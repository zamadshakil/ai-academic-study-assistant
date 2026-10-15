import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  FileCheck2,
  FileText,
  FolderOpen,
  GraduationCap,
  History,
  KeyRound,
  Layers,
  LayoutDashboard,
  Library,
  ListChecks,
  Megaphone,
  MessageSquare,
  Network,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"
import type { UserRole } from "@/lib/types"

export interface DashboardNavItem {
  label: string
  icon: LucideIcon
  href: string
  roles: UserRole[]
}

export interface DashboardNavGroup {
  label: string
  items: DashboardNavItem[]
}

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: "Academic LMS Core",
    items: [
      {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "Courses",
        icon: GraduationCap,
        href: "/dashboard/courses",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "Course Materials",
        icon: FolderOpen,
        href: "/dashboard/materials",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "RAG Study Assistant",
        icon: Sparkles,
        href: "/dashboard/smart-ai",
        roles: ["main_admin", "manager", "member"],
      },
    ],
  },
  {
    label: "Practice & Revision",
    items: [
      {
        label: "CLO-Mapped Quizzes",
        icon: CheckCircle2,
        href: "/dashboard/quizzes",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "Flashcard Decks",
        icon: Layers,
        href: "/dashboard/flashcards",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "Learning Analytics",
        icon: BarChart3,
        href: "/dashboard/analytics",
        roles: ["main_admin", "manager", "member"],
      },
    ],
  },
  {
    label: "Outcome-Based Education",
    items: [
      {
        label: "CLO / PLO Framework",
        icon: Network,
        href: "/dashboard/obe-framework",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "CLO Auto-Mapping",
        icon: Target,
        href: "/dashboard/obe-mapping",
        roles: ["main_admin", "manager"],
      },
      {
        label: "Attainment Matrix",
        icon: FileCheck2,
        href: "/dashboard/obe-attainment",
        roles: ["main_admin", "manager"],
      },
      {
        label: "Accreditation Reports",
        icon: FileText,
        href: "/dashboard/obe-reports",
        roles: ["main_admin", "manager"],
      },
    ],
  },
  {
    label: "Collaboration & Portal",
    items: [
      {
        label: "Academic Tasks",
        icon: ListChecks,
        href: "/dashboard/tasks",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "Submissions",
        icon: Upload,
        href: "/dashboard/submissions",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "Discussions & Messages",
        icon: MessageSquare,
        href: "/dashboard/messages",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "Announcements",
        icon: Megaphone,
        href: "/dashboard/announcements",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "My AI Credits",
        icon: Zap,
        href: "/dashboard/my-credits",
        roles: ["main_admin", "manager", "member"],
      },
      {
        label: "Academic Faculty & Roster",
        icon: Users,
        href: "/dashboard/team",
        roles: ["main_admin", "manager"],
      },
      {
        label: "Departments",
        icon: Library,
        href: "/dashboard/departments",
        roles: ["main_admin"],
      },
      {
        label: "System Settings",
        icon: Settings,
        href: "/dashboard/settings",
        roles: ["main_admin", "manager", "member"],
      },
    ],
  },
]

export function getDashboardNavGroups(role: UserRole, allowedHrefs?: string[]): DashboardNavGroup[] {
  const allowedHrefSet = allowedHrefs ? new Set(allowedHrefs) : null
  return dashboardNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        allowedHrefSet ? allowedHrefSet.has(item.href) : item.roles.includes(role),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

export function getDashboardNavItems(role: UserRole, allowedHrefs?: string[]): DashboardNavItem[] {
  return getDashboardNavGroups(role, allowedHrefs).flatMap((group) => group.items)
}
