import { NextResponse } from "next/server"
import { requireProfile } from "@/lib/auth"
import {
  listQuizzes,
  getQuizById,
  generateQuizFromMaterial,
  submitQuizAttempt,
} from "@/lib/academic/service"

export async function GET(request: Request) {
  try {
    await requireProfile()
    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get("id")
    const courseId = searchParams.get("course_id") || undefined

    if (quizId) {
      const quiz = await getQuizById(quizId)
      if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
      return NextResponse.json({ quiz })
    }

    const quizzes = await listQuizzes(courseId)
    return NextResponse.json({ quizzes })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load quizzes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireProfile()
    const body = await request.json()

    // Action 1: Auto-generate quiz from slide/material
    if (body.action === "generate") {
      if (!body.material_id) {
        return NextResponse.json({ error: "material_id is required" }, { status: 400 })
      }
      const quiz = await generateQuizFromMaterial(body.material_id, body.count || 4)
      return NextResponse.json({ quiz }, { status: 201 })
    }

    // Action 2: Submit quiz attempt
    if (body.action === "submit") {
      if (!body.quiz_id || !body.answers) {
        return NextResponse.json({ error: "quiz_id and answers are required" }, { status: 400 })
      }
      const attempt = await submitQuizAttempt(body.quiz_id, profile, body.answers)
      return NextResponse.json({ attempt }, { status: 200 })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Quiz operation failed" }, { status: 500 })
  }
}
