import { redirect } from "next/navigation"
import { getCurrentProfile, redirectToAuthEntry } from "@/lib/auth"
import { getSupabaseEnv } from "@/lib/env"
import { ShowcaseHome } from "@/components/showcase/home"

export const dynamic = "force-dynamic"

export default async function RootPage() {
  if (process.env.SHOWCASE_SITE_ENABLED === "true") return <ShowcaseHome />
  const profile = await getCurrentProfile()
  if (!profile) return redirectToAuthEntry("/")
  redirect("/dashboard")
}
