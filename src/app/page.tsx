import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Calendar,
  FileCheck2,
  Package,
  FileText,
  Pin,
  Clock,
  Eye,
} from "lucide-react";
import { prisma } from "@/shared/lib/infra/prisma";
import { listPublicNewsArticles } from "@/features/news/server";
import { formatDate } from "@/shared/lib/format";
import { getLocale } from "@/shared/lib/i18n/server";
import { VexHeroSection } from "@/components/hero/vex-hero-section";

import { PortalNavbar } from "@/components/layout/portal-navbar";
import { GraduationCap } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default async function PortalHomePage() {
  const tenant = await prisma.tenant.findFirst();
  const locale = await getLocale();
  const brandTitle = tenant?.nameTh ?? "วิทยาลัยสงฆ์มหาสารคาม";
  const logoUrl = tenant?.logoUrl;
  const news = tenant ? await listPublicNewsArticles(tenant.id, { limit: 6 }) : [];

  const pinnedNews = news.filter((n) => n.isPinned);
  const regularNews = news.filter((n) => !n.isPinned);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Top Navbar matching Admin Header Theme */}
      <PortalNavbar brandName={brandTitle} logoUrl={logoUrl} />

      <main className="flex-1 space-y-16 pb-16">
        {/* VEX Animated Video Background Hero Section */}
        <VexHeroSection
          chatHref="/portal/news"
          exploreHref="#portal-content"
          logoUrl={logoUrl}
          brandTitle={brandTitle}
        />

      <div id="portal-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-6">
        {/* Pinned News (Highlight Banner) */}
        {pinnedNews.length > 0 && (
          <section>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Pin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  ประกาศและข่าวสารสำคัญ (Pinned Announcement)
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pinnedNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/portal/news/${item.slug}`}
                    className="group flex flex-col sm:flex-row gap-4 bg-background p-4 rounded-xl border border-border shadow-xs hover:border-primary/50 transition-all"
                  >
                    {item.coverImageUrl && (
                      <div className="relative h-32 sm:h-auto sm:w-40 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.coverImageUrl}
                          alt={item.titleTh}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex flex-col justify-between flex-1">
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-primary">
                          {locale === "en" ? item.categoryNameEn : item.categoryNameTh}
                        </span>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {locale === "en" ? item.titleEn : item.titleTh}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {locale === "en" ? item.summaryEn : item.summaryTh}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 pt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {item.publishedAt ? formatDate(item.publishedAt, locale) : ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Latest News Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                ข่าวสารและกิจกรรมล่าสุด
              </h2>
              <p className="text-sm text-muted-foreground">
                ติดตามความเคลื่อนไหว กิจกรรมสัมมนา และประกาศของคณะ
              </p>
            </div>
            <Link
              href="/portal/news"
              className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {regularNews.length === 0 && pinnedNews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              ยังไม่มีข่าวสารที่เผยแพร่ในขณะนี้
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {regularNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/portal/news/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs hover:border-primary/50 transition-all"
                >
                  {item.coverImageUrl ? (
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.coverImageUrl}
                        alt={item.titleTh}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                      ไม่มีรูปภาพหน้าปก
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">
                        {locale === "en" ? item.categoryNameEn : item.categoryNameTh}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.publishedAt ? formatDate(item.publishedAt, locale) : ""}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {locale === "en" ? item.titleEn : item.titleTh}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {locale === "en" ? item.summaryEn : item.summaryTh}
                    </p>
                    <div className="pt-4 mt-auto flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {item.viewCount} ครั้ง
                      </span>
                      <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                        อ่านต่อ →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Online Services Quick Links */}
        <section id="services" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              บริการออนไลน์สำหรับนิสิตและคณาจารย์
            </h2>
            <p className="text-sm text-muted-foreground">
              เข้าถึงระบบงานอิเล็กทรอนิกส์ของคณะได้อย่างสะดวกรวดเร็ว
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "ยื่นคำร้องนิสิต", icon: FileText, href: "/login", desc: "คำร้องออนไลน์" },
              { title: "จองห้องและยานพาหนะ", icon: Calendar, href: "/portal/reservations", desc: "ตารางการใช้งาน" },
              { title: "ระบบจัดการครุภัณฑ์", icon: Package, href: "/login", desc: "ตรวจนับ/แจ้งซ่อม" },
              { title: "ระบบสารบรรณ", icon: FileCheck2, href: "/portal/documents", desc: "หนังสือเวียน/คำสั่ง" },
              { title: "ข้อมูลหลักสูตร", icon: BookOpen, href: "/portal/curriculum", desc: "แผนการศึกษา" },
              { title: "ทำเนียบคณาจารย์", icon: Users, href: "/portal/staff", desc: "ติดต่ออาจารย์" },
            ].map((svc, i) => {
              const Icon = svc.icon;
              return (
                <Link
                  key={i}
                  href={svc.href}
                  className="group flex flex-col items-center justify-center p-5 rounded-xl border border-border bg-card text-center hover:border-primary/50 hover:bg-primary/5 transition-all shadow-xs"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {svc.title}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">{svc.desc}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>

    {/* Footer */}
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-base">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoUrl}
                  alt={brandTitle}
                  className="h-7 w-7 object-contain rounded-md"
                />
              ) : (
                <GraduationCap className="h-6 w-6 text-primary" />
              )}
              <span>{brandTitle}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              มุ่งผลิตบัณฑิตที่มีคุณธรรม เชี่ยวชาญเทคโนโลยี และพร้อมพัฒนาสังคมสู่อนาคตดิจิทัล
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">บริการข้อมูล</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/portal/news" className="hover:underline">
                  ข่าวสารและกิจกรรม
                </Link>
              </li>
              <li>
                <Link href="/portal/curriculum" className="hover:underline">
                  หลักสูตรการศึกษา
                </Link>
              </li>
              <li>
                <Link href="/portal/staff" className="hover:underline">
                  ทำเนียบคณาจารย์
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">ระบบงานออนไลน์</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/portal/reservations" className="hover:underline">
                  ระบบจองห้องและยานพาหนะ
                </Link>
              </li>
              <li>
                <Link href="/portal/documents" className="hover:underline">
                  ระบบสารบรรณและคำสั่งคณะ
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:underline">
                  เข้าสู่ระบบเจ้าหน้าที่ (Admin)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">ติดต่อคณะ</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              79 หมู่ 1 ถนนพหลโยธิน ต.ลำไทร อ.วังน้อย จ.พระนครศรีอยุธยา 13170<br />
              โทรศัพท์: 035-248-000<br />
              อีเมล: faculty@mcu.ac.th
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 Faculty of Management and Information Technology. All rights reserved.</span>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <LanguageSwitcher className="text-xs" />
            <span>Powered by VibeCore Framework</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
  );
}
