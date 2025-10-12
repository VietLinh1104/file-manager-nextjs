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
import { createattachmentService } from "@/services/erp-1/createattachment.service"
import { attachmentsRequest } from "@/types/erp-1/attachmentsRequest"

import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.min.css"

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

        console.log("✅ Upload complete:", formatted)
        return formatted
      },
      async abortMultipartUpload(_file, props) {
        return fetchUploadApiEndpoint("abort-multipart-upload", props)
      },
    })

    return instance
  }, [])

  /** 🔹 Log khi thêm file */
  useEffect(() => {
    const handleFileAdded = (file: UppyFile) => {
      console.log("📎 File vừa được thêm vào:")
      console.table({
        id: file.id,
        name: file.name,
        type: file.type,
        size: `${((file.size ?? 0) / 1024 / 1024).toFixed(2)} MB`,
      })
    }
    uppy.on("file-added", handleFileAdded)
    return () => {
      uppy.off("file-added", handleFileAdded)
    }
  }, [uppy])

  /** 🔹 Khi upload hoàn tất */
  useEffect(() => {
    const handleComplete = (result: UploadResult) => {
      setIsUploading(false)
      const uploadedFiles = result.successful.map(
        (s) => s.response?.body
      ) as attachmentsRequest[]
      if (!uploadedFiles?.length) return

      console.log("✅ Danh sách file đã upload:", uploadedFiles)
      onUploadSuccess(uploadedFiles)

      // Lưu từng file vào ERP-1
      uploadedFiles.forEach((file) => {
        createattachmentService
          .create(file)
          .then((res) => {
            console.log(`✅ Đã lưu ${file.file_name} vào ERP-1:`, res)
          })
          .catch((err) => {
            console.error(`❌ Lỗi khi lưu ${file.file_name}:`, err)
          })
      })
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

    console.log("📂 File(s) đang chờ upload:")
    console.table(
      files.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        size: `${((f.size ?? 0) / 1024 / 1024).toFixed(2)} MB`,
      }))
    )

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
        <Button variant="outline"><Upload /> Upload Attachments</Button>
      </DialogTrigger>

      {/* 🔹 Nội dung Dialog */}
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upload file lên Cloudflare R2</DialogTitle>
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
