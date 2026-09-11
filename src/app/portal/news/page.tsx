import Link from "next/link";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import { prisma } from "@/shared/lib/infra/prisma";
import { listPublicNewsArticles, listNewsCategories } from "@/features/news/server";
import { formatDate } from "@/shared/lib/format";
import { getLocale } from "@/shared/lib/i18n/server";

export default async function PublicNewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const tenant = await prisma.tenant.findFirst();
  const locale = await getLocale();

  if (!tenant) return null;

  const [articles, categories] = await Promise.all([
    listPublicNewsArticles(tenant.id, { categorySlug: params.category }),
    listNewsCategories(tenant.id),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-3">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับหน้าหลักคณะ
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          ข่าวสารและประชาสัมพันธ์คณะ
        </h1>
        <p className="text-sm text-muted-foreground">
          ติดตามข่าวสาร ประกาศ กิจกรรมทางวิชาการ และความเคลื่อนไหวภายในคณะ
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <Link
          href="/portal/news"
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            !params.category
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          ทั้งหมด
        </Link>
        {categories.map((c) => {
          const isActive = params.category === c.slug;
          return (
            <Link
              key={c.id}
              href={`/portal/news?category=${c.slug}`}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "en" ? c.nameEn : c.nameTh}
            </Link>
          );
        })}
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
          ไม่พบข่าวสารในหมวดหมู่นี้
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((item) => (
            <Link
              key={item.id}
              href={`/portal/news/${item.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs hover:border-primary/50 transition-all"
            >
              {item.coverImageUrl ? (
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.coverImageUrl}
                    alt={item.titleTh}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  ไม่มีรูปภาพหน้าปก
                </div>
              )}
              <div className="flex flex-col flex-1 p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {locale === "en" ? item.categoryNameEn : item.categoryNameTh}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.publishedAt ? formatDate(item.publishedAt, locale) : ""}
                  </span>
                </div>
                <h2 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {locale === "en" ? item.titleEn : item.titleTh}
                </h2>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {locale === "en" ? item.summaryEn : item.summaryTh}
                </p>
                <div className="pt-4 mt-auto flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {item.viewCount} ครั้ง
                  </span>
                  <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                    อ่านต่อ →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
