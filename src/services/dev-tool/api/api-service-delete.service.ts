import fs from "fs"
import { join } from "path"

/**
 * Xoá file service đã generate dựa vào relative path lưu trong DB
 * @param relativePath dạng "/services/erp-1/user.service.ts"
 * @returns true nếu xoá thành công, false nếu không
 */
export function deleteGeneratedApiServiceFile(relativePath?: string | null): boolean {
  if (!relativePath) {
    console.log("⚠️ No tsFilePath provided, skip delete")
    return false
  }

  // build absolute path từ relative path
  const absPath = join(process.cwd(), "src", relativePath)

  try {
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath)
      console.log("🗑️ Deleted generated file:", absPath)
      return true
    } else {
      console.log("⚠️ File not found:", absPath)
      return false
    }
  } catch (err) {
    console.error("❌ Failed to delete file:", err)
    return false
  }
}
