import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/shared/lib/infra/prisma";
import { listPublicCurriculums, listEducationLevels } from "@/features/curriculum/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { CurriculumCardItem } from "./_components/curriculum-card-item";

export default async function PublicCurriculumPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const params = await searchParams;
  const tenant = await prisma.tenant.findFirst();
  const locale = await getLocale();

  if (!tenant) return null;

  const [curriculums, educationLevels] = await Promise.all([
    listPublicCurriculums(tenant.id, { degreeLevel: params.level }),
    listEducationLevels(tenant.id),
  ]);

  const getLevelLabel = (lvlCode: string) => {
    const matched = educationLevels.find((l) => l.code === lvlCode);
    if (matched) {
      return locale === "en" ? matched.nameEn : matched.nameTh;
    }
    return lvlCode;
  };

  const tabs = [
    { label: locale === "en" ? "All Levels" : "ทุกระดับการศึกษา", value: "" },
    ...educationLevels.map((lvl) => ({
      label: locale === "en" ? lvl.nameEn : lvl.nameTh,
      value: lvl.code,
    })),
  ];

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
        {tabs.map((tab) => {
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
            <CurriculumCardItem
              key={c.id}
              curriculum={c}
              levelLabel={getLevelLabel(c.degreeLevel)}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
