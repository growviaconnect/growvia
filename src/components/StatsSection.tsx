"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Zap, Gem, Star, Users } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const serifStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

/**
 * Font size scales down for longer strings so the layout stays tight.
 * "< 5 min" (6 chars) → largest; "100% vérifié" (12 chars) → smallest.
 */
function numFontSize(text: string): string {
  const len = text.replace(/\s/g, "").length;
  if (len <= 6)  return "clamp(32px, 4vw, 52px)";
  if (len <= 9)  return "clamp(28px, 3.5vw, 46px)";
  return               "clamp(24px, 3vw, 40px)";
}

const CARD_STYLE = {
  background: "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(124,58,237,0.06) 50%, rgba(255,255,255,0.04) 100%)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(167,139,250,0.25)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 24px rgba(124,58,237,0.15)",
  transition: "box-shadow 300ms ease, border-color 300ms ease",
} as const;

export default function StatsSection() {
  const { t } = useLang();

  // i=0: Star/Satisfaction, i=1: Users/Communauté, i=2-4: existing proof blocks
  const allBlocks = [
    {
      Icon: Star,
      badge: "Satisfaction",
      number: "4.9★",       // used for numFontSize only
      desc: "Satisfaction moyenne",
      isStarRating: true,
    },
    {
      Icon: Users,
      badge: "Communauté",
      number: "50+",
      desc: "Mentors actifs",
      isStarRating: false,
    },
    {
      Icon: ShieldCheck,
      badge: t("stats_proof1_badge"),
      number: t("stats_proof1_num"),
      desc: t("stats_proof1_desc"),
      isStarRating: false,
    },
    {
      Icon: Zap,
      badge: t("stats_proof2_badge"),
      number: t("stats_proof2_num"),
      desc: t("stats_proof2_desc"),
      isStarRating: false,
    },
    {
      Icon: Gem,
      badge: t("stats_proof3_badge"),
      number: t("stats_proof3_num"),
      desc: t("stats_proof3_desc"),
      isStarRating: false,
    },
  ];

  const [animated, setAnimated] = useState(false);
  const [timerVal, setTimerVal] = useState(60);

  /* ── Stagger reveal + scroll animations ────────────────────────── */
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const numRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef     = useRef<number | null>(null);

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

        setAnimated(true);

        // Counter 60 → 5 in 1 500 ms ease-out cubic (for "< 5 min" block at i=3)
        const start    = performance.now();
        const duration = 1500;
        const FROM = 60, TO = 5;
        function tick(now: number) {
          const elapsed = Math.min(now - start, duration);
          const progress = elapsed / duration;
          const eased    = 1 - Math.pow(1 - progress, 3);
          setTimerVal(Math.round(FROM + (TO - FROM) * eased));
          if (elapsed < duration) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            setTimerVal(TO);
          }
        }
        rafRef.current = requestAnimationFrame(tick);

        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
            const isTimer       = i === 3; // "< 5 min" — counter + badge pulse
            const isShimmer     = i === 4; // pricing — shimmer text

            return (
              <div
                key={block.badge}
                className="px-8 lg:px-12 pt-8 pb-14 flex flex-col items-center text-center rounded-2xl"
                style={CARD_STYLE}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow   = "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 40px rgba(124,58,237,0.35)";
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.45)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow   = "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 24px rgba(124,58,237,0.15)";
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)";
                }}
              >
                {/* Lucide icon */}
                <block.Icon style={{ color: "#A78BFA", width: 20, height: 20, marginBottom: 16 }} />

                {/* Pill badge — pulse loop on "< 5 min" block once animated */}
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 rounded-full px-3 py-1 mb-6"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "inline-block",
                    ...(isTimer && animated
                      ? { animation: "statPulse 2s ease-in-out infinite" }
                      : {}),
                  }}
                >
                  {block.badge}
                </span>

                {/* Main value */}
                <div
                  ref={(el) => { numRefs.current[i] = el; }}
                  className="leading-none tracking-tight mb-2.5"
                  style={{
                    fontSize: numFontSize(block.number),
                    fontWeight: 200,
                    color: "white",
                    ...(isShimmer && animated
                      ? {
                          backgroundImage: "linear-gradient(90deg, #A78BFA 0%, #ffffff 40%, #A78BFA 60%, #ffffff 100%)",
                          backgroundSize: "200% auto",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          animation: "shimmer 2.5s linear infinite",
                        }
                      : {}),
                  }}
                >
                  {isTimer ? (
                    `< ${timerVal} min`
                  ) : block.isStarRating ? (
                    <>4.9 <span style={{ color: "#A78BFA" }}>★</span></>
                  ) : (
                    block.number
                  )}
                </div>

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
