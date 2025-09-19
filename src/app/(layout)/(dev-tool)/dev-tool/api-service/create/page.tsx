// src\app\(layout)\(dev-tool)\dev-tool\api-service\create\page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ApiForm } from "@/components/ui/api-form"
import { Field, BO } from "@/components/ui/api-field-editor"   // đổi import cho đúng file

export default function CreateApiServicePage() {
  const router = useRouter()
  const [serviceName, setServiceName] = useState("")
  const [apiPath, setApiPath] = useState("")
  const [fields, setFields] = useState<Field[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [boList, setBoList] = useState<BO[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBOs = async () => {
      try {
        const res = await fetch("/api/data-types")
        const data = await res.json()
        setBoList(data)
      } catch (err) {
        console.error("❌ Error loading BOs", err)
      }
    }
    fetchBOs()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/api-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceName,
          baseUrl: apiPath,
          dataType: serviceName, // có thể mapping sang BO nếu cần
          fields,
        }),
      })
      if (res.ok) {
        router.push("/dev-tool/api-service")
      }
    } catch (err) {
      console.error("❌ Failed to save service", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-1.5">
      <h1 className="text-xl font-bold mb-4 opacity-70">Create API Service</h1>
      <ApiForm
        serviceName={serviceName}
        setServiceName={setServiceName}
        apiPath={apiPath}
        setApiPath={setApiPath}
        fields={fields}
        setFields={setFields}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        boList={boList}
        loading={loading}
        onSave={handleSave}
        onCancel={() => router.push("/dev-tool/api-service")}
      />
    </div>
  )
}
