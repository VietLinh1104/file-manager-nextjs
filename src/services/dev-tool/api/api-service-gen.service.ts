import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join, relative } from "path"
import dotenv from "dotenv"

dotenv.config()

export type ApiServiceInfo = {
  name: string
  baseUrl: string
  dataType: string
}

const ERP_NAME: string =
  process.env.ERP_NAME && process.env.ERP_NAME.trim() !== ""
    ? process.env.ERP_NAME
    : "my_erp"

export function generateApiServiceFile(service: ApiServiceInfo): string {
  const serviceDir = join(process.cwd(), "src/services", ERP_NAME)
  if (!existsSync(serviceDir)) mkdirSync(serviceDir, { recursive: true })

  const fileName = `${service.name.toLowerCase()}.service.ts`
  const filePath = join(serviceDir, fileName) // absolute path

  const fileContent = `// Auto-generated API service for ${service.name}
import { CrudService } from "@/services/dev-tool/api/crud.service"
import { ${service.dataType} } from "@/types/${ERP_NAME}/${service.dataType}"

export const ${service.name.toLowerCase()}Service = new CrudService<${service.dataType}>("${service.baseUrl}")
`

  writeFileSync(filePath, fileContent, { encoding: "utf-8" })

  // 👉 chỉ lấy path tương đối so với src (vd: /services/erp-1/user.service.ts)
  const relativePath = "/" + relative(join(process.cwd(), "src"), filePath).replace(/\\/g, "/")

  return relativePath
}
