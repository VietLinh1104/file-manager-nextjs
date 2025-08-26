// src\services\dev-tool\type\delete-type.service.ts
import { unlinkSync, existsSync } from "fs"
import { join } from "path"
import { prisma } from "@/../backend/prisma"

/**
 * Xoá DataType và file .ts đã generate
 */
export async function deleteBOAndFile(id: number) {
  // lấy BO để biết đường dẫn file
  const bo = await prisma.dataType.findUnique({
    where: { id },
    select: { tsFilePath: true },
  })

  if (!bo) {
    throw new Error(`DataType id=${id} not found`)
  }

  // xoá record trong DB
  const deleted = await prisma.dataType.delete({ where: { id } })

  // xoá file nếu tồn tại
  if (bo.tsFilePath) {
    // chuyển relative path thành absolute
    const absPath = join(process.cwd(), "src", bo.tsFilePath)

    if (existsSync(absPath)) {
      try {
        unlinkSync(absPath)
        console.log(`✅ Deleted file: ${absPath}`)
      } catch (err) {
        console.error(`❌ Failed to delete file ${absPath}:`, err)
      }
    } else {
      console.warn(`⚠️ File not found: ${absPath}`)
    }
  }

  return deleted
}
