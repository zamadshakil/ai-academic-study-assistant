import { NextResponse } from "next/server"
import { requireProfile } from "@/lib/auth"
import { listAcademicMaterials, uploadAcademicMaterial } from "@/lib/academic/service"

export async function GET(request: Request) {
  try {
    await requireProfile()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id") || undefined

    const materials = await listAcademicMaterials(courseId)
    return NextResponse.json({ materials })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load materials" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireProfile()
    if (profile.role !== "main_admin" && profile.role !== "manager") {
      return NextResponse.json({ error: "Only instructors and admins can upload academic materials" }, { status: 403 })
    }

    const body = await request.json()
    if (!body.title || !body.course_id) {
      return NextResponse.json({ error: "Title and course_id are required" }, { status: 400 })
    }

    const newMaterial = await uploadAcademicMaterial(
      {
        course_id: body.course_id,
        title: body.title.trim(),
        type: body.type || "slides",
        slide_or_page_count: Number(body.slide_or_page_count) || 1,
        summary: body.summary || "Course lecture material",
        extracted_text: body.extracted_text || body.summary || body.title,
        blob_url: body.blob_url,
      },
      profile,
    )

    return NextResponse.json({ material: newMaterial }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Material upload failed" }, { status: 500 })
  }
}
