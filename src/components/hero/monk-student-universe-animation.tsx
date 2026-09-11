"use client";

import { useEffect, useRef } from "react";
import { Atom } from "lucide-react";

export function MonkStudentUniverseAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 520);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Stars generation
    const starCount = 90;
    const stars = Array.from({ length: starCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.8 + 0.2,
      pulse: Math.random() * 0.05 + 0.01,
      color: ["#ffffff", "#e9d5ff", "#fef08a", "#93c5fd", "#fbcfe8"][
        Math.floor(Math.random() * 5)
      ],
    }));

    // Shooting stars
    const shootingStars: Array<{
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
    }> = [];

    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.5),
        length: Math.random() * 80 + 40,
        speed: Math.random() * 6 + 7,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        opacity: 1,
      });
    };

    let shootingTimer = 0;
    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Deep space radial nebula gradient
      const grad1 = ctx.createRadialGradient(
        width * 0.35,
        height * 0.3,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.8
      );
      grad1.addColorStop(0, "rgba(88, 28, 135, 0.45)"); // purple nebula
      grad1.addColorStop(0.4, "rgba(30, 27, 75, 0.65)"); // indigo
      grad1.addColorStop(0.8, "rgba(10, 10, 26, 0.85)"); // deep space
      grad1.addColorStop(1, "rgba(5, 5, 16, 0.95)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Secondary warm golden nebula glow
      const grad2 = ctx.createRadialGradient(
        width * 0.75,
        height * 0.65,
        20,
        width * 0.7,
        height * 0.6,
        width * 0.5
      );
      grad2.addColorStop(0, "rgba(245, 158, 11, 0.25)");
      grad2.addColorStop(0.6, "rgba(147, 51, 234, 0.15)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Orbiting celestial rings
      ctx.save();
      ctx.translate(width * 0.5, height * 0.45);
      ctx.rotate(time * 0.12);
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 0.4, width * 0.18, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.18)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 14]);
      ctx.stroke();
      ctx.restore();

      // Second ring
      ctx.save();
      ctx.translate(width * 0.5, height * 0.45);
      ctx.rotate(-time * 0.08);
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 0.46, width * 0.24, Math.PI / 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.14)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 10]);
      ctx.stroke();
      ctx.restore();

      // Render stars
      stars.forEach((star) => {
        star.x += star.speedX;
        star.y += star.speedY;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        star.opacity += Math.sin(time * 3 + star.x) * star.pulse;
        const currentOpacity = Math.max(0.15, Math.min(1, star.opacity));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentOpacity;
        ctx.fill();

        // Star twinkle cross on larger stars
        if (star.size > 1.8) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 2, star.y);
          ctx.lineTo(star.x + star.size * 2, star.y);
          ctx.moveTo(star.x, star.y - star.size * 2);
          ctx.lineTo(star.x, star.y + star.size * 2);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      // Shooting stars logic
      shootingTimer++;
      if (shootingTimer > 120 && Math.random() < 0.04) {
        spawnShootingStar();
        shootingTimer = 0;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.02;

        if (s.opacity <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - Math.cos(s.angle) * s.length,
          s.y - Math.sin(s.angle) * s.length
        );
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[500px] h-[480px] sm:h-[530px] rounded-3xl overflow-hidden border border-purple-500/30 dark:border-purple-500/40 shadow-2xl shadow-purple-950/40 bg-[#070714] select-none group">
      {/* 1. Animated Cosmos Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* 2. Ambient Floating Stardust Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/50 pointer-events-none" />

      {/* 3. Monk and University Student 3D Character Composition */}
      <div className="relative w-full h-full flex items-end justify-center z-10 px-4 pb-0 pt-6">
        <div className="relative w-full max-w-[420px] h-full flex items-end justify-center">
          
          {/* LEFT CHARACTER: The Young Buddhist Monk (พระสงฆ์) */}
          <div className="relative z-10 -mr-4 flex flex-col items-center animate-[floatMonk_6s_ease-in-out_infinite]">
            {/* Gentle Bodhi/Aura Halo behind monk */}
            <div className="absolute -top-6 w-36 h-36 rounded-full bg-amber-400/25 blur-xl pointer-events-none" />
            <div className="absolute -top-3 w-28 h-28 rounded-full border border-amber-300/40 animate-spin [animation-duration:20s] pointer-events-none" />

            <svg
              viewBox="0 0 160 260"
              className="w-40 sm:w-48 h-auto drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
            >
              <defs>
                <linearGradient id="monkRobeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#fdba74" />
                </linearGradient>
                <linearGradient id="sashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
              </defs>

              {/* Head & Face */}
              <circle cx="80" cy="55" r="32" fill="url(#skinGrad)" />
              {/* Ears */}
              <circle cx="48" cy="56" r="6" fill="#fdba74" />
              <circle cx="112" cy="56" r="6" fill="#fdba74" />
              {/* Eyes - Peaceful & Smiling */}
              <path d="M 64 54 Q 70 58 76 54" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 84 54 Q 90 58 96 54" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Eyebrows */}
              <path d="M 63 47 Q 70 45 77 48" stroke="#78350f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M 83 48 Q 90 45 97 47" stroke="#78350f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              {/* Gentle Smile */}
              <path d="M 72 67 Q 80 74 88 67" stroke="#b45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Rosy Cheeks */}
              <circle cx="62" cy="61" r="5" fill="#f87171" opacity="0.3" />
              <circle cx="98" cy="61" r="5" fill="#f87171" opacity="0.3" />

              {/* Robe (จีวรสีพระราชนิยม / ส้มทอง) */}
              <path
                d="M 46 88 C 42 120 40 170 38 255 L 122 255 C 120 170 118 120 114 88 C 104 84 94 82 80 82 C 66 82 56 84 46 88 Z"
                fill="url(#monkRobeGrad)"
              />
              {/* Robe Fold Lines */}
              <path d="M 52 90 Q 76 115 108 92" stroke="#92400e" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M 50 120 Q 80 150 110 125" stroke="#92400e" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M 44 160 Q 80 195 116 165" stroke="#92400e" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M 42 205 Q 80 235 118 210" stroke="#92400e" strokeWidth="2" fill="none" opacity="0.6" />

              {/* Sanghati Sash across shoulder */}
              <path
                d="M 54 86 L 68 86 L 96 255 L 80 255 Z"
                fill="url(#sashGrad)"
                opacity="0.9"
              />

              {/* Hands in Anjali / Wai or holding palm scriptures */}
              <ellipse cx="80" cy="140" rx="14" ry="18" fill="url(#skinGrad)" />
              {/* Lotus / Dharmachakra miniature icon in hand */}
              <circle cx="80" cy="140" r="7" fill="#fbbf24" />
              <circle cx="80" cy="140" r="4" fill="#d97706" />
            </svg>
          </div>

          {/* RIGHT CHARACTER: University Student with Modern Tech (นักศึกษา) */}
          <div className="relative z-20 -ml-4 flex flex-col items-center animate-[floatStudent_6s_ease-in-out_infinite] [animation-delay:1.5s]">
            {/* Ambient Tech glow behind student */}
            <div className="absolute -top-4 w-36 h-36 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

            <svg
              viewBox="0 0 170 260"
              className="w-44 sm:w-52 h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]"
            >
              <defs>
                <linearGradient id="studentShirt" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient id="studentHair" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="screenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>

              {/* Hair (modern styled cut) */}
              <path
                d="M 52 50 C 50 30 68 18 86 18 C 104 18 122 30 120 50 C 120 56 122 62 118 68 C 114 55 106 48 86 46 C 68 48 58 55 54 68 C 50 62 52 56 52 50 Z"
                fill="url(#studentHair)"
              />
              {/* Head & Face */}
              <circle cx="86" cy="55" r="30" fill="url(#skinGrad)" />
              {/* Bangs */}
              <path
                d="M 60 40 Q 75 48 88 38 Q 102 46 112 42 Q 106 32 86 30 Q 66 32 60 40 Z"
                fill="url(#studentHair)"
              />

              {/* Modern Headphones (like CodeYoung reference) */}
              <path
                d="M 54 52 C 54 26 118 26 118 52"
                stroke="#8b5cf6"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <rect x="50" y="44" width="8" height="18" rx="4" fill="#a78bfa" />
              <rect x="114" y="44" width="8" height="18" rx="4" fill="#a78bfa" />

              {/* Eyes - Happy & Confident */}
              <circle cx="74" cy="54" r="3.5" fill="#1e293b" />
              <circle cx="75" cy="53" r="1.2" fill="#ffffff" />
              <circle cx="98" cy="54" r="3.5" fill="#1e293b" />
              <circle cx="99" cy="53" r="1.2" fill="#ffffff" />

              {/* Eyebrows */}
              <path d="M 68 47 Q 74 44 80 47" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 92 47 Q 98 44 104 47" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* Bright Smile */}
              <path d="M 78 66 Q 86 73 94 66" stroke="#e11d48" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="68" cy="61" r="4" fill="#f43f5e" opacity="0.3" />
              <circle cx="104" cy="61" r="4" fill="#f43f5e" opacity="0.3" />

              {/* Modern University Uniform Shirt / Jacket */}
              {/* Inner white shirt with tie */}
              <path d="M 62 86 L 110 86 L 118 255 L 54 255 Z" fill="url(#studentShirt)" />
              {/* University Necktie (ม่วง-ทอง) */}
              <polygon points="86,88 89,112 86,145 83,112" fill="#7c3aed" />
              <polygon points="86,94 88,110 86,135 84,110" fill="#f59e0b" />

              {/* Modern Varsity / Tech Jacket (Dark Violet/Indigo) */}
              <path d="M 52 86 C 42 120 38 170 36 255 L 68 255 L 70 120 C 66 100 60 90 52 86 Z" fill="#4338ca" />
              <path d="M 120 86 C 130 120 134 170 136 255 L 104 255 L 102 120 C 106 100 112 90 120 86 Z" fill="#4338ca" />
              {/* Collar Accent */}
              <path d="M 52 86 L 70 110 L 86 88 L 102 110 L 120 86" stroke="#fbbf24" strokeWidth="2.5" fill="none" />

              {/* LAPTOP IN HANDS (Glowing Screen) */}
              {/* Screen back / Base */}
              <rect x="45" y="160" width="82" height="52" rx="6" fill="url(#laptopGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Screen Display Glow */}
              <rect x="49" y="164" width="74" height="44" rx="4" fill="url(#screenGlow)" opacity="0.9" />
              {/* Code lines on screen */}
              <line x1="55" y1="172" x2="75" y2="172" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="78" y1="172" x2="95" y2="172" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
              <line x1="58" y1="178" x2="90" y2="178" stroke="#e0e7ff" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="58" y1="184" x2="105" y2="184" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="55" y1="190" x2="82" y2="190" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" />

              {/* Student Hands holding laptop */}
              <ellipse cx="44" cy="186" rx="7" ry="9" fill="url(#skinGrad)" />
              <ellipse cx="128" cy="186" rx="7" ry="9" fill="url(#skinGrad)" />
            </svg>
          </div>

        </div>
      </div>

      {/* 4. Glassmorphism Floating Tag at Bottom-Right */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-purple-500/30 text-white shadow-xl">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white">
          <Atom className="w-3.5 h-3.5 animate-spin [animation-duration:8s]" />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-purple-300 font-medium leading-none">
            พุทธปัญญา • นวัตกรรมดิจิทัล
          </p>
          <p className="text-xs font-bold text-white tracking-tight">
            Buddhist Wisdom & Digital Era
          </p>
        </div>
      </div>

      {/* 5. Custom CSS Floating Animation Keyframes */}
      <style>{`
        @keyframes floatMonk {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(-1deg);
          }
        }
        @keyframes floatStudent {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }
      `}</style>
    </div>
  );
}