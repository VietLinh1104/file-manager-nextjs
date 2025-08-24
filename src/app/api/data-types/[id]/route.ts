import { NextResponse } from "next/server"
import { prisma } from "@/../backend/prisma"
import { deleteBOAndFile } from "@/services/delete-type.service"
import { generateTypeForBO } from "@/services/gen-type.service"   // 👈 import


type Params = { params: Promise<{ id: string }> }

type FieldInput = {
  name: string
  type: string
  required: boolean
  isList?: boolean
}

// Lấy chi tiết BO
export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const bo = await prisma.dataType.findUnique({
    where: { id: Number(id) },
    include: { fields: true },
  })
  if (!bo) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(bo)
}

// Cập nhật BO
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const body = (await req.json()) as { name: string; fields: FieldInput[] }

  const updated = await prisma.dataType.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      fields: {
        deleteMany: {}, // xoá toàn bộ field cũ
        create: body.fields.map(f => ({
          name: f.name,
          type: f.type,
          required: f.required,
          isList: f.isList ?? false,
        })),
      },
    },
    include: { fields: true },
  })

  // 👇 generate lại type file sau khi update DB
  await generateTypeForBO(Number(id))

  return NextResponse.json(updated)
}


// Xoá BO
export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params
  const deleted = await deleteBOAndFile(Number(id))
  return NextResponse.json(deleted)
}
