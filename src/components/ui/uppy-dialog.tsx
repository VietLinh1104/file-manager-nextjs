"use client"

import React, { useState, useEffect, useMemo } from "react"
import Uppy, { type UploadResult, type UppyFile } from "@uppy/core"
import { Dashboard } from "@uppy/react"
import AwsS3Multipart from "@uppy/aws-s3-multipart"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/axios"
import type { attachmentsRequest } from "@/types/erp-1/attachmentsRequest"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.min.css"
import { toast } from "sonner"

/** 🔹 Helper gọi API backend an toàn */
const fetchUploadApiEndpoint = async (endpoint: string, data: object) => {
  const res = await fetch(`/api/multipart-upload/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`❌ ${endpoint} failed: ${res.status}\n${text}`)
  }

  return res.json()
}

/** 🔹 Component upload file trong Dialog */
export function UppyDialog({
  onUploadSuccess,
}: {
  onUploadSuccess: (result: attachmentsRequest[]) => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [open, setOpen] = useState(false)

  // ✅ Tạo instance Uppy
  const uppy = useMemo(() => {
    const instance = new Uppy({
      autoProceed: false,
      restrictions: { maxNumberOfFiles: null },
    })

    instance.use(AwsS3Multipart, {
      async createMultipartUpload(file: UppyFile) {
        return fetchUploadApiEndpoint("create-multipart-upload", {
          fileName: file.name,
          contentType: file.type,
        })
      },
      async signPart(_file, props) {
        return fetchUploadApiEndpoint("sign-part", props)
      },
      async listParts(_file, props) {
        return fetchUploadApiEndpoint("list-parts", props)
      },
      async completeMultipartUpload(file: UppyFile, props) {
        const response = await fetchUploadApiEndpoint(
          "complete-multipart-upload",
          props
        )

        const formatted: attachmentsRequest = {
          file_name: response.file_name ?? file.name,
          file_type: file.type ?? "unknown",
          file_path: response.url,
          key: response.key,
          file_size: file.size ?? 0,
          uploaded_at: response.uploaded_at ?? new Date().toISOString(),
        }

        return formatted
      },
      async abortMultipartUpload(_file, props) {
        return fetchUploadApiEndpoint("abort-multipart-upload", props)
      },
    })

    return instance
  }, [])

  /** 🔹 Khi thêm file */
  useEffect(() => {
    const handleFileAdded = (file: UppyFile) => {
      console.log("📎 File được thêm:", file.name)
    }
    uppy.on("file-added", handleFileAdded)
    return () => {
      uppy.off("file-added", handleFileAdded)
    }
  }, [uppy])

  /** 🔹 Khi upload hoàn tất */
  useEffect(() => {
    const handleComplete = async (result: UploadResult) => {
      setIsUploading(false)

      const uploadedFiles = result.successful.map(
        (s) => s.response?.body
      ) as attachmentsRequest[]

      if (!uploadedFiles?.length) return

      console.log("✅ Upload thành công:", uploadedFiles)
      toast.success(`Upload thành công ${uploadedFiles.length} tệp!`)

      // ✅ Gửi callback về component cha
      onUploadSuccess(uploadedFiles)

      // ✅ Gửi danh sách lên backend
      try {
        await api.post("/api/attachments/list", uploadedFiles)
        toast.success(`Đã lưu ${uploadedFiles.length} tệp vào hệ thống!`)

        // 🔹 Thay vì uppy.reset(), ta tự xoá file và reset tiến trình
        try {
          // Hủy upload còn lại nếu có
          if (typeof (uppy as any).cancelAll === "function") {
            uppy.cancelAll()
          }

          // Xóa tất cả file khỏi Dashboard
          const fileIds = uppy.getFiles().map((f) => f.id)
          if (fileIds.length > 0) {
            if (typeof (uppy as any).removeFiles === "function") {
              ;(uppy as any).removeFiles(fileIds)
            } else {
              fileIds.forEach((id) => uppy.removeFile(id))
            }
          }

          // Reset tiến trình (để progress bar về 0)
          if (typeof (uppy as any).resetProgress === "function") {
            uppy.resetProgress()
          }
        } catch (resetErr) {
          console.warn("⚠️ Lỗi khi reset Uppy:", resetErr)
        }

        // ✅ Đóng dialog sau 1 giây
        setTimeout(() => setOpen(false), 1000)
      } catch (err) {
        console.error("❌ Lỗi khi lưu danh sách file:", err)
        toast.error("Không thể lưu danh sách file vào ERP-1")
      }
    }

    uppy.on("complete", handleComplete)
    return () => {
      uppy.off("complete", handleComplete)
    }
  }, [uppy, onUploadSuccess])

  /** 🔹 Khi nhấn nút Upload */
  const handleUpload = () => {
    const files = uppy.getFiles()
    if (files.length === 0) {
      alert("⚠️ Vui lòng chọn ít nhất một file trước khi upload.")
      return
    }

    console.log("📂 File(s) đang chờ upload:", files.map((f) => f.name))
    setIsUploading(true)
    uppy.upload().catch((err) => {
      console.error("❌ Lỗi upload:", err)
      setIsUploading(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 🔹 Nút mở dialog */}
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Tải lên tệp đính kèm
        </Button>
      </DialogTrigger>

      {/* 🔹 Nội dung Dialog */}
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cloudflare R2 Bucket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Dashboard
            uppy={uppy}
            proudlyDisplayPoweredByUppy={false}
            height={380}
            width="100%"
            hideUploadButton
            hideRetryButton={false}
            hidePauseResumeButton={false}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              variant={isUploading ? "secondary" : "default"}
            >
              {isUploading ? "Đang upload..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
