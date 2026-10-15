import { NextResponse } from "next/server"
import { requireProfile } from "@/lib/auth"
import {
  listCLOsByCourse,
  listPLOs,
  createCLO,
  updateCLOPLOMapping,
} from "@/lib/academic/service"

export async function GET(request: Request) {
  try {
    await requireProfile()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id")
    const plosOnly = searchParams.get("plos_only") === "true"

    if (plosOnly) {
      const plos = await listPLOs()
      return NextResponse.json({ plos })
    }

    if (!courseId) {
      return NextResponse.json({ error: "course_id parameter is required" }, { status: 400 })
    }

    const clos = await listCLOsByCourse(courseId)
    const plos = await listPLOs()
    return NextResponse.json({ clos, plos })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load CLOs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireProfile()
    if (profile.role !== "main_admin" && profile.role !== "manager") {
      return NextResponse.json({ error: "Only instructors and admins can manage CLOs" }, { status: 403 })
    }

    const body = await request.json()

    // Action 1: Create a new CLO
    if (!body.action || body.action === "create") {
      if (!body.course_id || !body.code || !body.description || !body.blooms_level) {
        return NextResponse.json({ error: "course_id, code, description, and blooms_level are required" }, { status: 400 })
      }

      const clo = await createCLO(body.course_id, {
        code: body.code,
        description: body.description,
        blooms_level: body.blooms_level,
        domain: body.domain || "Cognitive",
        target_percentage: Number(body.target_percentage) || 60,
        mapped_plos: body.mapped_plos || [{ plo_code: "PLO-2", weight: 3 }],
      })

      return NextResponse.json({ clo }, { status: 201 })
    }

    // Action 2: Update mapping
    if (body.action === "map_plo") {
      if (!body.course_id || !body.clo_id || !body.plo_code || !body.weight) {
        return NextResponse.json({ error: "course_id, clo_id, plo_code, and weight are required" }, { status: 400 })
      }

      const updated = await updateCLOPLOMapping(
        body.course_id,
        body.clo_id,
        body.plo_code,
        Number(body.weight) as 1 | 2 | 3,
      )

      return NextResponse.json({ clo: updated })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "CLO operation failed" }, { status: 500 })
  }
}
