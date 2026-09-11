import { PortalNavbar } from "@/components/layout/portal-navbar";
import { PortalFooter } from "@/components/layout/portal-footer";
import { prisma } from "@/shared/lib/infra/prisma";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await prisma.tenant.findFirst();
  const brandTitle = tenant?.nameTh ?? "วิทยาลัยสงฆ์มหาสารคาม";
  const brandEn = tenant?.nameEn ?? "Mahasarakham Buddhist College";
  const logoUrl = tenant?.logoUrl;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Top Navbar matching Admin Header Theme */}
      <PortalNavbar brandName={brandTitle} logoUrl={logoUrl} />

      {/* Main Content Body */}
      <main className="flex-1">{children}</main>

      {/* Portal Footer styled with Liyon theme tokens */}
      <PortalFooter brandTitle={brandTitle} brandEn={brandEn} logoUrl={logoUrl} />
    </div>
  );
}
