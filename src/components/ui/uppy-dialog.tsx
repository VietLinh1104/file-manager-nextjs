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

/** 🔹 Gọi API backend an toàn */
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

  /** ✅ Khởi tạo Uppy */
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
        return fetchUploadApiEndpoint("complete-multipart-upload", props)
      },
      async abortMultipartUpload(_file, props) {
        return fetchUploadApiEndpoint("abort-multipart-upload", props)
      },
    })

    return instance
  }, [])

  /** 🔹 Khi upload hoàn tất */
  useEffect(() => {
    const handleComplete = async (result: UploadResult) => {
      setIsUploading(false)

      // 🟢 Format dữ liệu từ Uppy response
      const uploadedFiles = result.successful.map((s) => {
        const body = s.response?.body || {}
        return {
          file_name: body.file_name ?? s.name,
          file_type: s.type ?? "unknown",
          file_path: body.url,
          key: body.key,
          file_size: s.size ?? 0,
          uploaded_at: body.uploaded_at ?? new Date().toISOString(),
        } as attachmentsRequest
      })

      if (!uploadedFiles?.length) return
      console.log("✅ Upload thành công:", uploadedFiles)
      toast.success(`Upload thành công ${uploadedFiles.length} tệp!`)

      // 🟢 Gọi API /api/attachments/list để lưu và nhận attachmentId
      try {
        const res = await api.post("/api/attachments/list", uploadedFiles)
        const savedFiles = res.data.map((f: any) => ({
          attachmentId: f.attachmentId, // backend trả về
          fileName: f.fileName,
          filePath: f.filePath,
          fileType: f.fileType,
          fileSize: f.fileSize,
          uploadedAt: f.uploadedAt,
        }))

        console.log("💾 Lưu DB thành công:", savedFiles)
        toast.success("Đã lưu tệp vào ERP-1!")

        // 🔹 Trả về cho DynamicForm
        onUploadSuccess(savedFiles)

        // ✅ Reset Uppy
        try {
          if (typeof (uppy as any).cancelAll === "function") uppy.cancelAll()
          const fileIds = uppy.getFiles().map((f) => f.id)
          fileIds.forEach((id) => uppy.removeFile(id))
          if (typeof (uppy as any).resetProgress === "function") uppy.resetProgress()
        } catch (resetErr) {
          console.warn("⚠️ Lỗi reset:", resetErr)
        }

        // ✅ Đóng dialog sau 1s
        setTimeout(() => setOpen(false), 1000)
      } catch (err) {
        console.error("❌ Lỗi khi lưu attachments:", err)
        toast.error("Không thể lưu danh sách file vào ERP-1")
      }
    }

    uppy.on("complete", handleComplete)
    return () => uppy.off("complete", handleComplete)
  }, [uppy, onUploadSuccess])

  /** 🔹 Nút upload */
  const handleUpload = () => {
    const files = uppy.getFiles()
    if (files.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một tệp.")
      return
    }
    console.log("📂 Bắt đầu upload:", files.map((f) => f.name))
    setIsUploading(true)
    uppy.upload().catch((err) => {
      console.error("❌ Lỗi upload:", err)
      setIsUploading(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Tải lên tệp đính kèm
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upload lên Cloudflare R2</DialogTitle>
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
