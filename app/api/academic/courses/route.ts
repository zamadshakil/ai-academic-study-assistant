import { NextResponse } from "next/server"
import { requireProfile } from "@/lib/auth"
import { listCourses, createCourse, getCourseById } from "@/lib/academic/service"

export async function GET(request: Request) {
  try {
    const profile = await requireProfile()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("id")

    if (courseId) {
      const course = await getCourseById(courseId)
      if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })
      return NextResponse.json({ course })
    }

    const courses = await listCourses(profile)
    return NextResponse.json({ courses })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load courses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireProfile()
    if (profile.role !== "main_admin" && profile.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized: only instructors or admins can create courses" }, { status: 403 })
    }

    const body = await request.json()
    if (!body.code || !body.title) {
      return NextResponse.json({ error: "Course code and title are required" }, { status: 400 })
    }

    const newCourse = await createCourse(
      {
        code: body.code,
        title: body.title,
        description: body.description ?? "",
        department: body.department ?? "Computer Science",
        semester: body.semester ?? "Fall 2026",
        credit_hours: Number(body.credit_hours) || 3,
        instructor_id: profile.id,
      },
      profile,
    )

    return NextResponse.json({ course: newCourse }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create course" }, { status: 500 })
  }
}
