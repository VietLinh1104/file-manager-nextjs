// src/app/api/api-services/route.ts
import { prisma } from "@/../backend/prisma"
import { NextResponse } from "next/server"
import { generateApiServiceFile } from "@/services/dev-tool/api/api-service-gen.service"

export async function GET() {
	const services = await prisma.apiService.findMany()
  return NextResponse.json(services) 
}

export async function POST(req: Request) {
	const body = await req.json()

	// 1. Lưu DB (chưa có tsFilePath)
	let service = await prisma.apiService.create({ data: body })

	// 2. Generate file
	try {
		const filePath = generateApiServiceFile({
			name: service.name,
			baseUrl: service.baseUrl,
			dataType: service.dataType,
		})

		// 3. Update lại DB với path
		service = await prisma.apiService.update({
			where: { id: service.id },
			data: { tsFilePath: filePath },
		})

		console.log("✅ Generated API service:", filePath)
	} catch (err) {
		console.error("❌ Failed to generate service file:", err)
	}

	return NextResponse.json(service)
}
