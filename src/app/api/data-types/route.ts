import { NextResponse } from "next/server"
import { prisma } from "@/../backend/prisma"

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

    // kiểm tra name có bị trùng không
    const existing = await prisma.dataType.findUnique({
      where: { name: body.name },
    })
    if (existing) {
      return NextResponse.json(
        { error: `DataType '${body.name}' already exists` },
        { status: 400 }
      )
    }

    // lấy danh sách BO hiện có để map refBOId
    const allBOs: { id: number; name: string }[] = await prisma.dataType.findMany({
      select: { id: true, name: true },
    })

    const newBO = await prisma.dataType.create({
      data: {
        name: body.name,
        fields: {
          create: body.fields.map((f: FieldInput) => {
            const ref = allBOs.find((bo: { id: number; name: string }) => bo.name === f.type)
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

    return NextResponse.json(newBO)
  } catch (err) {
    console.error("POST /api/data-types error:", err)
    return NextResponse.json({ error: "Failed to create DataType" }, { status: 500 })
  }
}
