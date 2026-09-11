"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { DOCUMENT_P } from "./permissions";
import {
  createDocumentSchema,
  processApprovalSchema,
} from "./_internal/validations";
import {
  createDocument,
  submitDocumentForApproval,
  processApproval,
  type DocumentDto,
} from "./_internal/services";

export async function createDocumentAction(input: unknown): Promise<ActionResult<DocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentManage);
    const parsed = createDocumentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDocument(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/documents");
    return result;
  });
}

export async function submitDocumentAction(id: string): Promise<ActionResult<DocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentManage);
    const result = await submitDocumentForApproval(ctx.tenantId, id);
    revalidatePath("/documents");
    return result;
  });
}

export async function processApprovalAction(input: unknown): Promise<ActionResult<DocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentApprove);
    const parsed = processApprovalSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await processApproval(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/documents");
    return result;
  });
}
