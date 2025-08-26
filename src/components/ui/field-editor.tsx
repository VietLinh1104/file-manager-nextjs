"use client"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"

export interface Field {
  id?: number
  name: string
  type: string
  required: boolean
  isList: boolean
  documentation?: string
}

export interface BO {
  id: number
  name: string
  fields?: Field[]
}

interface FieldEditorProps {
  field: Field | null
  boList: BO[]
  onChange: (key: keyof Field, value: string | boolean) => void
}

export function FieldEditor({ field, boList, onChange }: FieldEditorProps) {
  if (!field) {
    return <p className="text-gray-500 italic">Select a parameter to edit</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-1.5">Name</Label>
        <Input
          value={field.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-1.5">Variable Type</Label>
        <Select
          value={field.type}
          onValueChange={(value) => onChange("type", value)}
        >
          <SelectTrigger>
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

      <div className="flex items-center gap-2">
        <Checkbox
          id="required"
          checked={field.required}
          onCheckedChange={(value: boolean | "indeterminate") =>
            onChange("required", value === true)
          }
        />
        <Label htmlFor="required" className="mb-0">
          Required
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isList"
          checked={field.isList}
          onCheckedChange={(value: boolean | "indeterminate") =>
            onChange("isList", value === true)
          }
        />
        <Label htmlFor="isList" className="mb-0">
          List
        </Label>
      </div>

      <div>
        <Label className="mb-1.5">Documentation</Label>
        <Textarea
          className="h-20"
          value={field.documentation ?? ""}
          onChange={(e) => onChange("documentation", e.target.value)}
        />
      </div>
    </div>
  )
}
