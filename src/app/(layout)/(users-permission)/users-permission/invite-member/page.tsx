"use client"

import React, { useMemo } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
import type { inviteUserReq } from "@/types/erp-1/inviteUserReq"
import {inviteuserService} from "@/services/erp-1/inviteuser.service"

export default function GeneratedFormPage() {
	const fields: Field[] = useMemo(() => [
	{
		"id": "emailInvite",
		"label": "Email",
		"placeholder": "Nhập Email cần thêm...",
		"type": "email",
		"colSpan": 2,
		"required": true


	}], [])

	const handleSubmit = (values: Record<string, unknown>) => {
		const inviteuserreq: inviteUserReq = {
			emailInvite: values["emailInvite"] as string
		}

			inviteuserService.create(inviteuserreq)
		.then((response) => {
			console.log("User invited successfully:", response.data);
		})
		.catch((error) => {
			console.error("Error inviting user:", error);
		});
		// console.log("Submitted objects:", { inviteuserreq })
	}

	return (
		<div className="p-1.5">
			<DynamicForm
				title="Invite User"
				description="Nhập thông tin để mời thành viên"
				fields={fields}
				onSubmit={handleSubmit}
			/>
		</div>
	)
}
