import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"
import { prisma } from "@/../backend/prisma"

export type FieldType = "string" | "number" | "boolean" | "Date" | string

// 👇 định nghĩa Field type khớp với Prisma model
interface Field {
  id: number
  name: string
  type: string
  required: boolean
  isList?: boolean
}

function mapToTsType(type: FieldType, isList?: boolean): string {
  let tsType: string
  switch (type) {
    case "string": tsType = "string"; break
    case "number": tsType = "number"; break
    case "boolean": tsType = "boolean"; break
    case "Date": tsType = "Date"; break
    default: tsType = capitalize(type)
  }
  return isList ? `${tsType}[]` : tsType
}

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export async function generateTypeForBO(boId: number) {
  const bo = await prisma.dataType.findUnique({
    where: { id: boId },
    include: { fields: true },
  })
  if (!bo) throw new Error(`DataType id=${boId} not found`)

  // interfaceName luôn viết hoa chữ cái đầu
  const interfaceName = capitalize(bo.name)

  // 👇 fileName phải trùng với interfaceName
  const fileName = `${interfaceName}.ts`

  const allBOs = await prisma.dataType.findMany({ select: { name: true } })
  const refBOs = bo.fields
    .map(f => allBOs.find(obo => obo.name === f.type))
    .filter((r): r is { name: string } => Boolean(r))
    .map(ref => capitalize(ref.name))

  const importLines = refBOs
    .map(r => `import { ${r} } from "@/types/gen/${r}"`)
    .join("\n")

  const fields = (bo.fields as Field[]).map(
    f => `  ${f.name}${f.required ? "" : "?"}: ${mapToTsType(f.type, f.isList)};`
  ).join("\n")

  const tsInterface =
    (importLines ? importLines + "\n\n" : "") +
    `export interface ${interfaceName} {\n${fields}\n}`

  const outDir = join(process.cwd(), "src", "types", "gen")
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const filePath = join(outDir, fileName)
  writeFileSync(filePath, tsInterface, { encoding: "utf-8" })

  const relativePath = `/types/gen/${fileName}`
  await prisma.dataType.update({
    where: { id: bo.id },
    data: { tsFilePath: relativePath },
  })

  return relativePath
}

