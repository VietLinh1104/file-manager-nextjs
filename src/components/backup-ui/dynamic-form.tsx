"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"

export interface Field {
  id: string
  label: string
  type?: "text" | "textarea" | "select" | "radio" | "checkbox" | "date" | "file" | "number"
  defaultValue?: string | string[]
  placeholder?: string
  // ✅ options dạng object { value, name }
  options?: { value: string; name: string }[]
  colSpan?: number
}

interface DynamicFormProps {
  title: string
  description?: string
  fields: Field[]
  onSubmit?: (formData: FormData) => void
}

export function DynamicForm({ title, description, fields, onSubmit }: DynamicFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (onSubmit) onSubmit(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto rounded-md border p-6 space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Grid 2 cột */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className={`grid gap-2 ${
              field.colSpan === 2 ? "md:col-span-2" : ""
            }`}
          >
            <Label htmlFor={field.id}>{field.label}</Label>

            {field.type === "textarea" ? (
              <textarea
                id={field.id}
                name={field.id}
                defaultValue={field.defaultValue as string}
                placeholder={field.placeholder}
                className="border rounded p-2"
              />
            ) : field.type === "select" ? (
              <select
                id={field.id}
                name={field.id}
                defaultValue={field.defaultValue as string}
                className="w-full border rounded p-2"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.name}
                  </option>
                ))}
              </select>
            ) : field.type === "radio" ? (
              <div className="flex gap-4">
                {field.options?.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={field.id}
                      value={opt.value}
                      defaultChecked={field.defaultValue === opt.value}
                    />
                    {opt.name}
                  </label>
                ))}
              </div>
            ) : field.type === "checkbox" ? (
              field.options && field.options.length > 0 ? (
                // ✅ Checkbox group
                <div className="flex flex-col gap-2">
                  {field.options.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={field.id}
                        value={opt.value}
                        defaultChecked={
                          Array.isArray(field.defaultValue) &&
                          field.defaultValue.includes(opt.value)
                        }
                      />
                      {opt.name}
                    </label>
                  ))}
                </div>
              ) : (
                // ✅ Single checkbox
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={field.id}
                    name={field.id}
                    defaultChecked={field.defaultValue === "true"}
                  />
                  {field.label}
                </label>
              )
            ) : (
              <Input
                id={field.id}
                name={field.id}
                type={field.type || "text"}
                defaultValue={field.defaultValue as string}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="reset" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}
