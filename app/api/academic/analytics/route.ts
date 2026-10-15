import { NextResponse } from "next/server"
import { requireProfile } from "@/lib/auth"
import { getStudentAnalytics } from "@/lib/academic/service"

export async function GET(request: Request) {
  try {
    const profile = await requireProfile()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id") || "course-cs302"
    const studentId = searchParams.get("student_id") || profile.id

    const analytics = await getStudentAnalytics(studentId, courseId)
    return NextResponse.json({ analytics })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load analytics" }, { status: 500 })
  }
}
