"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Pin, PinOff, Eye, Globe, Newspaper, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { NewsArticleListItemDto, NewsCategoryDto } from "@/features/news";
import {
  createNewsArticleAction,
  updateNewsArticleAction,
  deleteNewsArticleAction,
  togglePinNewsArticleAction,
} from "@/features/news/actions";

interface Props {
  initialArticles: NewsArticleListItemDto[];
  categories: NewsCategoryDto[];
  canManage: boolean;
  canPublish: boolean;
}

export function NewsAdminClient({
  initialArticles,
  categories,
  canManage,
  canPublish,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [articles, setArticles] = useState<NewsArticleListItemDto[]>(initialArticles);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<NewsArticleListItemDto | null>(null);
  const [editingItem, setEditingItem] = useState<NewsArticleListItemDto | null>(null);

  // Form states
  const [titleTh, setTitleTh] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [summaryTh, setSummaryTh] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [contentTh, setContentTh] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [isPinned, setIsPinned] = useState(false);

  const openCreateDialog = () => {
    setEditingItem(null);
    setTitleTh("");
    setTitleEn("");
    setSlug("");
    setCategoryId("");
    setSummaryTh("");
    setSummaryEn("");
    setContentTh("");
    setContentEn("");
    setCoverImageUrl("");
    setStatus("DRAFT");
    setIsPinned(false);
    setModalOpen(true);
  };

  const openEditDialog = (item: NewsArticleListItemDto) => {
    setEditingItem(item);
    setTitleTh(item.titleTh);
    setTitleEn(item.titleEn);
    setSlug(item.slug);
    setCategoryId(item.categoryId ?? "");
    setSummaryTh(item.summaryTh ?? "");
    setSummaryEn(item.summaryEn ?? "");
    setContentTh(item.summaryTh ?? item.titleTh);
    setContentEn(item.summaryEn ?? item.titleEn);
    setCoverImageUrl(item.coverImageUrl ?? "");
    setStatus(item.status as "DRAFT" | "PUBLISHED" | "ARCHIVED");
    setIsPinned(item.isPinned);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        titleTh,
        titleEn,
        slug,
        categoryId: categoryId || null,
        summaryTh,
        summaryEn,
        contentTh: contentTh || titleTh,
        contentEn: contentEn || titleEn,
        coverImageUrl: coverImageUrl || null,
        attachmentUrls: [],
        status,
        isPinned,
      };

      if (editingItem) {
        const res = await updateNewsArticleAction({ id: editingItem.id, ...payload });
        if (res.ok) {
          toast.success(t("news.saveSuccess"));
          setArticles((prev) =>
            prev.map((a) => (a.id === editingItem.id ? { ...a, ...res.data } : a)),
          );
          setModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createNewsArticleAction(payload);
        if (res.ok) {
          toast.success(t("news.saveSuccess"));
          setArticles((prev) => [res.data, ...prev]);
          setModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleTogglePin = (item: NewsArticleListItemDto) => {
    startTransition(async () => {
      const newPinned = !item.isPinned;
      const res = await togglePinNewsArticleAction(item.id, newPinned);
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, isPinned: newPinned } : a)),
        );
        toast.success(newPinned ? t("news.pin") : t("news.unpin"));
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmItem) return;
    startTransition(async () => {
      const res = await deleteNewsArticleAction(deleteConfirmItem.id);
      if (res.ok) {
        toast.success(t("news.deleteSuccess"));
        setArticles((prev) => prev.filter((a) => a.id !== deleteConfirmItem.id));
        setDeleteConfirmItem(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const getStatusTone = (s: string) => {
    switch (s) {
      case "PUBLISHED":
        return "ok";
      case "ARCHIVED":
        return "off";
      default:
        return "warn";
    }
  };

  const columns: DataTableColumn<NewsArticleListItemDto>[] = [
    {
      key: "title",
      header: t("common.title"),
      render: (row) => (
        <div className="flex flex-col gap-1 max-w-md">
          <div className="flex items-center gap-2">
            {row.isPinned && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <Pin className="h-3 w-3" />
                {t("news.isPinned")}
              </span>
            )}
            <span className="font-medium text-foreground">
              {locale === "en" ? row.titleEn : row.titleTh}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">/{row.slug}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: t("news.category"),
      render: (row) => (
        <span className="text-sm">
          {locale === "en" ? row.categoryNameEn ?? "-" : row.categoryNameTh ?? "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: t("news.status"),
      render: (row) => (
        <StatusPill tone={getStatusTone(row.status)}>
          {t(`news.status.${row.status.toLowerCase()}`)}
        </StatusPill>
      ),
    },
    {
      key: "views",
      header: t("news.views"),
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          {row.viewCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "publishedAt",
      header: t("news.publishedAt"),
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.publishedAt ? formatDate(row.publishedAt, locale) : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("news.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("news.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/portal/news"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs hover:bg-accent"
          >
            <Globe className="h-4 w-4" />
            หน้าเว็บสาธารณะ
          </a>
          {canManage && (
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("news.create")}
            </Button>
          )}
        </div>
      </div>

      <DataTable
        state={articles.length > 0 ? "data" : "empty"}
        columns={columns}
        rows={articles}
        getRowId={(row) => row.id}
        headHeading={t("news.title")}
        headMeta={`${articles.length} รายการ`}
        empty={{
          icon: <Newspaper aria-hidden="true" />,
          title: t("news.empty"),
        }}
        error={{
          icon: <AlertCircle aria-hidden="true" />,
          title: t("common.error"),
        }}
        renderRowMenu={
          canManage
            ? (row) => (
                <>
                  <RowMenuItem
                    onSelect={() => handleTogglePin(row)}
                    icon={row.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  >
                    {row.isPinned ? t("news.unpin") : t("news.pin")}
                  </RowMenuItem>
                  <RowMenuItem onSelect={() => openEditDialog(row)} icon={<Edit2 className="h-4 w-4" />}>
                    {t("news.edit")}
                  </RowMenuItem>
                  <RowMenuItem
                    onSelect={() => setDeleteConfirmItem(row)}
                    icon={<Trash2 className="h-4 w-4 text-destructive" />}
                    danger
                  >
                    {t("news.delete")}
                  </RowMenuItem>
                </>
              )
            : undefined
        }
      />

      {/* Modal เขียน / แก้ไขข่าว */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen}>
        <form onSubmit={handleSave}>
          <LiyonDialogHeader
            title={editingItem ? t("news.edit") : t("news.create")}
            description={t("news.subtitle")}
          />
          <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("news.titleTh")}>
                <input
                  type="text"
                  required
                  value={titleTh}
                  onChange={(e) => {
                    setTitleTh(e.target.value);
                    if (!editingItem && !slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/\s+/g, "-"),
                      );
                    }
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="เช่น พิธีไหว้ครู ประจำปีการศึกษา 2569"
                />
              </LiyonField>

              <LiyonField label={t("news.titleEn")}>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Annual Teacher Homage Ceremony 2026"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("news.slug")} hint="ใช้สร้าง URL ภาษาอังกฤษ เช่น teacher-homage-2026">
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="annual-ceremony-2026"
                />
              </LiyonField>

              <LiyonField label={t("news.category")}>
                <LiyonSelect
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">{t("news.allCategories")}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {locale === "en" ? c.nameEn : c.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("news.status")}>
                <LiyonSelect
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
                >
                  <option value="DRAFT">{t("news.status.draft")}</option>
                  {canPublish && <option value="PUBLISHED">{t("news.status.published")}</option>}
                  <option value="ARCHIVED">{t("news.status.archived")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("news.coverImageUrl")}>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </LiyonField>
            </div>

            <LiyonField label={t("news.summaryTh")}>
              <textarea
                rows={2}
                value={summaryTh}
                onChange={(e) => setSummaryTh(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="สรุปเนื้อหาสั้นสำหรับแสดงบนการ์ดข่าว..."
              />
            </LiyonField>

            <LiyonField label={t("news.summaryEn")}>
              <textarea
                rows={2}
                value={summaryEn}
                onChange={(e) => setSummaryEn(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Brief summary for news card in English..."
              />
            </LiyonField>

            <LiyonField label={t("news.contentTh")}>
              <textarea
                rows={5}
                required
                value={contentTh}
                onChange={(e) => setContentTh(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-sans"
                placeholder="พิมพ์เนื้อหาข่าวฉบับเต็ม..."
              />
            </LiyonField>

            <LiyonField label={t("news.contentEn")}>
              <textarea
                rows={5}
                required
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-sans"
                placeholder="Full article content in English..."
              />
            </LiyonField>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t("common.save")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Modal ยืนยันการลบ */}
      <LiyonDialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <LiyonDialogHeader
          title={t("news.delete")}
          description={t("news.deleteConfirm")}
        />
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
            disabled={isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {t("news.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
