"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { errors, isAppError } from "@/shared/lib/errors";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, getTenantGemini } from "@/features/identity/server";
import { generateEnglishFromThaiNews, type GeneratedEnglishNews } from "@/shared/lib/ai/gemini";
import { NEWS_P } from "./permissions";
import {
  createNewsCategorySchema,
  updateNewsCategorySchema,
  createNewsArticleSchema,
  updateNewsArticleSchema,
  generateEnglishNewsSchema,
} from "./_internal/validations";
import {
  createNewsCategory,
  updateNewsCategory,
  deleteNewsCategory,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  togglePinNewsArticle,
  type NewsCategoryDto,
  type NewsArticleDetailDto,
} from "./_internal/services";

export async function createNewsCategoryAction(input: unknown): Promise<ActionResult<NewsCategoryDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = createNewsCategorySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createNewsCategory(ctx.tenantId, parsed);
    revalidatePath("/news");
    return result;
  });
}

export async function updateNewsCategoryAction(input: unknown): Promise<ActionResult<NewsCategoryDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = updateNewsCategorySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateNewsCategory(ctx.tenantId, parsed);
    revalidatePath("/news");
    return result;
  });
}

export async function deleteNewsCategoryAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    await deleteNewsCategory(ctx.tenantId, id);
    revalidatePath("/news");
  });
}

export async function createNewsArticleAction(input: unknown): Promise<ActionResult<NewsArticleDetailDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = createNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createNewsArticle(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/news");
    revalidatePath("/portal/news");
    return result;
  });
}

export async function updateNewsArticleAction(input: unknown): Promise<ActionResult<NewsArticleDetailDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = updateNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateNewsArticle(ctx.tenantId, parsed);
    revalidatePath("/news");
    revalidatePath("/portal/news");
    return result;
  });
}

export async function togglePinNewsArticleAction(id: string, isPinned: boolean): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    await togglePinNewsArticle(ctx.tenantId, id, isPinned);
    revalidatePath("/news");
    revalidatePath("/portal/news");
  });
}

export async function deleteNewsArticleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    await deleteNewsArticle(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/portal/news");
  });
}

export async function generateEnglishNewsWithAiAction(
  input: unknown,
): Promise<ActionResult<GeneratedEnglishNews>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = generateEnglishNewsSchema.parse(input, { error: zodErrorMap(await getLocale()) });

    const tenantGemini = await getTenantGemini(ctx.tenantId);
    const apiKey = tenantGemini?.apiKey || process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      throw errors.validation("ยังไม่ได้ตั้งค่า Gemini API Key กรุณาไปตั้งค่าที่หน้า 'ตั้งค่าระบบ' ก่อนใช้งาน");
    }

    try {
      const result = await generateEnglishFromThaiNews({
        apiKey,
        model: tenantGemini?.model,
        titleTh: parsed.titleTh,
        summaryTh: parsed.summaryTh ?? undefined,
        contentTh: parsed.contentTh,
      });

      return result;
    } catch (err: unknown) {
      if (isAppError(err)) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      throw errors.validation(msg);
    }
  });
}
