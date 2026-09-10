import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  CURRICULUM_P,
  listAdminCurriculums,
} from "@/features/curriculum/server";
import { CurriculumAdminClient } from "./_components/curriculum-admin-client";

export default async function CurriculumAdminPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const curriculums = await listAdminCurriculums(ctx.tenantId);

  return (
    <CurriculumAdminClient
      initialCurriculums={curriculums}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
    />
  );
}
