"use client"

import React, { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Trash, Plus, FileDown } from "lucide-react"
import { Transactions } from "@/api/swagger/models/Transactions"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useRouter } from "next/navigation"
import { confirmToast } from "@/components/ui/confirm-toast"
import { Partners } from "@/api/swagger/models/Partners"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import type { SpringPage } from "@/components/ui/data-table" // ⚡ import kiểu SpringPage


export const columns: ColumnDef<Partners>[] = [
 {
    accessorKey: "name",
    header: "Tên đối tác",
    cell: ({ row }) => {
      const val = row.getValue("name")
      return val
    }
  },
 {
    accessorKey: "type",
    header: "Danh mục",
    cell: ({ row }) => {
      const val = row.getValue("type")
      return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">{val as string}</span>
    }
  },
 {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const val = row.getValue("email")
      return val
    }
  },
 {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => {
      const val = row.getValue("phone")
      return val
    }
  },
 {
    accessorKey: "address",
    header: "Địa chỉ",
    cell: ({ row }) => {
      const val = row.getValue("address")
      return val
    }
  },
 {
    accessorKey: "createdAt",
    header: "Create At",
    cell: ({ row }) => {
      const val = row.getValue("createdAt")
      return val ? new Date(val as Date).toLocaleDateString() : ""
    }
  }
]


// 🧩 Component chính
export default function TransactionListTable() {
	//#region State
	const [pageData, setPageData] = useState<SpringPage<Partners>>() // ✅ dùng kiểu Page<Transactions>
	const [pageIndex, setPageIndex] = useState(0)
	const [pageSize] = useState(10)
	const [loading, setLoading] = useState(false)
	const [search, setSearch] = useState("")
	const [debouncedSearch, setDebouncedSearch] = useState("")
	const [selected, setSelected] = useState<Partners[]>([])
    const router = useRouter()
	//#endregion

	//#region Gọi API
	async function getPartners(page: number, size: number, search?: string) {
		try {
			toast.loading("Đang tải dữ liệu...")
			const res = await api.get("/api/partners", {
				params: {
					page, // ⚠️ Nếu backend Spring 1-based → dùng page + 1
					size,
					search: search || "",
				},
			})
			setPageData(res.data)
			console.log("✅ Dữ liệu giao dịch:", res.data)
		} catch (err) {
			console.error("❌ Lỗi khi load giao dịch:", err)
			toast.error("Không thể tải dữ liệu giao dịch")
		} finally {
			toast.dismiss()
		}
	}

    async function deleteListTransaction(objIds: string[]) {
		try {
            await api.delete("/api/transactions/batch-delete", { data: objIds })
            toast.success(`Đã xóa ${objIds.length} giao dịch`)
            await getPartners(pageIndex, pageSize, debouncedSearch)
        } catch (err) {
            console.error("❌ Lỗi khi xóa:", err)
            toast.error("Không thể xóa giao dịch")
        }
	}

    async function deleteTransaction(id: string) {
		try {
            await api.delete(`/api/transactions/${id}`)
            toast.success(`Đã xóa giao dịch với ID: ${id}`)
            await getPartners(pageIndex, pageSize, debouncedSearch)
        } catch (err) {
            console.error("❌ Lỗi khi xóa:", err)
            toast.error(`Không thể xóa giao dịch Error: ${err}`)
        }
	}

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
		return () => clearTimeout(t)
	}, [search])

	useEffect(() => {
		setLoading(true)
		getPartners(pageIndex, pageSize, debouncedSearch).finally(() =>
			setLoading(false)
		)
	}, [pageIndex, debouncedSearch, pageSize])
	//#endregion

	//#region Action handlers
    const handleDeleteSelected = React.useCallback(async () => {
        // Lấy danh sách transactionId đã chọn
        const objIds = selected
            .map((t) => t.partnerId)
            .filter((id): id is string => !!id)

        console.log("🧾 Các transactionId đã chọn:", objIds)

        if (objIds.length === 0) {
            toast.info("Không có giao dịch nào để xóa")
            return
        }

        confirmToast({
            title: "Xóa giao dịch?",
            description: "Hành động này sẽ xóa vĩnh viễn dữ liệu.",
            confirmText: "Xóa",
            onConfirm: async () => {
                await deleteListTransaction(objIds);
            },
        })
    }, [selected])

	const handleDelete = async (id: number | string) => {
        confirmToast({
            title: "Xóa giao dịch?",
            description: "Hành động này sẽ xóa vĩnh viễn dữ liệu.",
            confirmText: "Xóa",
            onConfirm: async () => {
                await deleteTransaction(id as string)
            },
        })
		
	}

	const handleExportCSV = () => {
        toast.info("Chức năng xuất CSV chưa làm xong :))) từ từ")
        

	}
	//#endregion

	//#region Toolbar & Row actions
	const toolbarActions = React.useMemo(() => {
		const base = [
			{
				label: "Thêm mới",
				href: "/erp-1/partners/new",
				icon: <Plus className="h-4 w-4" />,
			},
			{
				label: "Xuất CSV",
				onClick: handleExportCSV,
				icon: <FileDown className="h-4 w-4" />,
				variant: "secondary" as const,
			},
		]
		if (selected.length > 0) {
			base.push({
				label: `Xóa (${selected.length})`,
				onClick: handleDeleteSelected,
				variant: "secondary" as const,
				icon: <Trash className="h-4 w-4" />,
			})
		}
		return base
	}, [selected, handleDeleteSelected])

	const rowActions = React.useMemo(
		() => [
			{
				label: "Sửa",
				href: "/erp-1/partners/:id",
			},
			{
				label: "Xóa",
				onClick: (row: Transactions) =>
					handleDelete((row as Transactions).transactionId as string),
				variant: "destructive" as const,
			},
		],
		[]
	)
	//#endregion

	return (
		<div className="p-2">
			{loading || !pageData ? (
				<DataTableSkeleton
					columns={5}
					rows={10}
					toolbarActions={toolbarActions} // 🔥 Truyền y hệt toolbar chính
				/>
			) : (
				<DataTable<Partners, unknown>
					columns={columns}
					pageData={pageData} // ✅ dùng đúng prop
					onPageChange={setPageIndex}
					withCheckbox
					searchValue={search}
					onSearchChange={setSearch}
					onSelectionChange={setSelected}
					toolbarActions={toolbarActions}
					actions={rowActions}
					onRowClick={(row) =>
						router.push(`/erp-1/transactions/${row.partnerId}`)
					}
				/>
			)}
		</div>
	)
}
