"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { LayoutDashboard, User, LogOut, Settings } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { useAppSession } from "@/hooks/use-session";
import { hasPermission, P } from "@/features/identity";
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
  const { user, status, isAuthenticated, roles, permissions, isSuperAdmin } = useAppSession();

  const ctx = { roles, permissions, isSuperAdmin };
  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full h-16 border-b border-border/60 bg-[var(--glass-strong)] backdrop-blur-md px-4 md:px-8 flex items-center justify-between shadow-xs",
        className
      )}
    >
      {/* Brand logo & name */}
      <Link className="flex items-center gap-2.5 text-foreground hover:opacity-90 transition-opacity" href="/portal">
        <span className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden border border-border/50 bg-background shrink-0">
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoUrl}
              alt={brandName}
              className="w-full h-full object-contain p-0.5"
            />
          ) : (
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
            </svg>
          )}
        </span>
        <div className="flex flex-col text-left leading-tight">
          <b className="text-sm md:text-base font-bold text-foreground tracking-tight line-clamp-1">{brandName}</b>
          {brandTagline && <span className="text-[11px] text-muted-foreground line-clamp-1">{brandTagline}</span>}
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
        <Link href="/portal" className="hover:text-primary transition-colors">
          หน้าหลัก
        </Link>
        <Link href="/portal/news" className="hover:text-primary transition-colors">
          ข่าวสาร
        </Link>
        <Link href="/portal/curriculum" className="hover:text-primary transition-colors">
          หลักสูตร
        </Link>
        <Link href="/portal/staff" className="hover:text-primary transition-colors">
          บุคลากร
        </Link>
        <Link href="/portal/reservations" className="hover:text-primary transition-colors">
          จองห้อง/ยานพาหนะ
        </Link>
        <Link href="/portal/documents" className="hover:text-primary transition-colors">
          สารบรรณ
        </Link>
      </nav>

      {/* Actions (Theme toggle, Language switcher, Account / Login) */}
      <div className="flex items-center gap-2 shrink-0">
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

        {status === "loading" ? (
          <div aria-hidden="true" className="h-9 w-9 animate-pulse rounded-full bg-muted ml-2" />
        ) : isAuthenticated && user ? (
          <div className="acct ml-2">
            <DropdownMenuPrimitive.Root>
              <DropdownMenuPrimitive.Trigger asChild>
                <button type="button" className="flex items-center gap-2 p-1 pl-1 pr-2.5 rounded-full hover:bg-muted/60 transition-colors">
                  <span className="who w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-primary shrink-0" aria-hidden="true">
                    {user.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={user.image} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      initials
                    )}
                  </span>
                  <span className="nm text-xs font-medium text-foreground max-w-[120px] truncate hidden sm:inline-block">
                    {user.name}
                  </span>
                  <svg className="chev w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </DropdownMenuPrimitive.Trigger>
              <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                  className="menu-list bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-1 min-w-[200px] z-50 animate-in fade-in-80 zoom-in-95"
                  align="end"
                  sideOffset={8}
                  style={{ position: "static" }}
                >
                  <DropdownMenuPrimitive.Label asChild>
                    <div className="px-3 py-2 border-b border-border/50">
                      <p className="text-sm font-bold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuPrimitive.Label>

                  <DropdownMenuPrimitive.Item asChild>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      แผงควบคุมระบบ (Admin Console)
                    </Link>
                  </DropdownMenuPrimitive.Item>

                  <DropdownMenuPrimitive.Item asChild>
                    <Link
                      href="/me"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      ข้อมูลส่วนตัว
                    </Link>
                  </DropdownMenuPrimitive.Item>

                  {hasPermission(ctx, P.settingsManage) && (
                    <DropdownMenuPrimitive.Item asChild>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        ตั้งค่าระบบ
                      </Link>
                    </DropdownMenuPrimitive.Item>
                  )}

                  <DropdownMenuPrimitive.Separator className="h-px bg-border/50 my-1" />

                  <DropdownMenuPrimitive.Item asChild>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/portal" })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      ออกจากระบบ
                    </button>
                  </DropdownMenuPrimitive.Item>
                </DropdownMenuPrimitive.Content>
              </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>
          </div>
        ) : (
          <Link
            href="/login"
            className="ml-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs whitespace-nowrap"
          >
            เข้าสู่ระบบเจ้าหน้าที่
          </Link>
        )}
      </div>
    </header>
  );
}
