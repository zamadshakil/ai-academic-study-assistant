import { requireProfile } from "@/lib/auth"
import {
  computeCourseCLOAttainment,
  computeProgramPLOAttainment,
  listCourses,
} from "@/lib/academic/service"
import { PageHeader } from "@/components/dashboard/page-header"
import { OBEAttainmentClient } from "./obe-attainment-client"

export const metadata = {
  title: "OBE Attainment Matrix · Academic Study Assistant",
  description:
    "Real-time Course Learning Outcome and Program Learning Outcome attainment computation matrix.",
}

export default async function OBEAttainmentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const profile = await requireProfile()
  const resolvedParams = await searchParams
  const courseIdParam =
    typeof resolvedParams.course_id === "string" ? resolvedParams.course_id : "course-cs302"

  const courses = await listCourses(profile)
  const cloAttainments = await computeCourseCLOAttainment(courseIdParam)
  const ploAttainments = await computeProgramPLOAttainment(courseIdParam)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live OBE Attainment Matrix"
        description="Real-Time Outcome Attainment Engine: Dynamic computation of student success rates against the 60% HEC/PEC accreditation threshold."
      />
      <OBEAttainmentClient
        courses={courses}
        selectedCourseId={courseIdParam}
        cloAttainments={cloAttainments}
        ploAttainments={ploAttainments}
        userRole={profile.role}
      />
    </div>
  )
}
