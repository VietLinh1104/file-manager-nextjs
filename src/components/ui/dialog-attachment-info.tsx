"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy } from "lucide-react"
import { toast } from "sonner"

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://document.truediting.com"

interface AttachedEntity {
  entityName?: string
  entityId?: string
  attachedAt?: string
  // 👉 hỗ trợ thêm snake_case từ backend
  entity_name?: string
  entity_id?: string
  attached_at?: string
}

interface DialogAttachmentInfoProps {
  file: {
    fileName?: string
    fileType?: string
    fileSize?: number
    uploadedAt?: string
    key?: string | null
    attachedEntities?: AttachedEntity[]
    attached?: boolean
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 B"
  const units = ["KB", "MB", "GB"]
  let size = bytes / 1024
  let i = 0
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(2)} ${units[i]}`
}

export function DialogAttachmentInfo({ file, open, onOpenChange }: DialogAttachmentInfoProps) {
  const fileUrl = file.key ? `${R2_PUBLIC_URL}/${file.key}` : ""

  const handleCopy = () => {
    if (fileUrl) {
      navigator.clipboard.writeText(fileUrl)
      toast.success("Đã sao chép liên kết!")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Thông tin tệp</DialogTitle>
          <DialogDescription>Chi tiết tệp và entity đang liên kết</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Thông tin tệp */}
          <div>
            <p className="font-semibold text-sm opacity-60">Tên tệp:</p>
            <p>{file.fileName ?? "-"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-sm opacity-60">Loại:</p>
              <p>{file.fileType ?? "-"}</p>
            </div>
            <div>
              <p className="font-semibold text-sm opacity-60">Kích thước:</p>
              <p>{formatFileSize(file.fileSize)}</p>
            </div>
            <div>
              <p className="font-semibold text-sm opacity-60">Ngày tải lên:</p>
              <p>{file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : "-"}</p>
            </div>
            <div>
              <p className="font-semibold text-sm opacity-60">Trạng thái:</p>
              <p>{file.attached ? "Đã liên kết" : "Chưa liên kết"}</p>
            </div>
          </div>

          {/* Đường dẫn */}
          {file.key && (
            <div>
              <p className="font-semibold text-sm opacity-60">Đường dẫn:</p>
              <div className="flex items-center gap-2">
                <input
                  value={fileUrl ?? ""}
                  readOnly
                  className="w-full border rounded px-2 py-1 text-sm bg-gray-50"
                />
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
                <a href={fileUrl ?? undefined} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="secondary">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Entity liên kết */}
          <div>
            <p className="font-semibold text-sm opacity-60 mb-2">Entity liên kết:</p>
            {file.attachedEntities && file.attachedEntities.length > 0 ? (
              <table className="w-full border rounded text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Entity Name</th>
                    <th className="text-left px-3 py-2">Entity ID</th>
                    <th className="text-left px-3 py-2">Ngày liên kết</th>
                  </tr>
                </thead>
                <tbody>
                  {file.attachedEntities.map((e, i) => {
                    const name = e.entityName ?? e.entity_name ?? "-"
                    const id = e.entityId ?? e.entity_id ?? "-"
                    const date = e.attachedAt ?? e.attached_at ?? null
                    return (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-1">{name}</td>
                        <td className="px-3 py-1">{id}</td>
                        <td className="px-3 py-1">
                          {date ? new Date(date).toLocaleString() : "-"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">Chưa có entity nào liên kết.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
