"use client"

import React, { useState, useEffect } from "react"
import { File } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Attachments } from "@/api/swagger"
import { attachmentsRequest } from "@/types/erp-1/attachmentsRequest"
import { confirmDeleteFile } from "@/components/ui/delete-file-dialog"
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
} from "@/components/ui/item"

type AttachmentLike = Attachments | attachmentsRequest

interface AttachmentListProps {
  files: AttachmentLike[]
  readOnly?: boolean
  onChange?: (files: AttachmentLike[]) => void // 🔹 để gửi danh sách mới ra ngoài nếu cần
}

/** 🔹 Component danh sách file đính kèm */
export function AttachmentList({
  files: initialFiles,
  readOnly = false,
  onChange,
}: AttachmentListProps) {
  const [files, setFiles] = useState<AttachmentLike[]>(initialFiles || [])

  // 🔁 Đồng bộ khi props thay đổi
  useEffect(() => {
    setFiles(initialFiles)
  }, [initialFiles])

  /** 🔹 Hàm lấy giá trị an toàn */
  const getName = (f: AttachmentLike) =>
    (f as Attachments).fileName || (f as attachmentsRequest).file_name || "Unnamed file"

  const getSize = (f: AttachmentLike) =>
    (f as Attachments).fileSize || (f as attachmentsRequest).file_size || 0

  const getId = (f: AttachmentLike) =>
    (f as Attachments).attachmentId || (f as attachmentsRequest).attachmentId

  /** 🔹 Xử lý xóa file */
  const handleDelete = async (idx: number) => {
    confirmDeleteFile({
      onOption2: async () => {
        try {
          const file = files[idx]
          const attachmentId = getId(file)
          if (!attachmentId) {
            toast.error("Không tìm thấy ID của tệp.")
            return
          }

          // Gọi API xóa
          await api.delete(`/api/attachments/${attachmentId}`)

          // Cập nhật lại danh sách (xóa item khỏi UI)
          const updatedFiles = files.filter((_, i) => i !== idx)
          setFiles(updatedFiles)
          onChange?.(updatedFiles) // gửi ra ngoài nếu cần

          toast.success("Đã xóa tệp thành công ✅")
        } catch (err) {
          console.error("❌ Lỗi khi xóa file:", err)
          toast.error("Không thể xóa tệp. Vui lòng thử lại.")
        }
      },
    })
  }

  /** 🔹 Render UI */
  if (!files || files.length === 0) {
    return (
      <div className="border rounded-md px-4 py-3 text-sm text-muted-foreground flex items-center justify-center">
        Không có tệp đính kèm
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {files.map((f, idx) => (
        <Item key={idx} variant="outline">
          <ItemMedia>
            <File className="h-5 w-5 text-blue-500" />
          </ItemMedia>

          <ItemContent
            title={getName(f)}
            description={`${(getSize(f) / 1024 / 1024).toFixed(2)} MB`}
          />

          {!readOnly && (
            <ItemActions onRemove={() => handleDelete(idx)} />
          )}
        </Item>
      ))}
    </div>
  )
}
