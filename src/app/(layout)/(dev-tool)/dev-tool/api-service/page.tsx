"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

type ApiService = {
  id: number
  name: string
  baseUrl: string
  method: string
  dataType: string
  createdAt: string
}

export default function ApiServiceListPage() {
  const [services, setServices] = useState<ApiService[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/api-services")
        const data = await res.json()
        setServices(data)
      } catch (err) {
        console.error("Error loading services", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const columns: ColumnDef<ApiService>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "baseUrl", header: "Endpoint" },
    { accessorKey: "method", header: "Method" },
    { accessorKey: "dataType", header: "DataType" },
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
            onClick={() => handleDelete(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    await fetch(`/api/api-services/${id}`, { method: "DELETE" })
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">API Services</h1>
        <Link href="/dev-tool/api-service/create">
          <Button>Create Service</Button>
        </Link>
      </div>

      <DataTable<ApiService, unknown>
            columns={columns}
            data={services}
            total={services.length}
            pageSize={10}
            pageIndex={0}
            onPageChange={() => {}}
            />

    </div>
  )
}
