"use client";

import { useEffect, useState, type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number; // ms
  duration?: number; // ms
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 1000,
  className = "",
}: FadeInProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ease-out ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  charDelay?: number; // ms
  initialDelay?: number; // ms
  duration?: number; // ms
}

export function AnimatedHeading({
  text,
  className = "",
  charDelay = 30,
  initialDelay = 200,
  duration = 500,
}: AnimatedHeadingProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, initialDelay);
    return () => clearTimeout(timer);
  }, [initialDelay]);

  const lines = text.split("\n");

  return (
    <h1 className={className} style={{ letterSpacing: "-0.04em" }}>
      {lines.map((line, lineIndex) => {
        const lineLength = line.length;
        return (
          <span key={lineIndex} className="block">
            {line.split("").map((char, charIndex) => {
              const delay =
                lineIndex * lineLength * charDelay + charIndex * charDelay;
              const isSpace = char === " ";

              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all ease-out"
                  style={{
                    opacity: started ? 1 : 0,
                    transform: started ? "translateX(0)" : "translateX(-18px)",
                    transitionDuration: `${duration}ms`,
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {isSpace ? "\u00A0" : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
