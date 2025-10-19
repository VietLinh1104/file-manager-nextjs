"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function SwaggerUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return alert("Chưa chọn file Swagger JSON")

    const formData = new FormData()
    formData.append("file", file)
    setLoading(true)

    const res = await fetch("/api/swagger-upload", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    setLoading(false)

    if (data.success) {
      toast.success("Generate & lưu thành công!")    }
    
    else toast.error("Lỗi: " + data.error)
  }

  return (
    <div className="p-10 max-w-lg mx-auto border rounded">
      <h1 className="text-xl font-semibold mb-4">Upload Swagger / OpenAPI JSON</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input type="file" accept=".json" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Upload & Generate"}
        </Button>
      </form>
    </div>
  )
}
