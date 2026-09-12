import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Building2,
  Share2,
  Navigation,
} from "lucide-react";
import { prisma } from "@/shared/lib/infra/prisma";
import type { TenantContactSettings } from "@/features/identity";

export default async function PublicContactPage() {
  const tenant = await prisma.tenant.findFirst();
  const brandTitle = tenant?.nameTh ?? "วิทยาลัยสงฆ์มหาสารคาม";
  const brandEn = tenant?.nameEn ?? "Mahasarakham Buddhist College";
  const settings = (tenant?.settings ?? {}) as { contact?: TenantContactSettings };
  const contact = settings.contact;

  const address =
    contact?.address?.trim() ||
    "79 หมู่ 1 ถนนพหลโยธิน ต.ลำไทร อ.วังน้อย จ.พระนครศรีอยุธยา 13170";
  const phone = contact?.phone?.trim() || "035-248-000";
  const email = contact?.email?.trim() || "contact@mcu.ac.th";
  const workingHours =
    contact?.workingHours?.trim() || "จันทร์ - ศุกร์: 08.30 - 16.30 น.";
  const mapUrl =
    contact?.mapUrl?.trim() ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const facebookUrl = contact?.facebookUrl?.trim();
  const lineId = contact?.lineId?.trim();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับหน้าหลัก
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              ติดต่อและแผนผังที่ตั้ง
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              ช่องทางการติดต่อ แผนที่ และเวลาให้บริการของ {brandTitle} ({brandEn})
            </p>
          </div>
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-xs hover:bg-primary/90 transition-colors w-fit"
            >
              <Navigation className="w-4 h-4" />
              <span>เปิด Google Maps นำทาง</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </a>
          )}
        </div>
      </div>

      {/* Main Grid: Contact Cards & Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Contact Cards (span 5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Address */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">ที่ตั้งหน่วยงาน</h2>
                <p className="text-xs text-muted-foreground">Campus Address</p>
              </div>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed pl-13">
              {address}
            </p>
            {mapUrl && (
              <div className="pl-13 pt-1">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>ดูพิกัดบนแผนที่</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Card: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-foreground">เบอร์โทรศัพท์</h2>
                  <p className="text-[11px] text-muted-foreground">Telephone</p>
                </div>
              </div>
              <div>
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors block"
                >
                  {phone}
                </a>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  กดเพื่อโทรออกทันที
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-foreground">อีเมลติดต่อ</h2>
                  <p className="text-[11px] text-muted-foreground">Email Address</p>
                </div>
              </div>
              <div className="overflow-hidden">
                <a
                  href={`mailto:${email}`}
                  className="text-xs font-semibold text-foreground hover:text-primary transition-colors truncate block"
                  title={email}
                >
                  {email}
                </a>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  ส่งข้อความประสานงาน
                </span>
              </div>
            </div>
          </div>

          {/* Card: Working Hours */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">วันและเวลาทำการ</h2>
                <p className="text-xs text-muted-foreground">Office Hours</p>
              </div>
            </div>
            <div className="pl-13 space-y-1">
              <p className="text-sm font-medium text-foreground">{workingHours}</p>
              <p className="text-xs text-muted-foreground">
                (ปิดทำการในวันเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์)
              </p>
            </div>
          </div>

          {/* Card: Online Social Channels (if available) */}
          {(facebookUrl || lineId) && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">ช่องทางออนไลน์</h2>
                  <p className="text-xs text-muted-foreground">Social & Online Media</p>
                </div>
              </div>
              <div className="pl-13 flex flex-wrap gap-2.5 pt-1">
                {facebookUrl && (
                  <a
                    href={
                      facebookUrl.startsWith("http")
                        ? facebookUrl
                        : `https://${facebookUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 hover:bg-blue-600/20 transition-colors"
                  >
                    <span>Facebook Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {lineId && (
                  <a
                    href={
                      lineId.startsWith("http")
                        ? lineId
                        : `https://line.me/R/ti/p/${lineId.replace("@", "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-600/20 hover:bg-emerald-600/20 transition-colors"
                  >
                    <span>LINE: {lineId}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map & Building Info (span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs flex flex-col h-full min-h-[460px]">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    แผนที่การเดินทางและที่ตั้งอาคาร
                  </h2>
                  <p className="text-xs text-muted-foreground">{brandTitle}</p>
                </div>
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>เปิดแอปแผนที่</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Map Frame / Visual Preview */}
            <div className="relative flex-1 bg-muted/40 flex flex-col items-center justify-center p-8 text-center min-h-[350px]">
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                  <MapPin className="w-8 h-8 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground">
                    {brandTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {address}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-xs hover:bg-primary/90 transition-all group"
                  >
                    <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>นำทางด้วย Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                  </a>
                </div>
              </div>

              {/* Decorative grid pattern in background */}
              <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
