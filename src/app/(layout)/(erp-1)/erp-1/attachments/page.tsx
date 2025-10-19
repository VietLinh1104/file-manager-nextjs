"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Trash, Plus, FileDown } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useRouter } from "next/navigation"
import { confirmToast } from "@/components/ui/confirm-toast"
import { Attachments } from "@/api/swagger/models/Attachments"
import type { SpringPage } from "@/components/ui/data-table"
import { r2Fetch, DeleteFileResponse, DeleteListResponse } from "@/lib/r2"

// 🧩 Helper format kích thước
function formatFileSize(bytes?: number): string {
  if (bytes == null || isNaN(bytes)) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB", "TB"]
  let size = bytes / 1024
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// 🧱 Cột hiển thị
export const columns: ColumnDef<Attachments>[] = [
  {
    accessorKey: "fileName",
    header: "Tên Tệp",
    cell: ({ row }) => row.getValue("fileName") as string,
  },
  {
    accessorKey: "fileSize",
    header: "Kích thước",
    cell: ({ row }) => {
      const val = row.getValue("fileSize") as number
      return <span>{formatFileSize(val)}</span>
    },
  },
  {
    accessorKey: "key",
    header: "Key",
    cell: ({ row }) => {
      const val = row.getValue("key") as string
      if (!val) return ""

      // ✂️ Rút gọn key để hiển thị gọn gàng
      const shortKey =
        val.length > 50
          ? `${val.slice(0, 20)}...${val.slice(-6)}`
          : val

      return (
        <span
          className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-mono cursor-pointer hover:bg-blue-200 transition"
          title={`Click để sao chép\n${val}`}
          onClick={() => {
            navigator.clipboard.writeText(val)
            toast.success("✅ Đã sao chép key vào clipboard")
          }}
        >
          {shortKey}
        </span>
      )
    },
  },
  {
    accessorKey: "uploadedAt",
    header: "Ngày tải lên",
    cell: ({ row }) => {
      const val = row.getValue("uploadedAt")
      return val ? new Date(val as Date).toLocaleString() : ""
    },
  },
]

// 🧩 Component chính
export default function AttachmentsListTable() {
  const [pageData, setPageData] = useState<SpringPage<Attachments>>()
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selected, setSelected] = useState<Attachments[]>([])
  const router = useRouter()

  // 🔹 Lấy danh sách file
  const getAttachments = useCallback(async (page: number, size: number, search?: string) => {
    try {
      toast.loading("Đang tải dữ liệu...")
      const res = await api.get("/api/attachments", {
        params: { page, size, search: search || "" },
      })
      setPageData(res.data)
    } catch (err) {
      console.error("❌ Lỗi khi tải tệp:", err)
      toast.error("Không thể tải danh sách tệp")
    } finally {
      toast.dismiss()
    }
  }, [])

  // 🔹 Xoá danh sách trong DB và trên R2
  const deleteListAttachments = useCallback(
    async (attachments: Attachments[]) => {
      const ids = attachments.map((a) => a.attachmentId)
      const keys = attachments
        .map((a) => a.key)
        .filter((k): k is string => typeof k === "string")

      if (ids.length === 0) {
        toast.info("Không có tệp nào được chọn để xóa")
        return
      }

      try {
        toast.loading("Đang xóa tệp...")

        // 🗑️ 1️⃣ Xóa trong DB
        await api.delete("/api/attachments/batch-delete", { data: ids })

        // ☁️ 2️⃣ Xóa file thật trên R2
        if (keys.length > 0) {
          const res = await r2Fetch<DeleteListResponse, { keys: string[] }>(
            "delete-list",
            { body: { keys } }
          )
          if (res.errors && res.errors.length > 0) {
            console.warn("⚠️ Một số file không xóa được:", res.errors)
          }
        }

        toast.success(`Đã xóa ${ids.length} tệp đính kèm`)
        await getAttachments(pageIndex, pageSize, debouncedSearch)
      } catch (err) {
        console.error("❌ Lỗi khi xóa danh sách:", err)
        toast.error("Không thể xóa các tệp đính kèm đã chọn")
      } finally {
        toast.dismiss()
      }
    },
    [getAttachments, pageIndex, pageSize, debouncedSearch]
  )

  // 🔹 Xoá 1 item trong DB và trên R2
  const deleteAttachment = useCallback(
    async (item: Attachments) => {
      try {
        toast.loading("Đang xóa tệp...")

        // 🗑️ Xóa DB
        await api.delete(`/api/attachments/${item.attachmentId}`)

        // ☁️ Xóa thật trên R2
        if (item.key) {
          const res = await r2Fetch<DeleteFileResponse, { key: string }>(
            "delete-file",
            { body: { key: item.key } }
          )
          if (res.success) console.log("☁️ Đã xóa R2:", res.key)
        }

        toast.success(`Đã xóa tệp: ${item.fileName}`)
        await getAttachments(pageIndex, pageSize, debouncedSearch)
      } catch (err) {
        console.error("❌ Lỗi khi xóa tệp:", err)
        toast.error(`Không thể xóa tệp: ${item.fileName}`)
      } finally {
        toast.dismiss()
      }
    },
    [getAttachments, pageIndex, pageSize, debouncedSearch]
  )

  // 🔹 Debounce tìm kiếm
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  // 🔹 Load dữ liệu
  useEffect(() => {
    setLoading(true)
    getAttachments(pageIndex, pageSize, debouncedSearch).finally(() =>
      setLoading(false)
    )
  }, [getAttachments, pageIndex, pageSize, debouncedSearch])

  // 🔹 Xử lý hành động xóa nhiều
  const handleDeleteSelected = useCallback(async () => {
    if (selected.length === 0) {
      toast.info("Không có tệp nào để xóa")
      return
    }

    confirmToast({
      title: "Xóa tệp đính kèm?",
      description: `Bạn có chắc muốn xóa ${selected.length} tệp này không?`,
      confirmText: "Xóa",
      onConfirm: async () => {
        await deleteListAttachments(selected)
      },
    })
  }, [selected, deleteListAttachments])

  // 🔹 Xử lý xóa 1 dòng
  const handleDelete = useCallback(
    async (row: Attachments) => {
      confirmToast({
        title: "Xóa tệp đính kèm?",
        description: `Tệp "${row.fileName}" sẽ bị xóa vĩnh viễn khỏi hệ thống.`,
        confirmText: "Xóa",
        onConfirm: async () => {
          await deleteAttachment(row)
        },
      })
    },
    [deleteAttachment]
  )

  const handleExportCSV = useCallback(() => {
    toast.info("⚙️ Chức năng xuất CSV đang được phát triển...")
  }, [])

  // 🧰 Toolbar Actions
  const toolbarActions = useMemo(() => {
    const base = [
      {
        label: "Thêm mới",
        href: "/erp-1/attachments/new",
        icon: <Plus className="h-4 w-4" />,
      },
      {
        label: "Xuất CSV",
        onClick: handleExportCSV,
        icon: <FileDown className="h-4 w-4" />,
        variant: "secondary" as const,
      },
    ]
    if (selected.length > 0) {
      base.push({
        label: `Xóa (${selected.length})`,
        onClick: handleDeleteSelected,
        variant: "secondary" as const,
        icon: <Trash className="h-4 w-4" />,
      })
    }
    return base
  }, [selected, handleDeleteSelected, handleExportCSV])

  // 🧰 Row Actions
  const rowActions = useMemo(
    () => [
      {
        label: "Sửa",
        href: "/erp-1/attachments/:id",
      },
      {
        label: "Xóa",
        onClick: (row: Attachments) => handleDelete(row),
        variant: "destructive" as const,
      },
    ],
    [handleDelete]
  )

  return (
    <div className="p-2">
      {loading || !pageData ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <DataTable<Attachments, unknown>
          columns={columns}
          pageData={pageData}
          onPageChange={setPageIndex}
          withCheckbox
          searchValue={search}
          onSearchChange={setSearch}
          onSelectionChange={setSelected}
          toolbarActions={toolbarActions}
          actions={rowActions}
          onRowClick={(row) =>
            router.push(`/erp-1/attachments/${row.attachmentId}`)
          }
        />
      )}
    </div>
  )
}
