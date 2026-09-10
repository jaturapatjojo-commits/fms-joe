"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Globe, GraduationCap, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
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
import type { CurriculumDto } from "@/features/curriculum";
import {
  createCurriculumAction,
  updateCurriculumAction,
  deleteCurriculumAction,
} from "@/features/curriculum/actions";

interface Props {
  initialCurriculums: CurriculumDto[];
  canManage: boolean;
}

export function CurriculumAdminClient({
  initialCurriculums,
  canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [curriculums, setCurriculums] = useState<CurriculumDto[]>(initialCurriculums);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CurriculumDto | null>(null);
  const [editingItem, setEditingItem] = useState<CurriculumDto | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [degreeLevel, setDegreeLevel] = useState<"BACHELOR" | "MASTER" | "DOCTORAL">("BACHELOR");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [degreeTh, setDegreeTh] = useState("");
  const [degreeEn, setDegreeEn] = useState("");
  const [revisionYear, setRevisionYear] = useState<number>(2569);
  const [totalCredits, setTotalCredits] = useState<number>(120);
  const [studyYears, setStudyYears] = useState<number>(4);
  const [tuitionFee, setTuitionFee] = useState("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [syllabusFileUrl, setSyllabusFileUrl] = useState("");
  const [isOpenAdmission, setIsOpenAdmission] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const openCreateDialog = () => {
    setEditingItem(null);
    setCode("");
    setDegreeLevel("BACHELOR");
    setNameTh("");
    setNameEn("");
    setDegreeTh("");
    setDegreeEn("");
    setRevisionYear(2569);
    setTotalCredits(120);
    setStudyYears(4);
    setTuitionFee("");
    setDescriptionTh("");
    setDescriptionEn("");
    setSyllabusFileUrl("");
    setIsOpenAdmission(true);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditDialog = (item: CurriculumDto) => {
    setEditingItem(item);
    setCode(item.code);
    setDegreeLevel(item.degreeLevel as any);
    setNameTh(item.nameTh);
    setNameEn(item.nameEn);
    setDegreeTh(item.degreeTh);
    setDegreeEn(item.degreeEn);
    setRevisionYear(item.revisionYear);
    setTotalCredits(item.totalCredits);
    setStudyYears(item.studyYears);
    setTuitionFee(item.tuitionFee ?? "");
    setDescriptionTh(item.descriptionTh ?? "");
    setDescriptionEn(item.descriptionEn ?? "");
    setSyllabusFileUrl(item.syllabusFileUrl ?? "");
    setIsOpenAdmission(item.isOpenAdmission);
    setIsActive(item.isActive);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        code,
        degreeLevel,
        nameTh,
        nameEn,
        degreeTh,
        degreeEn,
        revisionYear,
        totalCredits,
        studyYears,
        tuitionFee: tuitionFee || null,
        descriptionTh: descriptionTh || null,
        descriptionEn: descriptionEn || null,
        careerPaths: [],
        studyPlan: [],
        syllabusFileUrl: syllabusFileUrl || null,
        isOpenAdmission,
        isActive,
      };

      if (editingItem) {
        const res = await updateCurriculumAction({ id: editingItem.id, ...payload });
        if (res.ok) {
          toast.success(t("curriculum.saveSuccess"));
          setCurriculums((prev) =>
            prev.map((c) => (c.id === editingItem.id ? { ...c, ...res.data } : c)),
          );
          setModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createCurriculumAction(payload);
        if (res.ok) {
          toast.success(t("curriculum.saveSuccess"));
          setCurriculums((prev) => [...prev, res.data]);
          setModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmItem) return;
    startTransition(async () => {
      const res = await deleteCurriculumAction(deleteConfirmItem.id);
      if (res.ok) {
        toast.success(t("curriculum.deleteSuccess"));
        setCurriculums((prev) => prev.filter((c) => c.id !== deleteConfirmItem.id));
        setDeleteConfirmItem(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const getDegreeBadge = (level: string) => {
    switch (level) {
      case "DOCTORAL":
        return <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300">ปริญญาเอก</span>;
      case "MASTER":
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">ปริญญาโท</span>;
      default:
        return <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">ปริญญาตรี</span>;
    }
  };

  const columns: DataTableColumn<CurriculumDto>[] = [
    {
      key: "code",
      header: t("curriculum.code"),
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.code} ({row.revisionYear})
        </span>
      ),
    },
    {
      key: "name",
      header: t("curriculum.nameTh"),
      render: (row) => (
        <div className="flex flex-col gap-1 max-w-md">
          <div className="flex items-center gap-2">
            {getDegreeBadge(row.degreeLevel)}
            <span className="font-medium text-foreground">
              {locale === "en" ? row.nameEn : row.nameTh}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {locale === "en" ? row.degreeEn : row.degreeTh}
          </span>
        </div>
      ),
    },
    {
      key: "credits",
      header: "หน่วยกิต/ระยะเวลา",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.totalCredits} หน่วยกิต ({row.studyYears} ปี)
        </span>
      ),
    },
    {
      key: "admission",
      header: t("curriculum.admissionStatus"),
      render: (row) => (
        <StatusPill tone={row.isOpenAdmission ? "ok" : "off"}>
          {row.isOpenAdmission ? t("curriculum.admission.open") : t("curriculum.admission.closed")}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("curriculum.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("curriculum.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/portal/curriculum"
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
              {t("curriculum.create")}
            </Button>
          )}
        </div>
      </div>

      <DataTable
        state={curriculums.length > 0 ? "data" : "empty"}
        columns={columns}
        rows={curriculums}
        getRowId={(row) => row.id}
        headHeading={t("curriculum.title")}
        headMeta={`${curriculums.length} หลักสูตร`}
        empty={{
          icon: <GraduationCap aria-hidden="true" />,
          title: t("curriculum.empty"),
        }}
        error={{
          icon: <AlertCircle aria-hidden="true" />,
          title: t("common.error"),
        }}
        renderRowMenu={
          canManage
            ? (row) => (
                <>
                  <RowMenuItem onSelect={() => openEditDialog(row)} icon={<Edit2 className="h-4 w-4" />}>
                    {t("curriculum.edit")}
                  </RowMenuItem>
                  <RowMenuItem
                    onSelect={() => setDeleteConfirmItem(row)}
                    icon={<Trash2 className="h-4 w-4 text-destructive" />}
                    danger
                  >
                    {t("curriculum.delete")}
                  </RowMenuItem>
                </>
              )
            : undefined
        }
      />

      {/* Modal เพิ่ม / แก้ไขหลักสูตร */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen}>
        <form onSubmit={handleSave}>
          <LiyonDialogHeader
            title={editingItem ? t("curriculum.edit") : t("curriculum.create")}
            description={t("curriculum.subtitle")}
          />
          <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LiyonField label={t("curriculum.code")}>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="เช่น IT-2569"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.degreeLevel")}>
                <LiyonSelect
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value as any)}
                >
                  <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
                  <option value="MASTER">{t("curriculum.level.master")}</option>
                  <option value="DOCTORAL">{t("curriculum.level.doctoral")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("curriculum.revisionYear")}>
                <input
                  type="number"
                  required
                  value={revisionYear}
                  onChange={(e) => setRevisionYear(parseInt(e.target.value, 10) || 2569)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.nameTh")}>
                <input
                  type="text"
                  required
                  value={nameTh}
                  onChange={(e) => setNameTh(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศ"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.nameEn")}>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Bachelor of Science in Information Technology"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.degreeTh")}>
                <input
                  type="text"
                  required
                  value={degreeTh}
                  onChange={(e) => setDegreeTh(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="วท.บ. (เทคโนโลยีสารสนเทศ)"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.degreeEn")}>
                <input
                  type="text"
                  required
                  value={degreeEn}
                  onChange={(e) => setDegreeEn(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="B.Sc. (Information Technology)"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LiyonField label={t("curriculum.totalCredits")}>
                <input
                  type="number"
                  required
                  value={totalCredits}
                  onChange={(e) => setTotalCredits(parseInt(e.target.value, 10) || 120)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.studyYears")}>
                <input
                  type="number"
                  required
                  value={studyYears}
                  onChange={(e) => setStudyYears(parseInt(e.target.value, 10) || 4)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.tuitionFee")}>
                <input
                  type="text"
                  value={tuitionFee}
                  onChange={(e) => setTuitionFee(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="เช่น 18,000 บาท/ภาคการศึกษา"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("curriculum.syllabusFileUrl")} hint="ลิงก์ไฟล์ PDF มคอ.2 สำหรับดาวน์โหลด">
              <input
                type="url"
                value={syllabusFileUrl}
                onChange={(e) => setSyllabusFileUrl(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="https://.../mko2-it.pdf"
              />
            </LiyonField>

            <LiyonField label="คำอธิบายหลักสูตร (ไทย)">
              <textarea
                rows={3}
                value={descriptionTh}
                onChange={(e) => setDescriptionTh(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="สรุปจุดเด่นและแนวทางการศึกษาของหลักสูตร..."
              />
            </LiyonField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.admissionStatus")}>
                <LiyonSelect
                  value={isOpenAdmission ? "true" : "false"}
                  onChange={(e) => setIsOpenAdmission(e.target.value === "true")}
                >
                  <option value="true">{t("curriculum.admission.open")}</option>
                  <option value="false">{t("curriculum.admission.closed")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label="สถานะการเปิดสอน">
                <LiyonSelect
                  value={isActive ? "true" : "false"}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                >
                  <option value="true">เปิดสอนตามปกติ</option>
                  <option value="false">ระงับการเปิดสอน</option>
                </LiyonSelect>
              </LiyonField>
            </div>
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
          title={t("curriculum.delete")}
          description={t("curriculum.deleteConfirm")}
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
            {t("curriculum.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
