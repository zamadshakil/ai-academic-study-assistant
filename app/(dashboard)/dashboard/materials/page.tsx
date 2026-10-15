import { redirect } from "next/navigation"
import { requireProfile } from "@/lib/auth"
import { CAPABILITIES, getAccessContext } from "@/lib/permissions"
import { listMaterials } from "@/lib/data"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/dashboard/page-header"
import { Materials } from "@/components/dashboard/materials"
import { MaterialUploader } from "@/components/dashboard/material-uploader"
import { BulkExportDialog } from "@/components/dashboard/bulk-export-dialog"
import { listAcademicMaterials } from "@/lib/academic/service"
import { AcademicMaterialsSection } from "@/components/dashboard/academic-materials-section"

export default async function MaterialsPage() {
  const profile = await requireProfile()
  const ctx = await getAccessContext(profile)
  const canReadMaterials = ctx.has(CAPABILITIES.MATERIALS_READ)
  const canCreateMaterials = ctx.has(CAPABILITIES.MATERIALS_CREATE)
  const canDeleteMaterials = ctx.has(CAPABILITIES.MATERIALS_DELETE)

  if (!canReadMaterials && !canCreateMaterials && !canDeleteMaterials) {
    redirect("/dashboard")
  }

  const materials = await listMaterials(profile, 200)
  const canUpload = canCreateMaterials && (profile.role === "main_admin" || !!profile.team_id)
  const canExport = profile.role === "main_admin" || profile.role === "manager"
  
  const supabase = await createClient()
  const { data: teams } = await supabase.from("teams").select("id, name").order("name")

  const academicMaterials = await listAcademicMaterials()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Materials & Lecture Slides Repository"
        description="Academic repository: Course lecture slides, PDFs, task files, and reference documentation indexed for RAG source citation and CLO auto-mapping."
        action={
          canExport ? (
            <BulkExportDialog
              type="materials"
              teams={teams ?? []}
              role={profile.role as "main_admin" | "manager"}
              currentTeamId={profile.team_id}
            />
          ) : null
        }
      />

      {/* Academic Lecture Slides & Materials Section */}
      <AcademicMaterialsSection materials={academicMaterials} canUpload={canUpload} userRole={profile.role} />

      <div className="pt-6 border-t border-border">
        <h3 className="text-base font-semibold mb-4">Shared Portal Uploads & Storage</h3>
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_360px]">
          <Materials rows={materials} canDelete={canDeleteMaterials} canDeleteGlobal={profile.role === "main_admin"} currentTeamId={profile.team_id} />
          {canUpload ? <MaterialUploader canTargetGlobal={profile.role === "main_admin"} teams={teams ?? []} currentTeamId={profile.team_id} /> : null}
        </div>
      </div>
    </div>
  )
}
