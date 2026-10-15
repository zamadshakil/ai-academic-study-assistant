"use client"

import { useState } from "react"
import Link from "next/link"
import {
  GraduationCap,
  Users,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Layers,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  School,
  FileCheck2,
} from "lucide-react"
import type { AcademicCourse } from "@/lib/academic/types"
import type { UserRole } from "@/lib/types"

interface CoursesClientProps {
  initialCourses: AcademicCourse[]
  userRole: UserRole
}

export function CoursesClientView({ initialCourses, userRole }: CoursesClientProps) {
  const [courses, setCourses] = useState<AcademicCourse[]>(initialCourses)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDept, setSelectedDept] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newDept, setNewDept] = useState("Computer Science")
  const [newSemester, setNewSemester] = useState("Fall 2026")
  const [newCredits, setNewCredits] = useState(3)
  const [submitting, setSubmitting] = useState(false)

  const canCreate = userRole === "main_admin" || userRole === "manager"

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = selectedDept === "all" || course.department === selectedDept
    return matchesSearch && matchesDept
  })

  const departments = Array.from(new Set(courses.map((c) => c.department)))

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newCode || !newTitle) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/academic/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode,
          title: newTitle,
          description: newDesc,
          department: newDept,
          semester: newSemester,
          credit_hours: newCredits,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.course) {
          setCourses([data.course, ...courses])
          setIsModalOpen(false)
          setNewCode("")
          setNewTitle("")
          setNewDesc("")
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top metrics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Active Courses</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">{courses.length}</p>
          <span className="text-xs text-muted-foreground">Across {departments.length} Academic Departments</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Enrolled</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {courses.reduce((acc, c) => acc + (c.student_count || 35), 0)}
          </p>
          <span className="text-xs text-emerald-600 font-medium">Undergraduate Students</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">OBE Mapping Status</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">HEC / PEC</p>
          <span className="text-xs text-blue-600 font-medium">Constructive Alignment Aligned</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">RAG Study Coverage</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">100%</p>
          <span className="text-xs text-muted-foreground">Grounded with Citations</span>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses by code, title, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create Course</span>
          </button>
        )}
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {course.code}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {course.semester} · {course.credit_hours} Cr.
                </span>
              </div>

              <div>
                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                >
                  {course.title}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <School className="h-3.5 w-3.5 text-muted-foreground" />
                  {course.department}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {course.student_count || 38} Enrolled
                </span>
              </div>
            </div>

            {/* Quick action buttons footer */}
            <div className="p-3 bg-muted/30 border-t border-border grid grid-cols-4 gap-1 text-center">
              <Link
                href={`/dashboard/courses/${course.id}`}
                title="View Course Syllabus & CLOs"
                className="py-1.5 px-2 text-xs font-medium rounded-md hover:bg-background transition-colors flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>CLOs</span>
              </Link>
              <Link
                href={`/dashboard/materials?course_id=${course.id}`}
                title="Lecture Slides & Materials"
                className="py-1.5 px-2 text-xs font-medium rounded-md hover:bg-background transition-colors flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Slides</span>
              </Link>
              <Link
                href={`/dashboard/quizzes?course_id=${course.id}`}
                title="CLO-Mapped Quizzes"
                className="py-1.5 px-2 text-xs font-medium rounded-md hover:bg-background transition-colors flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Quizzes</span>
              </Link>
              <Link
                href={`/dashboard/smart-ai?course_id=${course.id}`}
                title="Ask AI Study Assistant"
                className="py-1.5 px-2 text-xs font-medium rounded-md hover:bg-background transition-colors flex flex-col items-center gap-1 text-primary hover:text-primary/80 font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>RAG</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-semibold">Create Academic Course</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Course Code (e.g. CS302)
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="CS302"
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Artificial Intelligence"
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Description & Learning Scope
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Course scope, state-space search, probabilistic reasoning, RAG architectures..."
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
