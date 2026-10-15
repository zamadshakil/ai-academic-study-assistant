"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
  Award,
  Layers,
  ArrowRight,
  Plus,
  BookOpen,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import type {
  Quiz,
  QuizAttempt,
  AcademicCourse,
  AcademicMaterial,
} from "@/lib/academic/types"
import type { Profile, UserRole } from "@/lib/types"

interface QuizzesClientProps {
  initialQuizzes: Quiz[]
  courses: AcademicCourse[]
  materials: AcademicMaterial[]
  userRole: UserRole
  studentProfile: Profile
}

export function QuizzesClientView({
  initialQuizzes,
  courses,
  materials,
  userRole,
  studentProfile,
}: QuizzesClientProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes)
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isGenModalOpen, setIsGenModalOpen] = useState(false)
  const [genMaterialId, setGenMaterialId] = useState(materials[0]?.id || "")
  const [generating, setGenerating] = useState(false)

  const canGenerate = userRole === "main_admin" || userRole === "manager" || userRole === "member"

  function startQuiz(quiz: Quiz) {
    setActiveQuiz(quiz)
    setSelectedAnswers({})
    setQuizResult(null)
  }

  function handleSelectOption(questionId: string, optionIndex: number) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  async function handleSubmitQuiz() {
    if (!activeQuiz) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/academic/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          quiz_id: activeQuiz.id,
          answers: selectedAnswers,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.attempt) {
          setQuizResult(data.attempt)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGenerateQuiz(e: React.FormEvent) {
    e.preventDefault()
    if (!genMaterialId) return
    setGenerating(true)
    try {
      const res = await fetch("/api/academic/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          material_id: genMaterialId,
          count: 3,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.quiz) {
          setQuizzes((prev) => [data.quiz, ...prev])
          setIsGenModalOpen(false)
          startQuiz(data.quiz)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Active Quiz Player */}
      {activeQuiz ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-md space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                {activeQuiz.course_code || "CS302"}
              </span>
              <h2 className="text-xl font-bold mt-1">{activeQuiz.title}</h2>
              <p className="text-xs text-muted-foreground">{activeQuiz.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted"
              >
                Exit Quiz
              </button>
            </div>
          </div>

          {/* Results Summary Card if submitted */}
          {quizResult ? (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-xl border ${
                  quizResult.score >= 60
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold">Quiz Results</h3>
                  </div>
                  <span className="text-2xl font-black">{quizResult.score}%</span>
                </div>

                <p className="text-xs">
                  You answered {quizResult.correct_count} out of {quizResult.total_questions}{" "}
                  questions correctly.
                  {quizResult.score >= 60
                    ? " Excellent! You have successfully achieved the 60% OBE threshold for this assessment."
                    : " Score is below the 60% OBE target threshold. This topic has been logged to your Learning Analytics weak-topic detector."}
                </p>

                {/* CLO Breakdown */}
                <div className="pt-3 border-t border-border/40 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    Outcome-Based Attainment Breakdown
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.keys(quizResult.clo_breakdown).map((cloKey) => {
                      const item = quizResult.clo_breakdown[cloKey]
                      return (
                        <div
                          key={cloKey}
                          className="p-3 rounded-lg bg-background/80 border border-border/60 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold">{item.clo_code}</span>
                            <span className="text-[11px] text-muted-foreground block">
                              {item.correct} / {item.total} Correct
                            </span>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              item.percentage >= 60
                                ? "bg-emerald-500/20 text-emerald-600"
                                : "bg-red-500/20 text-red-600"
                            }`}
                          >
                            {item.percentage}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Detailed review of each question */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Question-by-Question Review & Explanations</h3>
                {activeQuiz.questions.map((q, idx) => {
                  const selected = selectedAnswers[q.id]
                  const isCorrect = selected === q.correct_answer
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border ${
                        isCorrect ? "border-emerald-500/30 bg-card" : "border-red-500/30 bg-card"
                      } space-y-2 text-xs`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-muted-foreground">
                          Question {idx + 1} · {q.clo_code} ({q.blooms_level})
                        </span>
                        {isCorrect ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Correct
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> Incorrect
                          </span>
                        )}
                      </div>

                      <p className="font-medium text-sm text-foreground">{q.question}</p>

                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                              optIdx === q.correct_answer
                                ? "border-emerald-500/50 bg-emerald-500/10 font-medium text-emerald-950 dark:text-emerald-100"
                                : optIdx === selected
                                ? "border-red-500/50 bg-red-500/10 text-red-950 dark:text-red-100"
                                : "border-border/60 bg-muted/20 text-muted-foreground"
                            }`}
                          >
                            <span>{opt}</span>
                            {optIdx === q.correct_answer && (
                              <span className="text-[10px] uppercase font-bold text-emerald-600">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-muted-foreground mt-2">
                        <span className="font-bold text-foreground">Explanation: </span>
                        {q.explanation}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => startQuiz(activeQuiz)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            // Questions taking interactive list
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">
                      Question {qIdx + 1} of {activeQuiz.questions.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {q.clo_code}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{q.blooms_level}</span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold">{q.question}</p>

                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground font-semibold"
                              : "border-border hover:bg-muted/40 text-foreground/90"
                          }`}
                        >
                          <span>{option}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-primary bg-primary text-white" : "border-border"
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Answered {Object.keys(selectedAnswers).length} of {activeQuiz.questions.length}{" "}
                  questions
                </span>

                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={submitting || Object.keys(selectedAnswers).length === 0}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Scoring Assessment..." : "Submit Quiz for Grading"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Quiz directory list
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Available Topic Quizzes</h2>
              <p className="text-xs text-muted-foreground">
                All questions are constructively aligned and mapped to Course Learning Outcomes (CLOs).
              </p>
            </div>

            {canGenerate && (
              <button
                onClick={() => setIsGenModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Auto-Generate Quiz from Slides</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {quiz.course_code || "CS302"}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {quiz.questions.length * 3} Mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold">{quiz.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{quiz.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.from(new Set(quiz.questions.map((q) => q.clo_code))).map((clo) => (
                      <span
                        key={clo}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      >
                        Mapped: {clo}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {quiz.questions.length} Multiple Choice Questions
                  </span>

                  <button
                    onClick={() => startQuiz(quiz)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Take Quiz</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Generate Quiz Modal */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Auto-Generate Quiz from Material</span>
              </h3>
              <button
                onClick={() => setIsGenModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateQuiz} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Select Lecture Slides or Task File
                </label>
                <select
                  value={genMaterialId}
                  onChange={(e) => setGenMaterialId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.slide_or_page_count} Slides)
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                The AI Study Assistant will analyze the lecture slides, formulate multiple choice
                questions, attach Bloom's Taxonomy levels, and map each question to the appropriate
                Course Learning Outcome (CLO).
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsGenModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {generating ? "Generating Questions..." : "Generate Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
