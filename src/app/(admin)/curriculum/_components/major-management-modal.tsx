"use client";

import { useState, useTransition } from "react";

import { Plus, Edit2, Trash2, GitBranch, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { CurriculumDto, CurriculumMajorDto } from "@/features/curriculum";
import {
  createCurriculumMajorAction,
  updateCurriculumMajorAction,
  deleteCurriculumMajorAction,
} from "@/features/curriculum/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curriculum: CurriculumDto | null;
  onMajorsUpdated: (curriculumId: string, updatedMajors: CurriculumMajorDto[]) => void;
}

export function MajorManagementModal({
  open,
  onOpenChange,
  curriculum,
  onMajorsUpdated,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const majors = curriculum?.majors ?? [];
  const [isPending, startTransition] = useTransition();

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<CurriculumMajorDto | null>(null);
  const [deleteConfirmMajor, setDeleteConfirmMajor] = useState<CurriculumMajorDto | null>(null);

  const [code, setCode] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [degreeTh, setDegreeTh] = useState("");
  const [degreeEn, setDegreeEn] = useState("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [careerPathsText, setCareerPathsText] = useState("");
  const [studyPlanJson, setStudyPlanJson] = useState("");
  const [syllabusFileUrl, setSyllabusFileUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);



  const openCreateForm = () => {
    setEditingMajor(null);
    setCode("");
    setNameTh("");
    setNameEn("");
    setDegreeTh(curriculum?.degreeTh ?? "");
    setDegreeEn(curriculum?.degreeEn ?? "");
    setDescriptionTh("");
    setDescriptionEn("");
    setCareerPathsText("");
    setStudyPlanJson("");
    setSyllabusFileUrl("");
    setSortOrder(majors.length + 1);
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEditForm = (m: CurriculumMajorDto) => {
    setEditingMajor(m);
    setCode(m.code ?? "");
    setNameTh(m.nameTh);
    setNameEn(m.nameEn);
    setDegreeTh(m.degreeTh ?? "");
    setDegreeEn(m.degreeEn ?? "");
    setDescriptionTh(m.descriptionTh ?? "");
    setDescriptionEn(m.descriptionEn ?? "");
    setCareerPathsText(m.careerPaths?.join("\n") ?? "");
    setStudyPlanJson(
      m.studyPlan && m.studyPlan.length > 0
        ? JSON.stringify(m.studyPlan, null, 2)
        : "",
    );
    setSyllabusFileUrl(m.syllabusFileUrl ?? "");
    setSortOrder(m.sortOrder);
    setIsActive(m.isActive);
    setIsFormOpen(true);
  };

  const handleSaveMajor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculum) return;

    startTransition(async () => {
      let parsedStudyPlan: unknown[] = [];
      if (studyPlanJson.trim()) {
        try {
          parsedStudyPlan = JSON.parse(studyPlanJson);
        } catch {
          toast.error(
            locale === "en"
              ? "Study Plan JSON format is invalid"
              : "รูปแบบ JSON ของแผนการศึกษาไม่ถูกต้อง",
          );
          return;
        }
      }

      const payload = {
        curriculumId: curriculum.id,
        code: code.trim() || null,
        nameTh: nameTh.trim(),
        nameEn: nameEn.trim(),
        degreeTh: degreeTh.trim() || null,
        degreeEn: degreeEn.trim() || null,
        descriptionTh: descriptionTh.trim() || null,
        descriptionEn: descriptionEn.trim() || null,
        careerPaths: careerPathsText
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        studyPlan: parsedStudyPlan,
        syllabusFileUrl: syllabusFileUrl.trim() || null,
        sortOrder,
        isActive,
      };

      if (editingMajor) {
        const res = await updateCurriculumMajorAction({
          id: editingMajor.id,
          ...payload,
        });
        if (res.ok) {
          toast.success(t("curriculum.major.saveSuccess"));
          const updatedList = majors.map((m) =>
            m.id === editingMajor.id ? res.data : m,
          );
          onMajorsUpdated(curriculum.id, updatedList);
          setIsFormOpen(false);
          setEditingMajor(null);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createCurriculumMajorAction(payload);
        if (res.ok) {
          toast.success(t("curriculum.major.saveSuccess"));
          const updatedList = [...majors, res.data].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          );
          onMajorsUpdated(curriculum.id, updatedList);
          setIsFormOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleDeleteMajor = () => {
    if (!curriculum || !deleteConfirmMajor) return;
    startTransition(async () => {
      const res = await deleteCurriculumMajorAction(deleteConfirmMajor.id);
      if (res.ok) {
        toast.success(t("curriculum.major.deleteSuccess"));
        const updatedList = majors.filter((m) => m.id !== deleteConfirmMajor.id);
        onMajorsUpdated(curriculum.id, updatedList);
        setDeleteConfirmMajor(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };


  if (!curriculum) return null;

  return (
    <>
      <LiyonDialog open={open} onOpenChange={onOpenChange}>
        <div className="space-y-0 max-w-4xl w-full">
          <LiyonDialogHeader
            title={t("curriculum.major.title")}
            description={`หลักสูตร: ${curriculum.nameTh} (${curriculum.code})`}
          />

          <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-3 py-1 text-xs font-semibold">
                  <GitBranch className="h-3.5 w-3.5" />
                  {majors.length} สาขาวิชา
                </span>
                <span className="text-xs text-muted-foreground">
                  (หากไม่มีการเพิ่มสาขาวิชา จะแสดงเป็นหลักสูตรเดี่ยวทั่วไป)
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={openCreateForm}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                {t("curriculum.major.create")}
              </Button>
            </div>

            {/* Majors List Table */}
            {majors.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
                <GitBranch className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="font-semibold text-foreground text-sm">
                  {t("curriculum.major.empty")}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                  หากหลักสูตรนี้มีหลายสาขาวิชา (เช่น สาขาวิชาพระพุทธศาสนา,
                  สาขาวิชาปรัชญา) ท่านสามารถเพิ่มเพื่อแยกแผนการศึกษาและข้อมูลอาชีพเฉพาะสาขาได้
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openCreateForm}
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  {t("curriculum.major.create")}
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3">ชื่อสาขาวิชา</th>
                      <th className="py-2.5 px-3">ชื่อปริญญาเฉพาะสาขา</th>
                      <th className="py-2.5 px-3 text-center">อาชีพรองรับ</th>
                      <th className="py-2.5 px-3 text-center">แผนการศึกษา</th>
                      <th className="py-2.5 px-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-card">
                    {majors.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-muted-foreground">
                          {m.sortOrder}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-sm">
                              {m.nameTh}
                            </span>
                            <span className="text-muted-foreground">
                              {m.nameEn}
                            </span>
                            {m.code && (
                              <span className="font-mono text-[11px] text-muted-foreground">
                                รหัส: {m.code}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="text-foreground">
                              {m.degreeTh || "-"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {m.degreeEn || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                            {m.careerPaths?.length ?? 0} อาชีพ
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {m.studyPlan && m.studyPlan.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              มีโครงสร้าง
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              (ใช้ของหลักสูตรหลัก)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditForm(m)}
                              className="h-7 w-7 p-0"
                              title={t("curriculum.major.edit")}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmMajor(m)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              title={t("curriculum.major.delete")}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ปิดหน้าต่าง
            </Button>
          </LiyonDialogFooter>
        </div>
      </LiyonDialog>

      {/* Major Add/Edit Form Dialog */}
      <LiyonDialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <form onSubmit={handleSaveMajor} className="space-y-0 max-w-2xl w-full">
          <LiyonDialogHeader
            title={
              editingMajor
                ? t("curriculum.major.edit")
                : t("curriculum.major.create")
            }
            description={`สาขาวิชาภายใต้: ${curriculum.nameTh}`}
          />
          <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <LiyonField label={t("curriculum.major.nameTh")}>
                  <input
                    type="text"
                    required
                    value={nameTh}
                    onChange={(e) => setNameTh(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="เช่น สาขาวิชาพระพุทธศาสนา"
                  />
                </LiyonField>
              </div>
              <div>
                <LiyonField label={t("curriculum.major.code")}>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                    placeholder="เช่น BUD-01"
                  />
                </LiyonField>
              </div>
            </div>

            <LiyonField label={t("curriculum.major.nameEn")}>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="เช่น Buddhism"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.major.degreeTh")}>
                <input
                  type="text"
                  value={degreeTh}
                  onChange={(e) => setDegreeTh(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="เช่น พุทธศาสตรบัณฑิต (พระพุทธศาสนา)"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.major.degreeEn")}>
                <input
                  type="text"
                  value={degreeEn}
                  onChange={(e) => setDegreeEn(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="เช่น Bachelor of Arts (Buddhism)"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("curriculum.major.descriptionTh")}>
              <textarea
                rows={2}
                value={descriptionTh}
                onChange={(e) => setDescriptionTh(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
                placeholder="สรุปจุดเด่นหรือวัตถุประสงค์เฉพาะของสาขาวิชานี้..."
              />
            </LiyonField>

            <LiyonField label={t("curriculum.major.careerPaths")}>
              <textarea
                rows={4}
                value={careerPathsText}
                onChange={(e) => setCareerPathsText(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
                placeholder="พระธรรมทูตทั้งในประเทศและต่างประเทศ&#10;ครูสอนวิชาพระพุทธศาสนาและจริยธรรมในสถานศึกษา&#10;นักวิชาการทางพระพุทธศาสนา"
              />
            </LiyonField>

            <LiyonField label="โครงสร้างแผนการศึกษา (JSON - หากแตกต่างจากหลักสูตรหลัก)">
              <textarea
                rows={3}
                value={studyPlanJson}
                onChange={(e) => setStudyPlanJson(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
                placeholder='[{"year": 1, "semester": 1, "credits": 12, "courses": [...]}]'
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label="ลิงก์ มคอ.2 ประจำสาขา (ถ้ามี)">
                <input
                  type="url"
                  value={syllabusFileUrl}
                  onChange={(e) => setSyllabusFileUrl(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="https://... /tqf2-major.pdf"
                />
              </LiyonField>

              <LiyonField label="ลำดับการแสดงผล">
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "บันทึกสาขาวิชา"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Delete Confirmation Modal */}
      <LiyonDialog
        open={Boolean(deleteConfirmMajor)}
        onOpenChange={(v) => !v && setDeleteConfirmMajor(null)}
      >
        <div className="space-y-4">
          <LiyonDialogHeader
            title={t("curriculum.major.delete")}
            description={t("curriculum.major.deleteConfirm")}
          />
          {deleteConfirmMajor && (
            <p className="text-sm font-medium text-foreground px-1">
              ต้องการลบสาขาวิชา:{" "}
              <span className="text-destructive font-bold">
                {deleteConfirmMajor.nameTh}
              </span>{" "}
              หรือไม่?
            </p>
          )}
          <LiyonDialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setDeleteConfirmMajor(null)}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={isPending}
              onClick={handleDeleteMajor}
            >
              {isPending ? "กำลังลบ..." : "ยืนยันการลบ"}
            </Button>
          </LiyonDialogFooter>
        </div>
      </LiyonDialog>
    </>
  );
}
