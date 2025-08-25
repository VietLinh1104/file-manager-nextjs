import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"
import { prisma } from "@/../backend/prisma"

export async function generateTablePage(serviceId: number) {
  const service = await prisma.apiService.findUnique({
    where: { id: serviceId },
  })
  if (!service) throw new Error("ApiService not found")

  const outDir = join(process.cwd(), "src", "app", "(erp-1)", "erp-1", service.name.toLowerCase())
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const filePath = join(outDir, "page.tsx")

  const code = `\
"use client"

import React, { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { ${service.dataType} } from "@/types/gen/${service.dataType}"
import { ${service.name.toLowerCase()}Service } from "@/services/gen/${service.name.toLowerCase()}.service"

export default function ${service.name}TablePage() {
  const [data, setData] = useState<${service.dataType}[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10
  const [total, setTotal] = useState(0)

  useEffect(() => {
    ${service.name.toLowerCase()}Service.getAll({ page: pageIndex + 1, pageSize })
      .then(res => {
        setData(res.data.data)
        setTotal(res.data.meta.total)
      })
  }, [pageIndex])

  const columns: ColumnDef<${service.dataType}>[] = [
    ${service.dataType === "Payment"
      ? `{
      accessorKey: "id",
      header: "ID"
    },
    {
      accessorKey: "amount",
      header: "Amount"
    },
    {
      accessorKey: "status",
      header: "Status"
    }`
      : `// TODO: add columns mapping for ${service.dataType}`}
  ]

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">${service.name} Table</h1>
      <DataTable<${service.dataType}>
        columns={columns}
        data={data}
        total={total}
        pageSize={pageSize}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
      />
    </div>
  )
}
`

  writeFileSync(filePath, code, { encoding: "utf-8" })
  return filePath
}
