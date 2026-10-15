import { requireProfile } from "@/lib/auth"
import { listCourses } from "@/lib/academic/service"
import { PageHeader } from "@/components/dashboard/page-header"
import { CoursesClientView } from "./courses-client"

export const metadata = {
  title: "Courses · Academic Study Assistant",
  description: "Outcome-Based Education Course Management and LMS Repository.",
}

export default async function CoursesPage() {
  const profile = await requireProfile()
  const courses = await listCourses(profile)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses Management"
        description="LMS Course Repository: Manage academic curricula, lecture materials, student rosters, and Outcome-Based Education (OBE) mappings."
      />
      <CoursesClientView initialCourses={courses} userRole={profile.role} />
    </div>
  )
}
