import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load biến môi trường từ file .env
dotenv.config();

const ERP_NAME: string =
  process.env.ERP_NAME && process.env.ERP_NAME.trim() !== ""
    ? process.env.ERP_NAME
    : "my_erp";

const folders = [
  path.join(process.cwd(), "src", "app", "(layout)", `(${ERP_NAME})`, ERP_NAME),
  path.join(process.cwd(), "src", "services", ERP_NAME),
  path.join(process.cwd(), "src", "types", ERP_NAME),
];

folders.forEach((folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ Đã tạo thư mục: ${folderPath}`);
  } else {
    console.log(`ℹ️ Thư mục đã tồn tại: ${folderPath}`);
  }
});
