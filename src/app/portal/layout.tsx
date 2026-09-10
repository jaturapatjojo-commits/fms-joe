import Link from "next/link";
import { Globe, LogIn, GraduationCap } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Main Content Body */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-base">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span>คณะการจัดการและเทคโนโลยีสารสนเทศ</span>
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
