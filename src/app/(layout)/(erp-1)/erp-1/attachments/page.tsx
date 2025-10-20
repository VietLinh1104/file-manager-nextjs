"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Trash, RefreshCcw, Upload } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { confirmToast } from "@/components/ui/confirm-toast"
import { Attachments } from "@/api/swagger/models/Attachments"
import type { SpringPage } from "@/components/ui/data-table"
import { r2Fetch, DeleteFileResponse, DeleteListResponse } from "@/lib/r2"
import { UppyDialog } from "@/components/ui/uppy-dialog"
import { DialogAttachmentInfo } from "@/components/ui/dialog-attachment-info"
import type { attachmentsRequest } from "@/types/erp-1/attachmentsRequest"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"

// 🧩 Mở rộng kiểu Attachments để có thông tin entity
export interface AttachmentWithEntities extends Attachments {
  attachedEntities?: {
    entityName?: string
    entityId?: string
    attachedAt?: string
  }[]
  attached?: boolean
}

// 🧩 Helper format kích thước
function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return "0 B"
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
export const columns: ColumnDef<AttachmentWithEntities>[] = [
  {
    accessorKey: "fileName",
    header: "Tên Tệp",
    cell: ({ row }) => row.getValue("fileName") as string,
  },
  {
    accessorKey: "fileSize",
    header: "Kích thước",
    cell: ({ row }) => <span>{formatFileSize(row.getValue("fileSize") as number)}</span>,
  },
  {
    accessorKey: "uploadedAt",
    header: "Ngày tải lên",
    cell: ({ row }) => {
      const val = row.getValue("uploadedAt")
      return val ? new Date(val as Date).toLocaleString() : ""
    },
  },
  {
    accessorKey: "attached",
    header: "Trạng thái",
    cell: ({ row }) => {
      const attached = row.getValue("attached") as boolean
      return (
        <span
          className={`px-2 py-1 rounded text-xs ${
            attached ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {attached ? "Đã liên kết" : "Chưa liên kết"}
        </span>
      )
    },
  },
]

// 🧩 Component chính
export default function AttachmentsListTable() {
  const [pageData, setPageData] = useState<SpringPage<AttachmentWithEntities>>()
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selected, setSelected] = useState<AttachmentWithEntities[]>([])
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<AttachmentWithEntities | null>(null)

  // 🔹 Lấy danh sách file
  const getAttachments = useCallback(
    async (page: number = pageIndex, size: number = pageSize, searchText?: string) => {
      try {
        setLoading(true)
        toast.loading("Đang tải dữ liệu...")
        const res = await api.get("/api/attachments/with-entities", {
          params: { page, size, search: searchText ?? debouncedSearch },
        })
        setPageData(res.data)
      } catch {
        toast.error("Không thể tải danh sách tệp")
      } finally {
        setLoading(false)
        toast.dismiss()
      }
    },
    [pageIndex, pageSize, debouncedSearch]
  )

  // 🔹 Reload sau khi upload
  const handleUploadSuccess = useCallback(
    async (uploadedFiles: attachmentsRequest[]) => {
      toast.success(`Đã upload ${uploadedFiles.length} tệp mới!`)
      setUploadOpen(false)
      await getAttachments()
    },
    [getAttachments]
  )

  // 🔹 Xóa danh sách
  const deleteListAttachments = useCallback(
    async (attachments: AttachmentWithEntities[]) => {
      const ids = attachments.map((a) => a.attachmentId)
      const keys = attachments.map((a) => a.key).filter((k): k is string => !!k)
      if (ids.length === 0) return toast.info("Không có tệp để xóa")

      try {
        toast.loading("Đang xóa...")
        await api.delete("/api/attachments/batch-delete", { data: ids })
        if (keys.length)
          await r2Fetch<DeleteListResponse, { keys: string[] }>("delete-list", { body: { keys } })
        toast.success(`Đã xóa ${ids.length} tệp`)
        await getAttachments()
      } catch {
        toast.error("Không thể xóa tệp")
      } finally {
        toast.dismiss()
      }
    },
    [getAttachments]
  )

  // 🔹 Xóa 1 file
  const handleDelete = useCallback(
    (row: AttachmentWithEntities) => {
      confirmToast({
        title: "Xóa tệp đính kèm?",
        description: `Tệp "${row.fileName}" sẽ bị xóa vĩnh viễn.`,
        confirmText: "Xóa",
        onConfirm: async () => {
          try {
            toast.loading("Đang xóa...")
            await api.delete(`/api/attachments/${row.attachmentId}`)
            if (row.key)
              await r2Fetch<DeleteFileResponse, { key: string }>("delete-file", { body: { key: row.key } })
            toast.success(`Đã xóa: ${row.fileName}`)
            await getAttachments()
          } catch {
            toast.error("Không thể xóa tệp")
          } finally {
            toast.dismiss()
          }
        },
      })
    },
    [getAttachments]
  )

  // 🔹 Debounce tìm kiếm
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  // 🔹 Load dữ liệu
  useEffect(() => {
    getAttachments()
  }, [getAttachments])

  // 🧰 Toolbar Actions
  const toolbarActions = useMemo(() => {
    const base = [
      {
        label: "Upload File",
        icon: <Upload className="h-4 w-4" />,
        onClick: () => setUploadOpen(true),
      },
      {
        label: "Reload",
        icon: <RefreshCcw className="h-4 w-4" />,
        onClick: () => {
          // toast.info("🔄 Đang tải lại danh sách...")
          getAttachments()
        },
        variant: "secondary" as const,
      },
    ]
    if (selected.length)
      base.push({
        label: `Xóa (${selected.length})`,
        onClick: () => void deleteListAttachments(selected),
        icon: <Trash className="h-4 w-4" />,
        variant: "secondary" as const,
      })
    return base
  }, [selected, deleteListAttachments, getAttachments])

  return (
    <div className="p-2">
      {/* 🔹 Uppy dialog */}
      <div className="hidden">

      <UppyDialog onUploadSuccess={handleUploadSuccess} open={uploadOpen} onOpenChange={setUploadOpen} />
      </div>

      {/* 🔹 Dialog chi tiết file */}
      {selectedFile && (
        <DialogAttachmentInfo
          file={selectedFile}
          open={!!selectedFile}
          onOpenChange={() => setSelectedFile(null)}
        />
      )}

      {/* 🔹 DataTable */}
      {loading || !pageData ? (
        <DataTableSkeleton
          columns={5}
          rows={10}
          toolbarActions={toolbarActions} // 🔥 Truyền y hệt toolbar chính
        />
      ) : (
        <DataTable<AttachmentWithEntities, unknown>
          columns={columns}
          pageData={pageData}
          onPageChange={setPageIndex}
          withCheckbox
          searchValue={search}
          onSearchChange={setSearch}
          onSelectionChange={setSelected}
          toolbarActions={toolbarActions}
          actions={[
            { label: "Xóa", onClick: (row) => handleDelete(row), variant: "destructive" as const },
          ]}
          onRowClick={(row) =>
            setSelectedFile({
              fileName: row.fileName ?? "",
              fileType: row.fileType ?? "",
              fileSize: row.fileSize ?? 0,
              uploadedAt: row.uploadedAt ?? new Date().toISOString(),
              key: row.key ?? undefined,
              attachedEntities: row.attachedEntities ?? [],
              attached: row.attached ?? false,
            })
          }
        />
      )}
    </div>
  )
}
