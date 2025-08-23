import { NextResponse } from "next/server"
import { prisma } from "@/../backend/prisma"

export async function GET() {
  const bos = await prisma.dataType.findMany({
    include: { fields: true },
    orderBy: { id: "desc" },
  })
  return NextResponse.json(bos)
}

export async function POST(req: Request) {
  const body = await req.json()
  const newBO = await prisma.dataType.create({
    data: {
      name: body.name,
      fields: {
        create: body.fields,
      },
    },
    include: { fields: true },
  })
  return NextResponse.json(newBO)
}
