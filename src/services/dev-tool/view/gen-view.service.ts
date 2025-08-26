import { promises as fs } from "fs"
import { join } from "path"
import { prisma } from "@/../backend/prisma"
import type { DataType, ApiService, Field, View } from "@prisma/client"

type ViewType = "table" | "input"

export interface TableColumnConfig {
  field: string
  header?: string
  visible?: boolean
  width?: number | string
}

export interface TableConfig {
  kind: "table"
  columns: TableColumnConfig[]
}

type ViewConfig = TableConfig // có thể mở rộng union sau này cho "input"

interface ViewWithRelations extends View {
  api: ApiService
  dataType: DataType & { fields: Field[] }
}

/** Type guard kiểm tra config table hợp lệ */
function isTableConfig(v: unknown): v is TableConfig {
  if (!v || typeof v !== "object") return false
  const obj = v as Record<string, unknown>
  if (obj.kind !== "table") return false
  if (!Array.isArray(obj.columns)) return false
  return obj.columns.every((c) => {
    if (!c || typeof c !== "object") return false
    const cc = c as Record<string, unknown>
    return typeof cc.field === "string"
  })
}

/** Loại bỏ dấu / đầu */
function trimSlash(s: string): string {
  return s.replace(/^\/+/, "").replace(/\/+$/, "")
}

/** Chuẩn hoá slug path từ tên */
function toSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-")
}

/** Lấy thư mục scope từ baseUrl: "/erp-1/users" -> "erp-1" */
function scopeFromBaseUrl(baseUrl: string): string {
  const parts = trimSlash(baseUrl).split("/")
  return parts[0] ?? "gen"
}

/** Lấy resource từ baseUrl: "/erp-1/users" -> "users" */
function resourceFromBaseUrl(baseUrl: string): string {
  const parts = trimSlash(baseUrl).split("/")
  return parts[1] ?? "items"
}

/** Singular rất đơn giản: "users" -> "user" */
function singularize(word: string): string {
  return word.endsWith("s") ? word.slice(0, -1) : word
}

/** Tạo code cho mảng ColumnDef từ mapping hoặc từ các field của DataType */
function buildColumnsCode(
  fields: Field[],
  cfg: TableConfig | null
): string {
  const columns =
    cfg?.columns?.filter((c) => c.visible !== false) ??
    fields.map((f) => ({ field: f.name, header: f.name, visible: true }))

  return columns
    .map((c) => `{ accessorKey: "${c.field}", header: "${c.header ?? c.field}" }`)
    .join(",\n    ")
}

async function ensureDir(p: string): Promise<void> {
  await fs.mkdir(p, { recursive: true })
}

/** Sinh trang Table */
async function generateTableView(view: ViewWithRelations): Promise<string> {
  const { api, dataType, path: viewPath } = view

  const scope = scopeFromBaseUrl(api.baseUrl) // "erp-1"
  const resource = resourceFromBaseUrl(api.baseUrl) // "users"
  const resourceSingular = singularize(resource) // "user"

  const typeName = dataType.name // ví dụ: "User"
  const serviceName = `${resourceSingular}Service` // "userService"
  const typeImportPath = `@/types/${scope}/${typeName}` // "@/types/erp-1/User"
  const serviceImportPath = `@/services/${scope}/${resourceSingular}.service` // "@/services/erp-1/user.service"

  // ép config JSON sang TableConfig nếu hợp lệ
  const cfg: TableConfig | null =
    isTableConfig(view.config) ? (view.config as TableConfig) : null

  const columnsCode = buildColumnsCode(dataType.fields, cfg)

  const fileContent = `\"use client\"
import React, { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { ${typeName} } from "${typeImportPath}"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ${serviceName} } from "${serviceImportPath}"

export default function ${typeName}TablePage() {
  const [data, setData] = useState<${typeName}[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10
  const [total, setTotal] = useState(0)

  useEffect(() => {
    ${serviceName}.getAll({ page: pageIndex + 1, pageSize })
      .then(res => {
        setData(res.data.data)
        setTotal(res.data.meta.total)
      })
  }, [pageIndex])

  const columns: ColumnDef<${typeName}, unknown>[] = [
    ${columnsCode},
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={\`/${trimSlash(viewPath)}/\${row.original.id}\`}>
            <Button size="sm" variant="outline">View</Button>
          </Link>
          <Button size="sm" variant="destructive">
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">${typeName} Table</h1>
      <DataTable<${typeName}, unknown>
        columns={columns}
        data={data}
        total={total}
        pageSize={pageSize}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
      />
    </div>
  )
}
`

  const relAppPath = trimSlash(viewPath) || `dev-tool/gen-view/${toSlug(view.name)}`
  const dir = join(process.cwd(), "src", "app", relAppPath)
  await ensureDir(dir)
  const filePath = join(dir, "page.tsx")
  await fs.writeFile(filePath, fileContent, "utf8")
  return filePath
}

/** Public API: sinh view theo type */
export async function generateView(viewId: number): Promise<{ filePath: string }> {
  const view = await prisma.view.findUnique({
    where: { id: viewId },
    include: { api: true, dataType: { include: { fields: true } } },
  })

  if (!view) {
    throw new Error(`View ${viewId} not found`)
  }

  // hiện tại hỗ trợ "table", có thể mở rộng "input" sau
  if (view.type === "table") {
    const filePath = await generateTableView(view as ViewWithRelations)
    return { filePath }
  }

  // fallback: chưa hỗ trợ
  throw new Error(`View type "${view.type}" is not supported yet`)
}
