import { cache } from "react"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseEnv } from "@/lib/env"
import type { Profile, UserRole } from "@/lib/types"

/**
 * Single source of truth for "who is calling me?" in server components and
 * server actions. Wrapped in React.cache so that the layout + page (+ any
 * other server component down the tree) all share ONE round-trip per render
 * pass instead of each repeating the auth.getUser() + profile select.
 */
const getCurrentUserAndProfile = cache(async (): Promise<{
  user: Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"]
  profile: Profile | null
}> => {
  const cookieStore = await cookies()
  const demoRole = cookieStore.get("academic_demo_role")?.value
  const env = getSupabaseEnv()

  if (demoRole || !env.configured) {
    const role: UserRole =
      demoRole === "manager" || demoRole === "instructor"
        ? "manager"
        : demoRole === "main_admin" || demoRole === "admin"
          ? "main_admin"
          : "member"

    const mockProfile: Profile = {
      id: role === "manager" ? "inst-1" : role === "main_admin" ? "admin-1" : "std-1",
      email:
        role === "manager"
          ? "instructor@ucp.edu.pk"
          : role === "main_admin"
            ? "qec@ucp.edu.pk"
            : "student@ucp.edu.pk",
      full_name:
        role === "manager"
          ? "Dr. Iqra Tariq (Instructor & Advisor)"
          : role === "main_admin"
            ? "Scrutiny Committee & QEC Admin"
            : "BSAI Student (Alice)",
      role,
      team_id: "team-ai",
      manager_id: role === "member" ? "inst-1" : null,
      must_reset: false,
      avatar_url: null,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return {
      user: {
        id: mockProfile.id,
        email: mockProfile.email,
        app_metadata: {},
        user_metadata: { full_name: mockProfile.full_name },
        aud: "authenticated",
        created_at: mockProfile.created_at,
      } as any,
      profile: mockProfile,
    }
  }

  try {
    const supabase = await createClient()
    let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch (err) {
      console.error("[auth] getUser() threw — treating as unauthenticated", err)
    }
    if (!user) return { user: null, profile: null }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
    return { user, profile: (data as Profile | null) ?? null }
  } catch (err) {
    console.error("[auth] createClient threw — returning null", err)
    return { user: null, profile: null }
  }
})

async function hasSupabaseAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.getAll().some((cookie) => /^sb-.*-auth-token(\.|$)/.test(cookie.name))
}

async function buildRecoveryHref(fallbackPath: string): Promise<string> {
  const headerStore = await headers()
  const pathname = headerStore.get("x-pathname") ?? fallbackPath
  const safePath = pathname.startsWith("/") ? pathname : fallbackPath
  return `/auth/session-recovery?next=${encodeURIComponent(safePath)}`
}

export async function redirectToAuthEntry(fallbackPath = "/dashboard"): Promise<never> {
  if (await hasSupabaseAuthCookie()) {
    redirect(await buildRecoveryHref(fallbackPath))
  }
  redirect("/auth/login")
}

export async function getSessionUser() {
  return (await getCurrentUserAndProfile()).user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  return (await getCurrentUserAndProfile()).profile
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (profile) return profile
  return redirectToAuthEntry()
}

export async function requireRole(roles: UserRole[]): Promise<Profile> {
  const profile = await requireProfile()
  if (!roles.includes(profile.role)) redirect("/dashboard")
  return profile
}

export function canManageTeam(profile: Profile, teamId: string | null): boolean {
  if (profile.role === "main_admin") return true
  if (profile.role === "manager" && teamId && profile.team_id === teamId) return true
  return false
}

// Re-export from the shared module so server code can `import { roleLabel } from "@/lib/auth"`.
export { roleLabel } from "@/lib/auth-shared"
