import { requireProfile } from "@/lib/auth"
import {
  listQuizzes,
  listCourses,
  listAcademicMaterials,
} from "@/lib/academic/service"
import { PageHeader } from "@/components/dashboard/page-header"
import { QuizzesClientView } from "./quizzes-client"

export const metadata = {
  title: "CLO-Mapped Quizzes · Academic Study Assistant",
  description:
    "Auto-generated quizzes from course slides with real-time scoring and CLO performance breakdown.",
}

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const profile = await requireProfile()
  const resolvedParams = await searchParams
  const courseIdParam =
    typeof resolvedParams.course_id === "string" ? resolvedParams.course_id : undefined

  const quizzes = await listQuizzes(courseIdParam)
  const courses = await listCourses(profile)
  const materials = await listAcademicMaterials(courseIdParam)

  return (
    <div className="space-y-6">
      <PageHeader
        title="CLO-Mapped Topic Quizzes"
        description="Auto-generated assessments from lecture slides: Practice key concepts, evaluate state-space algorithms, and receive immediate CLO performance diagnostics."
      />
      <QuizzesClientView
        initialQuizzes={quizzes}
        courses={courses}
        materials={materials}
        userRole={profile.role}
        studentProfile={profile}
      />
    </div>
  )
}
