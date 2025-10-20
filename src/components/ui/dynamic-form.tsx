"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
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
import { CalendarIcon, Eye, EyeOff, Pencil, Trash } from "lucide-react"
import { format } from "date-fns"
import { UppyDialog } from "@/components/ui/uppy-dialog"
import { Attachments } from "@/api/swagger"
import { AttachmentList } from "@/components/ui/attachment-list"

export interface Field {
  id: string
  label: string
  type?:
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "file"
    | "number"
  defaultValue?: string | string[] | Date | boolean | number | Attachments[]
  placeholder?: string
  options?: { value: string; name: string }[]
  colSpan?: number
  disabled?: boolean
  required?: boolean
}

interface DynamicFormProps {
  title: string
  description?: string
  fields: Field[]
  onSubmit?: (values: Record<string, unknown>) => Promise<void> | void
  disabledFields?: string[]
  isSubmitting?: boolean
  readOnly?: boolean
  onEditClick?: () => void
  onDeleteClick?: () => void
}

export function DynamicForm({
  title,
  description,
  fields,
  onSubmit,
  disabledFields = [],
  isSubmitting = false,
  readOnly = false,
  onEditClick,
  onDeleteClick,
}: DynamicFormProps) {
  // ✅ local state kiểm soát disable thực tế
  const [internalSubmitting, setInternalSubmitting] = useState(false)

  // ✅ Tạo schema động
  const schemaObj: Record<string, z.ZodTypeAny> = {}
  fields.forEach((f) => {
    if (f.type === "date") {
      schemaObj[f.id] = f.required
        ? z.date().refine((v) => !!v, { message: `${f.label} là bắt buộc` })
        : z.date().optional()
    } else if (f.type === "email") {
      const base = z.string().email("Email không hợp lệ")
      schemaObj[f.id] = f.required
        ? base.min(1, `${f.label} là bắt buộc`)
        : base.optional()
    } else if (f.type === "checkbox" && f.options?.length) {
      const base = z.array(z.string())
      schemaObj[f.id] = f.required
        ? base.min(1, `Chọn ít nhất một ${f.label}`)
        : base.optional()
    } else if (f.type === "checkbox") {
      schemaObj[f.id] = f.required
        ? z.boolean().refine((val) => val === true, `${f.label} là bắt buộc`)
        : z.boolean().optional()
    } else if (f.type === "file") {
      schemaObj[f.id] = z.any().optional()
    } else if (f.type === "number") {
      const base = z.preprocess(
        (val) => {
          if (typeof val === "string" && val.trim() !== "") {
            const num = Number(val.replace(/\./g, "").replace(/,/g, ""))
            return isNaN(num) ? undefined : num
          }
          return val
        },
        z.number().refine((v) => !isNaN(v), `${f.label} phải là số`)
      )
      schemaObj[f.id] = f.required
        ? base.refine((v) => !isNaN(v), `${f.label} là bắt buộc`)
        : base.optional()
    } else {
      const base = z.string()
      schemaObj[f.id] = f.required
        ? base.min(1, `${f.label} không được để trống`)
        : base.optional()
    }
  })

  const formSchema = z.object(schemaObj)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((acc, f) => {
      if (f.type === "checkbox" && f.options?.length)
        acc[f.id] = (f.defaultValue as string[]) || []
      else if (f.type === "checkbox") acc[f.id] = Boolean(f.defaultValue)
      else if (f.type === "file") acc[f.id] = f.defaultValue ?? []
      else acc[f.id] = f.defaultValue ?? ""
      return acc
    }, {} as Record<string, unknown>),
  })

  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const togglePassword = (id: string) =>
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }))

  // ✅ xử lý submit và kiểm soát trạng thái
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setInternalSubmitting(true)
      await onSubmit?.(values)
      toast.success("✅ Lưu dữ liệu thành công!")
      form.reset(values)
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err)
      toast.error("Không thể lưu dữ liệu")
    } finally {
      setInternalSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset()
    form.clearErrors()
  }

  // 🛑 Cảnh báo khi rời trang nếu form chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (internalSubmitting || form.formState.isDirty) {
        event.preventDefault()
        event.returnValue =
          "Bạn có thay đổi chưa lưu. Rời khỏi trang sẽ mất dữ liệu!"
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [internalSubmitting, form.formState.isDirty])

  const disabledAll = internalSubmitting || isSubmitting

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        onReset={handleReset}
        className="w-full mx-auto rounded-md border p-6 space-y-6 relative"
      >
        {/* 🧭 Góc phải: Edit/Delete */}
        <div className="absolute top-4 right-4 flex gap-2">
          {onEditClick && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onEditClick}
              disabled={disabledAll}
            >
              <Pencil className="h-4 w-4 mr-1" /> Sửa
            </Button>
          )}
          {onDeleteClick && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onDeleteClick}
              disabled={disabledAll}
            >
              <Trash className="h-4 w-4 mr-1" /> Xóa
            </Button>
          )}
        </div>

        {/* Tiêu đề & mô tả */}
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Body form */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {fields.map((field) => {
            const isDisabled =
              readOnly || disabledAll || disabledFields.includes(field.id) || field.disabled

            return (
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
                      {field.type === "file" ? (
                        <div className="flex flex-col gap-2">
                          {readOnly ? (
                            <AttachmentList files={rhfField.value as Attachments[]} readOnly />
                          ) : (
                            <>
                              <UppyDialog
                                onUploadSuccess={(uploadedFiles) => {
                                  const current = (rhfField.value as Attachments[]) ?? []
                                  const merged = [...current, ...uploadedFiles]
                                  form.setValue(field.id, merged, { shouldDirty: true })
                                }}
                              />
                              <AttachmentList
                                files={(rhfField.value as Attachments[]) ?? []}
                                onChange={(newFiles) => {
                                  form.setValue(field.id, newFiles)
                                }}
                              />
                            </>
                          )}
                        </div>
                      ) : field.type === "textarea" ? (
                        <Textarea
                          placeholder={field.placeholder}
                          {...rhfField}
                          value={rhfField.value as string}
                          disabled={isDisabled}
                          readOnly={readOnly}
                        />
                      ) : field.type === "number" ? (
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder={field.placeholder}
                          value={
                            rhfField.value
                              ? Number(rhfField.value).toLocaleString("vi-VN")
                              : ""
                          }
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\./g, "").replace(/,/g, "")
                            if (!isNaN(Number(raw))) rhfField.onChange(Number(raw))
                          }}
                          disabled={isDisabled}
                          readOnly={readOnly}
                        />
                      ) : field.type === "password" ? (
                        <div className="relative">
                          <Input
                            type={showPassword[field.id] ? "text" : "password"}
                            placeholder={field.placeholder}
                            {...rhfField}
                            value={rhfField.value as string}
                            disabled={isDisabled}
                            readOnly={readOnly}
                          />
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => togglePassword(field.id)}
                              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                            >
                              {showPassword[field.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      ) : field.type === "select" ? (
                        <Select
                          onValueChange={rhfField.onChange}
                          defaultValue={String(rhfField.value || "")}
                          disabled={isDisabled}
                        >
                          <SelectTrigger className="w-full">
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
                      ) : field.type === "date" ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="justify-start text-left font-normal w-full"
                              disabled={isDisabled}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {rhfField.value ? (
                                format(rhfField.value as Date, "PPP")
                              ) : (
                                <span className="text-muted-foreground">Chọn ngày</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={rhfField.value as Date | undefined}
                              onSelect={rhfField.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input
                          type={field.type || "text"}
                          placeholder={field.placeholder}
                          {...rhfField}
                          value={rhfField.value as string}
                          disabled={isDisabled}
                          readOnly={readOnly}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          })}
        </div>

        {/* Footer */}
        {!readOnly && (
          <div className="flex justify-end gap-2">
            <Button type="reset" variant="outline" disabled={disabledAll}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={disabledAll || !form.formState.isDirty}
            >
              {disabledAll ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
