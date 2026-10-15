import { Suspense } from "react"
import { requireProfile } from "@/lib/auth"
import { CAPABILITIES, getAccessContext } from "@/lib/permissions"
import {
  getDashboardSummary,
  listAnnouncements,
  listMaterials,
  listActivity,
  listMyTasks,
} from "@/lib/data"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { SubmissionsTable } from "@/components/dashboard/submissions-table"
import { Announcements } from "@/components/dashboard/announcements"
import { Materials } from "@/components/dashboard/materials"
import { ActivityLog } from "@/components/dashboard/activity-log"
import { MyTasks } from "@/components/dashboard/my-tasks"
import { roleLabel } from "@/lib/auth-shared"
import type { Profile } from "@/lib/types"

// ---------------------------------------------------------------------------
// Streaming dashboard overview
//
// Each section below is its own async Server Component wrapped in Suspense,
// so the page shell paints immediately and each region streams in as its own
// data resolves — instead of blocking on the slowest of five queries via
// Promise.all. StatCards and RecentSubmissions both call the cached
// getDashboardSummary, so they share one round-trip.
// ---------------------------------------------------------------------------

export default async function OverviewPage() {
  const profile = await requireProfile()
  const ctx = await getAccessContext(profile)
  const canReadTasks = ctx.has(CAPABILITIES.TASKS_READ)

  const greeting = profile.full_name?.split(" ")[0] ?? profile.email
  const roleline =
    profile.role === "main_admin"
      ? "Main Admin overview — every team, every submission, every action."
      : profile.role === "manager"
        ? "Manager view — submissions, members, and validation insights for your team."
        : "Welcome back. Here's the latest from your team."

  return (
    <>
      <PageHeader
        title={`Hello, ${greeting}`}
        description={roleline}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-white px-3 py-1.5 text-[12px] font-semibold text-muted-foreground border border-border">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1aae39]" aria-hidden="true" />
            Signed in as {roleLabel(profile.role)}
          </span>
        }
      />

      {/* Academic LMS & OBE Quick Navigation Hub */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-purple-500/5 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              AI-Powered Academic Platform
            </span>
            <h2 className="text-base font-bold text-foreground">
              Academic Study Assistant & Outcome-Based Education (OBE)
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary w-fit">
            HEC / PEC Washington Accord
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          <a
            href="/dashboard/courses"
            className="p-3 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 transition-all text-center space-y-1 group"
          >
            <span className="text-xs font-bold block group-hover:text-primary transition-colors">
              Courses
            </span>
            <span className="text-[10px] text-muted-foreground block">Curricula & CLOs</span>
          </a>

          <a
            href="/dashboard/materials"
            className="p-3 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 transition-all text-center space-y-1 group"
          >
            <span className="text-xs font-bold block group-hover:text-primary transition-colors">
              Slides & PDFs
            </span>
            <span className="text-[10px] text-muted-foreground block">RAG Repository</span>
          </a>

          <a
            href="/dashboard/smart-ai"
            className="p-3 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 transition-all text-center space-y-1 group"
          >
            <span className="text-xs font-bold block text-primary group-hover:text-primary/80 transition-colors">
              RAG Assistant
            </span>
            <span className="text-[10px] text-muted-foreground block">Source Citations</span>
          </a>

          <a
            href="/dashboard/quizzes"
            className="p-3 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 transition-all text-center space-y-1 group"
          >
            <span className="text-xs font-bold block text-emerald-600 group-hover:text-emerald-500 transition-colors">
              Quizzes
            </span>
            <span className="text-[10px] text-muted-foreground block">CLO Diagnostics</span>
          </a>

          <a
            href="/dashboard/flashcards"
            className="p-3 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 transition-all text-center space-y-1 group"
          >
            <span className="text-xs font-bold block text-blue-600 group-hover:text-blue-500 transition-colors">
              Flashcards
            </span>
            <span className="text-[10px] text-muted-foreground block">3D Revision Deck</span>
          </a>

          <a
            href="/dashboard/analytics"
            className="p-3 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 transition-all text-center space-y-1 group"
          >
            <span className="text-xs font-bold block text-purple-600 group-hover:text-purple-500 transition-colors">
              Analytics
            </span>
            <span className="text-[10px] text-muted-foreground block">Weak Topics & CQI</span>
          </a>
        </div>
      </div>

      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCardsSection profile={profile} />
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="xl:col-span-2 space-y-4 lg:space-y-6 min-w-0">
          {profile.role === "member" && canReadTasks ? (
            <Suspense fallback={null}>
              <OpenTasksSection profile={profile} />
            </Suspense>
          ) : null}
          <Suspense fallback={<TableSkeleton />}>
            <RecentSubmissionsSection profile={profile} />
          </Suspense>
          <Suspense fallback={<TableSkeleton />}>
            <MaterialsSection profile={profile} />
          </Suspense>
        </div>
        <div className="space-y-4 lg:space-y-6 min-w-0">
          <Suspense fallback={<PanelSkeleton />}>
            <AnnouncementsSection profile={profile} />
          </Suspense>
          {profile.role !== "member" ? (
            <Suspense fallback={<PanelSkeleton />}>
              <ActivitySection profile={profile} />
            </Suspense>
          ) : null}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

async function StatCardsSection({ profile }: { profile: Profile }) {
  const summary = await getDashboardSummary(profile)
  return (
    <StatCards
      total={summary.total}
      passRate={summary.passRate}
      avgScore={summary.avgScore}
      needsReview={summary.needsReview}
    />
  )
}

async function RecentSubmissionsSection({ profile }: { profile: Profile }) {
  // Reuses the React.cache'd summary — no second query.
  const summary = await getDashboardSummary(profile)
  const canDelete = profile.role === "manager" || profile.role === "main_admin"
  return <SubmissionsTable rows={summary.recent} canDelete={canDelete} />
}

async function MaterialsSection({ profile }: { profile: Profile }) {
  const rows = await listMaterials(profile, 6)
  return <Materials rows={rows} showViewAll />
}

async function AnnouncementsSection({ profile }: { profile: Profile }) {
  const rows = await listAnnouncements(profile, 5)
  return <Announcements rows={rows} showViewAll />
}

async function ActivitySection({ profile }: { profile: Profile }) {
  const rows = await listActivity(profile, 8)
  return <ActivityLog rows={rows} />
}

async function OpenTasksSection({ profile }: { profile: Profile }) {
  const myTasks = await listMyTasks(profile)
  const openTasks = myTasks.filter((t) => t.status === "assigned")
  if (openTasks.length === 0) return null
  return (
    <section>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-3">
        Open tasks ({openTasks.length})
      </h2>
      <MyTasks tasks={openTasks.slice(0, 3)} />
    </section>
  )
}

// ---------------------------------------------------------------------------
// Skeleton fallbacks (kept inline to avoid a new file for one-off shapes)
// ---------------------------------------------------------------------------

function StatCardsSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 animate-pulse"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4 lg:p-5 shadow-card h-[112px]"
        />
      ))}
    </section>
  )
}

function TableSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-border bg-card shadow-card h-72 animate-pulse"
    />
  )
}

function PanelSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-border bg-card shadow-card h-64 animate-pulse"
    />
  )
}
