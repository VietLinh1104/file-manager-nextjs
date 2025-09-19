import { prisma } from "@/../backend/prisma"
import { NextResponse } from "next/server"
import {
  deleteApiServiceFile,
  updateApiServiceFile,
} from "@/services/dev-tool/api/api-service-gen.service"

// Input types khớp với form gửi lên
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

// DELETE /api/api-services/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const service = await prisma.apiService.findUnique({
    where: { id: Number(params.id) },
  })

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  // Xoá file đã generate
  if (service.tsFilePath) {
    deleteApiServiceFile(service.tsFilePath)
  }

  // Xoá record DB (cascade xoá methods + params)
  await prisma.apiService.delete({ where: { id: service.id } })

  return NextResponse.json({ success: true })
}

// PUT /api/api-services/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body: ApiServiceInput = await req.json()
  const { name, baseUrl, fields } = body

  // 1. Clear methods cũ để update lại
  await prisma.apiMethod.deleteMany({
    where: { serviceId: Number(params.id) },
  })

  let service = await prisma.apiService.update({
    where: { id: Number(params.id) },
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
    include: { methods: { include: { params: true } } },
  })

  // 2. Regenerate file
  try {
    const dataTypes = (
      await prisma.dataType.findMany({
        select: { name: true, tsFilePath: true },
      })
    ).filter((d) => d.tsFilePath !== null) as { name: string; tsFilePath: string }[]

    const filePath = updateApiServiceFile(
      {
        name: service.name,
        baseUrl: service.baseUrl,
        methods: service.methods,
      },
      dataTypes
    )

    service = await prisma.apiService.update({
      where: { id: service.id },
      data: { tsFilePath: filePath },
      include: { methods: { include: { params: true } } },
    })

    console.log("✅ Updated & regenerated API service:", filePath)
  } catch (err) {
    console.error("❌ Failed to regenerate service file:", err)
  }

  return NextResponse.json(service)
}
