"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Globe, GraduationCap, AlertCircle, BookOpen, Layers, GitBranch } from "lucide-react";
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
import type { CurriculumDto, CurriculumMajorDto, EducationLevelDto } from "@/features/curriculum";
import { MajorManagementModal } from "./major-management-modal";
import {
  createCurriculumAction,
  updateCurriculumAction,
  deleteCurriculumAction,
  createEducationLevelAction,
  updateEducationLevelAction,
  deleteEducationLevelAction,
} from "@/features/curriculum/actions";


const STANDARD_COLORS: Record<string, string> = {
  BACHELOR: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  CERTIFICATE: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  HIGH_VOCATIONAL: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  VOCATIONAL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  MASTER: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  DOCTORAL: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  GRAD_DIPLOMA: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  SHORT_COURSE: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
};

interface Props {
  initialCurriculums: CurriculumDto[];
  initialEducationLevels: EducationLevelDto[];
  canManage: boolean;
}

export function CurriculumAdminClient({
  initialCurriculums,
  initialEducationLevels,
  canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"programs" | "levels">("programs");
  const [curriculums, setCurriculums] = useState<CurriculumDto[]>(initialCurriculums);
  const [educationLevels, setEducationLevels] = useState<EducationLevelDto[]>(initialEducationLevels);
  const [isPending, startTransition] = useTransition();

  // Curriculum Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CurriculumDto | null>(null);
  const [editingItem, setEditingItem] = useState<CurriculumDto | null>(null);
  const [selectedCurriculumForMajors, setSelectedCurriculumForMajors] = useState<CurriculumDto | null>(null);

  // Curriculum Form states
  const [code, setCode] = useState("");
  const [degreeLevel, setDegreeLevel] = useState<string>(
    initialEducationLevels[0]?.code ?? "BACHELOR",
  );
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
  const [careerPathsText, setCareerPathsText] = useState("");
  const [studyPlanJson, setStudyPlanJson] = useState("");
  const [syllabusFileUrl, setSyllabusFileUrl] = useState("");
  const [isOpenAdmission, setIsOpenAdmission] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Education Level Modal states
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<EducationLevelDto | null>(null);
  const [deleteConfirmLevel, setDeleteConfirmLevel] = useState<EducationLevelDto | null>(null);

  // Education Level Form states
  const [levelCode, setLevelCode] = useState("");
  const [levelNameTh, setLevelNameTh] = useState("");
  const [levelNameEn, setLevelNameEn] = useState("");
  const [levelSortOrder, setLevelSortOrder] = useState<number>(0);

  // --- Curriculum Handlers ---
  const openCreateDialog = () => {
    setEditingItem(null);
    setCode("");
    setDegreeLevel(educationLevels[0]?.code ?? "BACHELOR");
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
    setCareerPathsText("");
    setStudyPlanJson("");
    setSyllabusFileUrl("");
    setIsOpenAdmission(true);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditDialog = (item: CurriculumDto) => {
    setEditingItem(item);
    setCode(item.code);
    setDegreeLevel(item.degreeLevel);
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
    setCareerPathsText(item.careerPaths?.join("\n") ?? "");
    setStudyPlanJson(
      item.studyPlan && item.studyPlan.length > 0
        ? JSON.stringify(item.studyPlan, null, 2)
        : "",
    );
    setSyllabusFileUrl(item.syllabusFileUrl ?? "");
    setIsOpenAdmission(item.isOpenAdmission);
    setIsActive(item.isActive);
    setModalOpen(true);
  };

  const handleSaveCurriculum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!degreeLevel) {
      toast.error(locale === "en" ? "Please select degree level" : "กรุณาเลือกระดับการศึกษา");
      return;
    }

    startTransition(async () => {
      let parsedStudyPlan: unknown[] = [];
      if (studyPlanJson.trim()) {
        try {
          parsedStudyPlan = JSON.parse(studyPlanJson);
        } catch {
          toast.error(locale === "en" ? "Study Plan JSON format is invalid" : "รูปแบบ JSON ของแผนการศึกษาไม่ถูกต้อง");
          return;
        }
      }

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
        careerPaths: careerPathsText
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        studyPlan: parsedStudyPlan,
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
          setEducationLevels((prev) =>
            prev.map((l) =>
              l.code === res.data.degreeLevel
                ? { ...l, curriculumsCount: (l.curriculumsCount ?? 0) + 1 }
                : l,
            ),
          );
          setModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleDeleteCurriculum = () => {
    if (!deleteConfirmItem) return;
    startTransition(async () => {
      const res = await deleteCurriculumAction(deleteConfirmItem.id);
      if (res.ok) {
        toast.success(t("curriculum.deleteSuccess"));
        const deletedCode = deleteConfirmItem.degreeLevel;
        setCurriculums((prev) => prev.filter((c) => c.id !== deleteConfirmItem.id));
        setEducationLevels((prev) =>
          prev.map((l) =>
            l.code === deletedCode
              ? { ...l, curriculumsCount: Math.max(0, (l.curriculumsCount ?? 0) - 1) }
              : l,
          ),
        );
        setDeleteConfirmItem(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleMajorsUpdated = (curriculumId: string, updatedMajors: CurriculumMajorDto[]) => {
    setCurriculums((prev) =>
      prev.map((c) => (c.id === curriculumId ? { ...c, majors: updatedMajors } : c)),
    );
    setSelectedCurriculumForMajors((prev) =>
      prev && prev.id === curriculumId ? { ...prev, majors: updatedMajors } : prev,
    );
  };


  // --- Education Level Handlers ---
  const openCreateLevelDialog = () => {
    setEditingLevel(null);
    setLevelCode("");
    setLevelNameTh("");
    setLevelNameEn("");
    setLevelSortOrder(educationLevels.length + 1);
    setLevelModalOpen(true);
  };

  const openEditLevelDialog = (lvl: EducationLevelDto) => {
    setEditingLevel(lvl);
    setLevelCode(lvl.code);
    setLevelNameTh(lvl.nameTh);
    setLevelNameEn(lvl.nameEn);
    setLevelSortOrder(lvl.sortOrder);
    setLevelModalOpen(true);
  };

  const handleSaveLevel = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        code: levelCode.trim(),
        nameTh: levelNameTh.trim(),
        nameEn: levelNameEn.trim(),
        sortOrder: levelSortOrder,
      };

      if (editingLevel) {
        const res = await updateEducationLevelAction({ id: editingLevel.id, ...payload });
        if (res.ok) {
          toast.success(t("curriculum.level.saveSuccess"));
          const oldCode = editingLevel.code;
          const newCode = res.data.code;
          setEducationLevels((prev) =>
            prev.map((l) => (l.id === editingLevel.id ? { ...l, ...res.data } : l)),
          );
          if (oldCode !== newCode) {
            setCurriculums((prev) =>
              prev.map((c) => (c.degreeLevel === oldCode ? { ...c, degreeLevel: newCode } : c)),
            );
          }
          setLevelModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createEducationLevelAction(payload);
        if (res.ok) {
          toast.success(t("curriculum.level.saveSuccess"));
          setEducationLevels((prev) => [...prev, res.data].sort((a, b) => a.sortOrder - b.sortOrder));
          setLevelModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleDeleteLevel = () => {
    if (!deleteConfirmLevel) return;
    startTransition(async () => {
      const res = await deleteEducationLevelAction(deleteConfirmLevel.id);
      if (res.ok) {
        toast.success(t("curriculum.level.deleteSuccess"));
        setEducationLevels((prev) => prev.filter((l) => l.id !== deleteConfirmLevel.id));
        setDeleteConfirmLevel(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const getDegreeBadge = (code: string) => {
    const matched = educationLevels.find((l) => l.code === code);
    const label = matched
      ? locale === "en"
        ? matched.nameEn
        : matched.nameTh
      : code;
    const color =
      STANDARD_COLORS[code] ??
      "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300";
    return (
      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${color}`}>
        {label}
      </span>
    );
  };

  const curriculumColumns: DataTableColumn<CurriculumDto>[] = [
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
      key: "majors",
      header: t("curriculum.majors"),
      render: (row) => {
        const majorCount = row.majors?.length ?? 0;
        return (
          <div className="flex items-center gap-1.5">
            {majorCount > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedCurriculumForMajors(row)}
                className="inline-flex items-center gap-1 rounded-full bg-purple-100 hover:bg-purple-200 border border-purple-300 dark:bg-purple-950/70 dark:border-purple-800 dark:text-purple-300 text-purple-800 px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer"
                title="คลิกเพื่อจัดการสาขาวิชา"
              >
                <GitBranch className="h-3 w-3" />
                {majorCount} สาขาวิชา
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedCurriculumForMajors(row)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                title="คลิกเพื่อเพิ่มสาขาวิชา"
              >
                <Plus className="h-3 w-3" />
                เพิ่มสาขา
              </button>
            )}
          </div>
        );
      },
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

  const levelColumns: DataTableColumn<EducationLevelDto>[] = [
    {
      key: "sortOrder",
      header: t("curriculum.level.sortOrder"),
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.sortOrder}
        </span>
      ),
    },
    {
      key: "code",
      header: t("curriculum.level.code"),
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: t("curriculum.level.nameTh"),
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {getDegreeBadge(row.code)}
            <span className="font-medium text-foreground">{row.nameTh}</span>
          </div>
          <span className="text-xs text-muted-foreground">{row.nameEn}</span>
        </div>
      ),
    },
    {
      key: "count",
      header: t("curriculum.level.curriculumsCount"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.curriculumsCount ?? 0} หลักสูตร
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
          {canManage && activeTab === "programs" && (
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("curriculum.create")}
            </Button>
          )}
          {canManage && activeTab === "levels" && (
            <Button onClick={openCreateLevelDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("curriculum.level.create")}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("programs")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "programs"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          {t("curriculum.tab.programs")}
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
            {curriculums.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("levels")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "levels"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          {t("curriculum.tab.levels")}
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
            {educationLevels.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Curriculums Table */}
      {activeTab === "programs" && (
        <DataTable
          state={curriculums.length > 0 ? "data" : "empty"}
          columns={curriculumColumns}
          rows={curriculums}
          getRowId={(row) => row.id}
          headHeading={t("curriculum.tab.programs")}
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
                    <RowMenuItem
                      onSelect={() => setSelectedCurriculumForMajors(row)}
                      icon={<GitBranch className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                    >
                      {t("curriculum.major.manage")} ({row.majors?.length ?? 0})
                    </RowMenuItem>
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
      )}

      {/* Tab 2: Education Levels Table */}
      {activeTab === "levels" && (
        <DataTable
          state={educationLevels.length > 0 ? "data" : "empty"}
          columns={levelColumns}
          rows={educationLevels}
          getRowId={(row) => row.id}
          headHeading={t("curriculum.tab.levels")}
          headMeta={`${educationLevels.length} ระดับการศึกษา`}
          empty={{
            icon: <Layers aria-hidden="true" />,
            title: t("curriculum.level.empty"),
          }}
          error={{
            icon: <AlertCircle aria-hidden="true" />,
            title: t("common.error"),
          }}
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    <RowMenuItem onSelect={() => openEditLevelDialog(row)} icon={<Edit2 className="h-4 w-4" />}>
                      {t("curriculum.level.edit")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => setDeleteConfirmLevel(row)}
                      icon={<Trash2 className="h-4 w-4 text-destructive" />}
                      danger
                    >
                      {t("curriculum.level.delete")}
                    </RowMenuItem>
                  </>
                )
              : undefined
          }
        />
      )}

      {/* Modal เพิ่ม / แก้ไขหลักสูตร */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen}>
        <form onSubmit={handleSaveCurriculum}>
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
                  onChange={(e) => setDegreeLevel(e.target.value)}
                >
                  {educationLevels.map((lvl) => (
                    <option key={lvl.id} value={lvl.code}>
                      {locale === "en" ? lvl.nameEn : lvl.nameTh} ({lvl.code})
                    </option>
                  ))}
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

            <LiyonField
              label="อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา"
              hint="ระบุชื่ออาชีพบรรทัดละ 1 อาชีพ (เช่น นักวิชาการศาสนา, อนุศาสนาจารย์)"
            >
              <textarea
                rows={3}
                value={careerPathsText}
                onChange={(e) => setCareerPathsText(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="นักวิชาการศาสนา&#10;อนุศาสนาจารย์&#10;บุคลากรทางการศึกษา"
              />
            </LiyonField>

            <LiyonField
              label="แผนการศึกษาตลอดหลักสูตร (Study Plan JSON)"
              hint="ระบุแผนการเรียนรายปี/รายภาคการศึกษาในรูปแบบ JSON หรือเว้นว่างได้"
            >
              <textarea
                rows={4}
                value={studyPlanJson}
                onChange={(e) => setStudyPlanJson(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
                placeholder='[&#10;  { "year": 1, "semester": 1, "credits": 12, "courses": [...] }&#10;]'
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

      {/* Modal ยืนยันการลบหลักสูตร */}
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
          <Button variant="destructive" onClick={handleDeleteCurriculum} disabled={isPending}>
            {t("curriculum.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Modal เพิ่ม/แก้ไข ระดับการศึกษา */}
      <LiyonDialog open={levelModalOpen} onOpenChange={setLevelModalOpen}>
        <form onSubmit={handleSaveLevel}>
          <LiyonDialogHeader
            title={editingLevel ? t("curriculum.level.edit") : t("curriculum.level.create")}
            description={t("curriculum.level.subtitle")}
          />
          <LiyonDialogBody className="space-y-4">
            <LiyonField label={t("curriculum.level.code")}>
              <input
                type="text"
                required
                value={levelCode}
                onChange={(e) => setLevelCode(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                placeholder={t("curriculum.level.codePlaceholder")}
              />
            </LiyonField>

            <LiyonField label={t("curriculum.level.nameTh")}>
              <input
                type="text"
                required
                value={levelNameTh}
                onChange={(e) => setLevelNameTh(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="เช่น ระดับประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)"
              />
            </LiyonField>

            <LiyonField label={t("curriculum.level.nameEn")}>
              <input
                type="text"
                required
                value={levelNameEn}
                onChange={(e) => setLevelNameEn(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="เช่น High Vocational Certificate"
              />
            </LiyonField>

            <LiyonField label={t("curriculum.level.sortOrder")}>
              <input
                type="number"
                required
                value={levelSortOrder}
                onChange={(e) => setLevelSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </LiyonField>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLevelModalOpen(false)}
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

      {/* Modal ยืนยันการลบระดับการศึกษา */}
      <LiyonDialog open={!!deleteConfirmLevel} onOpenChange={() => setDeleteConfirmLevel(null)}>
        <LiyonDialogHeader
          title={t("curriculum.level.delete")}
          description={
            deleteConfirmLevel && (deleteConfirmLevel.curriculumsCount ?? 0) > 0
              ? `ไม่สามารถลบระดับการศึกษานี้ได้ เนื่องจากมีหลักสูตรจำนวน ${deleteConfirmLevel.curriculumsCount} รายการที่กำลังใช้งานอยู่ (กรุณาลบหรือเปลี่ยนระดับการศึกษาของหลักสูตรเหล่านั้นก่อน)`
              : t("curriculum.level.deleteConfirm")
          }
        />
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteConfirmLevel(null)}
            disabled={isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteLevel}
            disabled={isPending || (deleteConfirmLevel?.curriculumsCount ?? 0) > 0}
          >
            {t("curriculum.level.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Modal จัดการสาขาวิชา */}
      <MajorManagementModal
        open={Boolean(selectedCurriculumForMajors)}
        onOpenChange={(v) => !v && setSelectedCurriculumForMajors(null)}
        curriculum={selectedCurriculumForMajors}
        onMajorsUpdated={handleMajorsUpdated}
      />
    </div>
  );
}

