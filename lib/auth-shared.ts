import type { UserRole } from "@/lib/types"

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "main_admin":
      return "Academic Administrator"
    case "manager":
      return "Course Instructor"
    case "member":
      return "Student"
  }
}
