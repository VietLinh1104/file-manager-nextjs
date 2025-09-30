// src/app/(layout)/(erp-1)/erp-1/data-table/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Trash, Plus, FileDown } from "lucide-react"
import { columns } from "./columns"
import { userService } from "@/services/erp-1/user.service"
import { User } from "@/types/erp-1/User"

export default function DocumentListTableSection() {

  //#region State
  const [data, setData] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selected, setSelected] = useState<User[]>([])
  //#endregion

  //#region CRUD functions
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await userService.getAll()
      const all = res.data.data
      const filtered = debouncedSearch
        ? all.filter((p) =>
            p.id.toString().toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : all

      setData(filtered)
      setTotal(res.data.meta.total)
    } catch (error) {
      console.error("Error fetching users:", error)
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, debouncedSearch])
  //#endregion
  
  //#region Handle actions 
  const handleDeleteSelected = async () => {
    if (!selected.length) return
    if (!confirm(`Delete ${selected.length} documents?`)) return
    console.log("Delete selected", selected)
    await fetchData()
    setSelected([])
  }

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this document?")) return
    console.log("Delete", id)
    await fetchData()
  }

  const handleExportCSV = () => {
    console.log("Export CSV", selected)
    // TODO: export CSV logic
  }
  //#endregion

  //#region Toolbar & Row Actions
  const toolbarActions = React.useMemo(() => {
    const base = [
      {
        label: "Add New",
        href: "/erp-1/data-table2/new",
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
        label: `Delete Selected (${selected.length})`,
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
        href: "/dev-tool/api-service/:id", // :id sẽ được replace trong DataTable
      },
      {
        label: "Delete",
        onClick: (row: User) => handleDelete(row.id),
        variant: "destructive" as const,
      },
    ],
    []
  )

  const userColumns: ColumnDef<User>[] = columns
  //#endregion

  return (
    <div className="p-1.5">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable<User, unknown>
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
          toolbarActions={toolbarActions}  // ✅ gọn
          actions={rowActions}             // ✅ gọn
        />
      )}
    </div>
  )
}
