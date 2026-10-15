import { NextResponse } from "next/server"
import { requireProfile } from "@/lib/auth"
import { exportOBEAccreditationReport, generateOBECsvReport } from "@/lib/academic/service"

export async function GET(request: Request) {
  try {
    const profile = await requireProfile()
    if (profile.role !== "main_admin" && profile.role !== "manager") {
      return NextResponse.json({ error: "Only instructors and administrators can export OBE reports" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id") || "course-cs302"
    const format = searchParams.get("format") || "json"

    const report = await exportOBEAccreditationReport(courseId)

    if (format === "csv") {
      const csvContent = generateOBECsvReport(report)
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="OBE_Attainment_Report_${report.course.code}.csv"`,
        },
      })
    }

    return NextResponse.json({ report })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate OBE report" }, { status: 500 })
  }
}
