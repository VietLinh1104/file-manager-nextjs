import { NextResponse } from "next/server"
import { prisma } from "@/../backend/prisma"

interface Params {
  params: { id: string }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const deleted = await prisma.dataType.delete({
      where: { id: Number(params.id) },
    })
    return NextResponse.json(deleted)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
