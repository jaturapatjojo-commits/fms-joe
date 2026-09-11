import Link from "next/link";
import { Calendar, Clock, MapPin, Users, ArrowLeft, Car, DoorOpen, ShieldCheck } from "lucide-react";
import { getLocale } from "@/shared/lib/i18n/server";
import { listResources, listPublicSchedule } from "@/features/reservations/server";
import { prisma } from "@/shared/lib/infra/prisma";

export const dynamic = "force-dynamic";

export default async function PortalReservationsPage() {
  const locale = await getLocale();

  // ดึง default tenant
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!tenant) {
    return <div className="p-8 text-center text-muted-foreground">ไม่พบข้อมูลหน่วยงาน</div>;
  }

  const [resources, schedule] = await Promise.all([
    listResources(tenant.id),
    listPublicSchedule(tenant.id),
  ]);

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
                Faculty Facility & Logistics Service
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {locale === "th" ? "ตารางการใช้บริการห้องประชุมและยานพาหนะ" : "Meeting Room & Vehicle Booking Schedule"}
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/90 max-w-2xl font-light">
                {locale === "th"
                  ? "ตรวจสอบคิวการใช้งานห้องประชุม สัมมนา และยานพาหนะส่วนกลางของคณะ"
                  : "Check availability and real-time public schedules for meeting rooms and faculty transport vehicles."}
              </p>
            </div>
            <Link
              href="/reservations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand font-semibold text-sm shadow-md hover:bg-white/95 transition-all shrink-0"
            >
              <ShieldCheck className="h-4 w-4 text-brand" />
              {locale === "th" ? "เข้าสู่ระบบเพื่อจอง" : "Log in to Book"}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Resource Gallery */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            {locale === "th" ? "ทรัพยากรห้องประชุมและยานพาหนะของคณะ" : "Faculty Resources"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((r) => (
              <div
                key={r.id}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {r.imageUrl ? (
                  <div className="h-44 w-full overflow-hidden bg-muted relative">
                    <img
                      src={r.imageUrl}
                      alt={locale === "th" ? r.nameTh : r.nameEn || r.nameTh}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                      {r.resourceType === "VEHICLE" ? (
                        <>
                          <Car className="h-3.5 w-3.5 text-amber-400" />
                          <span>ยานพาหนะ</span>
                        </>
                      ) : (
                        <>
                          <DoorOpen className="h-3.5 w-3.5 text-amber-400" />
                          <span>ห้องประชุม/เรียน</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-44 w-full bg-muted flex items-center justify-center text-muted-foreground">
                    {r.resourceType === "VEHICLE" ? (
                      <Car className="h-12 w-12 stroke-[1.5]" />
                    ) : (
                      <DoorOpen className="h-12 w-12 stroke-[1.5]" />
                    )}
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-base leading-snug">
                      {locale === "th" ? r.nameTh : r.nameEn || r.nameTh}
                    </h3>
                    {r.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{r.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>
                        ความจุ {r.capacity} {r.resourceType === "VEHICLE" ? "ที่นั่ง" : "คน"}
                      </span>
                    </div>
                    {r.details && (
                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2 bg-muted/40 p-2 rounded-lg border border-border/50">
                        {r.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Booking Schedule */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {locale === "th" ? "ตารางการจองที่ได้รับอนุมัติแล้ว" : "Confirmed Booking Schedule"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {locale === "th" ? "แสดงคิวที่ได้รับการอนุมัติเรียบร้อยแล้ว" : "Only approved requests shown"}
            </span>
          </div>

          {schedule.length === 0 ? (
            <div className="p-10 text-center bg-card rounded-2xl border border-dashed border-border text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto stroke-[1.2] mb-3 opacity-40" />
              <p className="font-medium text-sm">
                {locale === "th" ? "ยังไม่มีรายการจองที่อนุมัติในช่วงนี้" : "No approved bookings during this period"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "th" ? "ทุกห้องและยานพาหนะพร้อมเปิดรับคำขอจอง" : "All resources are currently available."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedule.map((res) => {
                const start = new Date(res.startTime);
                const end = new Date(res.endTime);
                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl border border-border bg-card flex items-start justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                          อนุมัติแล้ว
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {locale === "th" ? res.resourceNameTh : res.resourceNameEn || res.resourceNameTh}
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground text-sm leading-snug">
                        {res.title}
                      </h4>
                      {res.destination && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>ปลายทาง: {res.destination}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary justify-end">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {start.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground justify-end mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>
                          {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
