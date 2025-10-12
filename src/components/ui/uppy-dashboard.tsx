"use client"

import React from "react"
import Uppy, { type UploadResult, type UppyFile } from "@uppy/core"
import { Dashboard } from "@uppy/react"
import AwsS3Multipart from "@uppy/aws-s3-multipart"
import { createattachmentService } from "@/services/erp-1/createattachment.service"
import { attachmentsRequest } from "@/types/erp-1/attachmentsRequest"

import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.min.css"

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

export function MultipartFileUploader({
  onUploadSuccess,
}: {
  onUploadSuccess: (result: {
    file_name: string
    file_type: string
    file_path: string
    key: string
    file_size: number
    uploaded_at: string
  }) => void
}) {
  const uppy = React.useMemo(() => {
    const instance = new Uppy({
      autoProceed: true,
      restrictions: { maxNumberOfFiles: 1 },
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

        // 🔧 Chuẩn hóa object trả về
        const formatted = {
          file_name: response.file_name ?? file.name, // ✅ thêm tên file
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

  React.useEffect(() => {
    const handleComplete = (result: UploadResult) => {
      const data:attachmentsRequest = result.successful?.[0]?.response?.body
      if (!data) return

      const payload:attachmentsRequest = {
        file_name: data.file_name,
        file_type: data.file_type,
        file_path: data.file_path,
        key: data.key,
        file_size: data.file_size,
        uploaded_at: data.uploaded_at,
      }

      onUploadSuccess(payload)

      createattachmentService
        .create(payload)
        .then((res) => {
          console.log("✅ Attachment created in ERP-1:", res)
        })
        .catch((err) => {
          console.error("❌ Failed to create attachment in ERP-1:", err)
        })

      console.log("Attachment payload:", payload)
    }

    uppy.on("complete", handleComplete)
    return () => {
      uppy.off("complete", handleComplete)
    }
  }, [uppy, onUploadSuccess])

  return (
    <Dashboard
      uppy={uppy}
      proudlyDisplayPoweredByUppy={false}
      height={400}
      width="100%"
    />
  )
}
