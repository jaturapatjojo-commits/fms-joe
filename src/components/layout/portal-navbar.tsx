"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/shared/lib/utils";

interface PortalNavbarProps {
  brandName: string;
  brandTagline?: string;
  logoUrl?: string | null;
  className?: string;
}

export function PortalNavbar({
  brandName,
  brandTagline = "ระบบบริหารจัดการองค์กร",
  logoUrl,
  className,
}: PortalNavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className={cn("adm-head border-b border-border/40 sticky top-0 z-50 px-4 md:px-8", className)}>
      {/* Brand logo & name matching AdminShell .brand-blk */}
      <Link className="brand-blk !w-auto pr-4 hover:opacity-90 transition-opacity" href="/portal">
        <i className={cn(logoUrl && "bg-transparent border border-white/10 overflow-hidden")}>
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoUrl}
              alt={brandName}
              className="w-full h-full object-contain p-0.5 rounded-sm"
            />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
            </svg>
          )}
        </i>
        <div className="t">
          <b>{brandName}</b>
          {brandTagline && <span>{brandTagline}</span>}
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 ml-4 text-sm font-medium text-muted-foreground">
        <Link href="/portal" className="hover:text-foreground transition-colors">
          หน้าหลัก
        </Link>
        <Link href="/portal/news" className="hover:text-foreground transition-colors">
          ข่าวสาร
        </Link>
        <Link href="/portal/curriculum" className="hover:text-foreground transition-colors">
          หลักสูตร
        </Link>
        <Link href="/portal/staff" className="hover:text-foreground transition-colors">
          บุคลากร
        </Link>
        <Link href="/portal/reservations" className="hover:text-foreground transition-colors">
          จองห้อง/ยานพาหนะ
        </Link>
        <Link href="/portal/documents" className="hover:text-foreground transition-colors">
          สารบรรณ
        </Link>
      </nav>

      <span className="sp" />

      {/* Actions (Theme toggle, Language switcher, Login button) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="icon-btn"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
          </svg>
          <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.2 14.7A8.3 8.3 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
          </svg>
        </button>

        <LanguageSwitcher />

        <Link
          href="/login"
          className="ml-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-brand text-on-brand hover:opacity-90 transition-opacity shadow-xs whitespace-nowrap"
        >
          เข้าสู่ระบบเจ้าหน้าที่
        </Link>
      </div>
    </header>
  );
}
