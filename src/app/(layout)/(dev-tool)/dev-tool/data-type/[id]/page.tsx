// src\app\(layout)\(dev-tool)\dev-tool\data-type\[id]\page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DataTypeForm } from "@/components/ui/data-type-form"
import { Field, BO } from "@/components/ui/field-editor"

export default function EditDataTypePage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params?.id)

  const [boName, setBoName] = useState("")
  const [fields, setFields] = useState<Field[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0)
  const [loading, setLoading] = useState(true)
  const [boList, setBoList] = useState<BO[]>([])

  // load BO hiện tại
  useEffect(() => {
    const fetchBO = async () => {
      try {
        const res = await fetch(`/api/data-types/${id}`)
        if (!res.ok) throw new Error("Failed to load BO")
        const data: BO = await res.json()

        const mappedFields: Field[] = (data.fields ?? []).map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          required: f.required,
          isList: (f as Partial<Field>).isList ?? false,
          documentation: (f as Partial<Field>).documentation ?? "",
        }))

        setBoName(data.name)
        setFields(mappedFields)
      } catch (err) {
        console.error(err)
        alert("Error loading BO")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchBO()
  }, [id])

  // load danh sách BO
  useEffect(() => {
    const fetchBOs = async () => {
      try {
        const res = await fetch("/api/data-types")
        if (res.ok) {
          const data: BO[] = await res.json()
          setBoList(data)
        }
      } catch (err) {
        console.error("Failed to fetch BO list:", err)
      }
    }
    fetchBOs()
  }, [])

  const saveBO = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/data-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: boName, fields }),
      })
      if (!res.ok) throw new Error("Update failed")
      alert("BO updated successfully!")
      router.push("/dev-tool/data-type")
    } catch (err) {
      console.error(err)
      alert("Error updating BO")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <DataTypeForm
      boName={boName}
      setBoName={setBoName}
      fields={fields}
      setFields={setFields}
      selectedIndex={selectedIndex}
      setSelectedIndex={setSelectedIndex}
      boList={boList}
      loading={loading}
      onSave={saveBO}
      onCancel={() => router.push("/dev-tool/data-type")}
    />
  )
}
