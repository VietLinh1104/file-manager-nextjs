"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SwaggerUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

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

    if (data.success) setMessage("✅ Generate & lưu thành công!")
    else setMessage("❌ Lỗi: " + data.error)
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
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  )
}
