"use client"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { Trash, Plus } from "lucide-react"

export interface MethodParam {
  name: string
  type: string
  required: boolean
  isList: boolean
}

export interface Field {
  id?: number
  name: string
  type: string
  required: boolean
  isList: boolean
  documentation?: string
  params?: MethodParam[]
  isDefaultCrud?: boolean // 👈 flag để phân biệt default CRUD
}

export interface BO {
  id: number
  name: string
  fields?: Field[]
}

interface FieldEditorProps {
  field: Field | null
  boList: BO[]
  onChange: (
    key: keyof Field,
    value: string | boolean | MethodParam[]
  ) => void
}

export function FieldEditor({ field, boList, onChange }: FieldEditorProps) {
  if (!field) {
    return <p className="text-gray-500 italic">Select a method to edit</p>
  }

  // Nếu là CRUD mặc định → disable input
  const isDisabled = field.isDefaultCrud === true

  const updateParam = (
    idx: number,
    key: keyof MethodParam,
    value: string | boolean
  ) => {
    if (isDisabled) return // ❌ default CRUD không cho chỉnh param
    const newParams: MethodParam[] = [...(field.params ?? [])]
    newParams[idx] = { ...newParams[idx], [key]: value } as MethodParam
    onChange("params", newParams)
  }

  const addParam = () => {
    if (isDisabled) return
    const newParam: MethodParam = {
      name: "param",
      type: "string",
      required: true,
      isList: false,
    }
    onChange("params", [...(field.params ?? []), newParam])
  }

  const removeParam = (idx: number) => {
    if (isDisabled) return
    const newParams: MethodParam[] = (field.params ?? []).filter(
      (_, i) => i !== idx
    )
    onChange("params", newParams)
  }

  return (
    <div className="space-y-6">
      {/* Method name */}
      <div>
        <Label className="mb-1.5">Method Name</Label>
        <Input
          value={field.name}
          disabled={isDisabled}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>

      {/* Return type */}
      <div>
        <Label className="mb-1.5">Return Type</Label>
        <Select
          value={field.type}
          onValueChange={(value) => onChange("type", value)}
          disabled={isDisabled}
        >
          <SelectTrigger disabled={isDisabled}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Primitives</SelectLabel>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="Date">Date</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Business Objects</SelectLabel>
              {boList.map((bo) => (
                <SelectItem key={bo.id} value={bo.name}>
                  {bo.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Parameters */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Parameters</Label>
          {!isDisabled && (
            <Button size="sm" variant="outline" onClick={addParam}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </div>

        {(field.params ?? []).length === 0 && (
          <p className="text-sm text-gray-500 italic">No parameters</p>
        )}

        {(field.params ?? []).map((p, idx) => (
          <div
            key={idx}
            className="border rounded-md p-2 mb-2 flex flex-col gap-2 bg-gray-50"
          >
            <div className="flex gap-2">
              <Input
                placeholder="name"
                value={p.name}
                disabled={isDisabled}
                onChange={(e) => updateParam(idx, "name", e.target.value)}
              />
              <Select
                value={p.type}
                onValueChange={(value) => updateParam(idx, "type", value)}
                disabled={isDisabled}
              >
                <SelectTrigger className="w-[140px]" disabled={isDisabled}>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Primitives</SelectLabel>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="Date">Date</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Business Objects</SelectLabel>
                    {boList.map((bo) => (
                      <SelectItem key={bo.id} value={bo.name}>
                        {bo.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {!isDisabled && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeParam(idx)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-4 ml-1">
              <div className="flex items-center gap-1">
                <Checkbox
                  checked={p.required}
                  disabled={isDisabled}
                  onCheckedChange={(val) =>
                    updateParam(idx, "required", val === true)
                  }
                />
                <Label className="text-sm">Required</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  checked={p.isList}
                  disabled={isDisabled}
                  onCheckedChange={(val) =>
                    updateParam(idx, "isList", val === true)
                  }
                />
                <Label className="text-sm">List</Label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flags for return value */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="required"
          checked={field.required}
          disabled={isDisabled}
          onCheckedChange={(value: boolean | "indeterminate") =>
            onChange("required", value === true)
          }
        />
        <Label htmlFor="required" className="mb-0">
          Required (return)
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isList"
          checked={field.isList}
          disabled={isDisabled}
          onCheckedChange={(value: boolean | "indeterminate") =>
            onChange("isList", value === true)
          }
        />
        <Label htmlFor="isList" className="mb-0">
          Return List
        </Label>
      </div>

      {/* Documentation */}
      <div>
        <Label className="mb-1.5">Documentation</Label>
        <Textarea
          className="h-20"
          value={field.documentation ?? ""}
          disabled={isDisabled}
          onChange={(e) => onChange("documentation", e.target.value)}
        />
      </div>
    </div>
  )
}
