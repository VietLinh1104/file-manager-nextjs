"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// ========== TYPES ==========
export interface Field {
  id: string
  label: string
  type?: "text" | "textarea" | "select" | "radio" | "checkbox" | "date" | "file" | "number"
  defaultValue?: string | string[] | Date | boolean
  placeholder?: string
  options?: { value: string; name: string }[]
  colSpan?: number
}

interface DynamicFormProps {
  title: string
  description?: string
  fields: Field[]
  onSubmit?: (values: Record<string, unknown>) => void
}

// ========== COMPONENT ==========
export function DynamicForm({ title, description, fields, onSubmit }: DynamicFormProps) {
  // Sinh schema động
  const schemaObj: Record<string, z.ZodTypeAny> = {}
  fields.forEach((f) => {
    if (f.type === "date") schemaObj[f.id] = z.date().optional()
    else if (f.type === "checkbox" && f.options?.length) schemaObj[f.id] = z.array(z.string()).optional()
    else if (f.type === "checkbox") schemaObj[f.id] = z.boolean().optional()
    else schemaObj[f.id] = z.string().optional()
  })
  const formSchema = z.object(schemaObj)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((acc, f) => {
      if (f.type === "checkbox" && f.options?.length) acc[f.id] = (f.defaultValue as string[]) || []
      else if (f.type === "checkbox") acc[f.id] = Boolean(f.defaultValue)
      else acc[f.id] = f.defaultValue || ""
      return acc
    }, {} as Record<string, unknown>),
  })

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit?.(values)
  }

  function handleReset() {
    form.reset()
    form.clearErrors()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        onReset={handleReset}
        className="w-full mx-auto rounded-md border p-6 space-y-6"
      >
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {fields.map((field) => (
            <FormField
              key={field.id}
              control={form.control}
              name={field.id}
              render={({ field: rhfField }) => (
                <FormItem
                  className={`grid gap-2 ${field.colSpan === 2 ? "md:col-span-2" : ""}`}
                >
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.type === "textarea" ? (
                      <Textarea
                        placeholder={field.placeholder}
                        {...rhfField}
                        value={rhfField.value as string}
                      />
                    ) : field.type === "select" ? (
                      <Select
                        onValueChange={rhfField.onChange}
                        defaultValue={String(rhfField.value || "")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || "Chọn..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "radio" ? (
                      <RadioGroup
                        onValueChange={rhfField.onChange}
                        defaultValue={String(rhfField.value || "")}
                        className="flex gap-4"
                      >
                        {field.options?.map((opt) => (
                          <div key={opt.value} className="flex items-center gap-2">
                            <RadioGroupItem
                              value={opt.value}
                              id={`${field.id}-${opt.value}`}
                            />
                            <label htmlFor={`${field.id}-${opt.value}`}>{opt.name}</label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : field.type === "checkbox" ? (
                      field.options && field.options.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {field.options.map((opt) => {
                            const arr = (rhfField.value as string[]) || []
                            return (
                              <label key={opt.value} className="flex items-center gap-2">
                                <Checkbox
                                  checked={arr.includes(opt.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) rhfField.onChange([...arr, opt.value])
                                    else rhfField.onChange(arr.filter((v) => v !== opt.value))
                                  }}
                                />
                                {opt.name}
                              </label>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={rhfField.value as boolean}
                            onCheckedChange={rhfField.onChange}
                          />
                          {field.label}
                        </div>
                      )
                    ) : field.type === "date" ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="justify-start text-left font-normal w-full"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {rhfField.value
                              ? format(rhfField.value as Date, "PPP")
                              : <span className="text-muted-foreground">Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={rhfField.value as Date | undefined}
                            onSelect={rhfField.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : field.type === "file" ? (
                      <Input
                        type="file"
                        onChange={(e) => rhfField.onChange(e.target.files)}
                      />
                    ) : (
                      <Input
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        {...rhfField}
                        value={rhfField.value as string}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="reset" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  )
}
