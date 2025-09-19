"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldEditor, Field, BO, MethodParam } from "@/components/ui/api-field-editor"

interface ApiFormProps {
  serviceName: string
  setServiceName: (name: string) => void
  apiPath: string
  setApiPath: (path: string) => void
  fields: Field[]
  setFields: (fields: Field[]) => void
  selectedIndex: number | null
  setSelectedIndex: (index: number | null) => void
  boList: BO[]
  loading: boolean
  onSave: () => void
  onCancel?: () => void
}

export function ApiForm({
  serviceName,
  setServiceName,
  apiPath,
  setApiPath,
  fields,
  setFields,
  selectedIndex,
  setSelectedIndex,
  boList,
  loading,
  onSave,
  onCancel,
}: ApiFormProps) {
  // Khởi tạo mặc định 5 method CRUD
  React.useEffect(() => {
    if (fields.length === 0) {
      setFields([
        { name: "getAll", type: "", required: true, isList: true, params: [], isDefaultCrud: true },
        { name: "getById", type: "", required: true, isList: false, params: [], isDefaultCrud: true },
        { name: "create", type: "", required: true, isList: false, params: [], isDefaultCrud: true },
        { name: "updateById", type: "", required: true, isList: false, params: [], isDefaultCrud: true },
        { name: "delete", type: "", required: true, isList: false, params: [], isDefaultCrud: true },
      ])
      setSelectedIndex(0)
    }
  }, [fields, setFields, setSelectedIndex])

  // update tất cả default CRUD khi chọn BO
  const handleDefaultBOChange = (boName: string) => {
    const newFields = fields.map((f) =>
      f.isDefaultCrud ? { ...f, type: boName } : f
    )
    setFields(newFields)
  }

  const handleChange = (
    key: keyof Field,
    value: string | boolean | MethodParam[]
  ) => {
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
        name: "newMethod",
        type: "string",
        required: true,
        isList: false,
        documentation: "",
        params: [],
      },
    ])
    setSelectedIndex(fields.length)
  }

  const removeField = () => {
    if (selectedIndex === null) return
    if (fields[selectedIndex].isDefaultCrud) return // ❌ không cho xoá default CRUD
    setFields(fields.filter((_, i) => i !== selectedIndex))
    setSelectedIndex(null)
  }

  return (
    <div className="flex flex-col h-[700px] border rounded-md shadow-sm">
      {/* Header */}
      <div className="p-3 border-b grid grid-cols-3 gap-4">
        <div>
          <Label className="block mb-1">API Service Name</Label>
          <Input
            placeholder="UserService"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
          />
        </div>
        <div>
          <Label className="block mb-1">API Path</Label>
          <Input
            placeholder="/api/users"
            value={apiPath}
            onChange={(e) => setApiPath(e.target.value)}
          />
        </div>
        <div>
          <Label className="block mb-1">Default BO</Label>
          <Select
            value={fields.find((f) => f.isDefaultCrud)?.type || ""}
            onValueChange={handleDefaultBOChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select BO" />
            </SelectTrigger>
            <SelectContent>
              {boList.map((bo) => (
                <SelectItem key={bo.id} value={bo.name}>
                  {bo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-1">
        {/* LEFT: Methods */}
        <div className="w-1/3 border-r p-3 flex flex-col">
          <div className="flex justify-between mb-3">
            <h3 className="flex font-semibold items-center">API Method</h3>
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
                {f.name} ({f.type || "?"}) {f.isList ? "[]" : ""}
                {f.isDefaultCrud && <span className="ml-2 text-xs text-gray-500">(CRUD)</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: Method Properties */}
        <div className="w-2/3 p-4">
          <h3 className="font-semibold mb-2">Method Properties</h3>
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
