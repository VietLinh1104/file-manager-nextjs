"use client"
import api from "@/lib/axios"
import React, { useMemo } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
import type { PartnersRequest } from "@/api/swagger/models/PartnersRequest"
import { toast } from "sonner"
import { useRouter } from "next/navigation"




export default function GeneratedFormPage() {
	const router = useRouter();

	const fields: Field[] = useMemo(() => [
	{
		"id": "name",
		"label": "Tên đối tác",
		"placeholder": "",
		"type": "text",
		"required": true,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1
	},
	{
		"id": "type",
		"label": "Tệp đối tác",
		"placeholder": "",
		"type": "select",
		"required": true,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1,
		"options": [
		{
			"value": "CUSTOMER",
			"name": "Khách hàng"
		},
		{
			"value": "SUPPLIER",
			"name": "Nhà cung cấp"
		}
		]
	},
	{
		"id": "email",
		"label": "Email",
		"placeholder": "",
		"type": "email",
		"required": true,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1
	},
	{
		"id": "phone",
		"label": "Số điện thoại",
		"placeholder": "",
		"type": "text",
		"required": false,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1
	},
	{
		"id": "address",
		"label": "Địa chỉ",
		"placeholder": "",
		"type": "text",
		"required": false,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1
	}
	], [])


	/** ✅ Submit form */
	/** ✅ Submit form */
    const handleSubmit = async (values: Record<string, unknown>) => {


		// const attachments = Array.isArray(values.attachments)
		// ? values.attachments.filter((a): a is { attachmentId: string } => 
		// 	typeof a === "object" && !!a && "attachmentId" in a)
		// : []

		// const attachmentIds = attachments.map((a) => a.attachmentId)


        const partnersrequest: PartnersRequest = {
			name: values["name"] as string,
			type: values["type"] as string,
			email: values["email"] as string,
			phone: values["phone"] as string,
			address: values["address"] as string
		}


        // console.log("📤 Submitted object:", transactionrequest)

        try {
            const res = await api.post("/api/partners", partnersrequest)
			toast.success("Tạo giao dịch thành công!")
            console.log("✅ Transaction created:", res.data)
			router.push(`/erp-1/transactions/${res.data.partnerId}`);
        } catch (err) {
			toast.error("Tạo giao dịch thất bại!")
            console.error("❌ Lỗi khi tạo transaction:", err)
			
        }
    }


	return (
		<div className="p-1.5">
			<DynamicForm
				title="Giao dịch"
				description="Nhập thông tin giao dịch mới"
				fields={fields}
				onSubmit={handleSubmit}
			/>
		</div>
	)
}
