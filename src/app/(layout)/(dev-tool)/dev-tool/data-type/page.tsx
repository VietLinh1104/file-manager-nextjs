"use client"
import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Trash, Plus } from "lucide-react"

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

  const [selected, setSelected] = React.useState<DataType[]>([])

  const [search, setSearch] = React.useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>("")

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(pageIndex + 1))
      params.set("pageSize", String(pageSize))
      if (debouncedSearch) params.set("q", debouncedSearch)

      const res = await fetch(`/api/data-types?${params.toString()}`)
      const json = await res.json()

      if (Array.isArray(json)) {
        const filtered = debouncedSearch
          ? json.filter((dt: DataType) =>
              dt.name.toLowerCase().includes(debouncedSearch.toLowerCase())
            )
          : json
        setDataTypes(filtered)
        setTotal(filtered.length)
      } else {
        setDataTypes((json.data as DataType[]) ?? [])
        setTotal(json.meta?.total ?? (json.data?.length ?? 0))
      }
    } catch (err) {
      console.error("Failed to fetch data types:", err)
      setDataTypes([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, debouncedSearch])

  React.useEffect(() => {
    setPageIndex(0)
  }, [debouncedSearch])

  // Xóa 1 BO
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

  // Xóa nhiều BO
  const deleteSelected = async () => {
    if (!selected.length) return
    if (!confirm(`Delete ${selected.length} items?`)) return
    try {
      await Promise.all(
        selected.map((row) =>
          fetch(`/api/data-types/${row.id}`, { method: "DELETE" })
        )
      )
      await fetchData()
      setSelected([])
    } catch (err) {
      console.error(err)
      alert("Error deleting selected BOs")
    }
  }

  const columns: ColumnDef<DataType, unknown>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>,
    },
    {
      accessorKey: "fields",
      header: "Fields",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.fields.map((f) => (
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
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
  ]

  return (
    <div className="p-1.5">
      <div className="mb-3">
        <h1 className="text-xl font-bold opacity-70">Data Type</h1>
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
          withCheckbox
          searchValue={search}
          onSearchChange={setSearch}
          onSelectionChange={setSelected}   // ✅ lấy row chọn
          toolbarActions={[
            ...(selected.length > 0
              ? [
                  {
                    label: `Delete Selected (${selected.length})`,
                    onClick: deleteSelected,
                    variant: "destructive" as const,
                    icon: <Trash className="h-4 w-4" />,
                  },
                ]
              : []),
            {
              label: "Create Data Type",
              href: "/dev-tool/data-type/create",
              icon: <Plus className="h-4 w-4" />,
            },
          ]}
          actions={[
            { label: "Edit", href: "/dev-tool/data-type/:id" },
            {
              label: "Delete",
              onClick: (row: DataType) => deleteBO(row.id),
              variant: "destructive",
            },
          ]}
        />
      )}
    </div>
  )
}
