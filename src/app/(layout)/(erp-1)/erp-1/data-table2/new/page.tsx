"use client"

import React, { useMemo } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
import type { contractsResp } from "@/types/erp-1/contractsResp"
import type { users } from "@/types/erp-1/users"

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
  }
], [])

  const handleSubmit = (values: Record<string, unknown>) => {
 const contractsresp: contractsResp = {
 contract_id: undefined,
 partner_id: values["select-1759397687705"] as string,
 user_id: values["radio-1759397688825"] as string,
 title: "",
 status: undefined,
 created_at: undefined,
 updated_at: values["date-1759397694439"] as Date | undefined
}

 const users: users = {
 user_id: "",
 role_id: undefined,
 username: undefined,
 password_hash: undefined,
 full_name: undefined,
 email: undefined,
//  status: values["checkbox-1759397704280"] as boolean,
 created_at: undefined,
 updated_at: undefined
}

    console.log("Submitted objects:", { contractsresp, users })
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
}