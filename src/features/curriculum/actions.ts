"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "./permissions";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
  createEducationLevelSchema,
  updateEducationLevelSchema,
  createCurriculumMajorSchema,
  updateCurriculumMajorSchema,
} from "./_internal/validations";
import {
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  createEducationLevel,
  updateEducationLevel,
  deleteEducationLevel,
  createCurriculumMajor,
  updateCurriculumMajor,
  deleteCurriculumMajor,
  type CurriculumDto,
  type CurriculumMajorDto,
  type EducationLevelDto,
} from "./_internal/services";

export async function createCurriculumAction(input: unknown): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createCurriculumSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createCurriculum(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function updateCurriculumAction(input: unknown): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateCurriculumSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateCurriculum(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function deleteCurriculumAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteCurriculum(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
  });
}

export async function createEducationLevelAction(input: unknown): Promise<ActionResult<EducationLevelDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createEducationLevelSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createEducationLevel(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function updateEducationLevelAction(input: unknown): Promise<ActionResult<EducationLevelDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateEducationLevelSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateEducationLevel(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function deleteEducationLevelAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteEducationLevel(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
  });
}

export async function createCurriculumMajorAction(input: unknown): Promise<ActionResult<CurriculumMajorDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createCurriculumMajorSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createCurriculumMajor(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function updateCurriculumMajorAction(input: unknown): Promise<ActionResult<CurriculumMajorDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateCurriculumMajorSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateCurriculumMajor(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function deleteCurriculumMajorAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteCurriculumMajor(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
  });
}

