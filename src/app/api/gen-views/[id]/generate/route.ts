import { NextResponse } from "next/server"
import { generateView } from "@/services/dev-tool/view/gen-view.service"

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const idNum = Number(params.id)
  if (!Number.isFinite(idNum)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  try {
    const { filePath } = await generateView(idNum)
    return NextResponse.json({ ok: true, filePath })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
