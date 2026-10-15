import { NextResponse } from "next/server"
import { requireProfile } from "@/lib/auth"
import {
  listAutoMappingSuggestions,
  reviewAutoMappingSuggestion,
  autoMapContentToCLOs,
} from "@/lib/academic/service"

export async function GET(request: Request) {
  try {
    await requireProfile()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id") || undefined
    const status = searchParams.get("status") || undefined

    const suggestions = await listAutoMappingSuggestions(courseId, status)
    return NextResponse.json({ suggestions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load suggestions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireProfile()
    const body = await request.json()

    // Action 1: Trigger auto-mapping on a snippet or material
    if (body.action === "auto_map") {
      const suggestion = await autoMapContentToCLOs(
        body.content,
        body.course_id,
        body.item_type || "material",
        body.item_id || `item-${Date.now()}`,
        body.item_title || "Sample Material",
      )
      return NextResponse.json({ suggestion })
    }

    // Action 2: Review suggestion (approve / reject / adjust)
    if (body.action === "review") {
      if (profile.role !== "main_admin" && profile.role !== "manager") {
        return NextResponse.json({ error: "Only instructors can review CLO mappings" }, { status: 403 })
      }

      const updated = await reviewAutoMappingSuggestion(
        body.suggestion_id,
        body.decision, // "approved" | "rejected" | "adjusted"
        profile,
        body.adjusted_clo_id,
      )

      return NextResponse.json({ suggestion: updated })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Mapping operation failed" }, { status: 500 })
  }
}
