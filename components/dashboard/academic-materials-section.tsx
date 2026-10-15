"use client"

import { useState } from "react"
import Link from "next/link"
import {
  FolderOpen,
  BookOpen,
  CheckCircle2,
  Layers,
  Sparkles,
  Target,
  FileText,
  Plus,
  UploadCloud,
  X,
  Search,
} from "lucide-react"
import type { AcademicMaterial } from "@/lib/academic/types"

interface AcademicMaterialsSectionProps {
  materials: AcademicMaterial[]
  canUpload?: boolean
  userRole?: string
}

export function AcademicMaterialsSection({
  materials: initialMaterials,
  canUpload = true,
  userRole,
}: AcademicMaterialsSectionProps) {
  const [materials, setMaterials] = useState<AcademicMaterial[]>(initialMaterials)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Form states
  const [courseId, setCourseId] = useState("course-ai-302")
  const [courseCode, setCourseCode] = useState("CS302")
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"slides" | "notes" | "assignment" | "handout">("slides")
  const [slideCount, setSlideCount] = useState(10)
  const [summary, setSummary] = useState("")
  const [extractedText, setExtractedText] = useState("")

  const filteredMaterials = materials.filter((m) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (m.title?.toLowerCase().includes(q) ?? false) ||
      (m.course_code?.toLowerCase().includes(q) ?? false) ||
      (m.type?.toLowerCase().includes(q) ?? false) ||
      (m.summary?.toLowerCase().includes(q) ?? false)
    )
  })

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setIsUploading(true)
    setUploadError(null)

    try {
      const res = await fetch("/api/academic/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          course_code: courseCode,
          title: title.trim(),
          type,
          slide_or_page_count: Number(slideCount) || 1,
          summary: summary.trim() || `${title} course content`,
          extracted_text: extractedText.trim() || summary.trim() || title.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMaterials((prev) => [data.material, ...prev])
        setTitle("")
        setSummary("")
        setExtractedText("")
        setShowUploadModal(false)
      } else {
        const data = await res.json()
        setUploadError(data.error || "Failed to upload material")
      }
    } catch (err: any) {
      setUploadError(err.message || "Network error while uploading material")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            <span>Academic Lecture Slides & Task Files</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Course lecture materials indexed for RAG citation grounding and CLO auto-mapping.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search slides & materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-60"
            />
          </div>

          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Slides</span>
            </button>
          )}
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card/50 space-y-2">
          <FileText className="h-8 w-8 text-muted-foreground/60 mx-auto" />
          <p className="text-sm font-semibold">No materials match your query</p>
          <p className="text-xs text-muted-foreground">Try clearing your search term or upload a new slide presentation.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredMaterials.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary">
                    {m.course_code || "CS302"}
                  </span>
                  <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-muted">
                    {m.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.slide_or_page_count} Slides / Pages
                  </span>
                  {m.mapped_clos?.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    >
                      Mapped: {c}
                    </span>
                  ))}
                </div>
                <h4 className="text-sm font-semibold text-foreground">{m.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1">{m.summary}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/dashboard/quizzes?material_id=${m.id}&course_id=${m.course_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Generate Quiz</span>
                </Link>
                <Link
                  href={`/dashboard/flashcards?material_id=${m.id}&course_id=${m.course_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Layers className="h-3.5 w-3.5 text-blue-600" />
                  <span>Flashcards</span>
                </Link>
                <Link
                  href={`/dashboard/smart-ai?course_id=${m.course_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Study RAG</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Upload Academic Course Material</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Target Course</label>
                <select
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value)
                    if (e.target.value === "course-ai-302") setCourseCode("CS302")
                    else if (e.target.value === "course-ds-201") setCourseCode("CS201")
                    else if (e.target.value === "course-algo-301") setCourseCode("CS301")
                  }}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                >
                  <option value="course-ai-302">CS302 - Artificial Intelligence</option>
                  <option value="course-ds-201">CS201 - Data Structures & Algorithms</option>
                  <option value="course-algo-301">CS301 - Analysis of Algorithms</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Document / Slide Deck Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lecture 05: Constraint Satisfaction & Heuristic Backtracking"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Material Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <option value="slides">Lecture Slides</option>
                    <option value="notes">Lecture Notes</option>
                    <option value="assignment">Assignment / Task</option>
                    <option value="handout">Course Handout</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Slide / Page Count</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={slideCount}
                    onChange={(e) => setSlideCount(parseInt(e.target.value) || 1)}
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Brief Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Covers CSP formalization, MRV heuristics, and forward checking."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">
                  Extracted Slide Content (for RAG & CLO Grounding)
                </label>
                <textarea
                  rows={5}
                  placeholder="Slide 1: Title & Agenda...&#10;Slide 2: CSP Definition and Variables...&#10;Slide 3: Backtracking Algorithm..."
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Format slides with `Slide N:` prefixes to enable precise locator citations in the study assistant.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <span>Indexing...</span>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Upload & Index</span>
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
