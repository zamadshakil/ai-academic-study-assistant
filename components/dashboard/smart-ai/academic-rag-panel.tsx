"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Search,
  BookOpen,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Send,
  Loader2,
  Trash2,
  HelpCircle,
  ExternalLink,
} from "lucide-react"
import type { RAGCitation } from "@/lib/academic/types"

interface AcademicTurn {
  id: string
  query: string
  courseId?: string
  courseCode?: string
  answer: string
  confidenceScore: number
  isLowConfidence: boolean
  citations: RAGCitation[]
  timestamp: string
}

interface AcademicRAGPanelProps {
  initialCourseId?: string
  courses?: Array<{ id: string; code: string; title: string }>
}

const DEFAULT_COURSES = [
  { id: "all", code: "ALL", title: "All Enrolled Courses (Cross-Curricular RAG)" },
  { id: "course-cs302", code: "CS302", title: "CS302 - Artificial Intelligence & Intelligent Systems" },
  { id: "course-se410", code: "SE410", title: "SE410 - Software Quality Engineering & OBE Systems" },
  { id: "course-cs201", code: "CS201", title: "CS201 - Data Structures & Algorithm Design" },
]

const QUICK_PROMPTS = [
  {
    topic: "A* Consistency Condition",
    prompt: "Explain the consistency (monotonicity) condition for A* heuristic search and why it guarantees graph search optimality.",
    courseId: "course-cs302",
  },
  {
    topic: "PEAS Framework",
    prompt: "What does PEAS stand for in artificial intelligence? Provide the complete specification for an automated taxi driver from Lecture 01.",
    courseId: "course-cs302",
  },
  {
    topic: "RAG & Confidence Thresholding",
    prompt: "How does confidence thresholding in RAG prevent LLM hallucination and ensure academic integrity?",
    courseId: "course-cs302",
  },
  {
    topic: "Admissible Heuristics in 8-Puzzle",
    prompt: "What is an admissible heuristic function? Compare Manhattan distance with misplaced tiles in the 8-puzzle.",
    courseId: "course-cs302",
  },
  {
    topic: "Out-of-Domain Probe",
    prompt: "Quantum cellular photosynthesis respiration cycle in marine microbiology deep hydrothermal vents.",
    courseId: "course-cs302",
  },
]

export function AcademicRAGPanel({
  initialCourseId = "course-cs302",
  courses = DEFAULT_COURSES,
}: AcademicRAGPanelProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId)
  const [queryInput, setQueryInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [turns, setTurns] = useState<AcademicTurn[]>([
    {
      id: "initial-turn",
      query: "What is the admissibility condition for A* heuristic search?",
      courseId: "course-cs302",
      courseCode: "CS302",
      answer:
        "Based on your course material (**Lecture 04 - Informed Heuristic Search & A* Optimality.pptx**, Slide 19):\n\nA heuristic h(n) is admissible if for every node n, h(n) <= h*(n), where h*(n) is the true cost to reach the goal state from n. An admissible heuristic is optimistic - it never overestimates the cost to reach the goal.\n\nThis explanation is directly grounded in your instructor's course slides and aligns with learning outcome **CLO-2**. See the attached citation cards below for verification.",
      confidenceScore: 0.94,
      isLowConfidence: false,
      citations: [
        {
          document_title: "Lecture 04 - Informed Heuristic Search & A* Optimality.pptx",
          page_or_slide: "Slide 19",
          excerpt:
            "Conditions for Optimality: Admissibility and Consistency. A heuristic h(n) is admissible if for every node n, h(n) <= h*(n), where h*(n) is the true cost to reach the goal state from n. An admissible heuristic is optimistic - it never overestimates the cost to reach the goal.",
          similarity: 0.94,
          clo_code: "CLO-2",
        },
        {
          document_title: "Lecture 04 - Informed Heuristic Search & A* Optimality.pptx",
          page_or_slide: "Slide 14",
          excerpt:
            "A* Search: Minimizing Total Estimated Path Cost. A* search evaluates nodes by combining g(n), the cost to reach node n, and h(n), the cost to get from n to the goal: f(n) = g(n) + h(n).",
          similarity: 0.82,
          clo_code: "CLO-2",
        },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])

  async function handleAsk(promptText?: string) {
    const q = promptText || queryInput.trim()
    if (!q || loading) return

    setLoading(true)
    const activeCourse = selectedCourseId === "all" ? undefined : selectedCourseId

    try {
      const res = await fetch("/api/academic/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          course_id: activeCourse,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const newTurn: AcademicTurn = {
          id: `turn-${Date.now()}`,
          query: q,
          courseId: activeCourse,
          courseCode: data.course_code || "CS302",
          answer: data.answer,
          confidenceScore: data.confidence_score,
          isLowConfidence: data.is_low_confidence,
          citations: data.citations || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setTurns((prev) => [newTurn, ...prev])
        setQueryInput("")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Academic RAG Status Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-blue-500/10 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Source-Grounded Academic RAG
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Confidence Thresholding Active (0.35)
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Course Lecture Q&A Assistant with Verifiable Citations
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Anchored in your instructor&apos;s uploaded lecture slides, task files, and Outcome-Based Education (OBE) learning outcomes. Answers below the 35% similarity threshold are flagged to prevent hallucination.
            </p>
          </div>

          {/* Course Scope Picker */}
          <div className="flex items-center gap-2 shrink-0 bg-card p-2 rounded-xl border border-border">
            <GraduationCap className="h-4 w-4 text-primary" />
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="text-xs font-semibold rounded-lg bg-background px-3 py-1.5 border border-border focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Academic Prompts */}
        <div className="pt-2 border-t border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
            Suggested Academic Questions (click to query):
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.topic}
                onClick={() => {
                  setSelectedCourseId(qp.courseId)
                  handleAsk(qp.prompt)
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-primary/5 hover:border-primary/40 transition-colors text-left flex items-center gap-1.5 group"
              >
                <Search className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <span>{qp.topic}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Input Bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask any question from course lecture slides (e.g. What is the A* consistency condition?)..."
          className="w-full rounded-xl border border-border bg-card px-4 py-3.5 pr-28 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          <button
            onClick={() => handleAsk()}
            disabled={loading || !queryInput.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Searching…</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Ask RAG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Conversation / Query Turns Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Retrieved Grounded Answers ({turns.length})</span>
          </h2>
          {turns.length > 0 && (
            <button
              onClick={() => setTurns([])}
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear History
            </button>
          )}
        </div>

        {turns.map((turn) => (
          <div
            key={turn.id}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5 animate-in fade-in duration-200"
          >
            {/* User Question */}
            <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Student Study Query
                </span>
                <h3 className="text-base font-bold text-foreground">{turn.query}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  {turn.courseCode}
                </span>
                <span className="text-xs text-muted-foreground">{turn.timestamp}</span>
              </div>
            </div>

            {/* Confidence Threshold Badge / Warning */}
            <div className="flex items-center justify-between gap-3 bg-muted/40 px-3.5 py-2 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Retrieval Confidence:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded ${
                    turn.isLowConfidence
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {Math.round(turn.confidenceScore * 100)}% Similarity
                </span>
                <span className="text-muted-foreground">
                  (Integrity Threshold: 35%)
                </span>
              </div>

              {turn.isLowConfidence ? (
                <span className="text-amber-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Below Threshold (Flagged)
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Source Grounded
                </span>
              )}
            </div>

            {/* Low Confidence Alert Banner */}
            {turn.isLowConfidence && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Low Confidence Verification Warning: Out-of-Domain or Missing Topic</span>
                </div>
                <p className="leading-relaxed">
                  This inquiry has insufficient semantic coverage in the instructor&apos;s uploaded materials for {turn.courseCode}. To prevent parametric LLM hallucination and uphold academic accuracy, the platform refuses to fabricate ungrounded answers.
                </p>
              </div>
            )}

            {/* Answer Text */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap bg-background/50 p-4 rounded-xl border border-border/60">
              {turn.answer}
            </div>

            {/* Citations Deck */}
            {turn.citations && turn.citations.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Verified Source Citations ({turn.citations.length})
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Directly traceable to instructor slide decks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {turn.citations.map((cite, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-colors shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            {cite.document_title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300">
                              {cite.page_or_slide}
                            </span>
                            {cite.clo_code && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                {cite.clo_code}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground shrink-0">
                          {Math.round(cite.similarity * 100)}% Match
                        </span>
                      </div>

                      <blockquote className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-lg border-l-2 border-primary line-clamp-3">
                        &ldquo;{cite.excerpt}&rdquo;
                      </blockquote>

                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                        <Link
                          href={`/dashboard/quizzes?course_id=${turn.courseId || "course-cs302"}`}
                          className="text-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Practice Quiz
                        </Link>
                        <Link
                          href={`/dashboard/flashcards?course_id=${turn.courseId || "course-cs302"}`}
                          className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Layers className="h-3 w-3" /> Flashcards
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
