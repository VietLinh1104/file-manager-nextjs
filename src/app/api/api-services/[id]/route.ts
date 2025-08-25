import { prisma } from "@/../backend/prisma"
import { NextResponse } from "next/server"
import { deleteGeneratedApiServiceFile } from "@/services/dev-tool/api/api-service-delete.service"

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const service = await prisma.apiService.findUnique({
    where: { id: Number(params.id) },
  })

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  // gọi service xoá file
  deleteGeneratedApiServiceFile(service.tsFilePath)

  // xoá record DB
  await prisma.apiService.delete({ where: { id: service.id } })

  return NextResponse.json({ success: true })
}
