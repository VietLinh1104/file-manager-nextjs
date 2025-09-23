// src/app/(layout)/(erp-1)/erp-1/data-table/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Trash, Plus } from "lucide-react"
import { columns, Payment } from "./columns"
import DialogFile from "./dialog"
import { getPayments } from "@/services/erp-1/payment.service"

export default function DocumentListTableSection() {
  const [data, setData] = useState<Payment[]>([])
  const [total, setTotal] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selected, setSelected] = useState<Payment[]>([])

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  // fetch list
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getPayments<Payment>(pageIndex + 1, pageSize)
      const all = res.data.data
      const filtered = debouncedSearch
        ? all.filter((p) =>
            p.id.toString().toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : all

      setData(filtered)
      setTotal(res.data.meta.total)
    } catch (error) {
      console.error("Error fetching payments:", error)
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

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this document?")) return
    // TODO: call API delete payment
    console.log("Delete", id)
    await fetchData()
  }

  const handleDeleteSelected = async () => {
    if (!selected.length) return
    if (!confirm(`Delete ${selected.length} documents?`)) return
    // TODO: call API delete many payments
    console.log("Delete selected", selected)
    await fetchData()
    setSelected([])
  }

  const paymentColumns: ColumnDef<Payment>[] = columns

  return (
    <div className="p-1.5">

      {/* <DialogFile /> */}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable<Payment, unknown>
          columns={paymentColumns}
          data={data}
          total={total}
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
              label: "Upload Document",
            //   href: "/erp-1/data-table/upload",
			onClick: () => alert("Upload Document"),
              icon: <Plus className="h-4 w-4" />,
            },
          ]}
          actions={[
            {
              label: "Edit",
              href: "/dev-tool/api-service/:id", // :id sẽ được thay bằng row.original.id
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
