"use client"

import { ColumnDef } from "@tanstack/react-table"

// Kiểu dữ liệu của bảng
export type Payment = {
  id: string
  amount: number      // faker.number.int → number
  status: "pending" | "processing" | "success" | "failed"
  email: string
  createdAt: string   // faker.date.isoDateTime → string
}

// Cột của bảng
export const columns: ColumnDef<Payment>[] = [
  // { accessorKey: "id", header: "ID" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "amount", header: "Amount" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "createdAt", header: "Created At" }
]