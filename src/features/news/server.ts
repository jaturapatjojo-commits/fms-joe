import "server-only";

export {
  listNewsCategories,
  listAdminNewsArticles,
  listPublicNewsArticles,
  getPublicNewsArticleBySlug,
  getAdminNewsArticleById,
  type NewsCategoryDto,
  type NewsArticleListItemDto,
  type NewsArticleDetailDto,
} from "./_internal/services";
export { NEWS_P, NEWS_PERMISSIONS } from "./permissions";
