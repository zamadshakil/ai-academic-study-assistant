import { NextResponse } from "next/server"
import { requireProfile } from "@/lib/auth"
import { queryAcademicRAG, CONFIDENCE_THRESHOLD } from "@/lib/academic/service"

export async function POST(request: Request) {
  try {
    await requireProfile()
    const body = await request.json()

    if (!body.query || typeof body.query !== "string") {
      return NextResponse.json({ error: "Query string is required" }, { status: 400 })
    }

    const result = await queryAcademicRAG(body.query, body.course_id)

    return NextResponse.json({
      answer: result.answer,
      confidence_score: result.confidence_score,
      confidence_threshold: CONFIDENCE_THRESHOLD,
      is_low_confidence: result.is_low_confidence,
      citations: result.citations,
      course_code: result.course_code,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Academic RAG query failed" }, { status: 500 })
  }
}
