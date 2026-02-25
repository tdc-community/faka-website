import { NextResponse } from "next/server"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "faka2026"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body as { password?: string }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const valid = password === ADMIN_PASSWORD
    return NextResponse.json({ valid })
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
