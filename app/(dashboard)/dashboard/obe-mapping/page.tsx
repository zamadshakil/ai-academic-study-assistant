import { requireProfile } from "@/lib/auth"
import {
  listAutoMappingSuggestions,
  listCourses,
  listCLOsByCourse,
  listPLOs,
} from "@/lib/academic/service"
import { PageHeader } from "@/components/dashboard/page-header"
import { OBEMappingClient } from "./obe-mapping-client"

export const metadata = {
  title: "CLO Auto-Mapping Engine · Academic Study Assistant",
  description:
    "RAG-powered semantic auto-tagging of course slides, task files, and assessments with instructor review & approval.",
}

export default async function OBEMappingPage() {
  const profile = await requireProfile()
  const suggestions = await listAutoMappingSuggestions()
  const courses = await listCourses(profile)
  const defaultCourse = courses[0]
  const clos = defaultCourse ? await listCLOsByCourse(defaultCourse.id) : []
  const plos = await listPLOs()

  return (
    <div className="space-y-6">
      <PageHeader
        title="CLO / PLO Auto-Mapping Engine"
        description="RAG-based semantic classifier: Automatically maps uploaded lecture slides, assessments, and task files to Course Learning Outcomes (CLOs) and Program Learning Outcomes (PLOs) with instructor approval."
      />
      <OBEMappingClient
        initialSuggestions={suggestions}
        courses={courses}
        initialClos={clos}
        plos={plos}
        userRole={profile.role}
      />
    </div>
  )
}
