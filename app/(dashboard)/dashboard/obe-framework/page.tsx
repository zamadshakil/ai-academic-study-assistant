import { requireProfile } from "@/lib/auth"
import {
  listPLOs,
  listCourses,
  listCLOsByCourse,
} from "@/lib/academic/service"
import { PageHeader } from "@/components/dashboard/page-header"
import { OBEFrameworkClient } from "./obe-framework-client"

export const metadata = {
  title: "OBE Framework · Academic Study Assistant",
  description:
    "HEC/PEC Outcome-Based Education Framework: 12 Program Learning Outcomes and Course Learning Outcomes directory.",
}

export default async function OBEFrameworkPage() {
  const profile = await requireProfile()
  const plos = await listPLOs()
  const courses = await listCourses(profile)
  const allClosArray = await Promise.all(courses.map((c) => listCLOsByCourse(c.id)))
  const allClos = allClosArray.flat()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outcome-Based Education (OBE) Framework"
        description="Standard HEC & PEC Accreditation Standards: 12 Program Learning Outcomes (PLOs), Course Learning Outcomes (CLOs) with Bloom's Taxonomy, and Constructive Alignment Matrix."
      />
      <OBEFrameworkClient
        plos={plos}
        courses={courses}
        allClos={allClos}
        userRole={profile.role}
      />
    </div>
  )
}
