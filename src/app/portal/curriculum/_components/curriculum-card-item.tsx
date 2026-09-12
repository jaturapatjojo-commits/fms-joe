"use client";

import { useState } from "react";
import {
  FileDown,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
  GitBranch,
} from "lucide-react";
import type { CurriculumDto } from "@/features/curriculum";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";

interface StudyPlanSemester {
  year: number;
  semester: number;
  credits?: number;
  courses: Array<{
    code: string;
    name: string;
    credits: string | number;
  }>;
}

interface Props {
  curriculum: CurriculumDto;
  levelLabel: string;
  locale: string;
}

export function CurriculumCardItem({ curriculum: c, levelLabel, locale }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);

  const hasMajors = Boolean(c.majors && c.majors.length > 0);
  const [selectedMajorId, setSelectedMajorId] = useState<string | null>(
    hasMajors ? c.majors![0].id : null,
  );

  const activeMajor = hasMajors
    ? c.majors!.find((m) => m.id === selectedMajorId) ?? c.majors![0]
    : null;

  const currentDegree = activeMajor?.degreeTh
    ? locale === "en"
      ? activeMajor.degreeEn || activeMajor.degreeTh
      : activeMajor.degreeTh
    : locale === "en"
      ? c.degreeEn
      : c.degreeTh;

  const currentDescription = activeMajor?.descriptionTh
    ? locale === "en"
      ? activeMajor.descriptionEn ?? activeMajor.descriptionTh
      : activeMajor.descriptionTh
    : locale === "en"
      ? c.descriptionEn ?? c.descriptionTh
      : c.descriptionTh;

  const currentCareers =
    activeMajor?.careerPaths && activeMajor.careerPaths.length > 0
      ? activeMajor.careerPaths
      : (c.careerPaths ?? []);

  const activeStudyPlanRaw =
    activeMajor?.studyPlan && activeMajor.studyPlan.length > 0
      ? activeMajor.studyPlan
      : c.studyPlan;

  const studyPlan = (Array.isArray(activeStudyPlanRaw)
    ? activeStudyPlanRaw
    : []) as StudyPlanSemester[];
  const hasStudyPlan = studyPlan.length > 0;

  const currentSyllabusUrl = activeMajor?.syllabusFileUrl || c.syllabusFileUrl;

  return (
    <>
      <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/50 transition-all space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary">{levelLabel}</span>
              {hasMajors && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 text-[11px] font-semibold">
                  <GitBranch className="h-3 w-3" />
                  {c.majors!.length} สาขาวิชา
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {locale === "en" ? c.nameEn : c.nameTh}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {currentDegree} (หลักสูตรปรับปรุง พ.ศ. {c.revisionYear})
            </p>
          </div>
          {c.isOpenAdmission ? (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle className="h-3.5 w-3.5" />
              เปิดรับสมัคร
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              ปิดรับสมัคร
            </span>
          )}
        </div>

        {/* Major Selection Pills (if program has branches) */}
        {hasMajors && (
          <div className="rounded-xl border border-purple-200/70 bg-purple-50/50 dark:border-purple-900/50 dark:bg-purple-950/20 p-3 space-y-2">
            <span className="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              เลือกสาขาวิชาที่สนใจ:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {c.majors!.map((m) => {
                const isSelected = m.id === activeMajor?.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMajorId(m.id)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-background border border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    {locale === "en" ? m.nameEn : m.nameTh}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {currentDescription && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {currentDescription}
          </p>
        )}

        {/* Career Paths Badges */}
        {currentCareers && currentCareers.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-primary" />
              โอกาสทางอาชีพ {activeMajor ? `(${locale === "en" ? activeMajor.nameEn : activeMajor.nameTh})` : ""}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentCareers.slice(0, 4).map((cp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium"
                >
                  {cp}
                </span>
              ))}
              {currentCareers.length > 4 && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  +{currentCareers.length - 4} สายอาชีพ
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50 text-center text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground">หน่วยกิตรวม</span>
            <p className="font-bold text-foreground">{c.totalCredits} หน่วยกิต</p>
          </div>
          <div className="space-y-1 border-x border-border/50">
            <span className="text-muted-foreground">ระยะเวลาเรียน</span>
            <p className="font-bold text-foreground">{c.studyYears} ปี</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">ค่าธรรมเนียม</span>
            <p className="font-bold text-foreground truncate px-1">
              {c.tuitionFee || "ตามประกาศมหาวิทยาลัย"}
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs mt-auto">
          <div className="flex items-center gap-2">
            {hasStudyPlan && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDetailOpen(true)}
                className="h-8 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>ดูแผนการศึกษา ๔ ปี</span>
              </Button>
            )}

            {currentSyllabusUrl ? (
              <a
                href={currentSyllabusUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline px-2 py-1"
              >
                <FileDown className="h-3.5 w-3.5" />
                มคอ.๒ (PDF)
              </a>
            ) : null}
          </div>

          <a
            href="/login"
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            สมัครเรียนออนไลน์
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Full Detail & Study Plan Modal */}
      {hasStudyPlan && (
        <LiyonDialog open={detailOpen} onOpenChange={setDetailOpen}>
          <div className="space-y-0">
            <LiyonDialogHeader
              title={
                activeMajor
                  ? `${locale === "en" ? c.nameEn : c.nameTh} - ${locale === "en" ? activeMajor.nameEn : activeMajor.nameTh}`
                  : locale === "en" ? c.nameEn : c.nameTh
              }
              description={`${currentDegree} • หลักสูตรปรับปรุง พ.ศ. ${c.revisionYear}`}
            />
            <LiyonDialogBody className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
              {/* Branch Selector Inside Dialog */}
              {hasMajors && (
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-purple-600" />
                    สาขาวิชา:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.majors!.map((m) => {
                      const isSelected = m.id === activeMajor?.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMajorId(m.id)}
                          className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          }`}
                        >
                          {locale === "en" ? m.nameEn : m.nameTh}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Overview & Philosophy */}
              {currentDescription && (
                <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    ปรัชญาและจุดมุ่งหมายของหลักสูตร / สาขาวิชา
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentDescription}
                  </p>
                </div>
              )}

              {/* Career Paths */}
              {currentCareers && currentCareers.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentCareers.map((cp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{cp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4-Year Study Plan by Semesters */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  แผนการศึกษาตลอดหลักสูตร (๔ ปี ๘ ภาคการศึกษา)
                </h3>

                <div className="space-y-4">
                  {studyPlan.map((sem, sIdx) => (
                    <div
                      key={sIdx}
                      className="rounded-xl border border-border overflow-hidden bg-card"
                    >
                      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-b border-border text-xs">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-primary" />
                          ชั้นปีที่ {sem.year} ภาคการศึกษาที่ {sem.semester}
                        </span>
                        {sem.credits && (
                          <span className="font-semibold text-primary font-mono">
                            รวม {sem.credits} หน่วยกิต
                          </span>
                        )}
                      </div>

                      <div className="divide-y divide-border/60">
                        {sem.courses?.map((course, cIdx) => (
                          <div
                            key={cIdx}
                            className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-muted-foreground min-w-[70px]">
                                {course.code}
                              </span>
                              <span className="text-foreground">{course.name}</span>
                            </div>
                            <span className="font-mono font-semibold text-muted-foreground ml-2 shrink-0">
                              {course.credits} นก.
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </LiyonDialogBody>
            <LiyonDialogFooter>
              {currentSyllabusUrl && (
                <a
                  href={currentSyllabusUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mr-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <FileDown className="w-4 h-4" />
                  ดาวน์โหลด มคอ.๒ ฉบับสมบูรณ์ (PDF)
                </a>
              )}
              <Button type="button" onClick={() => setDetailOpen(false)}>
                ปิดหน้าต่าง
              </Button>
            </LiyonDialogFooter>
          </div>
        </LiyonDialog>
      )}
    </>
  );
}

