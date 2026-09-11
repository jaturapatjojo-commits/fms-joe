"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { FadeIn } from "./motion-components";
import { MonkStudentUniverseAnimation } from "./monk-student-universe-animation";
import { cn } from "@/shared/lib/utils";

interface VexHeroSectionProps {
  onExploreClick?: () => void;
  chatHref?: string;
  exploreHref?: string;
  logoUrl?: string | null;
  brandTitle?: string;
  showNavbar?: boolean;
}

export function VexHeroSection({
  onExploreClick,
  chatHref = "/portal/curriculum",
  exploreHref = "#portal-content",
  logoUrl,
  brandTitle = "วิทยาลัยสงฆ์มหาสารคาม",
  showNavbar = false,
}: VexHeroSectionProps) {
  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden bg-[#fafafa] dark:bg-[#0c0d12] border-b border-border/50 transition-colors">
      {/* Background Soft Glows & Ambient Highlights */}
      <div className="absolute -top-32 right-10 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[250px] bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-12 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Typography, Badge & CTAs (span 7) */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6">
            {/* Pill / Badge */}
            <FadeIn delay={150} duration={600}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/90 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/40 text-xs sm:text-sm font-medium w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" />
                <span>ศูนย์กลางการเรียนรู้และนวัตกรรมดิจิทัลแห่งอนาคต</span>
              </div>
            </FadeIn>

            {/* Main Headline */}
            <FadeIn delay={300} duration={700}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.15] sm:leading-[1.12]">
                Learn. to code.
                <br />
                <span className="text-purple-600 dark:text-purple-400">
                  Build the future.
                </span>
              </h1>
            </FadeIn>

            {/* Subheading / Description */}
            <FadeIn delay={450} duration={700}>
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                หลักสูตรและระบบการศึกษาแบบ Interactive เสริมสร้างทักษะดิจิทัล
                สร้างสรรค์โครงงานจริง และเตรียมความพร้อมสู่โลกอนาคตอย่างมั่นใจ
              </p>
            </FadeIn>

            {/* Call To Action Buttons */}
            <FadeIn delay={600} duration={700}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {/* Primary Button */}
                <Link
                  href={chatHref}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-all shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/35 hover:-translate-y-0.5"
                >
                  <span>สำรวจหลักสูตร</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Secondary Button / Video Button */}
                <a
                  href={exploreHref}
                  onClick={onExploreClick}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-all shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 hover:-translate-y-0.5"
                >
                  <PlayCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>แนะนำวิทยาลัย</span>
                </a>
              </div>
            </FadeIn>

            {/* Quick Stats / Highlights */}
            <FadeIn delay={750} duration={700}>
              <div className="pt-4 flex items-center gap-6 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 border-t border-border/40 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                    100%
                  </span>
                  <span>ทักษะปฏิบัติจริง</span>
                </div>
                <span className="text-border">•</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                    24/7
                  </span>
                  <span>ระบบบริการออนไลน์</span>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Monk & University Student in Universe Animation (span 5) */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <FadeIn delay={400} duration={800}>
              <MonkStudentUniverseAnimation />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}