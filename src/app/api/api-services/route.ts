import { prisma } from "@/../backend/prisma"
import { NextResponse } from "next/server"
import { generateApiServiceFile } from "@/services/dev-tool/api/api-service-gen.service"

// Types khớp với form client gửi lên
interface ApiParamInput {
  name: string
  type: string
  required: boolean
  isList: boolean
}

interface ApiMethodInput {
  name: string
  type: string
  required: boolean
  isList: boolean
  documentation?: string
  params?: ApiParamInput[]
}

interface ApiServiceInput {
  name: string
  baseUrl: string
  fields: ApiMethodInput[]
}

// GET /api/api-services
export async function GET() {
  const services = await prisma.apiService.findMany({
    include: {
      methods: {
        include: { params: true },
      },
    },
  })
  return NextResponse.json(services)
}

// POST /api/api-services
export async function POST(req: Request) {
  const body: ApiServiceInput = await req.json()
  const { name, baseUrl, fields } = body

  // 1. Lưu DB (service + methods + params)
  let service = await prisma.apiService.create({
    data: {
      name,
      baseUrl,
      methods: {
        create: fields.map((f) => ({
          name: f.name,
          returnType: f.type,
          required: f.required,
          isList: f.isList,
          documentation: f.documentation,
          params: {
            create: (f.params ?? []).map((p) => ({
              name: p.name,
              type: p.type,
              required: p.required,
              isList: p.isList,
            })),
          },
        })),
      },
    },
    include: {
      methods: { include: { params: true } },
    },
  })

  // 2. Generate file service (có import BO từ DB)
  try {
    const dataTypes = (
      await prisma.dataType.findMany({
        select: { name: true, tsFilePath: true },
      })
    ).filter((d) => d.tsFilePath !== null) as { name: string; tsFilePath: string }[]

    const filePath = generateApiServiceFile(
      {
        name: service.name,
        baseUrl: service.baseUrl,
        methods: service.methods,
      },
      dataTypes
    )

    // 3. Update DB với tsFilePath
    service = await prisma.apiService.update({
      where: { id: service.id },
      data: { tsFilePath: filePath },
      include: {
        methods: { include: { params: true } },
      },
    })

    console.log("✅ Generated API service:", filePath)
  } catch (err) {
    console.error("❌ Failed to generate service file:", err)
  }

  return NextResponse.json(service)
}
