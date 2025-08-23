"use client"
import * as React from "react"

interface Field {
  name: string
  type: string
  required: boolean
}

export default function CreateDataType() {
  const [fields, setFields] = React.useState<Field[]>([
    { name: "User", type: "string", required: true },
  ])
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(0)

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
    setFields([...fields, { name: "NewField", type: "string", required: false }])
    setSelectedIndex(fields.length)
  }

  const removeField = () => {
    if (selectedIndex === null) return
    const newFields = fields.filter((_, i) => i !== selectedIndex)
    setFields(newFields)
    setSelectedIndex(null)
  }

  return (
    <div className="flex h-[600px] border rounded-md shadow-sm">
      {/* LEFT: Parameters */}
      <div className="w-1/3 border-r p-3 flex flex-col">
        <h3 className="font-semibold mb-2">Parameters</h3>
        <ul className="flex-1 border rounded-md bg-gray-50 overflow-y-auto">
          {fields.map((f, i) => (
            <li
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`px-3 py-2 cursor-pointer ${
                i === selectedIndex ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              {f.name} ({f.type})
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <button
            onClick={addField}
            className="flex-1 px-2 py-1 bg-green-600 text-white rounded"
          >
            + Add
          </button>
          <button
            onClick={removeField}
            className="flex-1 px-2 py-1 bg-red-500 text-white rounded"
          >
            Remove
          </button>
        </div>
      </div>

      {/* RIGHT: Parameter Properties */}
      <div className="w-2/3 p-4">
        <h3 className="font-semibold mb-2">Parameter Properties</h3>
        {selectedIndex !== null ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={fields[selectedIndex].name}
                onChange={e => handleChange("name", e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Variable Type</label>
              <select
                value={fields[selectedIndex].type}
                onChange={e => handleChange("type", e.target.value)}
                className="border rounded p-2 w-full"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="Date">Date</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fields[selectedIndex].required}
                onChange={e => handleChange("required", e.target.checked)}
              />
              <label>Required</label>
            </div>

            <div>
              <label className="block text-sm font-medium">Documentation</label>
              <textarea className="border rounded p-2 w-full h-20"></textarea>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Select a parameter to edit</p>
        )}
      </div>
    </div>
  )
}
