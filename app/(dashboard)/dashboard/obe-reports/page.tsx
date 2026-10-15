import { requireProfile } from "@/lib/auth"
import {
  exportOBEAccreditationReport,
  listCourses,
} from "@/lib/academic/service"
import { PageHeader } from "@/components/dashboard/page-header"
import { OBEReportsClient } from "./obe-reports-client"

export const metadata = {
  title: "OBE Accreditation Reports · Academic Study Assistant",
  description:
    "Formal HEC/PEC OBE Accreditation Audit Report generation, Continuous Quality Improvement (CQI), and CSV/JSON export.",
}

export default async function OBEReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const profile = await requireProfile()
  const resolvedParams = await searchParams
  const courseIdParam =
    typeof resolvedParams.course_id === "string" ? resolvedParams.course_id : "course-cs302"

  const courses = await listCourses(profile)
  const report = await exportOBEAccreditationReport(courseIdParam)

  return (
    <div className="space-y-6">
      <PageHeader
        title="OBE Accreditation & Audit Reports"
        description="Formal Higher Education Commission (HEC) & Pakistan Engineering Council (PEC) Accreditation Dossier: Attainment statistics, constructive alignment matrix, and Continuous Quality Improvement (CQI) reports."
      />
      <OBEReportsClient
        courses={courses}
        selectedCourseId={courseIdParam}
        report={report}
        userRole={profile.role}
      />
    </div>
  )
}
