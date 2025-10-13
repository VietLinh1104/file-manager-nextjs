import { NextResponse } from "next/server"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // 🔹 Lưu swagger vào thư mục /openapi
    const buffer = Buffer.from(await file.arrayBuffer())
    const openapiDir = path.join(process.cwd(), "openapi")
    if (!fs.existsSync(openapiDir)) fs.mkdirSync(openapiDir)
    const filePath = path.join(openapiDir, "api-docs.json")
    fs.writeFileSync(filePath, buffer)

    // 🔹 Generate API client & type bằng openapi-typescript-codegen
    try {
      execSync(
        'npx openapi -i ./openapi/api-docs.json -o ./src/api/swagger --client fetch --useUnionTypes true',
        { stdio: "inherit" }
      )
    } catch (err) {
      console.error("❌ Generate error:", err)
      return NextResponse.json({ error: "Failed to generate API" }, { status: 500 })
    }

    // ============================================
    // 1️⃣ Parse Models (DataType)
    // ============================================
    const modelsDir = path.join(process.cwd(), "src/api/swagger/models")
    const modelFiles = fs.existsSync(modelsDir)
      ? fs.readdirSync(modelsDir).filter((f) => f.endsWith(".ts"))
      : []

    let typeCount = 0
    for (const f of modelFiles) {
      const name = f.replace(".ts", "")
      const content = fs.readFileSync(path.join(modelsDir, f), "utf-8")

      const fieldMatches = [...content.matchAll(/(\w+)\??:\s*([\w\[\]]+);/g)]
      const fields = fieldMatches.map(([_, fieldName, fieldType]) => ({
        name: fieldName,
        type: fieldType.replace("[]", ""),
        required: !fieldName.endsWith("?"),
        isList: fieldType.includes("[]"),
      }))

      const dataType = await prisma.dataType.upsert({
        where: { name },
        update: { tsFilePath: `src/api/swagger/models/${f}` },
        create: {
          name,
          tsFilePath: `src/api/swagger/models/${f}`,
        },
      })

      // 🔹 Đồng bộ Field
      const existingFields = await prisma.field.findMany({
        where: { dataTypeId: dataType.id },
      })
      const newFieldNames = fields.map((f) => f.name)

      // Xóa field cũ không còn trong Swagger
      await prisma.field.deleteMany({
        where: {
          dataTypeId: dataType.id,
          name: { notIn: newFieldNames },
        },
      })

      // Thêm hoặc cập nhật field
      for (const field of fields) {
        await prisma.field.upsert({
          where: {
            name_dataTypeId: { name: field.name, dataTypeId: dataType.id },
          },
          update: { ...field },
          create: { ...field, dataTypeId: dataType.id },
        })
      }

      typeCount++
    }

    // ============================================
    // 2️⃣ Parse Services (ApiService)
    // ============================================
    const servicesDir = path.join(process.cwd(), "src/api/swagger/services")
    const serviceFiles = fs.existsSync(servicesDir)
      ? fs.readdirSync(servicesDir).filter((f) => f.endsWith(".ts"))
      : []

    let apiCount = 0
    for (const s of serviceFiles) {
      const serviceName = s.replace(".ts", "")
      const serviceContent = fs.readFileSync(path.join(servicesDir, s), "utf-8")

      const baseUrlMatch = serviceContent.match(/url:\s*'([^']+)'/)
      const baseUrl = baseUrlMatch ? baseUrlMatch[1] : ""

      const methods = [
        ...serviceContent.matchAll(
          /public static (\w+)\([\s\S]*?\): CancelablePromise<([\w<>]+)/g
        ),
      ]

      const service = await prisma.apiService.upsert({
        where: { name: serviceName },
        update: {
          baseUrl,
          tsFilePath: `src/api/swagger/services/${s}`,
        },
        create: {
          name: serviceName,
          baseUrl,
          tsFilePath: `src/api/swagger/services/${s}`,
        },
      })

      const existingMethods = await prisma.apiMethod.findMany({
        where: { serviceId: service.id },
      })
      const newMethodNames = methods.map((m) => m[1])

      // Xóa method không còn
      await prisma.apiMethod.deleteMany({
        where: {
          serviceId: service.id,
          name: { notIn: newMethodNames },
        },
      })

      // Upsert method
      for (const [_, mName, returnType] of methods) {
        await prisma.apiMethod.upsert({
          where: { name_serviceId: { name: mName, serviceId: service.id } },
          update: {
            returnType,
            isList: returnType.includes("Array<"),
          },
          create: {
            name: mName,
            returnType,
            isList: returnType.includes("Array<"),
            serviceId: service.id,
          },
        })
      }

      apiCount++
    }

    // ============================================
    // 3️⃣ Lưu log upload version
    // ============================================
    await prisma.swaggerUpload.create({
      data: {
        fileName: file.name,
        uploadedAt: new Date(),
        apiCount,
        typeCount,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Swagger uploaded & synced successfully",
      summary: { typeCount, apiCount },
    })
  } catch (err) {
    console.error("❌ Server error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
