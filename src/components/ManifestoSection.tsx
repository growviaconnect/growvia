"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/contexts/LangContext";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

const PHRASE_COUNT = 4;
// Crossfade half-width in viewport-height units.
// Each phrase occupies 1 viewport of scroll; FADE controls how much they overlap.
const FADE = 0.3;

function phraseOpacity(progress: number, i: number): number {
  const start = i;
  const end   = i + 1;
  if (progress < start - FADE) return 0;
  if (progress < start + FADE) return (progress - start + FADE) / (2 * FADE); // fade in
  if (i === PHRASE_COUNT - 1)  return 1;                                        // last phrase never fades out
  if (progress < end   - FADE) return 1;                                        // fully visible
  if (progress < end   + FADE) return 1 - (progress - end + FADE) / (2 * FADE); // fade out
  return 0;
}

function phraseY(progress: number, i: number): number {
  const PX = 14; // max translateY offset
  const start = i, end = i + 1;
  if (progress < start - FADE) return PX;
  if (progress < start + FADE) {
    const t = (progress - start + FADE) / (2 * FADE);
    return (1 - t) * PX;                         // slide up while fading in
  }
  if (i === PHRASE_COUNT - 1 || progress < end - FADE) return 0;
  if (progress < end + FADE) {
    const t = (progress - end + FADE) / (2 * FADE);
    return -t * PX;                              // slide up while fading out
  }
  return -PX;
}

export default function ManifestoSection() {
  const { t } = useLang();
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const phraseRefs   = useRef<(HTMLParagraphElement | null)[]>([]);
  const dotRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef       = useRef<number | null>(null);
  const stepRef      = useRef(-1); // last active step, avoids dot thrashing

  const phrases = [
    t("manifesto_phrase_1"),
    t("manifesto_phrase_2"),
    t("manifesto_phrase_3"),
    t("manifesto_phrase_4"),
  ];

  useEffect(() => {
    // Set all phrases to hidden before first scroll tick
    phraseRefs.current.forEach((el) => {
      if (!el) return;
      el.style.opacity   = "0";
      el.style.transform = "translateY(14px)";
    });

    const update = () => {
      if (!containerRef.current) return;
      const rect     = containerRef.current.getBoundingClientRect();
      const progress = -rect.top / window.innerHeight; // viewport-height units scrolled in

      // ── Phrases: continuous imperative updates (no React state, no CSS transition) ──
      phraseRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity   = String(Math.max(0, Math.min(1, phraseOpacity(progress, i))));
        el.style.transform = `translateY(${phraseY(progress, i).toFixed(2)}px)`;
      });

      // ── Dots: update only when active step changes ───────────────────────────────
      const step = progress < 0
        ? -1
        : Math.min(PHRASE_COUNT - 1, Math.floor(progress));

      if (step !== stepRef.current) {
        stepRef.current = step;
        dotRefs.current.forEach((el, i) => {
          if (!el) return;
          const active = i === step;
          el.style.background = active ? "#7C3AED" : "rgba(255,255,255,0.2)";
          el.style.transform  = active ? "scale(1.6)" : "scale(1)";
          el.style.boxShadow  = active ? "0 0 8px rgba(124,58,237,0.6)" : "none";
        });
      }
    };

    const onScroll = () => {
      if (rafRef.current) return;           // coalesce multiple scroll events per frame
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // sync on mount
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── Mobile: simple stacked layout, no sticky ─────────────────────── */
  if (isMobile) {
    return (
      <div className="relative overflow-hidden py-20">
        <img
          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.35) saturate(0.5)" }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative px-6 flex flex-col items-center gap-12">
          <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em]">
            {t("manifesto_label")}
          </p>
          {phrases.map((phrase, i) => (
            <p
              key={i}
              className="text-center text-white leading-snug max-w-xs"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(1.4rem, 5vw, 1.75rem)",
                opacity: 0.85,
              }}
            >
              {phrase}
            </p>
          ))}
        </div>
      </div>
    );
  }

  /* ── Desktop: 500vh scroll trap with sticky panel ─────────────────── */
  return (
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

        {/* Content */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center px-6">
          <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-10">
            {t("manifesto_label")}
          </p>

          {/* Phrase container, phrases are absolutely stacked */}
          <div className="relative w-full max-w-3xl" style={{ height: "8rem" }}>
            {phrases.map((phrase, i) => (
              <p
                key={i}
                ref={(el) => { phraseRefs.current[i] = el; }}
                className="absolute inset-0 flex items-center justify-center text-center text-white leading-snug"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  /* opacity & transform set imperatively by scroll handler */
                  opacity: 0,
                  transform: "translateY(14px)",
                  willChange: "opacity, transform",
                  pointerEvents: "none",
                }}
              >
                {phrase}
              </p>
            ))}
          </div>
        </div>

        {/* Dot indicators, right side */}
        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          {phrases.map((_, i) => (
            <div
              key={i}
              ref={(el) => { dotRefs.current[i] = el; }}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                transform: "scale(1)",
                boxShadow: "none",
                transition: "background 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease",
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
