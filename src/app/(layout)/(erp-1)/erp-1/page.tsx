"use client"

import React, { useMemo } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
import type { submitUserInfoReq } from "@/types/erp-1/submitUserInfoReq"

export default function GeneratedFormPage() {
	const fields: Field[] = useMemo(() => [
	{
		"id": "text-1759775565679",
		"label": "Text Input",
		"placeholder": "",
		"type": "text",
		"required": false,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1
	},
	{
		"id": "email-1759775566760",
		"label": "Email Input",
		"placeholder": "",
		"type": "email",
		"required": false,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1
	},
	{
		"id": "password-1759775568033",
		"label": "Password Input",
		"placeholder": "",
		"type": "password",
		"required": false,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1
	},
	{
		"id": "number-1759775570351",
		"label": "Number Input",
		"placeholder": "",
		"type": "number",
		"required": false,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1
	}
], [])

	const handleSubmit = (values: Record<string, unknown>) => {
        const submituserinforeq: submitUserInfoReq = {
        token: "",
        email: "",
        username: "",
        password: "",
        fullname: "",
        status: ""
    }
	console.log("Submitted objects:", { submituserinforeq })
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
