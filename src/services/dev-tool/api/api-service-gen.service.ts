import { writeFileSync, mkdirSync, existsSync, unlinkSync } from "fs"
import { join, relative } from "path"
import dotenv from "dotenv"
import { ApiMethod, ApiParam } from "@prisma/client"

dotenv.config()

export type ApiServiceInfo = {
  name: string
  baseUrl: string
  methods: (ApiMethod & { params: ApiParam[] })[]
}

export type DataTypeInfo = {
  name: string
  tsFilePath: string | null
}

const ERP_NAME: string =
  process.env.ERP_NAME && process.env.ERP_NAME.trim() !== ""
    ? process.env.ERP_NAME
    : "my_erp"

function getServiceDir(): string {
  return join(process.cwd(), "src/services", ERP_NAME)
}

function getFilePath(serviceName: string): string {
  const serviceDir = getServiceDir()
  if (!existsSync(serviceDir)) mkdirSync(serviceDir, { recursive: true })
  return join(serviceDir, `${serviceName.toLowerCase()}.service.ts`)
}

/**
 * Generate API service file
 */
export function generateApiServiceFile(
  service: ApiServiceInfo,
  allDataTypes: { name: string; tsFilePath: string }[] = []
): string {
  const filePath = getFilePath(service.name)

  // lấy default BO
  const defaultType = service.methods[0]?.returnType || "unknown"

  const dt = allDataTypes.find((d) => d.name === defaultType)
  let importTypeLine = ""
  if (dt?.tsFilePath) {
    const relativeTypePath =
      "@/".concat(
        relative(
          join(process.cwd(), "src"),
          join(process.cwd(), "src", dt.tsFilePath.replace(/^\//, ""))
        )
          .replace(/\\/g, "/")
          .replace(/\.ts$/, "")
      )
    importTypeLine = `import { ${defaultType} } from "${relativeTypePath}"`
  }

  // base CrudService
  let fileContent = `// Auto-generated API service for ${service.name}
import { CrudService } from "@/services/dev-tool/api/crud.service"
${importTypeLine}

export const ${service.name.toLowerCase()}Service = new CrudService<${defaultType}>("${service.baseUrl}")
`

  // check có method custom ngoài CRUD
  const customMethods = service.methods.filter(
    (m) =>
      !["getall", "getbyid", "create", "update", "updatebyid", "delete"].includes(
        m.name.toLowerCase()
      )
  )

  if (customMethods.length > 0) {
    const extraMethods = customMethods
      .map((m) => {
        const params = (m.params ?? [])
          .map((p) => `${p.name}: ${mapType(p.type, p.isList)}`)
          .join(", ")

        const returnType = mapType(m.returnType, m.isList)

        // build query params để tránh unused var
        const paramObj =
          (m.params?.length ?? 0) > 0 ? `{ params: { ${m.params.map((p) => p.name).join(", ")} } }` : "{}"

        return `  async ${m.name}(${params}): Promise<AxiosResponse<${returnType}>> {
    return api.${httpVerb(m.name)}<${returnType}>(\`${service.baseUrl}/${m.name}\`, ${paramObj})
  }`
      })
      .join("\n\n")

    fileContent += `

// Extra custom methods
import api from "@/lib/axios"
import { AxiosResponse } from "axios"

export class ${capitalize(service.name)}ExtraService extends CrudService<${defaultType}> {
${extraMethods}
}

export const ${service.name.toLowerCase()}ExtraService = new ${capitalize(
      service.name
    )}ExtraService("${service.baseUrl}")
`
  }

  writeFileSync(filePath, fileContent, { encoding: "utf-8" })

  const relativePath =
    "/" +
    relative(join(process.cwd(), "src"), filePath).replace(/\\/g, "/")

  return relativePath
}

export function updateApiServiceFile(
  service: ApiServiceInfo,
  allDataTypes: { name: string; tsFilePath: string }[] = []
): string {
  return generateApiServiceFile(service, allDataTypes)
}

export function deleteApiServiceFile(filePath: string | null): void {
  if (!filePath) return
  try {
    const absPath = join(process.cwd(), "src", filePath.replace(/^\//, ""))
    if (existsSync(absPath)) {
      unlinkSync(absPath)
      console.log("🗑️ Deleted API service file:", absPath)
    }
  } catch (err) {
    console.error("❌ Failed to delete file:", err)
  }
}

function isPrimitive(type: string): boolean {
  return ["string", "number", "boolean", "Date"].includes(type)
}

function mapType(type: string, isList: boolean): string {
  const tsType = isPrimitive(type) ? type : type
  return isList ? `${tsType}[]` : tsType
}

function httpVerb(methodName: string): string {
  const lower = methodName.toLowerCase()
  if (lower.startsWith("get")) return "get"
  if (lower.startsWith("create") || lower.startsWith("add")) return "post"
  if (lower.startsWith("update")) return "put"
  if (lower.startsWith("delete") || lower.startsWith("remove")) return "delete"
  return "get"
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
