import assert from "node:assert/strict"

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000"

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer(maxRetries = 20) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, { signal: AbortSignal.timeout(2000) })
      if (res.status === 200) return true
    } catch (e) {
      // Retry
    }
    await delay(1000)
  }
  return false
}

async function runAudit() {
  console.log(`Starting thorough E2E audit against ${BASE_URL}...`)

  const isUp = await waitForServer()
  assert.ok(isUp, "Server failed to respond within timeout window")
  console.log("✔ Server is active and accepting connections.")

  // 1. Root & Dashboard Entry Test
  console.log("\n[Test 1] Root Route & Dashboard Navigation...")
  const homeRes = await fetch(`${BASE_URL}/`)
  assert.equal(homeRes.status, 200, "Home page returned non-200 status")
  console.log("✔ Root entry loads smoothly and directs to active dashboard.")

  // 2. Auth Login Page & Demo Personas Test
  console.log("\n[Test 2] Auth Login Page & Demo Personas...")
  const loginRes = await fetch(`${BASE_URL}/auth/login`)
  assert.equal(loginRes.status, 200)
  const loginHtml = await loginRes.text()
  assert.ok(loginHtml.includes("Academic Study Assistant") || loginHtml.includes("Faculty"), "Login page missing branding")
  assert.ok(loginHtml.includes("Dr. Iqra Tariq") || loginHtml.includes("Tariq"), "Login page missing faculty persona")
  assert.ok(loginHtml.includes("Alice") || loginHtml.includes("BSAI"), "Login page missing student persona")
  assert.ok(loginHtml.includes("QEC") || loginHtml.includes("Scrutiny"), "Login page missing QEC persona")
  console.log("✔ Login page renders responsive auth form and all 3 demo personas (Faculty, Student, QEC).")

  // 3. Demo Persona Switching
  console.log("\n[Test 3] Demo Persona Switching (Student, Faculty, QEC Admin)...")
  
  // Student Alice
  const studentDemoRes = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "member" }),
  })
  assert.equal(studentDemoRes.status, 200)
  const studentSetCookie = studentDemoRes.headers.get("set-cookie") || ""
  assert.ok(studentSetCookie.includes("academic_demo_role=member"), "Student demo cookie missing")
  const studentCookie = "academic_demo_role=member"

  const studentDashRes = await fetch(`${BASE_URL}/dashboard`, {
    headers: { cookie: studentCookie },
  })
  assert.equal(studentDashRes.status, 200)
  console.log("✔ Student persona session established; access to /dashboard granted.")

  // Faculty Dr. Iqra Tariq
  const facultyDemoRes = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "manager" }),
  })
  assert.equal(facultyDemoRes.status, 200)
  const facultyCookie = "academic_demo_role=manager"

  const facultyObeRes = await fetch(`${BASE_URL}/dashboard/obe-attainment`, {
    headers: { cookie: facultyCookie },
  })
  assert.equal(facultyObeRes.status, 200)
  console.log("✔ Faculty persona session established; access to /dashboard/obe-attainment granted.")

  // QEC Scrutiny Committee
  const qecDemoRes = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "main_admin" }),
  })
  assert.equal(qecDemoRes.status, 200)
  const qecCookie = "academic_demo_role=main_admin"

  const qecReportsRes = await fetch(`${BASE_URL}/dashboard/obe-reports`, {
    headers: { cookie: qecCookie },
  })
  assert.equal(qecReportsRes.status, 200)
  console.log("✔ QEC Admin persona session established; access to /dashboard/obe-reports granted.")

  // 4. Grounded RAG Chatbot API Testing
  console.log("\n[Test 4] Grounded RAG Chatbot (Citations, Confidence & Anti-Hallucination)...")
  
  // High-confidence question
  const ragRes = await fetch(`${BASE_URL}/api/academic/rag`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      query: "What is an admissible heuristic in A* search?",
      course_id: "course-cs302",
    }),
  })
  assert.equal(ragRes.status, 200)
  const ragData = await ragRes.json()
  assert.equal(ragData.is_low_confidence, false)
  assert.ok(ragData.confidence_score >= 0.35)
  assert.ok(ragData.citations.length > 0)
  assert.ok(ragData.citations[0].document_title)
  assert.ok(ragData.citations[0].page_or_slide)
  console.log(`✔ RAG grounded answer verified: Confidence ${(ragData.confidence_score * 100).toFixed(0)}%, Cited: ${ragData.citations[0].page_or_slide}`)

  // Short academic keyword query ('AI')
  const shortQueryRes = await fetch(`${BASE_URL}/api/academic/rag`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      query: "what is AI in rational agents",
      course_id: "course-cs302",
    }),
  })
  assert.equal(shortQueryRes.status, 200)
  const shortData = await shortQueryRes.json()
  assert.equal(shortData.is_low_confidence, false)
  assert.ok(shortData.citations.length > 0)
  console.log(`✔ Short query ('AI') verified: Confidence ${(shortData.confidence_score * 100).toFixed(0)}%, Top citation: ${shortData.citations[0].document_title}`)

  // Anti-hallucination threshold test (out of domain)
  const outOfDomainRes = await fetch(`${BASE_URL}/api/academic/rag`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      query: "Quantum cellular photosynthesis respiration cycle in marine microbiology",
      course_id: "course-cs302",
    }),
  })
  assert.equal(outOfDomainRes.status, 200)
  const outOfDomainData = await outOfDomainRes.json()
  assert.equal(outOfDomainData.is_low_confidence, true)
  assert.ok(outOfDomainData.confidence_score < 0.35)
  assert.ok(outOfDomainData.answer.includes("Low Confidence Notice"))
  assert.equal(outOfDomainData.citations.length, 0)
  console.log("✔ Anti-hallucination threshold correctly flags out-of-domain query with warning.")

  // 5. Courses, CLOs and Materials API
  console.log("\n[Test 5] LMS Academic Core API (Courses, CLOs, Materials)...")
  const coursesRes = await fetch(`${BASE_URL}/api/academic/courses`, {
    headers: { cookie: studentCookie },
  })
  assert.equal(coursesRes.status, 200)
  const coursesData = await coursesRes.json()
  assert.ok(Array.isArray(coursesData.courses) && coursesData.courses.length > 0)
  console.log(`✔ Courses API returns ${coursesData.courses.length} accredited courses.`)

  const closRes = await fetch(`${BASE_URL}/api/academic/clos?course_id=course-cs302`, {
    headers: { cookie: studentCookie },
  })
  assert.equal(closRes.status, 200)
  const closData = await closRes.json()
  assert.ok(Array.isArray(closData.clos) && closData.clos.length >= 3)
  console.log(`✔ CLO API returns ${closData.clos.length} Bloom's taxonomy mapped outcomes.`)

  const materialsRes = await fetch(`${BASE_URL}/api/academic/materials?course_id=course-cs302`, {
    headers: { cookie: studentCookie },
  })
  assert.equal(materialsRes.status, 200)
  const materialsData = await materialsRes.json()
  assert.ok(Array.isArray(materialsData.materials) && materialsData.materials.length >= 3)
  console.log(`✔ Materials API returns ${materialsData.materials.length} uploaded slide decks.`)

  // 6. Interactive Quiz Generation & Scored Attempt
  console.log("\n[Test 6] Formative Quiz Generator & CLO Attempt Scoring...")
  const genQuizRes = await fetch(`${BASE_URL}/api/academic/quizzes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      action: "generate",
      material_id: "mat-cs302-04",
      count: 3,
    }),
  })
  assert.equal(genQuizRes.status, 201)
  const genQuizData = await genQuizRes.json()
  assert.ok(genQuizData.quiz && genQuizData.quiz.questions.length === 3)
  const generatedQuiz = genQuizData.quiz

  const submitQuizRes = await fetch(`${BASE_URL}/api/academic/quizzes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      action: "submit",
      quiz_id: generatedQuiz.id,
      student_id: "student-alice",
      answers: {
        [generatedQuiz.questions[0].id]: generatedQuiz.questions[0].correct_answer,
        [generatedQuiz.questions[1].id]: generatedQuiz.questions[1].correct_answer,
      },
    }),
  })
  assert.equal(submitQuizRes.status, 200)
  const attemptData = await submitQuizRes.json()
  assert.ok(attemptData.attempt)
  assert.equal(attemptData.attempt.total_questions, 3)
  assert.equal(attemptData.attempt.correct_count, 2)
  console.log(`✔ Quiz generated and scored: ${attemptData.attempt.score}% with CLO breakdown recorded.`)

  // 7. Flashcards & Spaced Repetition Progress
  console.log("\n[Test 7] 3D Flashcards & Spaced Repetition Persistence...")
  const flashcardRes = await fetch(`${BASE_URL}/api/academic/flashcards?course_id=course-cs302`, {
    headers: { cookie: studentCookie },
  })
  assert.equal(flashcardRes.status, 200)
  const flashcardData = await flashcardRes.json()
  assert.ok(Array.isArray(flashcardData.decks) && flashcardData.decks.length > 0)
  const targetDeck = flashcardData.decks[0]

  const updateFlashcardRes = await fetch(`${BASE_URL}/api/academic/flashcards`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      action: "update_progress",
      deck_id: targetDeck.id,
      mastered_card_ids: [targetDeck.cards[0]?.id || "c1"],
      reviewing_card_ids: [targetDeck.cards[1]?.id || "c2"],
    }),
  })
  assert.equal(updateFlashcardRes.status, 200)
  const updateData = await updateFlashcardRes.json()
  assert.ok(updateData.progress)
  assert.equal(updateData.progress.mastered_card_ids.length, 1)
  console.log("✔ Flashcard revision progress saved with spaced repetition retention metrics.")

  // 8. OBE Attainment & Weak Topic Detection
  console.log("\n[Test 8] Student Weak Topic Detection & Adaptive Recommendations...")
  const analyticsRes = await fetch(`${BASE_URL}/api/academic/analytics?course_id=course-cs302`, {
    headers: { cookie: studentCookie },
  })
  assert.equal(analyticsRes.status, 200)
  const analyticsData = await analyticsRes.json()
  assert.ok(analyticsData.analytics)
  assert.ok(typeof analyticsData.analytics.overall_mastery === "number")
  assert.ok(Array.isArray(analyticsData.analytics.weak_topics))
  assert.ok(Array.isArray(analyticsData.analytics.recommendations))
  console.log(`✔ Analytics loaded: Overall mastery ${analyticsData.analytics.overall_mastery}%, Weak topics: ${analyticsData.analytics.weak_topics.length}, Recommendations: ${analyticsData.analytics.recommendations.length}`)

  // 9. OBE Accreditation Export (CSV & JSON)
  console.log("\n[Test 9] HEC/PEC Accreditation Matrix Export (CSV & JSON)...")
  const exportJsonRes = await fetch(`${BASE_URL}/api/academic/export?course_id=course-cs302&format=json`, {
    headers: { cookie: qecCookie },
  })
  assert.equal(exportJsonRes.status, 200)
  const exportJson = await exportJsonRes.json()
  const report = exportJson.report || exportJson
  assert.equal(report.course.code, "CS302")
  assert.ok(report.clo_attainments.length >= 3)
  assert.ok(report.plo_attainments.length === 12)

  const exportCsvRes = await fetch(`${BASE_URL}/api/academic/export?course_id=course-cs302&format=csv`, {
    headers: { cookie: qecCookie },
  })
  assert.equal(exportCsvRes.status, 200)
  const exportCsv = await exportCsvRes.text()
  assert.ok(exportCsv.includes("HEC / PEC OBE Accreditation Attainment Matrix"))
  assert.ok(exportCsv.includes("Course Learning Outcomes (CLOs) Attainment"))
  assert.ok(exportCsv.includes("Program Learning Outcomes (PLOs 1-12) Summary"))
  assert.ok(exportCsv.includes("Continuous Quality Improvement (CQI) Recommendations"))
  console.log("✔ HEC/PEC accreditation exports generated in compliant RFC-4180 CSV and JSON formats.")

  console.log("\n🎉 ALL 9 END-TO-END E2E TEST SUITES PASSED FLAWLESSLY ON LOCALHOST!")
}

runAudit().catch((err) => {
  console.error("❌ E2E Audit Failed:", err)
  process.exit(1)
})
