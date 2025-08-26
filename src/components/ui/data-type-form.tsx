// src\components\ui\data-type-form.tsx
"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash } from "lucide-react"
import { FieldEditor, Field, BO } from "@/components/ui/field-editor"

interface DataTypeFormProps {
  boName: string
  setBoName: (name: string) => void
  fields: Field[]
  setFields: (fields: Field[]) => void
  selectedIndex: number | null
  setSelectedIndex: (index: number | null) => void
  boList: BO[]
  loading: boolean
  onSave: () => void
  onCancel?: () => void
}

export function DataTypeForm({
  boName,
  setBoName,
  fields,
  setFields,
  selectedIndex,
  setSelectedIndex,
  boList,
  loading,
  onSave,
  onCancel,
}: DataTypeFormProps) {
  const handleChange = (key: keyof Field, value: string | boolean) => {
    if (selectedIndex === null) return
    const newFields = [...fields]
    newFields[selectedIndex] = {
      ...newFields[selectedIndex],
      [key]: value,
    }
    setFields(newFields)
  }

  const addField = () => {
    setFields([
      ...fields,
      {
        name: "NewField",
        type: "string",
        required: true,
        isList: false,
        documentation: "",
      },
    ])
    setSelectedIndex(fields.length)
  }

  const removeField = () => {
    if (selectedIndex === null) return
    setFields(fields.filter((_, i) => i !== selectedIndex))
    setSelectedIndex(null)
  }

  return (
    <div className="flex flex-col h-[700px] border rounded-md shadow-sm">
      {/* Header */}
      <div className="p-3 border-b">
        <Label className="block mb-1">Business Object Name</Label>
        <Input value={boName} onChange={(e) => setBoName(e.target.value)} />
      </div>

      <div className="flex flex-1">
        {/* LEFT: Parameters */}
        <div className="w-1/3 border-r p-3 flex flex-col">
          <div className="flex justify-between mb-3">
            <h3 className="flex font-semibold items-center">Parameters</h3>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" onClick={removeField}>
                <Trash className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={addField}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ul className="flex-1 border rounded-md bg-gray-50 overflow-y-auto">
            {fields.map((f, i) => (
              <li
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`px-3 py-2 cursor-pointer ${
                  i === selectedIndex ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
              >
                {f.name} ({f.type}) {f.isList ? "[]" : ""}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: Properties */}
        <div className="w-2/3 p-4">
          <h3 className="font-semibold mb-2">Parameter Properties</h3>
          <FieldEditor
            field={selectedIndex !== null ? fields[selectedIndex] : null}
            boList={boList}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
