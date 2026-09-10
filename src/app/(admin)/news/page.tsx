import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  NEWS_P,
  listAdminNewsArticles,
  listNewsCategories,
} from "@/features/news/server";
import { NewsAdminClient } from "./_components/news-admin-client";

export default async function NewsAdminPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const [articles, categories] = await Promise.all([
    listAdminNewsArticles(ctx.tenantId),
    listNewsCategories(ctx.tenantId),
  ]);

  return (
    <NewsAdminClient
      initialArticles={articles}
      categories={categories}
      canManage={hasPermission(ctx, NEWS_P.newsManage)}
      canPublish={hasPermission(ctx, NEWS_P.newsPublish)}
    />
  );
}
