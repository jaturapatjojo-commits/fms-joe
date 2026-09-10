import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  STAFF_P,
  listAdminStaffMembers,
  listDepartments,
} from "@/features/staff/server";
import { StaffAdminClient } from "./_components/staff-admin-client";

export default async function StaffAdminPage() {
  const ctx = await requirePermission(STAFF_P.staffRead);
  const [staff, departments] = await Promise.all([
    listAdminStaffMembers(ctx.tenantId),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <StaffAdminClient
      initialStaff={staff}
      departments={departments}
      canManage={hasPermission(ctx, STAFF_P.staffManage)}
    />
  );
}
