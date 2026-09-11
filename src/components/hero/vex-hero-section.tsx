"use client";

import Link from "next/link";
import { AnimatedHeading, FadeIn } from "./motion-components";

interface VexHeroSectionProps {
  onExploreClick?: () => void;
  chatHref?: string;
  exploreHref?: string;
  logoUrl?: string | null;
  brandTitle?: string;
}

export function VexHeroSection({
  onExploreClick,
  chatHref = "/portal/curriculum",
  exploreHref = "#portal-content",
  logoUrl,
  brandTitle = "วิทยาลัยสงฆ์มหาสารคาม",
}: VexHeroSectionProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden text-white bg-black select-none font-sans">
      {/* Full-screen Background Image with Smooth Cinematic Ken Burns Motion */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/building.jpg"
          alt="อาคาร ๑๕๐ ปี จังหวัดมหาสารคาม วิทยาลัยสงฆ์มหาสารคาม มจร"
          className="w-full h-full object-cover animate-kenburns transform will-change-transform"
        />
        {/* Subtle cinematic gradient to enhance text contrast while preserving the true building colors */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between px-6 md:px-12 lg:px-16 pt-6 pb-12 lg:pb-16">
        {/* Navbar inside Liquid Glass */}
        <header className="w-full">
          <nav className="liquid-glass rounded-xl px-4 py-2.5 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center gap-2.5">
                {logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logoUrl}
                    alt={brandTitle}
                    className="h-8 w-8 object-contain rounded-md bg-white/10 p-0.5"
                  />
                ) : (
                  <span className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-sm font-bold">
                    MCU
                  </span>
                )}
                <span>{brandTitle}</span>
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-gray-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                เข้าสู่ระบบเจ้าหน้าที่
              </Link>
              <Link
                href="/portal"
                className="text-xs sm:text-sm font-medium bg-amber-500/80 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg transition-colors border border-amber-400/50 shadow-sm"
              >
                พอร์ทัลบริการ
              </Link>
            </div>
          </nav>
        </header>

        {/* Content Area */}
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            {/* Left Column: Heading and Subheading */}
            <div>
              {/* Main Heading with Motion (30ms charDelay, 200ms initialDelay, 500ms duration) */}
              <AnimatedHeading
                text="มหาจุฬาฯ มหาสารคาม"
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 text-white leading-tight drop-shadow-md"
                charDelay={30}
                initialDelay={200}
                duration={500}
              />

              {/* Subheading with Fade-in (800ms delay, 1000ms duration) */}
              <FadeIn delay={800} duration={1000}>
                <p className="text-base md:text-lg text-gray-200 mb-6 font-normal max-w-xl leading-relaxed drop-shadow-sm">
                  วิทยาลัยสงฆ์มหาสารคาม มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
                  <br />
                  ศูนย์กลางการจัดการศึกษา วิจัย และบริการวิชาการพระพุทธศาสนาสู่สังคม
                </p>
              </FadeIn>

              {/* Buttons Row with Fade-in (1200ms delay, 1000ms duration) */}
              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href={exploreHref}
                    onClick={onExploreClick}
                    className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md"
                  >
                    สำรวจบริการออนไลน์
                  </a>
                  <Link
                    href={chatHref}
                    className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all"
                  >
                    หลักสูตรที่เปิดรับสมัคร
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right Column: Tag aligned to bottom-right */}
            <div className="mt-8 lg:mt-0 flex items-end justify-start lg:justify-end">
              {/* Glass Tag with Fade-in (1400ms delay, 1000ms duration) */}
              <FadeIn delay={1400} duration={1000}>
                <div className="liquid-glass border border-white/20 px-6 py-3.5 rounded-xl inline-block shadow-lg">
                  <span className="text-base md:text-lg lg:text-xl font-light text-white tracking-wide">
                    พุทธศาสตร์ • การศึกษา • นวัตกรรมดิจิทัล
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
