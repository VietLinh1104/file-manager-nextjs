"use client"

import { useParams } from "next/navigation"
import api from "@/lib/axios"
import React, { useEffect, useMemo, useState } from "react"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Field } from "@/components/ui/dynamic-form"
import type { TransactionRequest } from "@/api/swagger/models/TransactionRequest"
import { toast } from "sonner"
import { Attachments, TransactionResponse } from "@/api/swagger"

export default function GeneratedFormPage() {
	// 🟢 Lấy param [id] từ URL (ví dụ /transactions/123)
	const params = useParams()
	const id = params?.id as string | undefined
	const [initialData, setInitialData] = useState<TransactionResponse| null>(null)
	const [isEditing, setIsEditing] = useState<boolean>(!id) // 🖊️ Mặc định nếu có id thì chỉ xem, không sửa

	// 🟡 Lấy giao dịch theo ID
	async function getTransactionById(id: string) {
		try {
			console.log("📡 Gọi API lấy giao dịch với ID:", id)
			const res = await api.get(`/api/transactions/${id}`)
			setInitialData(res.data)
			console.log("✅ Dữ liệu giao dịch:", res.data)
		} catch (err) {
			console.error("❌ Lỗi khi load giao dịch:", err )
			toast.error("Không thể tải dữ liệu giao dịch")
		}
	}

	// 🧠 Tự động gọi khi có ID
	useEffect(() => {
		console.log("🟡 ID param nhận được:", id)
		if (id) getTransactionById(id)
	}, [id])

	// 🧱 Khởi tạo field cho form
	const fields: Field[] = useMemo(() => [
		{
			id: "doitac",
			label: "Đối tác",
			type: "select",
			colSpan: 1,
			required: false,
			options: [
				{ value: "056c80ac-d7df-492b-b9f4-35ecea5c3ea7", name: "HPT" },
				{ value: "08b737d0-0f75-4ea3-8a7b-a11afc2b5a65", name: "Apple" },
			],
			defaultValue: initialData?.partner?.partnerId ?? "",
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
			defaultValue: initialData?.transactionCategory?.transaction_category_id ?? "",
		},
		{
			id: "amount",
			label: "Số tiền giao dịch",
			type: "number",
			required: true,
			colSpan: 1,
			defaultValue: initialData?.amount ?? 0,
		},
		{
			id: "loaiGiaoDich",
			label: "Loại giao dịch",
			type: "select",
			colSpan: 1,
			options: [
				{ value: "INCOME", name: "Thu" },
				{ value: "EXPENSE", name: "Chi" },
			],
			defaultValue: initialData?.transactionType ?? "INCOME",
		},
		{
			id: "note",
			label: "Ghi chú",
			type: "textarea",
			colSpan: 2,
			defaultValue: initialData?.note ?? "",
		},
		{
			id: "attachments",
			label: "Tệp đính kèm",
			type: "file",
		disable: true,
			colSpan: 2,
			defaultValue: (initialData?.attachmentsList as Attachments[]) ?? [],
			},
	], [initialData])

	// 🧾 Xử lý submit
	const handleSubmit = async (values: Record<string, unknown>) => {
		const attachments = Array.isArray(values.attachments)
			? values.attachments.filter((a): a is { attachmentId: string } =>
				typeof a === "object" && !!a && "attachmentId" in a)
			: []

		const attachmentIds = attachments.map((a) => a.attachmentId)

		const transactionrequest: TransactionRequest = {
			userId: "d10d0f02-bc35-4cdc-8005-6cfe1323d9cb", // hoặc lấy từ context user
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
			const res = id
				? await api.put(`/api/transactions/${id}`, transactionrequest)
				: await api.post("/api/transactions", transactionrequest)

			toast.success(id ? "Cập nhật giao dịch thành công!" : "Tạo giao dịch thành công!")
			console.log("✅ Transaction saved:", res.data)
		} catch (err) {
			console.error("❌ Lỗi khi lưu giao dịch:", err)
			toast.error(`Lỗi khi lưu giao dịch: ${err}`)
		}
	}

	return (
		<div className="p-3">
		{id && !initialData ? (
			<p className="opacity-40">Đang tải dữ liệu...</p>
		) : (
			<DynamicForm
				title="Giao dịch"
				description={id ? "Cập nhật thông tin giao dịch" : "Nhập thông tin giao dịch mới"}
				fields={fields}
				readOnly={!isEditing} // 🔒 true = chỉ xem, false = cho phép nhập
				onEditClick={() => setIsEditing(!isEditing)} // ✏️ Nhấn “Sửa”
				onSubmit={handleSubmit}
		/>
		)}
	</div>
	)
}
