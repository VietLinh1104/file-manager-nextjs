"use client"
import * as React from "react"

interface Field {
  name: string
  type: string
  required: boolean
}

interface BO {
  id: number
  name: string
}

export default function CreateDataType() {
  const [boName, setBoName] = React.useState("MyBO")
  const [fields, setFields] = React.useState<Field[]>([
    { name: "User", type: "string", required: true },
  ])
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(0)
  const [loading, setLoading] = React.useState(false)
  const [boList, setBoList] = React.useState<BO[]>([])

  // Load danh sách BO có sẵn để cho phép chọn làm type
  React.useEffect(() => {
    const fetchBOs = async () => {
      try {
        const res = await fetch("/api/data-types")
        if (res.ok) {
          const data = await res.json()
          setBoList(data)
        }
      } catch (err) {
        console.error("Failed to fetch BO list:", err)
      }
    }
    fetchBOs()
  }, [])

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

  // 👉 Save BO vào DB qua API route
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
      alert(`Saved BO: ${data.name} (${data.fields.length} fields)`)
    } catch (err) {
      console.error(err)
      alert("Error saving BO")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[700px] border rounded-md shadow-sm">
      {/* BO Name */}
      <div className="p-3 border-b">
        <label className="block text-sm font-medium">Business Object Name</label>
        <input
          type="text"
          value={boName}
          onChange={e => setBoName(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      <div className="flex flex-1">
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
                  <optgroup label="Business Objects">
                    {boList.map(bo => (
                      <option key={bo.id} value={bo.name}>
                        {bo.name}
                      </option>
                    ))}
                  </optgroup>
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

      {/* Save Button */}
      <div className="p-3 border-t flex justify-end">
        <button
          onClick={saveBO}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save BO"}
        </button>
      </div>
    </div>
  )
}
