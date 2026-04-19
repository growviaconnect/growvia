"use client";

import { useEffect, useRef, useState } from "react";

const PHRASES = [
  "Growing fast and learning every day.",
  "Real, honest human connections.",
  "Staying adaptable and always moving forward.",
  "Creating real and meaningful impact.",
];

export default function ManifestoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrolledIn = -rect.top;
      if (scrolledIn < 0) {
        setActiveStep(-1);
        return;
      }
      const step = Math.min(PHRASES.length - 1, Math.floor(scrolledIn / window.innerHeight));
      setActiveStep(step);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    /* 500vh = 4 scroll steps × 100vh + 1 initial viewport */
    <div ref={containerRef} style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Background */}
        <img
          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.35) saturate(0.5)" }}
        />
        <div className="absolute inset-0 bg-black/55" />

        {/* Bottom fade into page background */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "35%",
            background: "linear-gradient(to bottom, transparent 0%, #0D0A1A 100%)",
          }}
        />

        {/* Label */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center px-6">
          <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-10">
            We Believe In
          </p>

          {/* Phrases stacked — each absolutely positioned over each other */}
          <div className="relative w-full max-w-3xl" style={{ height: "8rem" }}>
            {PHRASES.map((phrase, i) => (
              <p
                key={i}
                className="absolute inset-0 flex items-center justify-center text-center text-white leading-snug"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  opacity: activeStep === i ? 1 : 0,
                  transform: activeStep === i ? "translateY(0)" : activeStep > i ? "translateY(-12px)" : "translateY(12px)",
                  transition: "opacity 0.6s ease, transform 0.6s ease",
                  pointerEvents: activeStep === i ? "auto" : "none",
                }}
              >
                {phrase}
              </p>
            ))}
          </div>
        </div>

        {/* Dot indicators — right side */}
        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          {PHRASES.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-400"
              style={{
                width: 6,
                height: 6,
                background: activeStep === i ? "#7C3AED" : "rgba(255,255,255,0.2)",
                transform: activeStep === i ? "scale(1.5)" : "scale(1)",
                transition: "background 0.4s ease, transform 0.4s ease",
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
