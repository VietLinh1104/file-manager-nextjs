// src\services\dev-tool\type\gen-type.service.ts
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"
import { prisma } from "@/../backend/prisma"
import dotenv from "dotenv"

dotenv.config()

export type FieldType = "string" | "number" | "boolean" | "Date" | string

interface Field {
  id: number
  name: string
  type: string
  required: boolean
  isList?: boolean
}

// Lấy ERP_NAME từ env hoặc mặc định
const ERP_NAME: string =
  process.env.ERP_NAME && process.env.ERP_NAME.trim() !== ""
    ? process.env.ERP_NAME
    : "my_erp"

function mapToTsType(type: FieldType, isList?: boolean): string {
  let tsType: string
  switch (type) {
    case "string": tsType = "string"; break
    case "number": tsType = "number"; break
    case "boolean": tsType = "boolean"; break
    case "Date": tsType = "Date"; break
    default: tsType = type   // giữ nguyên tên
  }
  return isList ? `${tsType}[]` : tsType
}

export async function generateTypeForBO(boId: number) {
  const bo = await prisma.dataType.findUnique({
    where: { id: boId },
    include: { fields: true },
  })
  if (!bo) throw new Error(`DataType id=${boId} not found`)

  const interfaceName = bo.name
  const fileName = `${interfaceName}.ts`

  const allBOs = await prisma.dataType.findMany({ select: { name: true } })
  const refBOs = bo.fields
    .map(f => allBOs.find(obo => obo.name === f.type))
    .filter((r): r is { name: string } => Boolean(r))
    .map(ref => ref.name)

  const importLines = refBOs
    .map(r => `import { ${r} } from "@/types/${ERP_NAME}/${r}"`)
    .join("\n")

  const fields = (bo.fields as Field[])
    .map(f => `  ${f.name}${f.required ? "" : "?"}: ${mapToTsType(f.type, f.isList)};`)
    .join("\n")

  const tsInterface =
    (importLines ? importLines + "\n\n" : "") +
    `export interface ${interfaceName} {\n${fields}\n}`

  // xuất ra đúng thư mục ERP_NAME
  const outDir = join(process.cwd(), "src", "types", ERP_NAME)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const filePath = join(outDir, fileName)
  writeFileSync(filePath, tsInterface, { encoding: "utf-8" })

  // Lưu path relative
  const relativePath = `/types/${ERP_NAME}/${fileName}`
  await prisma.dataType.update({
    where: { id: bo.id },
    data: { tsFilePath: relativePath },
  })

  return relativePath
}
