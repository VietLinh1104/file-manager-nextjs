"use client"

import React, { useMemo } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
import type { File } from "@/types/erp-1/File"

export default function GeneratedFormPage() {
	const fields: Field[] = useMemo(() => [
  {
    "id": "checkbox-1759227862702",
    "label": "Checkbox Input",
    "placeholder": "",
    "type": "checkbox",
    "colSpan": 1
  }
], [])

	const handleSubmit = (formData: FormData) => {
        const file: File = {
        checkbox: formData.get("checkbox-1759227862702") !== null
    }

	console.log("Submitted objects:", { file })
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
