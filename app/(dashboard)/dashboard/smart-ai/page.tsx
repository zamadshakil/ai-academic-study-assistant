import { listSubmissions } from "@/lib/data"
import { CAPABILITIES, requireCapability } from "@/lib/permissions"
import { SmartAiShell } from "@/components/dashboard/smart-ai/smart-ai-shell"

export const metadata = {
  title: "RAG Study Assistant · Academic Study Assistant",
  description:
    "Source-grounded academic study assistant with verifiable citations, confidence thresholding, and Outcome-Based Education alignment.",
}

export default async function SmartAiPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { profile } = await requireCapability(CAPABILITIES.SMART_AI_CHAT)
  const resolvedParams = await searchParams

  const threadParam = resolvedParams.thread
  const initialThreadId =
    typeof threadParam === "string" && threadParam.length > 0
      ? threadParam
      : null

  const courseParam = resolvedParams.course_id
  const initialCourseId =
    typeof courseParam === "string" && courseParam.length > 0
      ? courseParam
      : undefined

  const { rows: recentSubmissions } = await listSubmissions(profile, { limit: 24 })
  const services = { mcp: true, rag: true }

  return (
    <SmartAiShell
      profile={{
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        team_id: profile.team_id,
      }}
      submissions={recentSubmissions}
      services={services}
      initialThreadId={initialThreadId}
      initialCourseId={initialCourseId}
    />
  )
}
