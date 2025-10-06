"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Trash, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BOField {
  id: number
  name: string
  type: "string" | "number" | "boolean" | "date"
}
interface BO {
  id: number
  name: string
  fields: BOField[]
}

interface TableColumn {
  id: string
  header: string
  accessorKey: string
  field?: string
  dataType: "string" | "number" | "boolean" | "date"
  uiType: "text" | "time" | "tag"
}

export default function TableBuilderPage() {
  const [bos, setBos] = useState<BO[]>([])
  const [selectedBO, setSelectedBO] = useState<BO | null>(null)
  const [columns, setColumns] = useState<TableColumn[]>([])
  const [generatedCode, setGeneratedCode] = useState("")
  const [showDialog, setShowDialog] = useState(false)

  // ✅ fetch BO từ API
  useEffect(() => {
    fetch("/api/data-types")
      .then((res) => res.json())
      .then((data: BO[]) => setBos(data))
      .catch((err) => console.error("❌ Lỗi fetch BO:", err))
  }, [])

  // ✅ thêm cột mới
  function addColumn() {
    if (!selectedBO) return
    setColumns((prev) => [
      ...prev,
      {
        id: `col-${Date.now()}`,
        header: "New Column",
        accessorKey: "",
        dataType: "string",
        uiType: "text",
      },
    ])
  }

  function deleteColumn(id: string) {
    setColumns((prev) => prev.filter((c) => c.id !== id))
  }

  // ✅ generate code
  function generateCode() {
    if (!selectedBO) {
      alert("Chọn 1 BO để binding")
      return
    }

    const colsCode = columns
      .filter((c) => c.accessorKey)
      .map(
        (c) => ` {
    accessorKey: "${c.accessorKey}",
    header: "${c.header}",
    cell: ({ row }) => {
      const val = row.getValue("${c.accessorKey}")
      ${
        c.uiType === "time"
          ? 'return val ? new Date(val as Date).toLocaleDateString() : ""'
          : c.uiType === "tag"
          ? 'return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">{val as string}</span>'
          : "return val"
      }
    }
  }`
      )
      .join(",\n")

    // ✅ mock data: luôn có dữ liệu
    const mockRows = Array.from({ length: 5 }).map((_, i) => {
  const fields = selectedBO.fields
    .map((f) => {
      const type = f.type.toLowerCase()
      if (type === "date") {
        return `${f.name}: new Date()`
      }
      if (type === "string") {
        return `${f.name}: "${f.name}_${i + 1}"`
      }
      if (type === "number") {
        return `${f.name}: ${i + 1}`
      }
      if (type === "boolean") {
        return `${f.name}: ${i % 2 === 0}`
      }
      return `${f.name}: null`
    })
    .join(", ")
  return `{ ${fields} }`
})
    const code = `// src/app/(layout)/(erp-1)/erp-1/data-table/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Trash, Plus, FileDown } from "lucide-react"
import { ${selectedBO.name} } from "@/types/erp-1/${selectedBO.name}"

export const columns: ColumnDef<${selectedBO.name}>[] = [
${colsCode}
]

export default function DocumentListTableSection() {
  //#region State
  const [data, setData] = useState<${selectedBO.name}[]>([])
  const [total, setTotal] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selected, setSelected] = useState<${selectedBO.name}[]>([])
  //#endregion

  //#region CRUD functions
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mock: ${selectedBO.name}[] = [
        ${mockRows.join(",\n        ")}
      ]
      setData(mock)
      setTotal(mock.length)
      setLoading(false)
    }, 400)
  }, [pageIndex, debouncedSearch])
  //#endregion

  //#region Handle actions
  const handleDeleteSelected = async () => {
    console.log("Delete:", selected)
  }

  const handleDelete = async (id: number | string) => {
    console.log("Delete one:", id)
  }

  const handleExportCSV = () => {
    console.log("Export CSV")
  }
  //#endregion

  //#region Toolbar & Row Actions
  const toolbarActions = React.useMemo(() => {
    const base = [
      {
        label: "Add New",
        href: "",
        icon: <Plus className="h-4 w-4" />,
      },
      {
        label: "Export CSV",
        onClick: handleExportCSV,
        icon: <FileDown className="h-4 w-4" />,
        variant: "secondary" as const,
      },
    ]
    if (selected.length > 0) {
      base.push({
        label: \`Delete Selected (\${selected.length})\`,
        onClick: handleDeleteSelected,
        variant: "secondary" as const,
        icon: <Trash className="h-4 w-4" />,
      })
    }
    return base
  }, [selected])

  const rowActions = React.useMemo(
    () => [
      {
        label: "Edit",
        href: "/erp-1/${selectedBO.name}/:id",
      },
      {
        label: "Delete",
        onClick: (row: ${selectedBO.name}) => handleDelete((row as ${selectedBO.name}).id),
        variant: "destructive" as const,
      },
    ],
    []
  )
  //#endregion

  const userColumns: ColumnDef<${selectedBO.name}>[] = columns

  return (
    <div className="p-1.5">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable<${selectedBO.name}, unknown>
          columns={userColumns}
          data={data}
          total={total}
          pageSize={pageSize}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          withCheckbox
          searchValue={search}
          onSearchChange={setSearch}
          onSelectionChange={setSelected}
          toolbarActions={toolbarActions}
          actions={rowActions}
        />
      )}
    </div>
  )
}`

    setGeneratedCode(code)
    setShowDialog(true)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar chọn BO */}
      <aside className="w-64 border-r p-4">
        <h2 className="font-medium mb-2">Chọn BO</h2>
        <Select
          onValueChange={(val) => {
            const bo = bos.find((b) => b.id === Number(val)) || null
            setSelectedBO(bo)
            setColumns([])
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select BO..." />
          </SelectTrigger>
          <SelectContent>
            {bos.map((bo) => (
              <SelectItem key={bo.id} value={bo.id.toString()}>
                {bo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6">
        {selectedBO && (
          <>
            <Button onClick={addColumn} className="mb-4">
              + Thêm cột
            </Button>

            <div className="space-y-3">
              {columns.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center gap-2 border rounded p-2"
                >
                  {/* Header */}
                  <Input
                    value={col.header}
                    onChange={(e) =>
                      setColumns((prev) =>
                        prev.map((c) =>
                          c.id === col.id ? { ...c, header: e.target.value } : c
                        )
                      )
                    }
                    placeholder="Header..."
                    className="w-1/4"
                  />

                  {/* Field Select */}
                  <Select
                    value={col.accessorKey}
                    onValueChange={(val) =>
                      setColumns((prev) =>
                        prev.map((c) =>
                          c.id === col.id
                            ? {
                                ...c,
                                accessorKey: val,
                                field: val,
                                dataType:
                                  (selectedBO.fields.find((f) => f.name === val)
                                    ?.type as TableColumn["dataType"]) || "string",
                              }
                            : c
                        )
                      )
                    }
                  >
                    <SelectTrigger className="w-1/3">
                      <SelectValue placeholder="Chọn field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedBO.fields
                        .filter(
                          (f) =>
                            !columns.find(
                              (c) => c.accessorKey === f.name && c.id !== col.id
                            )
                        )
                        .map((f) => (
                          <SelectItem key={f.id} value={f.name}>
                            {f.name} ({f.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* UI Type Select */}
                  <Select
                    value={col.uiType}
                    onValueChange={(val) =>
                      setColumns((prev) =>
                        prev.map((c) =>
                          c.id === col.id ? { ...c, uiType: val as TableColumn["uiType"] } : c
                        )
                      )
                    }
                  >
                    <SelectTrigger className="w-1/4">
                      <SelectValue placeholder="UI hiển thị..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="time">Time</SelectItem>
                      <SelectItem value="tag">Tag</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Delete */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteColumn(col.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <Button className="mt-6" onClick={generateCode}>
              Generate Page Code
            </Button>
          </>
        )}

        {/* Dialog hiển thị code */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="w-[90vw] max-h-[80vh] overflow-y-auto">
            <DialogHeader className="flex justify-between items-center">
              <DialogTitle>Generated Page</DialogTitle>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(generatedCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <pre className="mt-2 p-4 border rounded bg-muted text-xs overflow-x-auto whitespace-pre">
              {generatedCode}
            </pre>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
