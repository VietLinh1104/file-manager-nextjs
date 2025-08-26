import { NextResponse } from "next/server"
import { viewService } from "@/services/dev-tool/view/view.service"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const idNum = Number(params.id)
  const data = await viewService.getById(idNum)
  return NextResponse.json({ data })
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const idNum = Number(params.id)
  const body = await req.json()
  const data = await viewService.update(idNum, body)
  return NextResponse.json({ data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const idNum = Number(params.id)
  await viewService.delete(idNum)
  return NextResponse.json({ ok: true })
}
