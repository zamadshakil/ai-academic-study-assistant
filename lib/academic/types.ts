export type BloomsTaxonomyLevel =
  | "C1 - Remembering"
  | "C2 - Understanding"
  | "C3 - Applying"
  | "C4 - Analyzing"
  | "C5 - Evaluating"
  | "C6 - Creating"

export type BloomsDomain = "Cognitive" | "Affective" | "Psychomotor"

export interface PLO {
  code: string // e.g. "PLO-1" to "PLO-12"
  title: string
  description: string
  target_percentage: number
}

export interface CLOPLOMapping {
  plo_code: string
  weight: 1 | 2 | 3 // 1: Low, 2: Medium, 3: High
}

export interface CLO {
  id: string
  course_id: string
  code: string // e.g. "CLO-1"
  description: string
  blooms_level: BloomsTaxonomyLevel
  domain: BloomsDomain
  target_percentage: number
  mapped_plos: CLOPLOMapping[]
}

export interface AcademicCourse {
  id: string
  code: string // e.g. "CS302"
  title: string
  description: string
  department: string
  semester: string
  credit_hours: number
  instructor_id: string
  instructor_name?: string
  student_count?: number
  material_count?: number
  created_at: string
  updated_at: string
}

export interface CourseEnrollment {
  id: string
  course_id: string
  student_id: string
  student_name?: string
  student_email?: string
  enrolled_at: string
}

export type CourseMaterialType = "slides" | "pdf" | "task_file" | "notes"

export interface AcademicMaterial {
  id: string
  course_id: string
  course_code?: string
  title: string
  type: CourseMaterialType
  slide_or_page_count: number
  blob_url?: string
  summary: string
  extracted_text: string
  mapped_clos: string[] // e.g. ["CLO-1", "CLO-2"]
  mapping_status: "auto_mapped" | "approved" | "manual"
  created_at: string
  uploader_id: string
}

export interface AutoMappingSuggestion {
  id: string
  course_id: string
  item_type: "material" | "quiz_question" | "flashcard" | "task"
  item_id: string
  item_title: string
  suggested_clo_id: string
  suggested_clo_code: string
  suggested_blooms_level: BloomsTaxonomyLevel
  suggested_plos: CLOPLOMapping[]
  confidence_score: number // 0 to 1
  rationale: string
  status: "pending" | "approved" | "rejected" | "adjusted"
  created_at: string
  reviewed_by?: string | null
  reviewed_at?: string | null
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number // 0..3 index
  explanation: string
  clo_id: string
  clo_code: string
  blooms_level: BloomsTaxonomyLevel
}

export interface Quiz {
  id: string
  course_id: string
  course_code?: string
  title: string
  description: string
  topic: string
  material_id: string | null
  questions: QuizQuestion[]
  created_at: string
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  course_id: string
  student_id: string
  student_name?: string
  score: number // percentage 0..100
  total_questions: number
  correct_count: number
  answers: Record<string, number> // questionId -> selectedIndex
  clo_breakdown: Record<
    string,
    {
      total: number
      correct: number
      percentage: number
      clo_code: string
      blooms_level?: string
    }
  >
  attempted_at: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
  key_term?: string
  clo_id: string
  clo_code: string
}

export interface FlashcardDeck {
  id: string
  course_id: string
  course_code?: string
  title: string
  material_id: string | null
  cards: Flashcard[]
  created_at: string
}

export interface FlashcardProgress {
  deck_id: string
  student_id: string
  mastered_card_ids: string[]
  reviewing_card_ids: string[]
  last_reviewed_at: string
}

export interface CLOAttainmentResult {
  clo_id: string
  clo_code: string
  description: string
  blooms_level: BloomsTaxonomyLevel
  course_id: string
  course_code: string
  target_percentage: number // e.g. 60
  average_score: number
  students_attempted: number
  students_achieved: number // score >= target_percentage
  attainment_percentage: number // (students_achieved / students_attempted) * 100
  status: "achieved" | "in_progress" | "not_achieved"
}

export interface PLOAttainmentResult {
  plo_code: string
  plo_title: string
  target_percentage: number
  attainment_percentage: number
  contributing_clos_count: number
  status: "achieved" | "in_progress" | "not_achieved"
}

export interface StudentWeakTopic {
  topic: string
  course_id: string
  course_code: string
  clo_code: string
  clo_description: string
  score_percentage: number
  needs_attention: boolean
}

export interface AdaptiveRecommendation {
  id: string
  course_id: string
  course_code: string
  type: "slides" | "flashcards" | "practice_quiz"
  title: string
  description: string
  action_url: string
  related_clo: string
  priority: "high" | "medium"
}

export interface RAGCitation {
  document_title: string
  page_or_slide: string
  excerpt: string
  similarity: number
  clo_code?: string
}

export interface OBEAccreditationExport {
  institution: string
  program: string
  term: string
  generated_at: string
  course: AcademicCourse
  clos: CLO[]
  plos: PLO[]
  clo_attainments: CLOAttainmentResult[]
  plo_attainments: PLOAttainmentResult[]
  student_summary: {
    total_students: number
    passed_ob_criteria: number
    overall_attainment_rate: number
  }
  continuous_quality_improvement_recommendations: string[]
}
