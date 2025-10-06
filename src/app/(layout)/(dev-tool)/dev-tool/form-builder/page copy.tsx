"use client"

import React, { useEffect, useState } from "react"
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Trash, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ========================== Types ==========================
interface BOField {
  id: number
  name: string
  type: string
  required: boolean
}
interface BO {
  id: number
  name: string
  fields: BOField[]
}
interface FormField {
  internalKey: string
  id: string
  uiType: string
  label: string
  placeholder?: string
  boundTo?: string
  options?: { value: string; name: string }[]
  dataType?: "string" | "number" | "boolean" | "File" | "Date"
  boId?: number
}

// ========================== Drag Item ==========================
function DraggableItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded border px-2 py-1 text-sm bg-muted hover:bg-accent"
    >
      {label}
    </div>
  )
}

// ========================== Canvas ==========================
function DroppableCanvas({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: "form-canvas" })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] rounded border p-4 transition ${
        isOver ? "bg-blue-50 border-blue-400" : "bg-background"
      }`}
    >
      {children}
    </div>
  )
}

// ========================== Main ==========================
export default function FormBuilderPage() {
  const [bos, setBos] = useState<BO[]>([])
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    fetch("/api/data-types")
      .then((res) => res.json())
      .then(setBos)
  }, [])

  // ========================== Handle Drag ==========================
  function handleDragEnd(event: DragEndEvent) {
    if (event.over?.id === "form-canvas") {
      const id = event.active.id as string
      if (id.startsWith("input:")) {
        const type = id.replace("input:", "")
        const uniqueKey = `${type}-${Date.now()}`
        const newField: FormField = {
          internalKey: uniqueKey,
          id: uniqueKey,
          uiType: type,
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Input`,
          placeholder: "",
          options:
            type === "select" || type === "radio"
              ? [
                  { value: "opt1", name: "Option 1" },
                  { value: "opt2", name: "Option 2" },
                ]
              : undefined,
          dataType:
            type === "file"
              ? "File"
              : type === "number"
              ? "number"
              : type === "date"
              ? "Date"
              : type === "checkbox"
              ? "boolean"
              : "string",
        }
        setFormFields((prev) => [...prev, newField])
        setSelectedFieldId(uniqueKey)
      }
    }
  }

  function updateField(internalKey: string, updates: Partial<FormField>) {
    setFormFields((prev) =>
      prev.map((f) => (f.internalKey === internalKey ? { ...f, ...updates } : f))
    )
  }

  function deleteField(internalKey: string) {
    setFormFields((prev) => prev.filter((f) => f.internalKey !== internalKey))
    if (selectedFieldId === internalKey) setSelectedFieldId(null)
  }

  // ========================== Generate Code (NEW) ==========================
  function generateCode() {
    const ids = formFields.map((f) => f.id)
    const duplicate = ids.find((id, i) => ids.indexOf(id) !== i)
    if (duplicate) {
      alert(`❌ Trùng id: ${duplicate}. Vui lòng chỉnh lại trong Properties.`)
      return
    }

    const boFieldMap: Record<number, FormField[]> = {}
    formFields.forEach((f) => {
      if (f.boId) {
        if (!boFieldMap[f.boId]) boFieldMap[f.boId] = []
        boFieldMap[f.boId].push(f)
      }
    })
    const usedBOs = bos.filter((bo) => boFieldMap[bo.id])
    if (usedBOs.length === 0) {
      alert("Bạn cần bind ít nhất 1 field vào BO để generate code")
      return
    }

    const imports = usedBOs
      .map((bo) => `import type { ${bo.name} } from "@/types/erp-1/${bo.name}"`)
      .join("\n")

    const fieldsCode = JSON.stringify(
      formFields.map((f) => ({
        id: f.id,
        label: f.label,
        placeholder: f.placeholder,
        type: f.uiType,
        colSpan: 1,
        ...(f.options ? { options: f.options } : {}),
      })),
      null,
      2
    )

    const objects = usedBOs
      .map((bo) => {
        const bindingMap = Object.fromEntries((boFieldMap[bo.id] || []).map((f) => [f.boundTo, f]))
        return ` const ${bo.name.toLowerCase()}: ${bo.name} = {
${bo.fields
  .map((boF) => {
    const bound = bindingMap[boF.name]
    if (bound) {
      const dt = bound.dataType || "string"
      if (bound.uiType === "checkbox") {
        if (bound.options && bound.options.length > 0) {
          return ` ${boF.name}: values["${bound.id}"] as string[]`
        }
        return ` ${boF.name}: values["${bound.id}"] as boolean`
      }
      if (dt === "number") {
        return ` ${boF.name}: Number(values["${bound.id}"]) || 0`
      }
      if (dt === "Date") {
        return ` ${boF.name}: values["${bound.id}"] as Date | undefined`
      }
      if (dt === "File") {
        return ` ${boF.name}: values["${bound.id}"] as File`
      }
      return ` ${boF.name}: values["${bound.id}"] as string`
    }

    // nếu chưa bind
    if (boF.required) {
      switch (boF.type) {
        case "number":
          return ` ${boF.name}: 0`
        case "boolean":
          return ` ${boF.name}: false`
        case "Date":
          return ` ${boF.name}: new Date()`
        case "File":
          return ` ${boF.name}: null as unknown as File`
        default:
          return ` ${boF.name}: ""`
      }
    }
    return ` ${boF.name}: undefined`
  })
  .filter(Boolean)
  .join(",\n")}
}`
      })
      .join("\n\n")

    const code = `"use client"

import React, { useMemo } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
${imports}

export default function GeneratedFormPage() {
  const fields: Field[] = useMemo(() => ${fieldsCode}, [])

  const handleSubmit = (values: Record<string, unknown>) => {
${objects}

    console.log("Submitted objects:", { ${usedBOs.map((bo) => bo.name.toLowerCase()).join(", ")} })
  }

  return (
    <div className="p-1.5">
      <DynamicForm
        title="Generated Form"
        description="Form được gen tự động từ nhiều BO"
        fields={fields}
        onSubmit={handleSubmit}
      />
    </div>
  )
}`

    setGeneratedCode(code)
    setShowDialog(true)
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedCode)
  }

  // ========================== Render ==========================
  const selectedField = formFields.find((f) => f.internalKey === selectedFieldId)

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen">
        {/* Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="mb-2 font-medium">Form Canvas</h2>
          <DroppableCanvas>
            {formFields.length === 0 && (
              <p className="text-sm text-muted-foreground">Kéo input từ sidebar vào đây</p>
            )}
            <div className="space-y-3">
              {formFields.map((f) => (
                <div
                  key={f.internalKey}
                  onClick={() => setSelectedFieldId(f.internalKey)}
                  className={`flex items-center justify-between rounded border p-2 cursor-pointer ${
                    selectedFieldId === f.internalKey ? "border-blue-500 bg-blue-50" : ""
                  }`}
                >
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">{f.label}</label>
                    {f.uiType === "text" && <Input disabled placeholder={f.placeholder} />}
                    {f.uiType === "number" && <Input type="number" disabled placeholder={f.placeholder} />}
                    {f.uiType === "date" && <Input type="date" disabled />}
                    {f.uiType === "file" && <Input type="file" disabled />}
                    {f.uiType === "textarea" && (
                      <textarea disabled placeholder={f.placeholder} className="w-full border rounded p-2" />
                    )}
                    {f.uiType === "select" && (
                      <select disabled className="w-full border rounded p-2">
                        {f.options?.map((o) => (
                          <option key={o.value}>{o.name}</option>
                        ))}
                      </select>
                    )}
                    {f.uiType === "radio" && (
                      <div className="flex gap-2">
                        {f.options?.map((o) => (
                          <label key={o.value} className="flex items-center gap-1 text-xs">
                            <input type="radio" disabled /> {o.name}
                          </label>
                        ))}
                      </div>
                    )}
                    {f.uiType === "checkbox" && (
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" disabled /> {f.label}
                      </label>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteField(f.internalKey)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </DroppableCanvas>

          <Button className="mt-6" onClick={generateCode}>
            Generate Code
          </Button>
        </div>

        {/* Sidebar */}
        <aside className="w-80 border-l flex flex-col p-4 bg-background">
          <div>
            <h2 className="mb-2 font-medium">Inputs</h2>
            <div className="flex flex-wrap gap-2">
              {["text", "number", "textarea", "select", "radio", "checkbox", "date", "file"].map((t) => (
                <DraggableItem key={t} id={`input:${t}`} label={t} />
              ))}
            </div>
          </div>

          {selectedField && (
            <Tabs defaultValue="props" className="mt-4 flex-1 flex flex-col">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="props">Props</TabsTrigger>
                <TabsTrigger value="binding">Binding</TabsTrigger>
                <TabsTrigger value="datatype">Type</TabsTrigger>
              </TabsList>

              {/* Props */}
              <TabsContent value="props" className="mt-2 space-y-3 flex-1 overflow-y-auto">
                <div>
                  <label className="text-xs font-medium">ID</label>
                  <Input
                    value={selectedField.id}
                    onChange={(e) => updateField(selectedField.internalKey, { id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Label</label>
                  <Input
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.internalKey, { label: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Placeholder</label>
                  <Input
                    value={selectedField.placeholder}
                    onChange={(e) => updateField(selectedField.internalKey, { placeholder: e.target.value })}
                  />
                </div>
              </TabsContent>

              {/* Binding */}
              <TabsContent value="binding" className="mt-2 space-y-3 flex-1 overflow-y-auto">
                <div>
                  <label className="text-xs font-medium">Chọn BO</label>
                  <Select
                    onValueChange={(val) =>
                      updateField(selectedField.internalKey, { boId: Number(val), boundTo: undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select BO" />
                    </SelectTrigger>
                    <SelectContent>
                      {bos.map((bo) => (
                        <SelectItem key={bo.id} value={bo.id.toString()}>
                          {bo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedField.boId && (
                  <div>
                    <label className="text-xs font-medium">Bind Field</label>
                    <Select
                      onValueChange={(val) =>
                        updateField(selectedField.internalKey, {
                          boundTo: val,
                          dataType:
                            (bos
                              .find((b) => b.id === selectedField.boId)
                              ?.fields.find((f) => f.name === val)?.type as FormField["dataType"]) ||
                            "string",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedField.boundTo || "Select BO field..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {bos
                          .find((b) => b.id === selectedField.boId)
                          ?.fields.map((boF) => (
                            <SelectItem key={boF.id} value={boF.name}>
                              {boF.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>

              {/* DataType */}
              <TabsContent value="datatype" className="mt-2 space-y-3 flex-1 overflow-y-auto">
                <div>
                  <label className="text-xs font-medium">Data Type</label>
                  <Select
                    onValueChange={(val) =>
                      updateField(selectedField.internalKey, { dataType: val as FormField["dataType"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedField.dataType || "string"} />
                    </SelectTrigger>
                    <SelectContent>
                      {["string", "number", "boolean", "File", "Date"].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </aside>
      </div>

      {/* Dialog hiển thị code */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[90vw]">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle>Generated Code</DialogTitle>
            <Button size="icon" variant="ghost" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <pre className="mt-2 p-4 border rounded bg-muted text-xs overflow-x-auto whitespace-pre-wrap max-h-[700px]">
            {generatedCode}
          </pre>
        </DialogContent>
      </Dialog>
    </DndContext>
  )
}
