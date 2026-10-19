import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import vm from "node:vm"
import ts from "typescript"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

function load(file, deps = {}) {
  const source = readFileSync(new URL(file, import.meta.url), "utf8")
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText

  const exports = {}
  const sandbox = {
    exports,
    require: (n) => deps[n] || require(n),
    process: {
      env: {
        NODE_ENV: "production",
      },
    },
    Response,
    Request,
    TextDecoder,
    AbortSignal,
    console: { error() {}, log() {}, warn() {} },
    ...deps.globals,
  }

  vm.runInNewContext(js, sandbox, { filename: file })
  return { exports, sandbox }
}

const { exports: academic } = load("../lib/academic/service.ts")

test("1. Course Management: listCourses, getCourseById, createCourse", async () => {
  // Admin sees all courses
  const allCourses = await academic.listCourses({ id: "admin-1", role: "main_admin" })
  assert.ok(Array.isArray(allCourses))
  assert.ok(allCourses.length >= 3)
  assert.ok(allCourses.some((c) => c.code === "CS302"))

  // Get course by ID
  const cs302 = await academic.getCourseById("course-cs302")
  assert.ok(cs302)
  assert.equal(cs302.code, "CS302")
  assert.equal(cs302.department, "Computer Science")

  // Instructor filter
  const instructorCourses = await academic.listCourses({
    id: "inst-1",
    role: "course_instructor",
  })
  assert.ok(instructorCourses.length > 0)
  assert.ok(instructorCourses.every((c) => c.instructor_id === "inst-1"))

  // Create course
  const newCourse = await academic.createCourse(
    {
      code: "SE310",
      title: "Software Quality Engineering",
      description: "OBE testing, verification, validation, and metrics.",
      department: "Software Engineering",
      semester: "Fall 2026",
      credit_hours: 3,
      instructor_id: "inst-1",
    },
    { id: "admin-1", role: "main_admin", full_name: "Academic Dean" }
  )
  assert.ok(newCourse.id)
  assert.equal(newCourse.code, "SE310")

  const fetched = await academic.getCourseById(newCourse.id)
  assert.ok(fetched)
  assert.equal(fetched.title, "Software Quality Engineering")
})

test("2. OBE Framework: 12 HEC/PEC PLOs, CLO listing, creation, and mapping", async () => {
  // List 12 PLOs
  const plos = await academic.listPLOs()
  assert.equal(plos.length, 12)
  assert.equal(plos[0].code, "PLO-1")
  assert.equal(plos[11].code, "PLO-12")
  assert.ok(plos.every((p) => p.target_percentage === 60))

  // List CLOs for CS302
  const clos = await academic.listCLOsByCourse("course-cs302")
  assert.ok(clos.length >= 3)
  const clo1 = clos.find((c) => c.code === "CLO-1")
  assert.ok(clo1)
  assert.equal(clo1.blooms_level, "C2 - Understanding")
  assert.ok(clo1.mapped_plos.length > 0)

  // Create a new CLO
  const createdCLO = await academic.createCLO("course-cs302", {
    code: "CLO-4",
    description: "Design adversarial search minimax trees for competitive games.",
    blooms_level: "C6 - Creating",
    domain: "Cognitive",
    target_percentage: 60,
    mapped_plos: [{ plo_code: "PLO-3", weight: 3 }],
  })
  assert.equal(createdCLO.code, "CLO-4")
  assert.equal(createdCLO.blooms_level, "C6 - Creating")

  // Update CLO-to-PLO mapping
  const updatedCLO = await academic.updateCLOPLOMapping(
    "course-cs302",
    createdCLO.id,
    "PLO-2",
    2
  )
  assert.ok(updatedCLO)
  assert.equal(updatedCLO.mapped_plos.length, 2)
})

test("3. Materials Repository: list and upload materials", async () => {
  const materials = await academic.listAcademicMaterials("course-cs302")
  assert.ok(materials.length >= 3)

  const uploaded = await academic.uploadAcademicMaterial(
    {
      course_id: "course-cs302",
      title: "Lecture 5: Adversarial Search & Minimax",
      type: "slides",
      slide_or_page_count: 24,
      summary: "Minimax and alpha-beta pruning for competitive games",
      extracted_text: "Slide 1: Games and Adversarial Search. Minimax algorithm with alpha-beta pruning. Optimal decision in games.",
    },
    { id: "inst-1", role: "course_instructor", full_name: "Dr. Tariq" }
  )
  assert.ok(uploaded.id)
  assert.equal(uploaded.title, "Lecture 5: Adversarial Search & Minimax")
})

test("4. AI CLO/PLO Auto-Mapping Engine: semantic tagging & instructor review", async () => {
  // Test auto-mapping logic
  const suggestion = await academic.autoMapContentToCLOs(
    "Lab 4: Design and evaluate A* search heuristics on a 15-puzzle grid. Analyze time and space complexity.",
    "course-cs302",
    "task",
    "task-lab-4",
    "Lab 4 Assignment"
  )
  assert.ok(suggestion)
  assert.ok(suggestion.suggested_clo_code)
  assert.ok(suggestion.suggested_blooms_level)
  assert.ok(suggestion.confidence_score >= 0.5)
  assert.equal(suggestion.status, "pending")

  // List suggestions
  const suggestions = await academic.listAutoMappingSuggestions("course-cs302")
  assert.ok(suggestions.length >= 1)

  // Review & approve
  const reviewed = await academic.reviewAutoMappingSuggestion(
    suggestion.id,
    "approved",
    { id: "inst-1", role: "course_instructor", full_name: "Dr. Tariq" }
  )
  assert.ok(reviewed)
  assert.equal(reviewed.status, "approved")
  assert.equal(reviewed.reviewed_by, "inst-1")
})

test("5. AI Quiz Generator & CLO-Scored Attempt Submission", async () => {
  const quizzes = await academic.listQuizzes("course-cs302")
  assert.ok(quizzes.length >= 2)

  const quiz = quizzes[0]
  assert.ok(quiz.questions.length > 0)

  // Generate quiz from material
  const genQuiz = await academic.generateQuizFromMaterial("mat-cs302-04", 3)
  assert.ok(genQuiz.id)
  assert.equal(genQuiz.questions.length, 3)

  // Submit attempt with answers (answer first 2 correctly, 3rd incorrectly)
  const answers = {}
  genQuiz.questions.forEach((q, idx) => {
    answers[q.id] = idx < 2 ? q.correct_answer : (q.correct_answer + 1) % 4
  })

  const attempt = await academic.submitQuizAttempt(genQuiz.id, "student-alice", answers)
  assert.ok(attempt.id)
  assert.equal(attempt.total_questions, 3)
  assert.equal(attempt.correct_count, 2)
  assert.equal(attempt.score, 67)
  assert.ok(attempt.clo_breakdown)
})

test("6. 3D Interactive Flashcards: generation and progress tracking", async () => {
  const decks = await academic.listFlashcardDecks("course-cs302")
  assert.ok(decks.length >= 2)

  // Generate new flashcard deck
  const newDeck = await academic.generateFlashcardsFromMaterial("mat-cs302-04", 3)
  assert.ok(newDeck.id)
  assert.ok(newDeck.cards.length >= 3)
  assert.ok(newDeck.cards[0].front)
  assert.ok(newDeck.cards[0].back)

  // Update progress
  const cardId = newDeck.cards[0].id
  const updatedProgress = await academic.updateFlashcardProgress(
    newDeck.id,
    "student-alice",
    [cardId],
    []
  )
  assert.equal(updatedProgress.deck_id, newDeck.id)
  assert.ok(updatedProgress.mastered_card_ids.includes(cardId))
})

test("7. Real-Time OBE Attainment & Student Analytics", async () => {
  // Course CLO attainment
  const cloAttainments = await academic.computeCourseCLOAttainment("course-cs302")
  assert.ok(cloAttainments.length >= 3)
  for (const att of cloAttainments) {
    assert.ok(att.clo_code)
    assert.ok(typeof att.attainment_percentage === "number")
    assert.ok(["achieved", "in_progress", "not_achieved"].includes(att.status))
    assert.equal(att.target_percentage, 60)
  }

  // Program PLO attainment
  const ploAttainments = await academic.computeProgramPLOAttainment("course-cs302")
  assert.ok(ploAttainments.length > 0)
  for (const plo of ploAttainments) {
    assert.ok(plo.plo_code)
    assert.ok(typeof plo.attainment_percentage === "number")
    assert.ok(["achieved", "in_progress", "not_achieved"].includes(plo.status))
  }

  // Student personalized analytics & weak topic identification (<60%)
  const analytics = await academic.getStudentAnalytics("student-alice", "course-cs302")
  assert.ok(analytics)
  assert.ok(typeof analytics.overall_mastery === "number")
  assert.ok(Array.isArray(analytics.weak_topics))
  assert.ok(Array.isArray(analytics.recommendations))

  // If weak topics exist, verify threshold (<60%) and needs_attention flag
  for (const wt of analytics.weak_topics) {
    assert.ok(wt.score_percentage < 60)
    assert.equal(wt.needs_attention, true)
  }
})

test("8. Grounded RAG Chatbot: citations, confidence scoring & thresholding", async () => {
  // Grounded search with relevant course query
  const queryResult = await academic.queryAcademicRAG(
    "What is an admissible heuristic function in A* search?",
    "course-cs302"
  )
  assert.equal(queryResult.is_low_confidence, false)
  assert.ok(queryResult.confidence_score >= 0.35)
  assert.ok(queryResult.citations.length > 0)
  assert.ok(queryResult.citations[0].document_title)
  assert.ok(queryResult.citations[0].page_or_slide)
  assert.ok(queryResult.citations[0].excerpt)
  assert.ok(queryResult.answer.length > 0)

  // Unrelated out-of-domain query triggering confidence thresholding
  const outOfDomainResult = await academic.queryAcademicRAG(
    "Quantum cellular photosynthesis respiration cycle in marine microbiology",
    "course-cs302"
  )
  assert.equal(outOfDomainResult.is_low_confidence, true)
  assert.ok(outOfDomainResult.confidence_score < 0.35)
  assert.ok(outOfDomainResult.answer.includes("Low Confidence Notice"))
  assert.equal(outOfDomainResult.citations.length, 0)
})

test("9. OBE Accreditation Export: CSV and JSON formats for HEC/PEC audits", async () => {
  const exportData = await academic.exportOBEAccreditationReport("course-cs302")
  assert.ok(exportData)
  assert.equal(exportData.course.code, "CS302")
  assert.ok(exportData.clo_attainments.length >= 3)
  assert.ok(exportData.plo_attainments.length > 0)
  assert.ok(exportData.student_summary.total_students > 0)

  // Verify CSV generation
  const csv = academic.generateOBECsvReport(exportData)
  assert.ok(csv.includes("HEC / PEC OBE Accreditation Attainment Matrix"))
  assert.ok(csv.includes("Course Learning Outcomes (CLOs) Attainment"))
  assert.ok(csv.includes("Program Learning Outcomes (PLOs 1-12) Summary"))
  assert.ok(csv.includes("Continuous Quality Improvement (CQI) Recommendations"))
})

test("10. RAG Slide Number Preservation: exact slide numbering vs synthetic index", async () => {
  // Querying admissibility heuristic in A* should cite the actual slide number in the presentation (Slide 19)
  const result = await academic.queryAcademicRAG(
    "admissible heuristic tree search consistency",
    "course-cs302"
  )
  assert.ok(result.citations.length > 0)
  const slide19Citation = result.citations.find((c) =>
    c.page_or_slide.toLowerCase().includes("slide 19")
  )
  assert.ok(slide19Citation, "Expected citation to preserve Slide 19 instead of synthetic index")
  assert.ok(slide19Citation.page_or_slide.includes("Slide 19"))

  // Querying PEAS should cite Slide 12
  const peasResult = await academic.queryAcademicRAG(
    "PEAS Performance Environment Actuators Sensors",
    "course-cs302"
  )
  assert.ok(peasResult.citations.length > 0)
  const slide12Citation = peasResult.citations.find((c) =>
    c.page_or_slide.toLowerCase().includes("slide 12")
  )
  assert.ok(slide12Citation, "Expected citation to preserve Slide 12 instead of synthetic index")
})

test("11. Student Course Listing Fallback: non-enrolled new student gets full course directory", async () => {
  // A brand new student with no mock enrollments
  const newStudent = { id: "student-brand-new-999", role: "member" }
  const courses = await academic.listCourses(newStudent)
  assert.ok(Array.isArray(courses))
  assert.ok(courses.length >= 3, "New student must receive available courses as fallback")
  assert.ok(courses.some((c) => c.code === "CS302"))
})

test("12. Dynamic Quiz & Flashcard Generation adapts to different material topics", async () => {
  // Generate from Agent Foundations material (mat-cs302-01)
  const agentQuiz = await academic.generateQuizFromMaterial("mat-cs302-01", 3)
  assert.equal(agentQuiz.questions.length, 3)
  const agentText = JSON.stringify(agentQuiz.questions).toLowerCase()
  assert.ok(agentText.includes("agent") || agentText.includes("peas") || agentText.includes("environment"))

  // Generate from Heuristic Search material (mat-cs302-04)
  const searchQuiz = await academic.generateQuizFromMaterial("mat-cs302-04", 3)
  assert.equal(searchQuiz.questions.length, 3)
  const searchText = JSON.stringify(searchQuiz.questions).toLowerCase()
  assert.ok(searchText.includes("heuristic") || searchText.includes("search") || searchText.includes("a*") || searchText.includes("admissib"))

  // Generate flashcards from Agent material
  const agentCards = await academic.generateFlashcardsFromMaterial("mat-cs302-01", 3)
  assert.equal(agentCards.cards.length, 3)
  const cardText = JSON.stringify(agentCards.cards).toLowerCase()
  assert.ok(cardText.includes("peas") || cardText.includes("agent") || cardText.includes("environment"))
})

test("13. Accurate Program PLO Attainment: non-contributing PLOs yield 0% and not_achieved", async () => {
  const ploAttainments = await academic.computeProgramPLOAttainment("course-cs302")
  assert.equal(ploAttainments.length, 12)

  // In CS302, PLO-1, PLO-2, PLO-3 have contributing CLOs
  const plo1 = ploAttainments.find((p) => p.plo_code === "PLO-1")
  const plo2 = ploAttainments.find((p) => p.plo_code === "PLO-2")
  assert.ok(plo1 && plo1.attainment_percentage > 0)
  assert.ok(plo2 && plo2.attainment_percentage > 0)

  // PLO-9 (Individual and Team Work) has 0 contributing CLOs in CS302
  const plo9 = ploAttainments.find((p) => p.plo_code === "PLO-9")
  assert.ok(plo9)
  assert.equal(plo9.attainment_percentage, 0, "Non-contributing PLO must have 0% attainment")
  assert.equal(plo9.status, "not_achieved")
})

test("14. Polymorphic Quiz Attempt: handles both user object and string studentId", async () => {
  const quiz = await academic.generateQuizFromMaterial("mat-cs302-04", 2)
  const answers = { [quiz.questions[0].id]: quiz.questions[0].correct_answer }

  // Call with string
  const attemptStr = await academic.submitQuizAttempt(quiz.id, "student-alice", answers)
  assert.equal(attemptStr.student_id, "student-alice")

  // Call with profile object
  const attemptObj = await academic.submitQuizAttempt(quiz.id, { id: "student-bob", role: "member" }, answers)
  assert.equal(attemptObj.student_id, "student-bob")
})

test("15. Short token query resilience ('AI', 'A*') and stopword filtering in RAG search", async () => {
  // Query with 'AI' and stopwords: 'what is AI in rational agents'
  const aiResult = await academic.queryAcademicRAG(
    "what is AI in rational agents",
    "course-cs302"
  )
  assert.equal(aiResult.is_low_confidence, false)
  assert.ok(aiResult.confidence_score >= 0.35)
  assert.ok(aiResult.citations.length > 0)
  assert.ok(aiResult.answer.toLowerCase().includes("rational"))

  // Query with 'A*' and stopwords: 'how does A* search work'
  const aStarResult = await academic.queryAcademicRAG(
    "how does A* search work",
    "course-cs302"
  )
  assert.equal(aStarResult.is_low_confidence, false)
  assert.ok(aStarResult.citations.length > 0)
  assert.ok(aStarResult.citations.some((c) => c.excerpt.toLowerCase().includes("a*") || c.page_or_slide.toLowerCase().includes("slide")))
})

test("16. Flashcard progress tracking & mastery calculation", async () => {
  const decks = await academic.listFlashcardDecks("course-cs302")
  assert.ok(decks.length > 0)
  const deck = decks[0]

  // Track 2 cards mastered, 1 card reviewing
  const card1 = deck.cards[0]?.id || "c1"
  const card2 = deck.cards[1]?.id || "c2"
  const card3 = deck.cards[2]?.id || "c3"

  const progress = await academic.updateFlashcardProgress(
    deck.id,
    "student-alice",
    [card1, card2],
    [card3]
  )
  assert.equal(progress.deck_id, deck.id)
  assert.equal(progress.student_id, "student-alice")
  assert.ok(progress.mastered_card_ids.includes(card1))
  assert.ok(progress.mastered_card_ids.includes(card2))
  assert.ok(progress.reviewing_card_ids.includes(card3))
})

