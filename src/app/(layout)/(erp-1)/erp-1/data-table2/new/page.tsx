"use client"

import React, { useMemo } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
// import type { contractsResp } from "@/types/erp-1/contractsResp"
// import type { users } from "@/types/erp-1/users"
import { UppyDialog } from "@/components/ui/uppy-dialog"
import { MultipartFileUploader } from "@/components/ui/uppy-dashboard"

export default function GeneratedFormPage() {
  const fields: Field[] = useMemo(() => [
  {
    "id": "select-1759397687705",
    "label": "Select Input",
    "placeholder": "",
    "type": "select",
    "colSpan": 2,
    "options": [
      {
        "value": "opt1",
        "name": "Option 1"
      },
      {
        "value": "opt2",
        "name": "Option 2"
      }
    ]
  },
  {
    "id": "radio-1759397688825",
    "label": "Radio Input",
    "placeholder": "",
    "type": "radio",
    "colSpan": 1,
    "options": [
      {
        "value": "opt1",
        "name": "Option 1"
      },
      {
        "value": "opt2",
        "name": "Option 2"
      }
    ]
  },
  {
    "id": "date-1759397694439",
    "label": "Date Input",
    "placeholder": "",
    "type": "date",
    "colSpan": 1
  },
  {
    "id": "checkbox-1759397704280",
    "label": "Checkbox Input",
    "placeholder": "",
    "type": "checkbox",
    "colSpan": 1
  },
  { id: "attachments", label: "Tệp đính kèm", type: "file" ,"colSpan": 2}
], [])

  const handleSubmit = (values: Record<string, unknown>) => {
    console.log("Submitted objects:", values)
  };

  return (
    <div className="p-1.5">
      {/* <MultipartFileUploaderDialog
            onUploadSuccess={(result) => console.log(JSON.stringify(result))}
          /> */}
      <DynamicForm
        title="Generated Form"
        description="Form được gen tự động từ nhiều BO"
        fields={fields}
        onSubmit={handleSubmit}
      />
    </div>
  )
}