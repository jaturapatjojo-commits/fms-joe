import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { prisma } from "@/shared/lib/infra/prisma";
import { listPublicStaffMembers, listDepartments } from "@/features/staff/server";
import { getLocale } from "@/shared/lib/i18n/server";

export default async function PublicStaffDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string }>;
}) {
  const params = await searchParams;
  const tenant = await prisma.tenant.findFirst();
  const locale = await getLocale();

  if (!tenant) return null;

  const [staffList, departments] = await Promise.all([
    listPublicStaffMembers(tenant.id, { departmentCode: params.dept }),
    listDepartments(tenant.id),
  ]);

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
          ทำเนียบคณาจารย์และบุคลากร
        </h1>
        <p className="text-sm text-muted-foreground">
          คณาจารย์ผู้ทรงคุณวุฒิ นักวิจัย และเจ้าหน้าที่ฝ่ายสนับสนุนการศึกษา
        </p>
      </div>

      {/* Department filter tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <Link
          href="/portal/staff"
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            !params.dept
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          ทั้งหมด
        </Link>
        {departments.map((d) => {
          const isActive = params.dept === d.code;
          return (
            <Link
              key={d.id}
              href={`/portal/staff?dept=${d.code}`}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "en" ? d.nameEn : d.nameTh}
            </Link>
          );
        })}
      </div>

      {/* Staff Grid */}
      {staffList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
          ยังไม่มีข้อมูลบุคลากรในกลุ่มนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((member) => (
            <div
              key={member.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all p-6 text-center items-center"
            >
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatarUrl}
                  alt={member.firstNameTh}
                  className="h-28 w-28 rounded-full object-cover border-2 border-primary/20 mb-4 shadow-xs"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-4">
                  {member.firstNameTh.charAt(0)}
                </div>
              )}

              <div className="space-y-1 mb-4">
                <h3 className="font-bold text-lg text-foreground">
                  {locale === "en"
                    ? `${member.prefixEn} ${member.firstNameEn} ${member.lastNameEn}`
                    : `${member.prefixTh} ${member.firstNameTh} ${member.lastNameTh}`}
                </h3>
                {member.adminPosition && (
                  <p className="text-xs font-semibold text-primary">
                    {member.adminPosition}
                  </p>
                )}
                {member.academicPosition && (
                  <p className="text-xs text-muted-foreground">
                    {member.academicPosition}
                  </p>
                )}
                {member.departmentNameTh && (
                  <span className="inline-block mt-2 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {locale === "en" ? member.departmentNameEn : member.departmentNameTh}
                  </span>
                )}
              </div>

              <div className="w-full pt-4 mt-auto border-t border-border/50 space-y-1.5 text-xs text-muted-foreground text-left">
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.roomNumber && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{member.roomNumber}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
