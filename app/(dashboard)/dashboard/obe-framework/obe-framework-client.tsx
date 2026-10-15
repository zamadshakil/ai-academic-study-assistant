"use client"

import { useState } from "react"
import {
  Network,
  BookOpen,
  Award,
  Layers,
  CheckCircle2,
  HelpCircle,
  School,
  ExternalLink,
  Plus,
  X,
  AlertCircle,
} from "lucide-react"
import type { PLO, CLO, AcademicCourse } from "@/lib/academic/types"
import type { UserRole } from "@/lib/types"

interface OBEFrameworkClientProps {
  plos: PLO[]
  courses: AcademicCourse[]
  allClos?: CLO[]
  initialClos?: CLO[]
  userRole: UserRole
}

export function OBEFrameworkClient({
  plos,
  courses,
  allClos,
  initialClos,
  userRole,
}: OBEFrameworkClientProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "")
  const [activeTab, setActiveTab] = useState<"plos" | "clos" | "blooms">("plos")
  const [closState, setClosState] = useState<CLO[]>(allClos || initialClos || [])
  const [showAddCloModal, setShowAddCloModal] = useState(false)
  const [newCloCode, setNewCloCode] = useState("")
  const [newCloDesc, setNewCloDesc] = useState("")
  const [newCloBlooms, setNewCloBlooms] = useState<CLO["blooms_level"]>("C3 - Applying")
  const [newCloPlo, setNewCloPlo] = useState("PLO-1")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentCourse = courses.find((c) => c.id === selectedCourseId)
  const displayedClos = closState.filter((c) => c.course_id === selectedCourseId)

  async function handleCreateClo(e: React.FormEvent) {
    e.preventDefault()
    if (!newCloCode.trim() || !newCloDesc.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/academic/clos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          course_id: selectedCourseId,
          code: newCloCode.trim(),
          description: newCloDesc.trim(),
          blooms_level: newCloBlooms,
          domain: "Cognitive",
          target_percentage: 60,
          mapped_plos: [{ plo_code: newCloPlo, weight: 3 }],
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setClosState((prev) => [...prev, data.clo])
        setNewCloCode("")
        setNewCloDesc("")
        setShowAddCloModal(false)
      } else {
        const err = await res.json()
        alert(err.error || "Failed to create CLO")
      }
    } catch (err) {
      console.error(err)
      alert("Error creating CLO")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab("plos")}
          className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "plos"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>HEC / PEC Program Learning Outcomes (PLOs 1–12)</span>
        </button>

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
          onClick={() => setActiveTab("blooms")}
          className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "blooms"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Bloom's Taxonomy Reference</span>
        </button>
      </div>

      {/* TAB 1: PLOs 1-12 */}
      {activeTab === "plos" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground space-y-1">
            <span className="font-bold text-foreground">HEC / PEC Washington Accord Alignment:</span>
            <p>
              Under Outcome-Based Education (OBE), undergraduate computing and engineering degrees must
              demonstrate student mastery across these 12 Graduate Attributes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plos.map((plo) => (
              <div
                key={plo.code}
                className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    {plo.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {plo.target_percentage}% Target
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground">{plo.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{plo.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CLOs */}
      {activeTab === "clos" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
            <div>
              <span className="text-sm font-semibold">
                Course: {currentCourse?.title || "Artificial Intelligence"} ({currentCourse?.code})
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {displayedClos.length} CLO{displayedClos.length === 1 ? "" : "s"} registered for this course
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="text-xs rounded-lg border border-border bg-background px-3 py-1.5"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
              {userRole !== "member" && (
                <button
                  type="button"
                  onClick={() => setShowAddCloModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Define CLO</span>
                </button>
              )}
            </div>
          </div>

          {displayedClos.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card/50 space-y-2">
              <BookOpen className="h-8 w-8 text-muted-foreground/60 mx-auto" />
              <p className="text-sm font-semibold">No Course Learning Outcomes Defined Yet</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                No CLOs have been formulated for {currentCourse?.title || "this course"} yet.
                {userRole !== "member" ? " Click 'Define CLO' above to formulate outcomes." : ""}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {displayedClos.map((clo) => (
                <div
                  key={clo.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-primary">{clo.code}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-700">
                        {clo.blooms_level}
                      </span>
                      <span className="text-xs text-muted-foreground">Domain: {clo.domain}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">
                      {clo.target_percentage}% Target
                    </span>
                  </div>

                  <p className="text-sm font-medium">{clo.description}</p>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <span>Contributing PLOs:</span>
                    <div className="flex gap-1.5">
                      {clo.mapped_plos.map((m) => (
                        <span
                          key={m.plo_code}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700"
                        >
                          {m.plo_code} (Emphasis {m.weight})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Bloom's Taxonomy Reference */}
      {activeTab === "blooms" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Bloom's Revised Taxonomy Cognitive Levels used to formulate and assess academic Course Learning Outcomes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                level: "C1 - Remembering",
                verbs: "Define, list, state, recall, label, identify",
                desc: "Retrieve relevant knowledge from long-term memory.",
              },
              {
                level: "C2 - Understanding",
                verbs: "Explain, summarize, classify, infer, compare, paraphrase",
                desc: "Construct meaning from oral, written, and graphic messages.",
              },
              {
                level: "C3 - Applying",
                verbs: "Implement, solve, execute, compute, calculate, use",
                desc: "Carry out or use a procedure in a given situation.",
              },
              {
                level: "C4 - Analyzing",
                verbs: "Differentiate, organize, deconstruct, correlate, examine",
                desc: "Break material into constituent parts and determine how parts relate.",
              },
              {
                level: "C5 - Evaluating",
                verbs: "Assess, evaluate, critique, judge, defend, justify",
                desc: "Make judgments based on criteria and standards.",
              },
              {
                level: "C6 - Creating",
                verbs: "Design, construct, formulate, develop, investigate, generate",
                desc: "Put elements together to form a coherent whole or make an original product.",
              },
            ].map((b) => (
              <div key={b.level} className="p-4 rounded-xl border border-border bg-card space-y-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 block w-fit">
                  {b.level}
                </span>
                <p className="text-xs font-medium text-foreground">{b.desc}</p>
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border">
                  <span className="font-semibold text-foreground">Action Verbs: </span>
                  {b.verbs}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Define New CLO */}
      {showAddCloModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Define New CLO · {currentCourse?.code}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCloModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClo} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">CLO Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. CLO-4"
                  value={newCloCode}
                  onChange={(e) => setNewCloCode(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Outcome Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Design and evaluate heuristic search algorithms for state-space problems."
                  value={newCloDesc}
                  onChange={(e) => setNewCloDesc(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Bloom's Taxonomy Level</label>
                  <select
                    value={newCloBlooms}
                    onChange={(e) => setNewCloBlooms(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
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
                  <label className="text-xs font-semibold block mb-1">Primary PLO Mapping</label>
                  <select
                    value={newCloPlo}
                    onChange={(e) => setNewCloPlo(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                  >
                    {plos.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.code}: {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddCloModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save CLO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
