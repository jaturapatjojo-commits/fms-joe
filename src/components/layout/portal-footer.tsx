import Link from "next/link";
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  BookOpen,
  CalendarCheck,
  FileText,
  Users,
  Building2,
} from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/shared/lib/utils";

interface PortalFooterProps {
  brandTitle: string;
  brandEn?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  className?: string;
}

export function PortalFooter({
  brandTitle,
  brandEn,
  tagline = "มุ่งสู่ความเป็นเลิศทางวิชาการและการจัดการยุคดิจิทัล เพื่อการพัฒนาสังคมอย่างยั่งยืน",
  logoUrl,
  className,
}: PortalFooterProps) {
  const currentYear = new Date().getFullYear();
  const buddhistYear = currentYear + 543;

  return (
    <footer
      className={cn(
        "relative mt-24 border-t border-border/70 bg-card/60 dark:bg-card/40 backdrop-blur-md overflow-hidden",
        className
      )}
    >
      {/* Top ambient glow line matching Liyon style */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-24 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Brand & Identity (span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              href="/portal"
              className="inline-flex items-center gap-3 text-foreground group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-border/60 bg-background/80 shadow-xs group-hover:border-primary/50 transition-colors shrink-0">
                {logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logoUrl}
                    alt={brandTitle}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <GraduationCap className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-base md:text-lg text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
                  {brandTitle}
                </h2>
                {brandEn && (
                  <p className="text-xs text-muted-foreground font-medium">
                    {brandEn}
                  </p>
                )}
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pr-2">
              {tagline}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3 h-3" />
                ระบบบริการอัจฉริยะ VibeCore
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ระบบให้บริการปกติ
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links / Information Services (span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 tracking-wide">
              <BookOpen className="w-4 h-4 text-primary" />
              บริการข้อมูลและสารสนเทศ
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link
                  href="/portal/news"
                  className="inline-flex items-center gap-1.5 hover:text-primary hover:translate-x-1 transition-all duration-200"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  ข่าวสารและประกาศกิจกรรม
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/curriculum"
                  className="inline-flex items-center gap-1.5 hover:text-primary hover:translate-x-1 transition-all duration-200"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  หลักสูตรระดับปริญญาตรี-โท-เอก
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/staff"
                  className="inline-flex items-center gap-1.5 hover:text-primary hover:translate-x-1 transition-all duration-200"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  ทำเนียบคณาจารย์และบุคลากร
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/contact"
                  className="inline-flex items-center gap-1.5 hover:text-primary hover:translate-x-1 transition-all duration-200"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  แผนผังและที่ตั้งวิทยาลัย
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Online Systems (span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 tracking-wide">
              <Building2 className="w-4 h-4 text-primary" />
              ระบบงานออนไลน์
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link
                  href="/portal/reservations"
                  className="inline-flex items-center gap-1.5 hover:text-primary hover:translate-x-1 transition-all duration-200"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-muted-foreground/60" />
                  จองห้องและยานพาหนะ
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/documents"
                  className="inline-flex items-center gap-1.5 hover:text-primary hover:translate-x-1 transition-all duration-200"
                >
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/60" />
                  ระบบหนังสือและสารบรรณ
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 hover:text-primary hover:translate-x-1 transition-all duration-200"
                >
                  <Users className="w-3.5 h-3.5 text-muted-foreground/60" />
                  ระบบบริหารพัสดุครุภัณฑ์
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  เข้าสู่ระบบเจ้าหน้าที่
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information (span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 tracking-wide">
              <MapPin className="w-4 h-4 text-primary" />
              ติดต่อหน่วยงาน
            </h3>
            <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <span>
                  79 หมู่ 1 ถนนพหลโยธิน ต.ลำไทร อ.วังน้อย จ.พระนครศรีอยุธยา 13170
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <a
                  href="tel:035248000"
                  className="hover:text-primary transition-colors"
                >
                  035-248-000
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <a
                  href="mailto:contact@mcu.ac.th"
                  className="hover:text-primary transition-colors"
                >
                  contact@mcu.ac.th
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>จันทร์ - ศุกร์: 08.30 - 16.30 น.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider and Sub-footer */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
            <span>
              © {currentYear} ({buddhistYear}) {brandTitle}
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>ความปลอดภัยตามมาตรฐาน PDPA</span>
            </div>
            <LanguageSwitcher className="text-xs" />
          </div>
        </div>
      </div>
    </footer>
  );
}