"use client"

import React, { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/erp-1/User"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { userService } from "@/services/erp-1/user.service"

export default function UserTablePage() {
  const [data, setData] = useState<User[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10
  const [total, setTotal] = useState(0)

  useEffect(() => {
    userService.getAll({ page: pageIndex + 1, pageSize })
      .then(res => {
        setData(res.data.data)
        setTotal(res.data.meta.total)
      })
  }, [pageIndex])

  const columns: ColumnDef<User>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={`/dev-tool/api-service/${row.original.id}`}>
            <Button size="sm" variant="outline">Edit</Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            // onClick={() => handleDelete(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">User Table</h1>

      {/* Hiển thị DataTable */}
      <DataTable<User, unknown>
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
