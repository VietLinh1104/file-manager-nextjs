"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type ApiService = {
  id: number
  name: string
  baseUrl: string
  dataType: string
}

export default function TableGenPage() {
  const [services, setServices] = useState<ApiService[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/api-services")
      .then((res) => res.json())
      .then(setServices)
  }, [])

  const handleGenerate = async (id: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/table-gen/${id}`, { method: "POST" })
      const data = await res.json()
      if (data.success) {
        alert(`✅ Generated table page at: ${data.filePath}`)
      } else {
        alert(`❌ Failed: ${data.error}`)
      }
    } catch (err) {
      alert("Error generating table page: "+ err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Generate Table Pages</h1>
      <ul className="space-y-2">
        {services.map((s) => (
          <li
            key={s.id}
            className="flex justify-between items-center border rounded p-2"
          >
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-gray-500">
                {s.dataType} – {s.baseUrl}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleGenerate(s.id)}
              disabled={loading}
            >
              Generate Page
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
