import Link from "next/link";
import { FileText, ArrowLeft, Download, ShieldCheck, Calendar } from "lucide-react";
import { getLocale } from "@/shared/lib/i18n/server";
import { listPublicDocuments } from "@/features/documents/server";
import { prisma } from "@/shared/lib/infra/prisma";

export const dynamic = "force-dynamic";

export default async function PortalDocumentsPage() {
  const locale = await getLocale();

  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!tenant) {
    return <div className="p-8 text-center text-muted-foreground">ไม่พบข้อมูลหน่วยงาน</div>;
  }

  const docs = await listPublicDocuments(tenant.id);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-deep via-brand to-brand-light text-on-brand py-12 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-white/85 hover:text-white text-sm font-medium mb-6 transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === "th" ? "กลับสู่หน้าหลักพอร์ทัล" : "Back to Portal"}
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-3">
                Faculty Official Documents & Circulars
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {locale === "th" ? "หนังสือเวียนและคำสั่งคณะ" : "Faculty Circulars & Official Orders"}
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/90 max-w-2xl font-light">
                {locale === "th"
                  ? "ศูนย์รวมหนังสือเวียน ประกาศ และคำสั่งอย่างเป็นทางการของคณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ"
                  : "Central repository of official announcements, faculty orders, and public circulars."}
              </p>
            </div>
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand font-semibold text-sm shadow-md hover:bg-white/95 transition-all shrink-0"
            >
              <ShieldCheck className="h-4 w-4 text-brand" />
              {locale === "th" ? "เข้าสู่ระบบสารบรรณ (เจ้าหน้าที่)" : "Staff E-Memo Login"}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {locale === "th" ? "รายการประกาศและหนังสือเวียนล่าสุด" : "Recent Published Orders"}
          </h2>
          <span className="text-xs text-muted-foreground">{docs.length} ฉบับ</span>
        </div>

        {docs.length === 0 ? (
          <div className="p-10 text-center bg-card rounded-2xl border border-dashed border-border text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto stroke-[1.2] mb-3 opacity-40" />
            <p className="font-medium text-sm">
              {locale === "th" ? "ยังไม่มีประกาศหรือคำสั่งสาธารณะในขณะนี้" : "No public documents currently available"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-primary/10 text-primary">
                      {doc.documentNo}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {doc.category === "CIRCULAR" ? "หนังสือเวียน" : "คำสั่งคณะ"}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-base leading-snug">
                    {doc.title}
                  </h3>
                  {doc.content && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {doc.content}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    ดาวน์โหลด PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
