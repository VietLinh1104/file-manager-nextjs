import { NextResponse } from "next/server"
import { readdirSync } from "fs"
import { join } from "path"

export async function GET() {
  try {
    const typesDir = join(process.cwd(), "src/types/gen")
    const files = readdirSync(typesDir)
      .filter((f) => f.endsWith(".ts"))
      .map((f) => f.replace(".ts", ""))

    return NextResponse.json(files)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
