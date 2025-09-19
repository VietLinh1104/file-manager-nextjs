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

  // collect BO types used
  const usedTypes = new Set<string>()
  service.methods.forEach((m) => {
    if (!isPrimitive(m.returnType)) usedTypes.add(m.returnType)
    m.params.forEach((p) => {
      if (!isPrimitive(p.type)) usedTypes.add(p.type)
    })
  })

  // generate imports
  const importStatements = Array.from(usedTypes)
    .map((t) => {
      const dt = allDataTypes.find((d) => d.name === t)
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
        return `import { ${t} } from "${relativeTypePath}"`
      }
      return null
    })
    .filter(Boolean)
    .join("\n")

  const methodsCode = service.methods
    .map((m) => {
      const params = (m.params ?? [])
        .map((p) => `${p.name}: ${mapType(p.type, p.isList)}`)
        .join(", ")
      const returnType = mapType(m.returnType, m.isList)

      return `  async ${m.name}(${params}): Promise<${returnType}> {
    return api.${httpVerb(m.name)}<${returnType}>(\`${service.baseUrl}\`)
  }`
    })
    .join("\n\n")

  const fileContent = `// Auto-generated API service for ${service.name}
import api from "@/lib/axios"
${importStatements ? "\n" + importStatements + "\n" : ""}

export class ${service.name}Service {
${methodsCode}
}

export const ${service.name.toLowerCase()}Service = new ${service.name}Service()
`

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
  if (lower.startsWith("create")) return "post"
  if (lower.startsWith("update")) return "put"
  if (lower.startsWith("delete")) return "delete"
  return "get"
}
