"use client"
import * as React from "react"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ViewConfig } from "@/types/dev-tool/genView"

export default function GenViewListPage() {
  const [views, setViews] = React.useState<ViewConfig[]>([])
  const [loading, setLoading] = React.useState(false)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize] = React.useState(10)
  const [total, setTotal] = React.useState(0)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/gen-views?page=${pageIndex + 1}&pageSize=${pageSize}`)
      const json = await res.json()
      console.log("API /gen-views response:", json)

      if (Array.isArray(json)) {
        setViews(json)
        setTotal(json.length)
      } else {
        setViews(json.data ?? [])
        setTotal(json.meta?.total ?? (json.data?.length ?? 0))
      }
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [pageIndex, pageSize])

  const deleteView = async (id: number) => {
    if (!confirm("Delete this view?")) return
    await fetch(`/api/gen-views/${id}`, { method: "DELETE" })
    fetchData()
  }

  const columns: ColumnDef<ViewConfig, unknown>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "apiEndpoint", header: "API" },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/dev-tool/gen-view/${row.original.id}`}>Edit</Link>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteView(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-1.5">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Generated Views</h1>
        <Button asChild>
          <Link href="/dev-tool/gen-view/create">+ Create View</Link>
        </Button>
      </div>

      {loading ? <p>Loading...</p> : (
        <DataTable<ViewConfig, unknown>
          columns={columns}
          data={views}
          total={total}
          pageSize={pageSize}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
        />
      )}
    </div>
  )
}
