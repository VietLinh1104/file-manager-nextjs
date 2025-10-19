"use client"
import * as React from "react"
import Link from "next/link"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  Search as SearchIcon,
  X as ClearIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface HasId {
  id?: string | number
  transactionId?: string
  attachmentId?: string
}

export interface ActionItem<TData extends HasId> {
  label: string
  onClick?: (row: TData) => void
  href?: string
  variant?: "default" | "destructive"
}

export interface ToolbarAction {
  label: string
  href?: string
  icon?: React.ReactNode
  variant?: "default" | "secondary" | "destructive"
  onClick?: () => void
}

export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export interface DataTableProps<TData extends HasId, TValue> {
  columns: ColumnDef<TData, TValue>[]
  pageData: SpringPage<TData>
  withCheckbox?: boolean
  actions?: ActionItem<TData>[]
  searchValue: string
  onSearchChange: (value: string) => void
  toolbarActions?: ToolbarAction[]
  onSelectionChange?: (rows: TData[]) => void
  onPageChange: (page: number) => void
  /** callback khi click vào 1 dòng */
  onRowClick?: (row: TData) => void
}

export function DataTable<TData extends HasId, TValue>({
  columns,
  pageData,
  withCheckbox = false,
  actions = [],
  searchValue,
  onSearchChange,
  toolbarActions = [],
  onSelectionChange,
  onPageChange,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const data = pageData?.content ?? []
  const totalPages = pageData?.totalPages ?? 1
  const pageIndex = pageData?.number ?? 0
  const pageSize = pageData?.size ?? 10

  const filteredData = React.useMemo(() => {
    if (!searchValue) return data
    const lower = searchValue.toLowerCase()
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    )
  }, [data, searchValue])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  // Gửi danh sách hàng được chọn ra ngoài
  React.useEffect(() => {
    onSelectionChange?.(table.getSelectedRowModel().rows.map((r) => r.original))
  }, [table.getSelectedRowModel().rows, onSelectionChange])

  // 🧹 Reset checkbox khi dữ liệu thay đổi (reload, xóa, thêm)
  React.useEffect(() => {
    table.resetRowSelection()
  }, [pageData.content])

  return (
    <div className="space-y-4">
      {/* 🔎 Thanh tìm kiếm + Toolbar actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70 pointer-events-none" />
          <Input
            placeholder="Search…"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchValue && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"
            >
              <ClearIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {toolbarActions.map((act, idx) =>
            act.href ? (
              <Button key={idx} asChild variant={act.variant ?? "default"}>
                <Link href={act.href}>
                  {act.label}
                  {act.icon && <span className="ml-2">{act.icon}</span>}
                </Link>
              </Button>
            ) : (
              <Button
                key={idx}
                onClick={act.onClick}
                variant={act.variant ?? "default"}
              >
                {act.label}
                {act.icon && <span className="ml-2">{act.icon}</span>}
              </Button>
            )
          )}
        </div>
      </div>

      {/* 📋 Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {withCheckbox && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                      }
                      aria-label="Select all rows"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableHead>
                )}
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none"
                  >
                    <div className="flex items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && (
                        <ArrowUp className="ml-1 h-4 w-4 text-muted-foreground" />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ArrowDown className="ml-1 h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions.length > 0 && (
                  <TableHead className="w-10">Actions</TableHead>
                )}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={
                    onRowClick
                      ? "cursor-pointer hover:bg-muted/50 transition"
                      : undefined
                  }
                >
                  {withCheckbox && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) =>
                          row.toggleSelected(!!value)
                        }
                        aria-label="Select row"
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Row actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, idx) => {
                            const variantCls =
                              action.variant === "destructive"
                                ? "text-red-600"
                                : ""
                            const id =
                              (row.original.id as string) ||
                              (row.original.transactionId as string)
                            if (action.href) {
                              const href = action.href.replace(":id", id)
                              return (
                                <DropdownMenuItem key={idx} asChild>
                                  <Link href={href} className={variantCls}>
                                    {action.label}
                                  </Link>
                                </DropdownMenuItem>
                              )
                            }
                            return (
                              <DropdownMenuItem
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation() // 🛑 Ngăn click lan ra TableRow
                                  setTimeout(() => {
                                    action.onClick?.(row.original)
                                  }, 0)
                                }}
                                className={variantCls}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (withCheckbox ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 📑 Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pageIndex + 1} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageData.first}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageData.last}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
