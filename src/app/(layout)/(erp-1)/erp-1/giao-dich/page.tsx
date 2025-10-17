"use client"
import api from "@/lib/axios"

import React, { useMemo } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
import type { TransactionRequest } from "@/api/swagger/models/TransactionRequest"

export default function GeneratedFormPage() {
	const fields: Field[] = useMemo(() => [
	{
		"id": "doitac",
		"label": "Đối tác",
		"placeholder": "",
		"type": "select",
		"required": false,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1,
		"options": [
			{
				"value": "056c80ac-d7df-492b-b9f4-35ecea5c3ea7",
				"name": "HPT"
			},
			{
				"value": "08b737d0-0f75-4ea3-8a7b-a11afc2b5a65",
				"name": "Apple"
			}
		]
	},
	{
		"id": "danhMucGiaoDich",
		"label": "Danh mục giao dịch",
		"placeholder": "",
		"type": "select",
		"required": true,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1,
		"options": [
			{
				"value": "19cdf939-332c-4c7e-9568-331b4f9b0712",
				"name": "Mua hàng"
			},
			{
				"value": "c7226eb3-5e4b-4566-a7f1-7600e2c491bd",
				"name": "Bán hàng"
			}
		]
	},
	{
		"id": "amount",
		"label": "Số tiền giao dịch",
		"placeholder": "",
		"type": "number",
		"required": true,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1
	},
	{
		"id": "loaiGiaoDich",
		"label": "Loại giao dịch",
		"placeholder": "",
		"type": "select",
		"required": false,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1,
		"options": [
			{
				"value": "INCOME",
				"name": "Thu"
			},
			{
				"value": "EXPENSE",
				"name": "Chi"
			}
		]
	},
	{
		"id": "note",
		"label": "Ghi chú",
		"placeholder": "",
		"type": "textarea",
		"required": false,
		"disabled": false,
		"defaultValue": "",
		"colSpan": 1
	},
	{ id: "attachments", label: "Tệp đính kèm", type: "file" ,"colSpan": 2}
    ], [])

	const handleSubmit = async  (values: Record<string, unknown>) => {



        const transactionrequest: TransactionRequest = {
            userId: "d10d0f02-bc35-4cdc-8005-6cfe1323d9cb",
            partnerId: values["doitac"] as string,
            transactionCategoryId: values["danhMucGiaoDich"] as string,
            amount: Number(values["amount"]) || 0,
            transactionType: values["loaiGiaoDich"] as string,
            status: "PENDING",
            note: values["note"] as string,
            attachment_id: ["31c5900a-99fa-4f5b-b208-032e1e8d1861","34a4d345-b2ad-4234-a5a7-a3aadec67c88"]
        }
        console.log("Submitted objects:", { transactionrequest })
        console.log("Submitted objects:", JSON.stringify(transactionrequest, null, 2))

        try {
            const res = await api.post("/api/transactions", transactionrequest)
            console.log("✅ Transaction created:", res.data)
        } catch (err) {
            console.error("❌ Lỗi khi tạo transaction:", err)
        }

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
