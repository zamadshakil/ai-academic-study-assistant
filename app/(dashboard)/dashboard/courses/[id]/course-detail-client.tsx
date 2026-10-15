"use client"

import { useState } from "react"
import Link from "next/link"
import {
  GraduationCap,
  BookOpen,
  FolderOpen,
  CheckCircle2,
  Layers,
  Sparkles,
  Plus,
  ArrowLeft,
  School,
  Calendar,
  Award,
  Users,
  Target,
  FileText,
  HelpCircle,
  Loader2,
  Upload,
} from "lucide-react"
import type {
  AcademicCourse,
  AcademicMaterial,
  CLO,
  PLO,
  BloomsTaxonomyLevel,
} from "@/lib/academic/types"
import type { UserRole } from "@/lib/types"
import { AcademicRAGPanel } from "@/components/dashboard/smart-ai/academic-rag-panel"

interface CourseDetailClientProps {
  course: AcademicCourse
  clos: CLO[]
  materials: AcademicMaterial[]
  plos: PLO[]
  userRole: UserRole
}

export function CourseDetailClient({
  course,
  clos: initialClos,
  materials: initialMaterials,
  plos,
  userRole,
}: CourseDetailClientProps) {
  const [clos, setClos] = useState<CLO[]>(initialClos)
  const [materials, setMaterials] = useState<AcademicMaterial[]>(initialMaterials)
  const [activeTab, setActiveTab] = useState<"clos" | "materials" | "matrix" | "rag">("clos")
  const [isAddCloOpen, setIsAddCloOpen] = useState(false)
  const [newCode, setNewCode] = useState(`CLO-${clos.length + 1}`)
  const [newDesc, setNewDesc] = useState("")
  const [newLevel, setNewLevel] = useState<BloomsTaxonomyLevel>("C3 - Applying")
  const [newPlo, setNewPlo] = useState("PLO-2")
  const [newWeight, setNewWeight] = useState<1 | 2 | 3>(3)

  // Upload Material Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadType, setUploadType] = useState<"slides" | "pdf" | "task_file" | "notes">("slides")
  const [uploadPages, setUploadPages] = useState(24)
  const [uploadSummary, setUploadSummary] = useState("")
  const [uploadText, setUploadText] = useState("")
  const [uploading, setUploading] = useState(false)

  const canEdit = userRole === "main_admin" || userRole === "manager"

  async function handleAddClo(e: React.FormEvent) {
    e.preventDefault()
    if (!newCode || !newDesc) return

    try {
      const res = await fetch("/api/academic/clos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          course_id: course.id,
          code: newCode,
          description: newDesc,
          blooms_level: newLevel,
          mapped_plos: [{ plo_code: newPlo, weight: newWeight }],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.clo) {
          setClos((prev) => [...prev, data.clo])
        } else {
          fallbackAddClo()
        }
      } else {
        fallbackAddClo()
      }
    } catch {
      fallbackAddClo()
    }

    setIsAddCloOpen(false)
    setNewDesc("")
    setNewCode(`CLO-${clos.length + 2}`)
  }

  function fallbackAddClo() {
    const newClo: CLO = {
      id: `clo-${Date.now()}`,
      course_id: course.id,
      code: newCode,
      description: newDesc,
      blooms_level: newLevel,
      domain: "Cognitive",
      target_percentage: 60,
      mapped_plos: [{ plo_code: newPlo, weight: newWeight }],
    }
    setClos((prev) => [...prev, newClo])
  }

  async function handleUploadMaterial(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadTitle.trim()) return

    setUploading(true)
    try {
      const res = await fetch("/api/academic/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: course.id,
          title: uploadTitle.trim(),
          type: uploadType,
          slide_or_page_count: uploadPages,
          summary: uploadSummary.trim(),
          extracted_text: uploadText.trim() || uploadSummary.trim() || uploadTitle.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.material) {
          setMaterials((prev) => [data.material, ...prev])
          setIsUploadOpen(false)
          setUploadTitle("")
          setUploadSummary("")
          setUploadText("")
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Courses</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                {course.code}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {course.semester} · {course.credit_hours} Credit Hours
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("rag")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask AI Study Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground block">Course Instructor</span>
          <span className="text-sm font-semibold">{course.instructor_name || "Assigned Faculty"}</span>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground block">Enrolled Students</span>
          <span className="text-sm font-semibold">{course.student_count || 42} Students</span>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground block">Defined CLOs</span>
          <span className="text-sm font-semibold">{clos.length} Outcomes</span>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground block">Lecture Materials</span>
          <span className="text-sm font-semibold">{materials.length} Slides / PDFs</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab("clos")}
          className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "clos"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Course Learning Outcomes (CLOs)</span>
        </button>

        <button
          onClick={() => setActiveTab("materials")}
          className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "materials"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>Course Materials ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "matrix"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target className="h-4 w-4" />
          <span>CLO-to-PLO Mapping Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab("rag")}
          className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "rag"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>RAG Study Assistant (Q&A)</span>
        </button>
      </div>

      {/* TAB 1: CLOs Directory */}
      {activeTab === "clos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Course Learning Outcomes (HEC/PEC OBE)</h2>
              <p className="text-xs text-muted-foreground">
                Measurable learning outcomes mapped to Bloom's Revised Cognitive Taxonomy and Program Learning Outcomes.
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => setIsAddCloOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add CLO</span>
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {clos.map((clo) => (
              <div
                key={clo.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-muted text-foreground">
                      {clo.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400">
                      {clo.blooms_level}
                    </span>
                    <span className="text-xs text-muted-foreground">Domain: {clo.domain}</span>
                  </div>
                  <p className="text-sm font-medium">{clo.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Target Threshold</span>
                    <span className="text-xs font-semibold text-emerald-600">
                      {clo.target_percentage}% Attainment
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 max-w-[140px]">
                    {clo.mapped_plos.map((m) => (
                      <span
                        key={m.plo_code}
                        title={`Weight: ${m.weight === 3 ? "High (3)" : m.weight === 2 ? "Medium (2)" : "Low (1)"}`}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                      >
                        {m.plo_code} ({m.weight})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Materials Repository */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Course Materials & Lecture Slides</h2>
              <p className="text-xs text-muted-foreground">
                Digital materials chunked and indexed into the RAG vector store with citation anchoring.
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload Slides / Notes</span>
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {materials.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-muted text-foreground">
                      {m.type}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {m.slide_or_page_count} Slides / Pages
                    </span>
                    {m.mapped_clos.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-700"
                      >
                        Mapped: {c}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-sm font-semibold">{m.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{m.summary}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/quizzes?course_id=${course.id}&material_id=${m.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Generate Quiz</span>
                  </Link>
                  <Link
                    href={`/dashboard/flashcards?course_id=${course.id}&material_id=${m.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted"
                  >
                    <Layers className="h-3.5 w-3.5 text-blue-600" />
                    <span>Generate Cards</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Mapping Matrix */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Course CLO to Program PLO Matrix</h2>
            <p className="text-xs text-muted-foreground">
              Constructive Alignment Matrix: Correlation levels (3 = High, 2 = Medium, 1 = Low) defined for HEC accreditation.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-sm">
            <table className="w-full text-xs text-left border-collapse min-w-[700px]">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-3 font-semibold">CLO</th>
                  <th className="p-3 font-semibold min-w-[200px]">Description & Bloom's Level</th>
                  {plos.map((plo) => (
                    <th key={plo.code} title={plo.title} className="p-2 font-semibold text-center">
                      {plo.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clos.map((clo) => (
                  <tr key={clo.id} className="hover:bg-muted/20">
                    <td className="p-3 font-bold text-primary">{clo.code}</td>
                    <td className="p-3">
                      <p className="font-medium text-foreground">{clo.description}</p>
                      <span className="text-[11px] text-muted-foreground">{clo.blooms_level}</span>
                    </td>
                    {plos.map((plo) => {
                      const match = clo.mapped_plos.find((m) => m.plo_code === plo.code)
                      return (
                        <td key={plo.code} className="p-2 text-center">
                          {match ? (
                            <span
                              className={`inline-block w-6 h-6 rounded-md font-bold text-xs leading-6 ${
                                match.weight === 3
                                  ? "bg-purple-600 text-white"
                                  : match.weight === 2
                                  ? "bg-purple-300 text-purple-950 dark:bg-purple-800 dark:text-purple-100"
                                  : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                              }`}
                            >
                              {match.weight}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Course-Grounded RAG Assistant */}
      {activeTab === "rag" && (
        <div className="space-y-4">
          <AcademicRAGPanel
            initialCourseId={course.id}
            courses={[{ id: course.id, code: course.code, title: `${course.code} - ${course.title}` }]}
          />
        </div>
      )}

      {/* Add CLO Modal */}
      {isAddCloOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-semibold">Define Course Learning Outcome (CLO)</h3>
              <button
                onClick={() => setIsAddCloOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClo} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  CLO Identifier
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Outcome Description (Actionable & Measurable)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Design and implement heuristic evaluation functions..."
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Bloom's Taxonomy Level
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as BloomsTaxonomyLevel)}
                    className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-2"
                  >
                    <option value="C1 - Remembering">C1 - Remembering</option>
                    <option value="C2 - Understanding">C2 - Understanding</option>
                    <option value="C3 - Applying">C3 - Applying</option>
                    <option value="C4 - Analyzing">C4 - Analyzing</option>
                    <option value="C5 - Evaluating">C5 - Evaluating</option>
                    <option value="C6 - Creating">C6 - Creating</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Mapped Primary PLO
                  </label>
                  <select
                    value={newPlo}
                    onChange={(e) => setNewPlo(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-2"
                  >
                    {plos.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.code} ({p.title.slice(0, 20)}...)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Correlation Level / Weight
                </label>
                <select
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value) as 1 | 2 | 3)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                >
                  <option value={3}>3 - High Emphasis</option>
                  <option value={2}>2 - Medium Emphasis</option>
                  <option value={1}>1 - Low Emphasis</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddCloOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Material Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  <span>Upload Course Lecture Slides / Material</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Indexed into RAG vector repository and auto-mapped against course CLOs.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadMaterial} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Document Title & File Name
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Lecture 08 - Adversarial Search & Alpha-Beta Pruning.pdf"
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Document Type
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-2"
                  >
                    <option value="slides">Lecture Slides</option>
                    <option value="pdf">Course Handout / PDF</option>
                    <option value="task_file">Task / Lab Specification</option>
                    <option value="notes">Reading Notes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Estimated Slide / Page Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={uploadPages}
                    onChange={(e) => setUploadPages(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Executive Topic Summary
                </label>
                <input
                  type="text"
                  value={uploadSummary}
                  onChange={(e) => setUploadSummary(e.target.value)}
                  placeholder="e.g. Game trees, minimax algorithm, utility functions, alpha-beta pruning..."
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Extracted Slide Text (Slide 1: ... Slide 4: ...)
                </label>
                <textarea
                  rows={4}
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="Paste or extract slide text here (e.g. Slide 1: Title... Slide 5: Game trees and Minimax formulation...)"
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 resize-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadTitle.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Indexing & Auto-Mapping…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload & Auto-Map CLO</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
