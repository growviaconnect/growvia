"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Zap, Gem, Star, Users, Check } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const serifStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

function numFontSize(text: string): string {
  const len = text.replace(/\s/g, "").length;
  if (len <= 6)  return "clamp(32px, 4vw, 52px)";
  if (len <= 9)  return "clamp(28px, 3.5vw, 46px)";
  return               "clamp(24px, 3vw, 40px)";
}

const CARD_BASE_SHADOW  = "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 24px rgba(124,58,237,0.15)";
const CARD_HOVER_SHADOW = "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 40px rgba(124,58,237,0.35)";

const CARD_STYLE = {
  background: "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(124,58,237,0.06) 50%, rgba(255,255,255,0.04) 100%)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(167,139,250,0.25)",
  boxShadow: CARD_BASE_SHADOW,
  transition: "box-shadow 300ms ease, border-color 300ms ease",
} as const;

export default function StatsSection() {
  const { t } = useLang();

  const allBlocks = [
    { Icon: Star,       badge: "Satisfaction",          number: "4.9★",              desc: "Satisfaction moyenne" },
    { Icon: Users,      badge: "Communauté",             number: "50+",               desc: "Mentors actifs" },
    { Icon: ShieldCheck, badge: t("stats_proof1_badge"), number: t("stats_proof1_num"), desc: t("stats_proof1_desc") },
    { Icon: Zap,        badge: t("stats_proof2_badge"), number: t("stats_proof2_num"), desc: t("stats_proof2_desc") },
    { Icon: Gem,        badge: t("stats_proof3_badge"), number: t("stats_proof3_num"), desc: t("stats_proof3_desc") },
  ];

  // ── Scroll animation states ─────────────────────────────────────
  const [animated,     setAnimated]     = useState(false);  // shimmer + badge pulse
  const [starsActive,  setStarsActive]  = useState(false);  // i=0: triggers star CSS anim
  const [counterVal,   setCounterVal]   = useState(0);      // i=1: 0→50
  const [plusPulse,    setPlusPulse]    = useState(false);  // i=1: "+" one-time pulse
  const [fillProgress, setFillProgress] = useState(0);      // i=2: 0–100
  const [checkVisible, setCheckVisible] = useState(false);  // i=2: checkmark after fill
  const [timerVal,     setTimerVal]     = useState(60);     // i=3: 60→5

  // ── Refs ────────────────────────────────────────────────────────
  const wrapperRef    = useRef<HTMLDivElement | null>(null);
  const numRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const rafTimerRef   = useRef<number | null>(null);
  const rafCounterRef = useRef<number | null>(null);
  const rafFillRef    = useRef<number | null>(null);

  useEffect(() => {
    const nums = numRefs.current.filter(Boolean) as HTMLDivElement[];

    // Initial hidden state for stagger reveal
    nums.forEach((el, i) => {
      el.style.opacity    = "0";
      el.style.transform  = "translateY(18px)";
      el.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms,
                              transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        // Stagger fade-in + slide-up on all number divs
        nums.forEach((el) => {
          el.style.opacity   = "1";
          el.style.transform = "translateY(0)";
        });

        // Enable CSS keyframe animations (shimmer, badge pulse, stars)
        setAnimated(true);
        setStarsActive(true);

        const t0 = performance.now();

        // i=3 — "< 5 min" counter: 60 → 5 in 4 000 ms ease-out
        {
          const DUR = 4000, FROM = 60, TO = 5;
          const tick = (now: number) => {
            const p = Math.min(now - t0, DUR) / DUR;
            setTimerVal(Math.round(FROM + (TO - FROM) * (1 - Math.pow(1 - p, 3))));
            if (p < 1) rafTimerRef.current = requestAnimationFrame(tick);
            else setTimerVal(TO);
          };
          rafTimerRef.current = requestAnimationFrame(tick);
        }

        // i=1 — "50+" counter: 0 → 50 in 3 000 ms ease-out, then "+" pulse
        {
          const DUR = 3000, TO = 50;
          let pulsed = false;
          const tick = (now: number) => {
            const p = Math.min(now - t0, DUR) / DUR;
            const eased = 1 - Math.pow(1 - p, 3);
            setCounterVal(Math.round(TO * eased));
            if (p < 1) {
              rafCounterRef.current = requestAnimationFrame(tick);
            } else {
              setCounterVal(TO);
              if (!pulsed) { pulsed = true; setPlusPulse(true); }
            }
          };
          rafCounterRef.current = requestAnimationFrame(tick);
        }

        // i=2 — "100%" fill: 0 → 100 in 2 500 ms ease-out, then show checkmark
        {
          const DUR = 2500;
          const tick = (now: number) => {
            const p = Math.min(now - t0, DUR) / DUR;
            setFillProgress(Math.round(100 * (1 - Math.pow(1 - p, 3))));
            if (p < 1) {
              rafFillRef.current = requestAnimationFrame(tick);
            } else {
              setFillProgress(100);
              setCheckVisible(true);
            }
          };
          rafFillRef.current = requestAnimationFrame(tick);
        }

        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => {
      observer.disconnect();
      if (rafTimerRef.current)   cancelAnimationFrame(rafTimerRef.current);
      if (rafCounterRef.current) cancelAnimationFrame(rafCounterRef.current);
      if (rafFillRef.current)    cancelAnimationFrame(rafFillRef.current);
    };
  }, [allBlocks.length]);

  return (
    <section>
      <style>{`
        @keyframes statPulse {
          0%, 100% { transform: scale(1);    box-shadow: none; }
          50%       { transform: scale(1.05); box-shadow: 0 0 12px rgba(124,58,237,0.6); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes starBounce {
          0%   { transform: scale(0);   opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes plusPulseAnim {
          0%   { transform: scale(1);   color: inherit; }
          40%  { transform: scale(1.4); color: #A78BFA; }
          100% { transform: scale(1);   color: inherit; }
        }
        @keyframes checkFadeIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1);   }
        }
      `}</style>

      {/* ── Title + Subtitle ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="reveal text-4xl md:text-[56px] lg:text-[76px] font-extrabold text-white tracking-tight leading-[1.05] mb-7">
            {t("stats_title_pre")}{" "}
            <span style={serifStyle}>{t("stats_title_hl")}</span>
            {" "}{t("stats_title_post")}
          </h2>
          <p className="reveal reveal-delay-1 text-lg text-white/40 leading-relaxed">
            {t("stats_sub")}
          </p>
        </div>
      </div>

      {/* ── Proof blocks ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div ref={wrapperRef} className="flex justify-end gap-3">
          {allBlocks.map((block, i) => {
            const isStarBlock  = i === 0;
            const isCounter    = i === 1;
            const isFill       = i === 2;
            const isTimer      = i === 3;
            const isShimmer    = i === 4;

            return (
              <div
                key={block.badge}
                className="px-8 lg:px-12 pt-8 pb-14 flex flex-col items-center text-center rounded-2xl"
                style={CARD_STYLE}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow   = CARD_HOVER_SHADOW;
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.45)";
                  // i=4: zoom number text on hover
                  if (isShimmer && numRefs.current[i]) {
                    const el = numRefs.current[i]!;
                    el.style.transition = "transform 400ms ease-out";
                    el.style.transform  = "scale(1.15)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow   = CARD_BASE_SHADOW;
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)";
                  if (isShimmer && numRefs.current[i]) {
                    const el = numRefs.current[i]!;
                    el.style.transition = "transform 400ms ease-in";
                    el.style.transform  = "scale(1)";
                  }
                }}
              >
                {/* Lucide icon */}
                <block.Icon style={{ color: "#A78BFA", width: 20, height: 20, marginBottom: 16 }} />

                {/* Pill badge — pulse loop on i=3 once animated */}
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 rounded-full px-3 py-1 mb-6"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "inline-block",
                    ...(isTimer && animated ? { animation: "statPulse 2s ease-in-out infinite" } : {}),
                  }}
                >
                  {block.badge}
                </span>

                {/* ── Main value ─────────────────────────────────── */}
                <div
                  ref={(el) => { numRefs.current[i] = el; }}
                  className="leading-none tracking-tight mb-2.5"
                  style={{
                    fontSize: numFontSize(block.number),
                    fontWeight: 200,
                    color: "white",
                    ...(isShimmer && animated ? {
                      backgroundImage: "linear-gradient(90deg, #A78BFA 0%, #ffffff 40%, #A78BFA 60%, #ffffff 100%)",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "shimmer 2.5s linear infinite",
                    } : {}),
                  }}
                >
                  {/* i=3: countdown counter */}
                  {isTimer && `< ${timerVal} min`}

                  {/* i=1: count-up + pulsing "+" */}
                  {isCounter && (
                    <>
                      {counterVal}
                      <span style={{
                        display: "inline-block",
                        animation: plusPulse ? "plusPulseAnim 600ms ease-out forwards" : "none",
                      }}>
                        +
                      </span>
                    </>
                  )}

                  {/* i=2: clip-path fill left→right over the number text */}
                  {isFill && (
                    <span style={{ position: "relative", display: "inline-block" }}>
                      {/* Ghost (unfilled) */}
                      <span style={{ color: "rgba(255,255,255,0.18)" }}>{block.number}</span>
                      {/* Colored fill, clipped from the right */}
                      <span style={{
                        position: "absolute",
                        inset: 0,
                        color: "#A78BFA",
                        clipPath: `inset(0 ${100 - fillProgress}% 0 0)`,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}>
                        {block.number}
                      </span>
                    </span>
                  )}

                  {/* i=0: static "4.9" — stars row below handles the ★ animation */}
                  {isStarBlock && "4.9"}

                  {/* i=4: shimmer handled via style above, just render text */}
                  {isShimmer && block.number}
                </div>

                {/* i=0: animated star row ★★★★★ */}
                {isStarBlock && (
                  <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                    {[0, 1, 2, 3, 4].map((si) => (
                      <span
                        key={si}
                        style={{
                          color: "#A78BFA",
                          fontSize: 13,
                          display: "inline-block",
                          opacity: starsActive ? undefined : 0,
                          animation: starsActive
                            ? `starBounce 400ms cubic-bezier(0.34,1.56,0.64,1) ${si * 300}ms both`
                            : "none",
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}

                {/* i=2: checkmark fades in after fill reaches 100% */}
                {isFill && checkVisible && (
                  <Check style={{
                    color: "#A78BFA",
                    width: 18,
                    height: 18,
                    marginBottom: 8,
                    animation: "checkFadeIn 500ms ease-out forwards",
                  }} />
                )}

                {/* Description */}
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                  {block.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
