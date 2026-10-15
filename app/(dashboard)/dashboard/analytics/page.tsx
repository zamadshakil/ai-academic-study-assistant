import { requireProfile } from "@/lib/auth"
import {
  getStudentAnalytics,
  computeCourseCLOAttainment,
  computeProgramPLOAttainment,
  listCourses,
} from "@/lib/academic/service"
import { PageHeader } from "@/components/dashboard/page-header"
import { AnalyticsClientView } from "./analytics-client"

export const metadata = {
  title: "Personalized Learning Analytics · Academic Study Assistant",
  description:
    "Adaptive learning analytics, weak-topic detection, and personalized study recommendations.",
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const profile = await requireProfile()
  const resolvedParams = await searchParams
  const courseIdParam =
    typeof resolvedParams.course_id === "string" ? resolvedParams.course_id : "course-cs302"

  const courses = await listCourses(profile)
  const studentData = await getStudentAnalytics(profile.id, courseIdParam)
  const cloAttainments = await computeCourseCLOAttainment(courseIdParam)
  const ploAttainments = await computeProgramPLOAttainment(courseIdParam)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personalized Learning Analytics & Adaptive Recommendations"
        description="Learning Analytics Engine: Real-time weak-topic detection, outcome attainment diagnostic tracking, and adaptive recommendations to bridge conceptual gaps."
      />
      <AnalyticsClientView
        courses={courses}
        selectedCourseId={courseIdParam}
        studentData={studentData}
        cloAttainments={cloAttainments}
        ploAttainments={ploAttainments}
        userRole={profile.role}
      />
    </div>
  )
}
