import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateNewsArticleInput,
  UpdateNewsArticleInput,
  CreateNewsCategoryInput,
  UpdateNewsCategoryInput,
} from "./validations";

export interface NewsCategoryDto {
  id: string;
  tenantId: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  sortOrder: number;
  articleCount?: number;
}

export interface NewsArticleListItemDto {
  id: string;
  tenantId: string;
  categoryId: string | null;
  categoryNameTh?: string | null;
  categoryNameEn?: string | null;
  titleTh: string;
  titleEn: string;
  slug: string;
  summaryTh: string | null;
  summaryEn: string | null;
  contentTh?: string;
  contentEn?: string;
  coverImageUrl: string | null;
  status: string;
  isPinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticleDetailDto extends NewsArticleListItemDto {
  contentTh: string;
  contentEn: string;
  attachmentUrls: string[];
}

/** ดึงหมวดหมู่ข่าวทั้งหมด */
export async function listNewsCategories(tenantId: string): Promise<NewsCategoryDto[]> {
  const categories = await prisma.newsCategory.findMany({
    where: { tenantId },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  return categories.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    sortOrder: c.sortOrder,
    articleCount: c._count.articles,
  }));
}

/** สร้างหมวดหมู่ */
export async function createNewsCategory(
  tenantId: string,
  input: CreateNewsCategoryInput,
): Promise<NewsCategoryDto> {
  const created = await prisma.newsCategory.create({
    data: {
      tenantId,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      slug: input.slug,
      sortOrder: input.sortOrder,
    },
  });
  return {
    id: created.id,
    tenantId: created.tenantId,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    slug: created.slug,
    sortOrder: created.sortOrder,
  };
}

/** อัปเดตหมวดหมู่ */
export async function updateNewsCategory(
  tenantId: string,
  input: UpdateNewsCategoryInput,
): Promise<NewsCategoryDto> {
  const updated = await prisma.newsCategory.update({
    where: { id: input.id, tenantId },
    data: {
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      slug: input.slug,
      sortOrder: input.sortOrder,
    },
  });
  return {
    id: updated.id,
    tenantId: updated.tenantId,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    slug: updated.slug,
    sortOrder: updated.sortOrder,
  };
}

/** ลบหมวดหมู่ */
export async function deleteNewsCategory(tenantId: string, id: string): Promise<void> {
  await prisma.newsCategory.delete({
    where: { id, tenantId },
  });
}

/** ดึงรายการข่าวสำหรับ Admin (เห็นทุกสถานะ) */
export async function listAdminNewsArticles(
  tenantId: string,
  options?: { categoryId?: string; status?: string; search?: string },
): Promise<NewsArticleListItemDto[]> {
  const where: {
    tenantId: string;
    categoryId?: string;
    status?: string;
    OR?: Array<{ titleTh?: { contains: string; mode: "insensitive" }; titleEn?: { contains: string; mode: "insensitive" } }>;
  } = { tenantId };

  if (options?.categoryId) where.categoryId = options.categoryId;
  if (options?.status) where.status = options.status;
  if (options?.search) {
    where.OR = [
      { titleTh: { contains: options.search, mode: "insensitive" } },
      { titleEn: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const articles = await prisma.newsArticle.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { category: true },
  });

  return articles.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category?.nameTh ?? null,
    categoryNameEn: a.category?.nameEn ?? null,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    slug: a.slug,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    status: a.status,
    isPinned: a.isPinned,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

/** ดึงรายการข่าวสำหรับ Public Portal (เฉพาะ PUBLISHED & เผยแพร่แล้ว) */
export async function listPublicNewsArticles(
  tenantId: string,
  options?: { categorySlug?: string; limit?: number },
): Promise<NewsArticleListItemDto[]> {
  const now = new Date();
  const where: {
    tenantId: string;
    status: string;
    publishedAt: { lte: Date };
    category?: { slug: string };
  } = {
    tenantId,
    status: "PUBLISHED",
    publishedAt: { lte: now },
  };

  if (options?.categorySlug) {
    where.category = { slug: options.categorySlug };
  }

  const articles = await prisma.newsArticle.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    take: options?.limit ?? 20,
    include: { category: true },
  });

  return articles.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category?.nameTh ?? null,
    categoryNameEn: a.category?.nameEn ?? null,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    slug: a.slug,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    coverImageUrl: a.coverImageUrl,
    status: a.status,
    isPinned: a.isPinned,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

/** ดึงรายละเอียดข่าวเดี่ยวด้วย Slug (สำหรับ Public Portal) พร้อมเพิ่ม View count */
export async function getPublicNewsArticleBySlug(
  tenantId: string,
  slug: string,
): Promise<NewsArticleDetailDto | null> {
  const now = new Date();
  const article = await prisma.newsArticle.findFirst({
    where: {
      tenantId,
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: now },
    },
    include: { category: true },
  });

  if (!article) return null;

  // เพิ่มยอดเข้าชม (fire-and-forget)
  prisma.newsArticle
    .update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  return {
    id: article.id,
    tenantId: article.tenantId,
    categoryId: article.categoryId,
    categoryNameTh: article.category?.nameTh ?? null,
    categoryNameEn: article.category?.nameEn ?? null,
    titleTh: article.titleTh,
    titleEn: article.titleEn,
    slug: article.slug,
    summaryTh: article.summaryTh,
    summaryEn: article.summaryEn,
    contentTh: article.contentTh,
    contentEn: article.contentEn,
    coverImageUrl: article.coverImageUrl,
    attachmentUrls: (article.attachmentUrls as string[]) ?? [],
    status: article.status,
    isPinned: article.isPinned,
    viewCount: article.viewCount + 1,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

/** ดึงรายละเอียดข่าวเดี่ยวด้วย ID (สำหรับ Admin แก้ไข) */
export async function getAdminNewsArticleById(
  tenantId: string,
  id: string,
): Promise<NewsArticleDetailDto | null> {
  const article = await prisma.newsArticle.findFirst({
    where: { id, tenantId },
    include: { category: true },
  });

  if (!article) return null;

  return {
    id: article.id,
    tenantId: article.tenantId,
    categoryId: article.categoryId,
    categoryNameTh: article.category?.nameTh ?? null,
    categoryNameEn: article.category?.nameEn ?? null,
    titleTh: article.titleTh,
    titleEn: article.titleEn,
    slug: article.slug,
    summaryTh: article.summaryTh,
    summaryEn: article.summaryEn,
    contentTh: article.contentTh,
    contentEn: article.contentEn,
    coverImageUrl: article.coverImageUrl,
    attachmentUrls: (article.attachmentUrls as string[]) ?? [],
    status: article.status,
    isPinned: article.isPinned,
    viewCount: article.viewCount,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

/** จัดการ Slug ให้ถูกต้องและไม่ซ้ำกันใน Tenant */
async function resolveUniqueSlug(
  tenantId: string,
  baseSlug: string | null | undefined,
  titleFallback: string,
  existingId?: string,
): Promise<string> {
  let slug = (baseSlug || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  if (!slug) {
    slug = titleFallback
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  if (!slug || slug === "-") {
    slug = `news-${Date.now()}`;
  }

  let finalSlug = slug;
  let counter = 1;
  while (
    await prisma.newsArticle.findFirst({
      where: {
        tenantId,
        slug: finalSlug,
        ...(existingId ? { id: { not: existingId } } : {}),
      },
    })
  ) {
    counter++;
    finalSlug = `${slug}-${counter}`;
  }

  return finalSlug;
}

/** สร้างข่าวสาร */
export async function createNewsArticle(
  tenantId: string,
  userId: string,
  input: CreateNewsArticleInput,
): Promise<NewsArticleDetailDto> {
  const titleEn = input.titleEn?.trim() || input.titleTh;
  const contentEn = input.contentEn?.trim() || input.contentTh;
  const summaryTh = input.summaryTh?.trim() || null;
  const summaryEn = input.summaryEn?.trim() || summaryTh;
  const slug = await resolveUniqueSlug(tenantId, input.slug, titleEn);

  const created = await prisma.newsArticle.create({
    data: {
      tenantId,
      createdById: userId,
      categoryId: input.categoryId || null,
      titleTh: input.titleTh,
      titleEn,
      slug,
      summaryTh,
      summaryEn,
      contentTh: input.contentTh,
      contentEn,
      coverImageUrl: input.coverImageUrl || null,
      attachmentUrls: input.attachmentUrls ?? [],
      status: input.status,
      isPinned: input.isPinned,
      publishedAt: input.publishedAt
        ? new Date(input.publishedAt)
        : input.status === "PUBLISHED"
          ? new Date()
          : null,
    },
    include: { category: true },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    categoryId: created.categoryId,
    categoryNameTh: created.category?.nameTh ?? null,
    categoryNameEn: created.category?.nameEn ?? null,
    titleTh: created.titleTh,
    titleEn: created.titleEn,
    slug: created.slug,
    summaryTh: created.summaryTh,
    summaryEn: created.summaryEn,
    contentTh: created.contentTh,
    contentEn: created.contentEn,
    coverImageUrl: created.coverImageUrl,
    attachmentUrls: (created.attachmentUrls as string[]) ?? [],
    status: created.status,
    isPinned: created.isPinned,
    viewCount: created.viewCount,
    publishedAt: created.publishedAt?.toISOString() ?? null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

/** อัปเดตข่าวสาร */
export async function updateNewsArticle(
  tenantId: string,
  input: UpdateNewsArticleInput,
): Promise<NewsArticleDetailDto> {
  const titleEn = input.titleEn?.trim() || input.titleTh;
  const contentEn = input.contentEn?.trim() || input.contentTh;
  const summaryTh = input.summaryTh?.trim() || null;
  const summaryEn = input.summaryEn?.trim() || summaryTh;
  const slug = await resolveUniqueSlug(tenantId, input.slug, titleEn, input.id);

  const updated = await prisma.newsArticle.update({
    where: { id: input.id, tenantId },
    data: {
      categoryId: input.categoryId || null,
      titleTh: input.titleTh,
      titleEn,
      slug,
      summaryTh,
      summaryEn,
      contentTh: input.contentTh,
      contentEn,
      coverImageUrl: input.coverImageUrl || null,
      attachmentUrls: input.attachmentUrls ?? [],
      status: input.status,
      isPinned: input.isPinned,
      publishedAt: input.publishedAt
        ? new Date(input.publishedAt)
        : input.status === "PUBLISHED"
          ? new Date()
          : null,
    },
    include: { category: true },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    categoryId: updated.categoryId,
    categoryNameTh: updated.category?.nameTh ?? null,
    categoryNameEn: updated.category?.nameEn ?? null,
    titleTh: updated.titleTh,
    titleEn: updated.titleEn,
    slug: updated.slug,
    summaryTh: updated.summaryTh,
    summaryEn: updated.summaryEn,
    contentTh: updated.contentTh,
    contentEn: updated.contentEn,
    coverImageUrl: updated.coverImageUrl,
    attachmentUrls: (updated.attachmentUrls as string[]) ?? [],
    status: updated.status,
    isPinned: updated.isPinned,
    viewCount: updated.viewCount,
    publishedAt: updated.publishedAt?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

/** เปลี่ยนสถานะปักหมุด */
export async function togglePinNewsArticle(
  tenantId: string,
  id: string,
  isPinned: boolean,
): Promise<void> {
  await prisma.newsArticle.update({
    where: { id, tenantId },
    data: { isPinned },
  });
}

/** ลบข่าวสาร */
export async function deleteNewsArticle(tenantId: string, id: string): Promise<void> {
  await prisma.newsArticle.delete({
    where: { id, tenantId },
  });
}
