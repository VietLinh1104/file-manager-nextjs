"use client"

import React, { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
import type { submitUserInfoReq } from "@/types/erp-1/submitUserInfoReq"
import {submituserinforeqService } from "@/services/erp-1/submituserinforeq.service"

export default function GeneratedFormPage() {
	const searchParams = useSearchParams()
	const token = searchParams.get("token") || ""
	const email = searchParams.get("email") || ""


  const fields: Field[] = useMemo(() => [
  {
    id: "email",
    label: "Email",
    placeholder: email,
    type: "email",
    defaultValue: email,
    disabled: true,
    required: true,
    colSpan: 1
  },
  {
    id: "username",
    label: "Username",
    type: "text",
    required: true,
    colSpan: 1
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    required: true,
    colSpan: 1
  },
  {
    id: "re-password",
    label: "Re-Password",
    type: "password",
    required: true,
    colSpan: 1
  },
  {
    id: "fullname",
    label: "Full-name",
    type: "text",
    required: true,
    colSpan: 1
  }
], [email])


	const handleSubmit = (values: Record<string, unknown>) => {
    const submituserinforeq: submitUserInfoReq = {
      token: token,
      email: email,
      username: values["username"] as string,
      password: values["password"] as string,
      fullname: values["fullname"] as string,
      status: "ACTIVE",
    }

    submituserinforeqService.create(submituserinforeq)
    .then((response) => {
			console.log("User invited successfully:", response.data);
		})
		.catch((error) => {
			console.error("Error inviting user:", error);
		});
  }

	return (
		<div className="p-1.5 max-w-5xl mx-auto mt-48 ">
			<DynamicForm
				title="Nhập thông tin người dùng"
				description="Nhập thông tin người dùng"
				fields={fields}
				onSubmit={handleSubmit}
			/>
		</div>
	)
}
