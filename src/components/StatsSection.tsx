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
    { Icon: Star,        badge: "Satisfaction",           number: "4.9★",                desc: "Satisfaction moyenne" },
    { Icon: Users,       badge: "Communauté",              number: "50+",                 desc: "Mentors actifs" },
    { Icon: ShieldCheck, badge: t("stats_proof1_badge"),  number: t("stats_proof1_num"), desc: t("stats_proof1_desc") },
    { Icon: Zap,         badge: t("stats_proof2_badge"),  number: t("stats_proof2_num"), desc: t("stats_proof2_desc") },
    { Icon: Gem,         badge: t("stats_proof3_badge"),  number: t("stats_proof3_num"), desc: t("stats_proof3_desc") },
  ];

  // ── Scroll reveal ──────────────────────────────────────────────
  const [starsActive,   setStarsActive]   = useState(false);
  const [starsAnimDone, setStarsAnimDone] = useState(false);
  const [scrollFired,   setScrollFired]   = useState(false);

  // ── i=3: < 5 min timer ────────────────────────────────────────
  const [timerVal,    setTimerVal]    = useState(60);
  const rafTimerRef   = useRef<number | null>(null);

  // ── i=1: 50+ counter ─────────────────────────────────────────
  const [counterVal,  setCounterVal]  = useState(0);
  const [plusPulse,   setPlusPulse]   = useState(false);
  const rafCounterRef = useRef<number | null>(null);

  // ── i=2: 100% vérifié — progress bar ──────────────────────────
  const [fillProgress, setFillProgress] = useState(0);
  const [checkVisible, setCheckVisible] = useState(false);
  const rafFillRef = useRef<number | null>(null);

  // ── i=0: 4.9★ — center star hover ────────────────────────────
  const [starHovered, setStarHovered] = useState(false);

  // ── i=4: Dès 9,99€ — price pulse + shimmer ────────────────────
  const [shimmerKey,    setShimmerKey]    = useState(0);
  const [shimmerActive, setShimmerActive] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const numRefs    = useRef<(HTMLDivElement | null)[]>([]);

  // ── Per-block animation helpers ───────────────────────────────

  function startTimer() {
    if (rafTimerRef.current) cancelAnimationFrame(rafTimerRef.current);
    setTimerVal(60);
    const t0 = performance.now();
    const DUR = 6000, FROM = 60, TO = 5;
    const tick = (now: number) => {
      const p = Math.min(now - t0, DUR) / DUR;
      // power-4 ease-out: plunges fast then crawls to 5
      setTimerVal(Math.round(FROM + (TO - FROM) * (1 - Math.pow(1 - p, 4))));
      if (p < 1) rafTimerRef.current = requestAnimationFrame(tick);
      else setTimerVal(TO);
    };
    rafTimerRef.current = requestAnimationFrame(tick);
  }

  function resetTimer() {
    if (rafTimerRef.current) { cancelAnimationFrame(rafTimerRef.current); rafTimerRef.current = null; }
    setTimerVal(60);
  }

  function startCounter() {
    if (rafCounterRef.current) cancelAnimationFrame(rafCounterRef.current);
    setCounterVal(0);
    setPlusPulse(false);
    const t0 = performance.now();
    const DUR = 3000, TO = 50;
    const tick = (now: number) => {
      const p = Math.min(now - t0, DUR) / DUR;
      setCounterVal(Math.round(TO * (1 - Math.pow(1 - p, 3))));
      if (p < 1) rafCounterRef.current = requestAnimationFrame(tick);
      else { setCounterVal(TO); setPlusPulse(true); }
    };
    rafCounterRef.current = requestAnimationFrame(tick);
  }

  function resetCounter() {
    if (rafCounterRef.current) { cancelAnimationFrame(rafCounterRef.current); rafCounterRef.current = null; }
    setCounterVal(0);
    setPlusPulse(false);
  }

  function startFill() {
    if (rafFillRef.current) cancelAnimationFrame(rafFillRef.current);
    setFillProgress(0);
    setCheckVisible(false);
    const t0 = performance.now();
    const DUR = 2000;
    const tick = (now: number) => {
      const p = Math.min(now - t0, DUR) / DUR;
      setFillProgress(Math.round(100 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) rafFillRef.current = requestAnimationFrame(tick);
      else { setFillProgress(100); setCheckVisible(true); }
    };
    rafFillRef.current = requestAnimationFrame(tick);
  }

  function resetFill() {
    if (rafFillRef.current) { cancelAnimationFrame(rafFillRef.current); rafFillRef.current = null; }
    setFillProgress(0);
    setCheckVisible(false);
  }

  // ── Scroll observer ───────────────────────────────────────────
  useEffect(() => {
    const nums = numRefs.current.filter(Boolean) as HTMLDivElement[];

    nums.forEach((el, i) => {
      el.style.opacity    = "0";
      el.style.transform  = "translateY(18px)";
      el.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms,
                              transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        nums.forEach((el) => {
          el.style.opacity   = "1";
          el.style.transform = "translateY(0)";
        });

        setScrollFired(true);
        setStarsActive(true);
        setTimeout(() => setStarsAnimDone(true), 2000);
        startTimer();
        startCounter();
        startFill();
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <style>{`
        @keyframes statPulse {
          0%, 100% { transform: scale(1);    box-shadow: none; }
          50%       { transform: scale(1.05); box-shadow: 0 0 12px rgba(124,58,237,0.6); }
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
        @keyframes checkPulse {
          0%   { opacity: 0; transform: scale(0.3); }
          60%  { opacity: 1; transform: scale(1.3); }
          100% { opacity: 1; transform: scale(1);   }
        }
        @keyframes pricePulse {
          0%   { transform: scale(1);    }
          30%  { transform: scale(1.15); }
          100% { transform: scale(1);    }
        }
        @keyframes goldenShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
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
            const isStarBlock = i === 0;
            const isCounter   = i === 1;
            const isFill      = i === 2;
            const isTimer     = i === 3;
            const isShimmer   = i === 4;

            return (
              <div
                key={block.badge}
                className="px-8 lg:px-12 pt-8 pb-14 flex flex-col items-center text-center rounded-2xl"
                style={CARD_STYLE}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow   = CARD_HOVER_SHADOW;
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.45)";
                  if (isStarBlock) setStarHovered(true);
                  if (isCounter)   startCounter();
                  if (isFill)      startFill();
                  if (isTimer)     startTimer();
                  if (isShimmer) { setShimmerKey((k) => k + 1); setShimmerActive(true); }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow   = CARD_BASE_SHADOW;
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)";
                  if (isStarBlock) setStarHovered(false);
                  if (isCounter)   resetCounter();
                  if (isFill)      resetFill();
                  if (isTimer)     resetTimer();
                  if (isShimmer)   setShimmerActive(false);
                }}
              >
                {/* Lucide icon */}
                <block.Icon style={{ color: "#A78BFA", width: 20, height: 20, marginBottom: 16 }} />

                {/* Pill badge — pulses on i=3 once scroll fires */}
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 rounded-full px-3 py-1 mb-6"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "inline-block",
                    ...(isTimer && scrollFired ? { animation: "statPulse 2s ease-in-out infinite" } : {}),
                  }}
                >
                  {block.badge}
                </span>

                {/* ── Main value ─────────────────────────────────── */}
                <div
                  ref={(el) => { numRefs.current[i] = el; }}
                  className="leading-none tracking-tight mb-2.5"
                  style={{ fontSize: numFontSize(block.number), fontWeight: 200, color: "white" }}
                >
                  {/* i=3: 60→5 countdown, 6s ease-out power-4 */}
                  {isTimer && `< ${timerVal} min`}

                  {/* i=1: 0→50 count-up, pulsing "+" at end */}
                  {isCounter && (
                    <>
                      {counterVal}
                      <span style={{
                        display: "inline-block",
                        animation: plusPulse ? "plusPulseAnim 600ms ease-out forwards" : "none",
                      }}>+</span>
                    </>
                  )}

                  {/* i=2: plain readable text — progress bar handles the reveal */}
                  {isFill && block.number}

                  {/* i=0: static number, star row handles the animation */}
                  {isStarBlock && "4.9"}

                  {/* i=4: pulse + golden shimmer on hover — inner span gets key to restart */}
                  {isShimmer && (
                    <span
                      key={shimmerKey}
                      style={{
                        display: "inline-block",
                        ...(shimmerActive ? {
                          animation: "pricePulse 500ms ease-out forwards, goldenShimmer 500ms linear forwards",
                          backgroundImage: "linear-gradient(90deg, #A78BFA 0%, #FFD700 40%, #A78BFA 60%, #FFD700 100%)",
                          backgroundSize: "200% auto",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        } : {}),
                      }}
                    >
                      {block.number}
                    </span>
                  )}
                </div>

                {/* i=2: purple progress bar fills left→right in 2s */}
                {isFill && (
                  <div style={{
                    width: "80%",
                    height: 3,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    marginBottom: 10,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${fillProgress}%`,
                      background: "#7C3AED",
                      borderRadius: 2,
                    }} />
                  </div>
                )}

                {/* i=2: checkmark pulses once after bar fills */}
                {isFill && checkVisible && (
                  <Check style={{
                    color: "#A78BFA",
                    width: 18,
                    height: 18,
                    marginBottom: 8,
                    animation: "checkPulse 600ms ease-out forwards",
                  }} />
                )}

                {/* i=0: ★★★★★ — center star (si=2) reacts to hover */}
                {isStarBlock && (
                  <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                    {[0, 1, 2, 3, 4].map((si) => {
                      const isCenter = si === 2;
                      return (
                        <span
                          key={si}
                          style={{
                            color: (isCenter && starHovered) ? "#FFD700" : "#A78BFA",
                            fontSize: 13,
                            display: "inline-block",
                            transform: (isCenter && starHovered && starsAnimDone) ? "scale(1.4)" : undefined,
                            transition: starsAnimDone ? "transform 300ms ease, color 300ms ease" : undefined,
                            opacity: starsAnimDone ? 1 : (starsActive ? undefined : 0),
                            animation: (!starsAnimDone && starsActive)
                              ? `starBounce 400ms cubic-bezier(0.34,1.56,0.64,1) ${si * 300}ms both`
                              : "none",
                          }}
                        >
                          ★
                        </span>
                      );
                    })}
                  </div>
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
