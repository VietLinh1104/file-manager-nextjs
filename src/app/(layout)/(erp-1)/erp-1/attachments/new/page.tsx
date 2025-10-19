"use client"
import api from "@/lib/axios"
import React, { useMemo } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
import type { TransactionRequest } from "@/api/swagger/models/TransactionRequest"
import { toast } from "sonner"
import { useRouter } from "next/navigation"




export default function GeneratedFormPage() {
	const router = useRouter();

	const fields: Field[] = useMemo(() => [
		{
			id: "doitac",
			label: "Đối tác",
			type: "select",
			required: false,
			colSpan: 1,
			options: [
				{ value: "056c80ac-d7df-492b-b9f4-35ecea5c3ea7", name: "HPT" },
				{ value: "08b737d0-0f75-4ea3-8a7b-a11afc2b5a65", name: "Apple" },
			],
		},
		{
			id: "danhMucGiaoDich",
			label: "Danh mục giao dịch",
			type: "select",
			required: true,
			colSpan: 1,
			options: [
				{ value: "19cdf939-332c-4c7e-9568-331b4f9b0712", name: "Mua hàng" },
				{ value: "c7226eb3-5e4b-4566-a7f1-7600e2c491bd", name: "Bán hàng" },
			],
		},
		{
			id: "amount",
			label: "Số tiền giao dịch",
			type: "number",
			required: true,
			colSpan: 1,
		},
		{
			id: "loaiGiaoDich",
			label: "Loại giao dịch",
			type: "select",
			colSpan: 1,
			required: true,
			options: [
				{ value: "INCOME", name: "Thu" },
				{ value: "EXPENSE", name: "Chi" },
			],
		},
		{
			id: "note",
			label: "Ghi chú",
			type: "textarea",
			colSpan: 1,
		},
		{ id: "attachments", label: "Tệp đính kèm", type: "file", colSpan: 2 },
	], [])

	/** ✅ Submit form */
	/** ✅ Submit form */
    const handleSubmit = async (values: Record<string, unknown>) => {
        console.log("🧾 attachments raw:", values["attachments"])


		const attachments = Array.isArray(values.attachments)
		? values.attachments.filter((a): a is { attachmentId: string } => 
			typeof a === "object" && !!a && "attachmentId" in a)
		: []

		const attachmentIds = attachments.map((a) => a.attachmentId)


        const transactionrequest: TransactionRequest = {
            userId: "d10d0f02-bc35-4cdc-8005-6cfe1323d9cb",
            partnerId: values["doitac"] as string,
            transactionCategoryId: values["danhMucGiaoDich"] as string,
            amount: Number(values["amount"]) || 0,
            transactionType: values["loaiGiaoDich"] as string,
            status: "PENDING",
            note: values["note"] as string,
            attachment_id: attachmentIds,
        }

        console.log("📤 Submitted object:", transactionrequest)

        try {
            const res = await api.post("/api/transactions", transactionrequest)
			toast.success("Tạo giao dịch thành công!")
            console.log("✅ Transaction created:", res.data)
			router.push(`/erp-1/transactions/${res.data.transactionId}`);
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
