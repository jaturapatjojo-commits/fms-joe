import { z } from "zod";

export const newsStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type NewsStatus = z.infer<typeof newsStatusSchema>;

export const createNewsCategorySchema = z.object({
  nameTh: z.string().min(1, "กรุณาระบุชื่อหมวดหมู่ภาษาไทย").max(100),
  nameEn: z.string().min(1, "Please specify category name in English").max(100),
  slug: z.string().min(1, "กรุณาระบุ slug").max(100).regex(/^[a-z0-9-]+$/, "slug ต้องเป็นตัวพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น"),
  sortOrder: z.coerce.number().int().default(0),
});

export const updateNewsCategorySchema = createNewsCategorySchema.extend({
  id: z.string().uuid(),
});

export const createNewsArticleSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  titleTh: z.string().min(1, "กรุณาระบุหัวข้อข่าวภาษาไทย").max(255),
  titleEn: z.string().max(255).optional().nullable().or(z.literal("")),
  slug: z.string().max(255).optional().nullable().or(z.literal("")),
  summaryTh: z.string().max(1000).optional().nullable().or(z.literal("")),
  summaryEn: z.string().max(1000).optional().nullable().or(z.literal("")),
  contentTh: z.string().min(1, "กรุณาระบุเนื้อหาภาษาไทย"),
  contentEn: z.string().optional().nullable().or(z.literal("")),
  coverImageUrl: z.string().url("URL รูปภาพไม่ถูกต้อง").optional().nullable().or(z.literal("")),
  attachmentUrls: z.array(z.string().url()).default([]),
  status: newsStatusSchema.default("DRAFT"),
  isPinned: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updateNewsArticleSchema = createNewsArticleSchema.extend({
  id: z.string().uuid(),
});

export const generateEnglishNewsSchema = z.object({
  titleTh: z.string().min(1, "กรุณาระบุหัวข้อข่าวภาษาไทย"),
  summaryTh: z.string().optional().nullable(),
  contentTh: z.string().min(1, "กรุณาระบุเนื้อหาภาษาไทย"),
});

export type CreateNewsCategoryInput = z.infer<typeof createNewsCategorySchema>;
export type UpdateNewsCategoryInput = z.infer<typeof updateNewsCategorySchema>;
export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
export type GenerateEnglishNewsInput = z.infer<typeof generateEnglishNewsSchema>;
