import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  CURRICULUM_P,
  listAdminCurriculums,
  listEducationLevels,
} from "@/features/curriculum/server";
import { CurriculumAdminClient } from "./_components/curriculum-admin-client";

export default async function CurriculumAdminPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [curriculums, educationLevels] = await Promise.all([
    listAdminCurriculums(ctx.tenantId),
    listEducationLevels(ctx.tenantId),
  ]);

  return (
    <CurriculumAdminClient
      initialCurriculums={curriculums}
      initialEducationLevels={educationLevels}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
    />
  );
}
