"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  School,
  FileCheck2,
  ListOrdered,
  ArrowRight,
} from "lucide-react"
import type { OBEAccreditationExport, AcademicCourse } from "@/lib/academic/types"
import type { UserRole } from "@/lib/types"

interface OBEReportsClientProps {
  courses: AcademicCourse[]
  selectedCourseId: string
  report: OBEAccreditationExport
  userRole: UserRole
}

export function OBEReportsClient({
  courses,
  selectedCourseId,
  report,
}: OBEReportsClientProps) {
  const [courseId, setCourseId] = useState(selectedCourseId)

  function handlePrint() {
    window.print()
  }

  function handleDownloadCsv() {
    window.open(`/api/academic/export?course_id=${courseId}&format=csv`, "_blank")
  }

  function handleDownloadJson() {
    window.open(`/api/academic/export?course_id=${courseId}&format=json`, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Top action toolbar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Course Dossier:</label>
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value)
              window.location.href = `/dashboard/obe-reports?course_id=${e.target.value}`
            }}
            className="text-xs rounded-lg border border-border bg-background px-3 py-1.5 focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5 text-purple-600" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Accreditation Dossier Paper Card */}
      <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Institutional Header */}
        <div className="text-center space-y-1.5 border-b border-border/80 pb-6">
          <span className="text-xs font-bold tracking-widest text-primary uppercase">
            Outcome-Based Education Accreditation Audit Dossier
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {report.institution}
          </h1>
          <p className="text-sm font-semibold text-muted-foreground">
            Department of Computer Science & Software Engineering · {report.program}
          </p>
          <p className="text-xs text-muted-foreground pt-1">
            Academic Term: {report.term} · Audit Date:{" "}
            {new Date(report.generated_at).toLocaleDateString()}
          </p>
        </div>

        {/* Section 1: Course Particulars */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <School className="h-4 w-4 text-primary" />
            <span>1. Course Particulars & Faculty Details</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-4 rounded-xl border border-border/60 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Course Code</span>
              <span className="font-bold text-foreground text-sm">{report.course.code}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Course Title</span>
              <span className="font-bold text-foreground text-sm">{report.course.title}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Credit Hours</span>
              <span className="font-bold text-foreground text-sm">
                {report.course.credit_hours} Cr.
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Faculty Advisor</span>
              <span className="font-bold text-foreground text-sm">
                {report.course.instructor_name || "Dr. Iqra Tariq"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Student Attainment Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>2. Overall Student Attainment Performance</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-muted-foreground block">Total Enrolled Cohort</span>
              <span className="text-xl font-black mt-1 block">
                {report.student_summary.total_students} Students
              </span>
              <span className="text-[11px] text-muted-foreground">Regular BSAI Section</span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-muted-foreground block">Met 60% OBE Criteria</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">
                {report.student_summary.passed_ob_criteria} Students
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">Qualified</span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-muted-foreground block">Overall Course Attainment</span>
              <span className="text-xl font-black text-primary mt-1 block">
                {report.student_summary.overall_attainment_rate}%
              </span>
              <span className="text-[11px] text-primary font-medium">
                Accreditation Pass Threshold: 60%
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: CLO Attainment Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-primary" />
            <span>3. Course Learning Outcomes (CLOs) Verification Matrix</span>
          </h2>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-muted/70 border-b border-border text-foreground font-semibold">
                <tr>
                  <th className="p-2.5">CLO</th>
                  <th className="p-2.5 min-w-[200px]">Description</th>
                  <th className="p-2.5">Bloom's Taxonomy</th>
                  <th className="p-2.5 text-center">Target %</th>
                  <th className="p-2.5 text-center">Class Avg %</th>
                  <th className="p-2.5 text-center">Attained %</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.clo_attainments.map((clo) => (
                  <tr key={clo.clo_id}>
                    <td className="p-2.5 font-bold text-primary">{clo.clo_code}</td>
                    <td className="p-2.5 font-medium">{clo.description}</td>
                    <td className="p-2.5 text-muted-foreground">{clo.blooms_level}</td>
                    <td className="p-2.5 text-center">{clo.target_percentage}%</td>
                    <td className="p-2.5 text-center font-semibold">{clo.average_score}%</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">
                      {clo.attainment_percentage}%
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          clo.status === "achieved"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-amber-500/10 text-amber-700"
                        }`}
                      >
                        {clo.status === "achieved" ? "Pass" : "Review"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Continuous Quality Improvement (CQI) */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-purple-600" />
            <span>4. Continuous Quality Improvement (CQI) Action Plan</span>
          </h2>

          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
            {report.continuous_quality_improvement_recommendations.map((cqi, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <span className="font-bold text-primary shrink-0">{idx + 1}.</span>
                <p className="text-foreground/90 leading-relaxed">{cqi}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Signatures for Official Accreditation Audit */}
        <div className="pt-8 border-t border-border grid grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-6">
            <div className="border-b border-border/80 pb-4 h-12" />
            <span className="font-semibold block">Course Instructor Signature</span>
            <span className="text-[11px] text-muted-foreground">Dr. Iqra Tariq</span>
          </div>

          <div className="space-y-6">
            <div className="border-b border-border/80 pb-4 h-12" />
            <span className="font-semibold block">Head of Department (HoD)</span>
            <span className="text-[11px] text-muted-foreground">Department of Computer Science</span>
          </div>

          <div className="space-y-6">
            <div className="border-b border-border/80 pb-4 h-12" />
            <span className="font-semibold block">Dean / QEC Director</span>
            <span className="text-[11px] text-muted-foreground">Quality Enhancement Cell (QEC)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
