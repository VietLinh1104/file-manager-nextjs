import { NextResponse } from "next/server"
import { prisma } from "@/../backend/prisma"
import { generateTypeForBO } from "@/services/dev-tool/type/gen-type.service"

type FieldInput = {
  name: string
  type: string
  required: boolean
}

export async function GET() {
  const bos = await prisma.dataType.findMany({
    include: { fields: true },
    orderBy: { id: "desc" },
  })
  return NextResponse.json(bos)
}


export async function POST(req: Request) {
  try {
    const body = await req.json() as { name: string; fields: FieldInput[] }

    const existing = await prisma.dataType.findUnique({
      where: { name: body.name },
    })
    if (existing) {
      return NextResponse.json(
        { error: `DataType '${body.name}' already exists` },
        { status: 400 }
      )
    }

    const allBOs = await prisma.dataType.findMany({ select: { id: true, name: true } })

    const newBO = await prisma.dataType.create({
      data: {
        name: body.name,
        fields: {
          create: body.fields.map((f: FieldInput) => {
            const ref = allBOs.find(bo => bo.name === f.type)
            return {
              name: f.name,
              type: f.type,
              required: f.required,
              refBOId: ref ? ref.id : null,
            }
          }),
        },
      },
      include: { fields: true },
    })

    // 👉 generate type file và lưu path vào DB
    const filePath = await generateTypeForBO(newBO.id)

    return NextResponse.json({ ...newBO, tsFilePath: filePath })
  } catch (err) {
    console.error("POST /api/data-types error:", err)
    return NextResponse.json({ error: "Failed to create DataType" }, { status: 500 })
  }
}
