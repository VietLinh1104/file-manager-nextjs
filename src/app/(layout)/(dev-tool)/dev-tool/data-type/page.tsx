"use client"
import * as React from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"

interface Field {
  id: number
  name: string
  type: string
  required: boolean
}

interface DataType {
  id: number
  name: string
  fields: Field[]
  createdAt: string
}

export default function DataTypeListPage() {
  const [dataTypes, setDataTypes] = React.useState<DataType[]>([])
  const [loading, setLoading] = React.useState(false)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize] = React.useState(10)
  const [total, setTotal] = React.useState(0)

  // Load list BO
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/data-types?page=${pageIndex + 1}&pageSize=${pageSize}`)
      const json = await res.json()
      console.log("API /data-types response:", json)

      if (Array.isArray(json)) {
        setDataTypes(json)
        setTotal(json.length)
      } else {
        setDataTypes(json.data ?? [])
        setTotal(json.meta?.total ?? (json.data?.length ?? 0))
      }
    } catch (err) {
      console.error("Failed to fetch data types:", err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [pageIndex, pageSize])

  // Xóa BO
  const deleteBO = async (id: number) => {
    if (!confirm("Are you sure to delete this BO?")) return
    try {
      const res = await fetch(`/api/data-types/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      await fetchData()
    } catch (err) {
      console.error(err)
      alert("Error deleting BO")
    }
  }

  // Định nghĩa column cho DataTable
  const columns: ColumnDef<DataType, unknown>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "fields",
      header: "Fields",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.fields.map(f => (
            <span
              key={f.id}
              className="inline-block bg-gray-200 text-sm px-2 py-1 rounded"
            >
              {f.name}:{f.type}
              {f.required ? "*" : ""}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/dev-tool/data-type/${row.original.id}`}>
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteBO(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Business Objects</h1>
        <Button asChild>
          <Link href="/dev-tool/data-type/create">
            + Create BO
          </Link>
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable<DataType, unknown>
          columns={columns}
          data={dataTypes}
          total={total}
          pageSize={pageSize}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
        />
      )}
    </div>
  )
}
