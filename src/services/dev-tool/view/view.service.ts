// src\services\dev-tool\view\view.service.ts
import { prisma } from "@/../backend/prisma"
import { View, Prisma } from "@prisma/client"

export const viewService = {
  async getAll() {
    return prisma.view.findMany({
      include: { api: true, dataType: true },
      orderBy: { createdAt: "desc" },
    })
  },

  async getById(id: number) {
    return prisma.view.findUnique({
      where: { id },
      include: { api: true, dataType: true },
    })
  },

  async create(data: {
    name: string
    type: "table" | "input"
    apiId: number
    dataTypeId: number
    path: string
    config: Prisma.InputJsonValue   // 👈 dùng Prisma type
  }) {
    return prisma.view.create({ data })
  },

  async update(id: number, data: Omit<Partial<View>, "id"> & { config?: Prisma.InputJsonValue }) {
    return prisma.view.update({
      where: { id },
      data,
    })
  },

  async delete(id: number) {
    return prisma.view.delete({ where: { id } })
  },
}
