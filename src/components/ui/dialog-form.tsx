"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Field {
  id: string
  label: string
  type?: "text" | "textarea" | "select" | "radio" | "checkbox" | "date" | "file"
  defaultValue?: string | string[]
  placeholder?: string
  options?: string[] // dùng cho select, radio, checkbox
}

interface DialogFormProps {
  title: string
  description?: string
  triggerLabel: string
  fields: Field[]
  onSubmit?: (formData: FormData) => void
}

export function DialogForm({
  title,
  description,
  triggerLabel,
  fields,
  onSubmit,
}: DialogFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (onSubmit) onSubmit(formData)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          {/* Dynamic fields */}
          <div className="grid gap-4 py-10">
            {fields.map((field) => (
              <div className="grid gap-3" key={field.id}>
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
                    className="border rounded p-2"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "radio" ? (
                  <div className="flex gap-4">
                    {field.options?.map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          defaultChecked={field.defaultValue === opt}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : field.type === "checkbox" ? (
                  <div className="flex flex-col gap-2">
                    {field.options?.map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name={field.id}
                          value={opt}
                          defaultChecked={
                            Array.isArray(field.defaultValue) &&
                            field.defaultValue.includes(opt)
                          }
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
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

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
