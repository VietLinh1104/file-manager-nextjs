import { NextResponse } from "next/server"
import { prisma } from "@/../backend/prisma"
import { deleteBOAndFile } from "@/services/dev-tool/type/delete-type.service"
import { generateTypeForBO } from "@/services/dev-tool/type/gen-type.service"   // 👈 import


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
import { unlinkSync, existsSync } from "fs"
import { join } from "path"

// Cập nhật BO
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const body = (await req.json()) as { name: string; fields: FieldInput[] }

  // lấy BO cũ để biết filePath
  const oldBO = await prisma.dataType.findUnique({
    where: { id: Number(id) },
    select: { tsFilePath: true, name: true },
  })

  // xóa file cũ nếu có
  if (oldBO?.tsFilePath) {
    const absPath = join(process.cwd(), "src", oldBO.tsFilePath)
    if (existsSync(absPath)) {
      try {
        unlinkSync(absPath)
        console.log(`✅ Deleted old file: ${absPath}`)
      } catch (err) {
        console.error(`❌ Failed to delete old file ${absPath}:`, err)
      }
    }
  }

  // update BO trong DB
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

  // generate file mới
  await generateTypeForBO(Number(id))

  return NextResponse.json(updated)
}



// Xoá BO
export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params
  const deleted = await deleteBOAndFile(Number(id))
  return NextResponse.json(deleted)
}
