import { NextResponse } from "next/server"
import { generateTablePage } from "@/services/dev-tool/table-data/table-page-gen.service"

// helper lấy message từ error
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

export async function POST(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = await generateTablePage(Number(params.id))
    return NextResponse.json({ success: true, filePath })
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}
