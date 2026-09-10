import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Eye, Calendar, Share2, Pin } from "lucide-react";
import { prisma } from "@/shared/lib/infra/prisma";
import { getPublicNewsArticleBySlug } from "@/features/news/server";
import { formatDate } from "@/shared/lib/format";
import { getLocale } from "@/shared/lib/i18n/server";

export default async function PublicNewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findFirst();
  const locale = await getLocale();

  if (!tenant) return notFound();

  const article = await getPublicNewsArticleBySlug(tenant.id, slug);
  if (!article) return notFound();

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Navigation */}
      <div>
        <Link
          href="/portal/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับหน้ารวมข่าวสาร
        </Link>
      </div>

      {/* Header Info */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {article.isPinned && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Pin className="h-3 w-3" />
              ข่าวปักหมุด
            </span>
          )}
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {locale === "en" ? article.categoryNameEn : article.categoryNameTh}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {locale === "en" ? article.titleEn : article.titleTh}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              เผยแพร่เมื่อ: {article.publishedAt ? formatDate(article.publishedAt, locale) : "-"}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              เข้าชม {article.viewCount} ครั้ง
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImageUrl && (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImageUrl}
            alt={article.titleTh}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-foreground leading-relaxed">
        {locale === "en" ? (
          <div className="whitespace-pre-line text-base">{article.contentEn}</div>
        ) : (
          <div className="whitespace-pre-line text-base">{article.contentTh}</div>
        )}
      </div>

      {/* Back button footer */}
      <div className="border-t border-border pt-8 flex justify-between items-center">
        <Link
          href="/portal/news"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้ารวมข่าวสาร
        </Link>
      </div>
    </article>
  );
}
