"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/erp-1/User"

// Cột của bảng
export const columns: ColumnDef<User>[] = [
  // { accessorKey: "id", header: "ID" },
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" }
]