import Link from "next/link";
import { ArrowLeft, FileDown, CheckCircle, ExternalLink } from "lucide-react";
import { prisma } from "@/shared/lib/infra/prisma";
import { listPublicCurriculums } from "@/features/curriculum/server";
import { getLocale } from "@/shared/lib/i18n/server";

export default async function PublicCurriculumPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const params = await searchParams;
  const tenant = await prisma.tenant.findFirst();
  const locale = await getLocale();

  if (!tenant) return null;

  const curriculums = await listPublicCurriculums(tenant.id, {
    degreeLevel: params.level,
  });

  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case "DOCTORAL":
        return "ระดับปริญญาเอก (Doctoral Degree)";
      case "MASTER":
        return "ระดับปริญญาโท (Master's Degree)";
      default:
        return "ระดับปริญญาตรี (Bachelor's Degree)";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับหน้าหลักคณะ
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          หลักสูตรการศึกษาที่เปิดสอน
        </h1>
        <p className="text-sm text-muted-foreground">
          หลักสูตรทันสมัย ออกแบบตามมาตรฐานผลลัพธ์การเรียนรู้ (Outcome-Based Education)
        </p>
      </div>

      {/* Degree Level Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {[
          { label: "ทุกระดับการศึกษา", value: "" },
          { label: "ระดับปริญญาตรี", value: "BACHELOR" },
          { label: "ระดับปริญญาโท", value: "MASTER" },
          { label: "ระดับปริญญาเอก", value: "DOCTORAL" },
        ].map((tab) => {
          const isActive = (params.level ?? "") === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value ? `/portal/curriculum?level=${tab.value}` : "/portal/curriculum"}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Curriculums Cards */}
      {curriculums.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
          ไม่พบข้อมูลหลักสูตรในระดับการศึกษานี้
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {curriculums.map((c) => (
            <div
              key={c.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/50 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-primary">
                    {getLevelLabel(c.degreeLevel)}
                  </span>
                  <h2 className="text-xl font-bold text-foreground">
                    {locale === "en" ? c.nameEn : c.nameTh}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono">
                    {locale === "en" ? c.degreeEn : c.degreeTh} (หลักสูตรปรับปรุง พ.ศ. {c.revisionYear})
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

              {c.descriptionTh && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {locale === "en" ? c.descriptionEn ?? c.descriptionTh : c.descriptionTh}
                </p>
              )}

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

              <div className="pt-2 flex items-center justify-between text-xs mt-auto">
                {c.syllabusFileUrl ? (
                  <a
                    href={c.syllabusFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    ดาวน์โหลดเล่ม มคอ.2 (PDF)
                  </a>
                ) : (
                  <span className="text-muted-foreground">ไม่มีเอกสารดาวน์โหลด</span>
                )}
                <a
                  href="/login"
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  สมัครเรียนออนไลน์
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
