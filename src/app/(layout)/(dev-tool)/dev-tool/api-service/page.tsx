// src\app\(layout)\(dev-tool)\dev-tool\api-service\page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Trash, Plus } from "lucide-react"

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
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selected, setSelected] = useState<ApiService[]>([])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  // fetch list
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/api-services")
      const data = await res.json()
      // filter client-side theo search
      const filtered = debouncedSearch
        ? data.filter((s: ApiService) =>
            s.name.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : data
      setServices(filtered)
    } catch (err) {
      console.error("Error loading services", err)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    await fetch(`/api/api-services/${id}`, { method: "DELETE" })
    await fetchData()
  }

  const handleDeleteSelected = async () => {
    if (!selected.length) return
    if (!confirm(`Delete ${selected.length} services?`)) return
    await Promise.all(
      selected.map((s) =>
        fetch(`/api/api-services/${s.id}`, { method: "DELETE" })
      )
    )
    await fetchData()
    setSelected([])
  }

  const columns: ColumnDef<ApiService>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "baseUrl", header: "Endpoint" },
    { accessorKey: "method", header: "Method" },
    { accessorKey: "dataType", header: "Data Type" },
  ]

  return (
    <div className="p-1.5">
      <div className="mb-3">
        <h1 className="text-xl font-bold opacity-70">API Service</h1>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable<ApiService, unknown>
          columns={columns}
          data={services}
          total={services.length}
          pageSize={pageSize}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          withCheckbox
          searchValue={search}
          onSearchChange={setSearch}
          onSelectionChange={setSelected}
          toolbarActions={[
            ...(selected.length > 0
              ? [
                  {
                    label: `Delete Selected (${selected.length})`,
                    onClick: handleDeleteSelected,
                    variant: "destructive" as const,
                    icon: <Trash className="h-4 w-4" />,
                  },
                ]
              : []),
            {
              label: "Create API Service",
              href: "/dev-tool/api-service/create",
              icon: <Plus className="h-4 w-4" />,
            },
          ]}
          actions={[
            {
              label: "Edit",
              href: "/dev-tool/api-service/:id",
            },
            {
              label: "Delete",
              onClick: (row) => handleDelete(row.id),
              variant: "destructive",
            },
          ]}
        />
      )}
    </div>
  )
}
