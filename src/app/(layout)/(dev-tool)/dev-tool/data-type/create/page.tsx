"use client"

import React, { useState, useEffect } from "react"
import { DataTypeForm } from "@/components/ui/data-type-form"
import { Field, BO } from "@/components/ui/field-editor"

export default function CreateDataTypePage() {
  const [boName, setBoName] = useState("MyBO")
  const [fields, setFields] = useState<Field[]>([
    { name: "User", type: "string", required: true, isList: false, documentation: "" },
  ])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0)
  const [loading, setLoading] = useState(false)
  const [boList, setBoList] = useState<BO[]>([])

  // 🔹 Fetch danh sách BO để có options trong Variable Type
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
      const res = await fetch("/api/data-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: boName, fields }),
      })
      if (!res.ok) throw new Error("Failed to save BO")
      const data = await res.json()
      alert(`Created BO: ${data.name} (${data.fields.length} fields)`)
    } catch (err) {
      console.error(err)
      alert("Error creating BO")
    } finally {
      setLoading(false)
    }
  }

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
    />
  )
}
