"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Target,
  FileCheck2,
  ExternalLink,
} from "lucide-react"
import type {
  AcademicCourse,
  CLOAttainmentResult,
  PLOAttainmentResult,
  StudentWeakTopic,
  AdaptiveRecommendation,
  QuizAttempt,
} from "@/lib/academic/types"
import type { UserRole } from "@/lib/types"

interface AnalyticsClientProps {
  courses: AcademicCourse[]
  selectedCourseId: string
  studentData: {
    overall_mastery: number
    weak_topics: StudentWeakTopic[]
    recommendations: AdaptiveRecommendation[]
    attempts: QuizAttempt[]
  }
  cloAttainments: CLOAttainmentResult[]
  ploAttainments: PLOAttainmentResult[]
  userRole: UserRole
}

export function AnalyticsClientView({
  courses,
  selectedCourseId,
  studentData,
  cloAttainments,
  ploAttainments,
  userRole,
}: AnalyticsClientProps) {
  const [courseId, setCourseId] = useState(selectedCourseId)
  const isInstructorOrAdmin = userRole === "main_admin" || userRole === "manager"

  return (
    <div className="space-y-8">
      {/* Course Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <span className="text-xs font-semibold text-muted-foreground block">
            Selected Academic Course
          </span>
          <span className="text-sm font-bold text-foreground">
            {courses.find((c) => c.id === courseId)?.title || "Artificial Intelligence"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-medium">Switch Course:</label>
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value)
              window.location.href = `/dashboard/analytics?course_id=${e.target.value}`
            }}
            className="text-xs rounded-lg border border-border bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Mastery & KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Overall Mastery</span>
            <span className="p-1.5 rounded-md bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{studentData.overall_mastery}%</p>
          <span className="text-xs text-emerald-600 font-semibold">
            {studentData.overall_mastery >= 60 ? "Above 60% OBE Target" : "Requires Intervention"}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Detected Weak Areas</span>
            <span className="p-1.5 rounded-md bg-red-500/10 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{studentData.weak_topics.length}</p>
          <span className="text-xs text-red-600 font-medium">Flagged for Adaptive Revision</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Adaptive Actions</span>
            <span className="p-1.5 rounded-md bg-purple-500/10 text-purple-600">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{studentData.recommendations.length}</p>
          <span className="text-xs text-muted-foreground">Targeted Slides & Decks</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Class Attainment</span>
            <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
              <FileCheck2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {Math.round(
              cloAttainments.reduce((acc, c) => acc + c.attainment_percentage, 0) /
                Math.max(cloAttainments.length, 1),
            )}
            %
          </p>
          <span className="text-xs text-blue-600 font-medium">Course OBE Attainment</span>
        </div>
      </div>

      {/* STUDENT SECTION 1: Persistent Weak-Topic Detection */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Persistent Weak-Topic Detection</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Automatically surfaces algorithmic concepts and outcome components where your practice score is below the 60% OBE threshold.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studentData.weak_topics.map((wt, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-300">
                  {wt.clo_code} Focus Required
                </span>
                <span className="text-xs font-bold text-red-600">{wt.score_percentage}% Score</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground">{wt.topic}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {wt.clo_description}
                </p>
              </div>

              <div className="pt-2 border-t border-red-500/20 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground">Identified via Recent Quiz Attempts</span>
                <span className="font-semibold text-red-700 dark:text-red-300">OBE Gap: -10%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STUDENT SECTION 2: Adaptive Study Recommendations */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>Adaptive Study Recommendations</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Personalized learning path: Direct pointers to specific lecture slides, targeted flashcard revision decks, and practice tests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {studentData.recommendations.map((rec) => {
            const Icon =
              rec.type === "slides" ? BookOpen : rec.type === "flashcards" ? Layers : CheckCircle2
            return (
              <div
                key={rec.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-foreground">
                      {rec.related_clo}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold">{rec.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                </div>

                <Link
                  href={rec.action_url}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  <span>Start Recommended Study</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* INSTRUCTOR / COURSE-WIDE SECTION: OBE Course Attainment Diagnostics */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              <span>Course Learning Outcomes (CLOs) Live Attainment</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Percentage of students meeting the 60% target threshold for each outcome under HEC/PEC accreditation criteria.
            </p>
          </div>

          {isInstructorOrAdmin && (
            <Link
              href="/dashboard/obe-reports"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>View Full Accreditation Report</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cloAttainments.map((clo) => (
            <div key={clo.clo_id} className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-primary">{clo.clo_code}</span>
                  <span className="text-xs text-muted-foreground ml-2">({clo.blooms_level})</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    clo.status === "achieved"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {clo.attainment_percentage}% Attained
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{clo.description}</p>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      clo.attainment_percentage >= 60 ? "bg-emerald-600" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, clo.attainment_percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>Target: {clo.target_percentage}%</span>
                  <span>
                    {clo.students_achieved} of {clo.students_attempted} Students Met Criteria
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
