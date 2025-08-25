"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type DataTypeOption = {
  id: number
  name: string
}

export default function CreateApiServicePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    baseUrl: "",
    method: "GET",
    dataType: "",
  })

  const [dataTypes, setDataTypes] = useState<DataTypeOption[]>([])

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch("/api/data-types") // lấy từ DB
        const list = await res.json()
        setDataTypes(list)
      } catch (err) {
        console.error("Error loading datatypes", err)
      }
    }
    fetchTypes()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/api-services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    router.push("/dev-tool/api-service")
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold mb-4">Create API Service</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <Label>Endpoint (baseUrl)</Label>
          <Input name="baseUrl" value={form.baseUrl} onChange={handleChange} required />
        </div>
        <div>
          <Label>Method</Label>
          <select
            name="method"
            value={form.method}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>
        </div>
        <div>
          <Label>DataType</Label>
          <select
            name="dataType"
            value={form.dataType}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          >
            <option value="">Select DataType</option>
            {dataTypes.map((dt) => (
              <option key={dt.id} value={dt.name}>
                {dt.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}
