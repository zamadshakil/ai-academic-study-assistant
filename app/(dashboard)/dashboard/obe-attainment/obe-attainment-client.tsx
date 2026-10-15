"use client"

import { useState } from "react"
import Link from "next/link"
import {
  FileCheck2,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Target,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import type {
  AcademicCourse,
  CLOAttainmentResult,
  PLOAttainmentResult,
} from "@/lib/academic/types"
import type { UserRole } from "@/lib/types"

interface OBEAttainmentClientProps {
  courses: AcademicCourse[]
  selectedCourseId: string
  cloAttainments: CLOAttainmentResult[]
  ploAttainments: PLOAttainmentResult[]
  userRole: UserRole
}

export function OBEAttainmentClient({
  courses,
  selectedCourseId,
  cloAttainments,
  ploAttainments,
}: OBEAttainmentClientProps) {
  const [courseId, setCourseId] = useState(selectedCourseId)

  const currentCourse = courses.find((c) => c.id === courseId)
  const achievedClosCount = cloAttainments.filter((c) => c.status === "achieved").length
  const overallCloRate = Math.round(
    cloAttainments.reduce((acc, c) => acc + c.attainment_percentage, 0) /
      Math.max(cloAttainments.length, 1),
  )

  return (
    <div className="space-y-8">
      {/* Course Selector & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <span className="text-xs font-semibold text-muted-foreground block">
            Target Course for Attainment Audit
          </span>
          <span className="text-sm font-bold text-foreground">
            {currentCourse?.code} - {currentCourse?.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-medium">Select Course:</label>
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value)
              window.location.href = `/dashboard/obe-attainment?course_id=${e.target.value}`
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

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">CLO Attainment Rate</span>
            <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{overallCloRate}%</p>
          <span className="text-xs text-emerald-600 font-semibold">
            {overallCloRate >= 60 ? "Criteria Satisfied" : "Below Baseline"}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Achieved Outcomes</span>
            <span className="p-1.5 rounded-md bg-primary/10 text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {achievedClosCount} / {cloAttainments.length}
          </p>
          <span className="text-xs text-muted-foreground">Scored &gt;= 60% by Class</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Washington Accord PLOs</span>
            <span className="p-1.5 rounded-md bg-purple-500/10 text-purple-600">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">12 / 12</p>
          <span className="text-xs text-purple-600 font-semibold">Full HEC Standard</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Accreditation Audit</span>
            <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">Compliant</p>
          <Link
            href={`/dashboard/obe-reports?course_id=${courseId}`}
            className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
          >
            <span>Generate Report</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Course CLO Attainment Table */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-primary" />
          <span>Course Learning Outcomes (CLO) Attainment Ledger</span>
        </h2>

        <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-3 font-semibold">CLO</th>
                <th className="p-3 font-semibold min-w-[240px]">Outcome & Cognitive Level</th>
                <th className="p-3 font-semibold text-center">Class Average</th>
                <th className="p-3 font-semibold text-center">Students Met / Total</th>
                <th className="p-3 font-semibold min-w-[160px]">Attainment Progress</th>
                <th className="p-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cloAttainments.map((clo) => (
                <tr key={clo.clo_id} className="hover:bg-muted/20">
                  <td className="p-3 font-bold text-primary">{clo.clo_code}</td>
                  <td className="p-3">
                    <p className="font-medium text-foreground">{clo.description}</p>
                    <span className="text-[11px] text-muted-foreground">{clo.blooms_level}</span>
                  </td>
                  <td className="p-3 text-center font-bold">{clo.average_score}%</td>
                  <td className="p-3 text-center text-muted-foreground font-medium">
                    {clo.students_achieved} / {clo.students_attempted}
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            clo.attainment_percentage >= 60 ? "bg-emerald-600" : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, clo.attainment_percentage)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-foreground">
                        {clo.attainment_percentage}% (Threshold: {clo.target_percentage}%)
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        clo.status === "achieved"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {clo.status === "achieved" ? "Achieved" : "In Progress"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Program PLO Washington Accord Attainment Matrix */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          <span>Program Learning Outcomes (PLOs 1–12) Weighted Attainment</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Calculated via constructive alignment weights from all contributing Course Learning Outcomes across the curriculum.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ploAttainments.map((plo) => (
            <div key={plo.plo_code} className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">
                  {plo.plo_code}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    plo.attainment_percentage >= 60
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {plo.attainment_percentage}%
                </span>
              </div>

              <h4 className="text-xs font-bold text-foreground line-clamp-1">{plo.plo_title}</h4>

              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, plo.attainment_percentage)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                <span>Target: {plo.target_percentage}%</span>
                <span>{plo.contributing_clos_count} Mapped CLOs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
