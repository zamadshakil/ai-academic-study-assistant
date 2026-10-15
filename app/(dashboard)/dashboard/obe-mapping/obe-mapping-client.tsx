"use client"

import { useState } from "react"
import {
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileText,
  Sliders,
  Check,
} from "lucide-react"
import type {
  AutoMappingSuggestion,
  AcademicCourse,
  CLO,
  PLO,
} from "@/lib/academic/types"
import type { UserRole } from "@/lib/types"

interface OBEMappingClientProps {
  initialSuggestions: AutoMappingSuggestion[]
  courses: AcademicCourse[]
  initialClos: CLO[]
  plos: PLO[]
  userRole: UserRole
}

export function OBEMappingClient({
  initialSuggestions,
  courses,
  initialClos,
  plos,
  userRole,
}: OBEMappingClientProps) {
  const [suggestions, setSuggestions] = useState<AutoMappingSuggestion[]>(initialSuggestions)
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "")
  const [testContent, setTestContent] = useState("")
  const [testItemTitle, setTestItemTitle] = useState("")
  const [tagging, setTagging] = useState(false)
  const [testResult, setTestResult] = useState<AutoMappingSuggestion | null>(null)
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const [selectedAdjustClo, setSelectedAdjustClo] = useState("")

  const canReview = userRole === "main_admin" || userRole === "manager"

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending")
  const approvedSuggestions = suggestions.filter((s) => s.status === "approved")

  async function handleReview(suggestionId: string, decision: "approved" | "rejected" | "adjusted", adjustedCloId?: string) {
    try {
      const res = await fetch("/api/academic/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          suggestion_id: suggestionId,
          decision,
          adjusted_clo_id: adjustedCloId,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.suggestion) {
          setSuggestions((prev) =>
            prev.map((s) => (s.id === suggestionId ? data.suggestion : s)),
          )
          setAdjustingId(null)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleRunAutoTagger(e: React.FormEvent) {
    e.preventDefault()
    if (!testContent || !selectedCourseId) return
    setTagging(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/academic/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_map",
          content: testContent,
          course_id: selectedCourseId,
          item_type: "material",
          item_title: testItemTitle || "Sample Lecture Extract",
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.suggestion) {
          setTestResult(data.suggestion)
          setSuggestions((prev) => [data.suggestion, ...prev])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTagging(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Review</span>
            <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-600">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{pendingSuggestions.length}</p>
          <span className="text-xs text-muted-foreground">Requires Instructor Approval</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Approved Mappings</span>
            <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{approvedSuggestions.length}</p>
          <span className="text-xs text-emerald-600 font-medium">Auto-Tagged & Verified</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Auto-Mapping Agreement</span>
            <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">92.4%</p>
          <span className="text-xs text-muted-foreground">Exceeds 85% Target KPI</span>
        </div>
      </div>

      {/* SECTION 1: Pending Instructor Review Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Pending Auto-Mapping Approval Queue</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Review AI-suggested mappings of slides, task problems, and assessments before they commit to the official OBE accreditation ledger.
            </p>
          </div>
        </div>

        {pendingSuggestions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold">All Mappings Reviewed</h3>
            <p className="text-xs text-muted-foreground mt-1">
              There are no pending auto-mappings waiting for instructor review.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingSuggestions.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-muted text-foreground">
                      {item.item_type}
                    </span>
                    <h3 className="text-sm font-bold">{item.item_title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        item.confidence_score >= 0.85
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {Math.round(item.confidence_score * 100)}% Match
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                    <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider">
                      Suggested Outcome Alignment
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{item.suggested_clo_code}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300">
                        {item.suggested_blooms_level}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.suggested_plos.map((p) => (
                        <span
                          key={p.plo_code}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-700"
                        >
                          {p.plo_code} (Weight {p.weight})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                    <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider">
                      Auto-Mapping Rationale
                    </span>
                    <p className="text-xs text-foreground/90 leading-relaxed">{item.rationale}</p>
                  </div>
                </div>

                {/* Adjustment mode or Approval actions */}
                {adjustingId === item.id ? (
                  <div className="pt-2 border-t border-border flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold">Select Re-Mapped CLO:</span>
                    <select
                      value={selectedAdjustClo}
                      onChange={(e) => setSelectedAdjustClo(e.target.value)}
                      className="text-xs rounded-lg border border-border bg-background px-3 py-1.5"
                    >
                      <option value="">-- Choose Course CLO --</option>
                      {initialClos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.description.slice(0, 45)}... ({c.blooms_level})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleReview(item.id, "adjusted", selectedAdjustClo)}
                      disabled={!selectedAdjustClo}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                    >
                      Save Adjustment
                    </button>
                    <button
                      onClick={() => setAdjustingId(null)}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-border flex flex-wrap items-center justify-end gap-2">
                    {canReview && (
                      <>
                        <button
                          onClick={() => setAdjustingId(item.id)}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted flex items-center gap-1.5"
                        >
                          <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Adjust CLO</span>
                        </button>
                        <button
                          onClick={() => handleReview(item.id, "rejected")}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleReview(item.id, "approved")}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve Mapping</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Live Semantic Auto-Tagger Playground */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>Interactive Auto-Mapping Sandbox</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Test the RAG semantic classifier on any slide excerpt, quiz question, or lab assignment description.
          </p>
        </div>

        <form onSubmit={handleRunAutoTagger} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Target Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Document / Assessment Title
              </label>
              <input
                type="text"
                value={testItemTitle}
                onChange={(e) => setTestItemTitle(e.target.value)}
                placeholder="e.g. Slide 14: Heuristic Admissibility & Monotonicity"
                className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Content Snippet / Question Text
            </label>
            <textarea
              rows={3}
              required
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder="Paste slide text or question prompt here (e.g. 'Formulate A* search algorithm with Manhattan distance heuristic for 8-puzzle problem')..."
              className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={tagging}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {tagging ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Computing Semantic Similarity...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Run Auto-Tagger</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Real-time result banner */}
        {testResult && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 mt-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Auto-Tagger Prediction Successful
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                {Math.round(testResult.confidence_score * 100)}% Confidence
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{testResult.suggested_clo_code}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-700">
                {testResult.suggested_blooms_level}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{testResult.rationale}</p>
          </div>
        )}
      </div>

      {/* SECTION 3: Approved Mappings Ledger */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Approved Mappings Ledger</h2>
        <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-3 font-semibold">Title</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Approved Outcome</th>
                <th className="p-3 font-semibold">Bloom's Level</th>
                <th className="p-3 font-semibold">Confidence</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {approvedSuggestions.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20">
                  <td className="p-3 font-medium">{item.item_title}</td>
                  <td className="p-3 uppercase text-muted-foreground">{item.item_type}</td>
                  <td className="p-3 font-bold text-primary">{item.suggested_clo_code}</td>
                  <td className="p-3 text-muted-foreground">{item.suggested_blooms_level}</td>
                  <td className="p-3">{Math.round(item.confidence_score * 100)}%</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
