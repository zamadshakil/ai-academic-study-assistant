import { requireProfile } from "@/lib/auth"
import {
  listFlashcardDecks,
  listCourses,
  listAcademicMaterials,
} from "@/lib/academic/service"
import { PageHeader } from "@/components/dashboard/page-header"
import { FlashcardsClientView } from "./flashcards-client"

export const metadata = {
  title: "Flashcard Decks · Academic Study Assistant",
  description:
    "Interactive flashcard revision decks auto-generated from course lecture slides.",
}

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const profile = await requireProfile()
  const resolvedParams = await searchParams
  const courseIdParam =
    typeof resolvedParams.course_id === "string" ? resolvedParams.course_id : undefined

  const decks = await listFlashcardDecks(courseIdParam)
  const courses = await listCourses(profile)
  const materials = await listAcademicMaterials(courseIdParam)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactive Flashcard Revision Decks"
        description="Auto-generated memory revision decks: Flip cards to test key concepts, formula definitions, and algorithm constraints mapped to Course Learning Outcomes."
      />
      <FlashcardsClientView
        initialDecks={decks}
        courses={courses}
        materials={materials}
        userRole={profile.role}
        studentProfile={profile}
      />
    </div>
  )
}
