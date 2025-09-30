"use client"

import React, { useMemo } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
import type { File } from "@/types/erp-1/File"

export default function GeneratedFormPage() {
	const fields: Field[] = useMemo(() => [
        {
            "id": "checkbox-file",
            "label": "Checkbox Input",
            "placeholder": "",
            "type": "checkbox",
            "colSpan": 1
        }
    ], [])

	const handleSubmit = (formData: FormData) => {
        const file: File = {
            checkbox: formData.get("checkbox-file") !== null
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
