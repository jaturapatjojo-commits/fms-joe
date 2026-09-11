"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Sparkles } from "lucide-react";
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
}: VexHeroSectionProps) {
  const [offsetY, setOffsetY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const videoRef1 = useRef<HTMLVideoElement | null>(null);
  const videoRef2 = useRef<HTMLVideoElement | null>(null);
  const [activeVideo, setActiveVideo] = useState(0);
  const isTransitioning = useRef(false);

  // Parallax on scroll
  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX } = e;
    const { innerWidth } = window;
    const tilt = (clientX - innerWidth / 2) / 28;
    setMouseX(tilt);
  };

  // Seamless cross-fade video loop
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.currentTarget;
    const { currentTime, duration } = target;
    const fadeDuration = 2;

    if (!duration || isTransitioning.current) return;

    if (duration - currentTime <= fadeDuration) {
      isTransitioning.current = true;
      const nextActive = activeVideo === 0 ? 1 : 0;
      const nextVideo = nextActive === 0 ? videoRef1.current : videoRef2.current;

      if (nextVideo) {
        nextVideo.currentTime = 0;
        nextVideo.muted = true;
        nextVideo.play().then(() => {
          setActiveVideo(nextActive);
          setTimeout(() => {
            isTransitioning.current = false;
            target.pause();
            target.currentTime = 0;
          }, fadeDuration * 1000);
        }).catch(() => {
          isTransitioning.current = false;
        });
      }
    }
  };

  // Calculate parallax offsets
  const domeTranslateY = Math.min(offsetY * 0.25, 160);
  const textTranslateY = Math.max(-offsetY * 0.35, -90);
  const textOpacity = Math.max(1 - offsetY / 550, 0);

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden pt-20 pb-8 bg-[#0c0817] text-white selection:bg-purple-500 selection:text-white"
    >
      {/* Seamless Video Background of moving clouds */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef1}
          src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/clouds-animation.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onTimeUpdate={activeVideo === 0 ? handleTimeUpdate : undefined}
          className={cn(
            "absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-[2000ms] ease-in-out",
            activeVideo === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        />
        <video
          ref={videoRef2}
          src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/clouds-animation.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onTimeUpdate={activeVideo === 1 ? handleTimeUpdate : undefined}
          className={cn(
            "absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-[2000ms] ease-in-out",
            activeVideo === 1 ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        />

        {/* Ambient Top & Radial Glow Overlay */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#0c0817] via-[#0c0817]/50 to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#180a33]/70 via-[#120726]/30 to-transparent pointer-events-none z-10" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center my-auto">
        {/* Top Text Header & Subtitles with Parallax */}
        <div
          style={{
            transform: `translateY(${textTranslateY}px)`,
            opacity: textOpacity,
          }}
          className="relative z-10 w-full text-center flex flex-col items-center px-4 sm:px-6 lg:px-8 transition-transform duration-75 ease-out"
        >
          {/* Main Giant Headline: Greenhouses */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-extrabold tracking-tight text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.6)] leading-none select-none animate-[fadeInDown_1s_ease-out]">
            Greenhouses
          </h1>

          {/* Subtitle Banner Row */}
          <div className="mt-3 sm:mt-5 w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left text-white/95 text-xs sm:text-sm md:text-base font-normal tracking-wide px-4 sm:px-12 gap-4 animate-[fadeInUp_1s_ease-out_0.2s_both]">
            <div className="sm:w-1/3 text-center sm:text-left drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] font-medium">
              Cultivating Life in the Skies
            </div>
            <div className="sm:w-1/3 text-center sm:text-right drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] font-medium leading-snug">
              Explore Our High-Altitude
              <br className="hidden sm:block" /> Horticultural Sanctuaries
            </div>
          </div>
        </div>

        {/* Floating Futuristic Greenhouse Dome Illustration */}
        <div
          style={{
            transform: `translateY(${domeTranslateY}px) translateX(${mouseX}px)`,
          }}
          className="relative z-30 -mt-6 sm:-mt-16 md:-mt-22 lg:-mt-28 w-full max-w-5xl px-4 flex justify-center pointer-events-auto transition-transform duration-200 ease-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/greenhouse.png"
            alt="Futuristic Floating Greenhouse Dome"
            className="w-full max-w-4xl h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)] animate-[floatDome_6s_ease-in-out_infinite]"
          />
        </div>

        {/* Floating Interactive CTA Button & Badges */}
        <div className="relative z-40 mt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href={exploreHref}
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.8)] hover:-translate-y-0.5 group cursor-pointer"
          >
            <span>Explore Sanctuary</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <Link
            href={chatHref}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm sm:text-base font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all hover:-translate-y-0.5"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{brandTitle}</span>
          </Link>
        </div>
      </div>

      {/* Bottom Gradient Fade into Page Content */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0c0817] via-[#0c0817]/60 to-transparent z-20 pointer-events-none" />

      {/* Floating dome and fade keyframes */}
      <style>{`
        @keyframes floatDome {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-16px);
          }
        }
        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}