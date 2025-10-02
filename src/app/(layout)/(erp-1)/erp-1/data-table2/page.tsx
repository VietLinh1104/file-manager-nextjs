// src/app/(layout)/(erp-1)/erp-1/data-table/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Trash, Plus, FileDown } from "lucide-react"
import { testResp } from "@/types/erp-1/testResp"

//#region Table columns
export const columns: ColumnDef<testResp>[] = [
 {
		accessorKey: "text",
		header: "Text",
		cell: ({ row }) => {
			const val = row.getValue("text")
			return val
		}
	},
 {
		accessorKey: "number",
		header: "Number",
		cell: ({ row }) => {
			const val = row.getValue("number")
			return val
		}
	},
 {
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => {
			const val = row.getValue("date")
			return new Date(val as string).toLocaleDateString()
		}
	},
 {
		accessorKey: "tag",
		header: "Tag",
		cell: ({ row }) => {
			const val = row.getValue("tag")
			return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">{val as string}</span>
		}
	}
]
//#endregion

export default function DocumentListTableSection() {
	//#region State
	const [data, setData] = useState<testResp[]>([])
	const [total, setTotal] = useState(0)
	const [pageIndex, setPageIndex] = useState(0)
	const [pageSize] = useState(20)
	const [loading, setLoading] = useState(false)
	const [search, setSearch] = useState("")
	const [debouncedSearch, setDebouncedSearch] = useState("")
	const [selected, setSelected] = useState<testResp[]>([])
	//#endregion

	//#region CRUD functions
	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
		return () => clearTimeout(t)
	}, [search])

	useEffect(() => {
		setLoading(true)
		setTimeout(() => {
			const mock: testResp[] = [
				{ id: "id_1", text: "text_1", number: "number_1", date: new Date(), tag: "tag_1" },
        { id: "id_2", text: "text_2", number: "number_2", date: new Date(), tag: "tag_2" },
        { id: "id_3", text: "text_3", number: "number_3", date: new Date(), tag: "tag_3" },
        { id: "id_4", text: "text_4", number: "number_4", date: new Date(), tag: "tag_4" },
        { id: "id_5", text: "text_5", number: "number_5", date: new Date(), tag: "tag_5" }
			]
			setData(mock)
			setTotal(mock.length)
			setLoading(false)
		}, 400)
	}, [pageIndex, debouncedSearch])
	//#endregion

	//#region Handle actions
	const handleDeleteSelected = async () => {
		console.log("Delete:", selected)
	}

	const handleDelete = async (id: number | string) => {
		console.log("Delete one:", id)
	}

	const handleExportCSV = () => {
		console.log("Export CSV")
	}
	//#endregion

	//#region Toolbar & Row Actions
	const toolbarActions = React.useMemo(() => {
		const base = [
			{
				label: "Add New",
				href: "",
				icon: <Plus className="h-4 w-4" />,
			},
			{
				label: "Export CSV",
				onClick: handleExportCSV,
				icon: <FileDown className="h-4 w-4" />,
				variant: "secondary" as const,
			},
		]
		if (selected.length > 0) {
			base.push({
				label: `Delete Selected (${selected.length})`,
				onClick: handleDeleteSelected,
				variant: "secondary" as const,
				icon: <Trash className="h-4 w-4" />,
			})
		}
		return base
	}, [selected])

	const rowActions = React.useMemo(
		() => [
			{
				label: "Edit",
				href: "/erp-1/testResp/:id",
			},
			{
				label: "Delete",
				onClick: (row: testResp) => handleDelete((row as  testResp).id),
				variant: "destructive" as const,
			},
		],
		[]
	)
	//#endregion

	const userColumns: ColumnDef<testResp>[] = columns

	return (
		<div className="p-1.5">
			{loading ? (
				<p>Loading...</p>
			) : (
				<DataTable<testResp, unknown>
					columns={userColumns}
					data={data}
					total={total}
					pageSize={pageSize}
					pageIndex={pageIndex}
					onPageChange={setPageIndex}
					withCheckbox
					searchValue={search}
					onSearchChange={setSearch}
					onSelectionChange={setSelected}
					toolbarActions={toolbarActions}
					actions={rowActions}
				/>
			)}
		</div>
	)
}