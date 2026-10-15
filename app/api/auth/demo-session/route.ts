import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const role = body.role === "manager" ? "manager" : body.role === "main_admin" ? "main_admin" : "member"
    const cookieStore = await cookies()
    cookieStore.set("academic_demo_role", role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    })
    return NextResponse.json({ success: true, role })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
