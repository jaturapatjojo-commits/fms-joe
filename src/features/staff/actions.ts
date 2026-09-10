"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { STAFF_P } from "./permissions";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createStaffMemberSchema,
  updateStaffMemberSchema,
} from "./_internal/validations";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  type DepartmentDto,
  type StaffMemberDto,
} from "./_internal/services";

export async function createDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDepartment(ctx.tenantId, parsed);
    revalidatePath("/staff");
    return result;
  });
}

export async function updateDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = updateDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateDepartment(ctx.tenantId, parsed);
    revalidatePath("/staff");
    return result;
  });
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    await deleteDepartment(ctx.tenantId, id);
    revalidatePath("/staff");
  });
}

export async function createStaffMemberAction(input: unknown): Promise<ActionResult<StaffMemberDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = createStaffMemberSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createStaffMember(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
    return result;
  });
}

export async function updateStaffMemberAction(input: unknown): Promise<ActionResult<StaffMemberDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = updateStaffMemberSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateStaffMember(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
    return result;
  });
}

export async function deleteStaffMemberAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    await deleteStaffMember(ctx.tenantId, id);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
  });
}
