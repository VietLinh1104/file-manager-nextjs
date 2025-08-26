// src\app\api\gen-views\route.ts
import { NextResponse } from "next/server"
import { viewService } from "@/services/dev-tool/view/view.service"

export async function GET() {
  const views = await viewService.getAll()
  return NextResponse.json({ data: views })
}

export async function POST(req: Request) {
  const body = await req.json()
  const view = await viewService.create(body)
  return NextResponse.json({ data: view })
}
