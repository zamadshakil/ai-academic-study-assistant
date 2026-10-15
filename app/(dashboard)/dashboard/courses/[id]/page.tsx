import { notFound } from "next/navigation"
import { requireProfile } from "@/lib/auth"
import {
  getCourseById,
  listCLOsByCourse,
  listAcademicMaterials,
  listPLOs,
} from "@/lib/academic/service"
import { CourseDetailClient } from "./course-detail-client"

export const metadata = {
  title: "Course Details · Academic Study Assistant",
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const profile = await requireProfile()
  const resolvedParams = await params
  const course = await getCourseById(resolvedParams.id)

  if (!course) {
    notFound()
  }

  const clos = await listCLOsByCourse(course.id)
  const materials = await listAcademicMaterials(course.id)
  const plos = await listPLOs()

  return (
    <CourseDetailClient
      course={course}
      clos={clos}
      materials={materials}
      plos={plos}
      userRole={profile.role}
    />
  )
}
