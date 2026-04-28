"use client";

import { useEffect, useRef } from "react";
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

export default function StatsSection() {
  const { t } = useLang();

  const proofs = [
    { badge: t("stats_proof1_badge"), number: t("stats_proof1_num"), desc: t("stats_proof1_desc") },
    { badge: t("stats_proof2_badge"), number: t("stats_proof2_num"), desc: t("stats_proof2_desc") },
    { badge: t("stats_proof3_badge"), number: t("stats_proof3_num"), desc: t("stats_proof3_desc") },
  ];

  /* ── Stagger reveal on scroll ──────────────────────────────────── */
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const numRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const nums = numRefs.current.filter(Boolean) as HTMLDivElement[];

    // Set initial hidden state
    nums.forEach((el, i) => {
      el.style.opacity   = "0";
      el.style.transform = "translateY(18px)";
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
        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [proofs.length]);

  return (
    <section>

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
        <div ref={wrapperRef} className="flex justify-end">
          {proofs.map((proof, i) => (
            <div
              key={proof.badge}
              className="px-8 lg:px-12 pt-8 pb-14 flex flex-col items-center text-center"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Pill badge */}
              <span
                className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 rounded-full px-3 py-1 mb-6"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {proof.badge}
              </span>

              {/* Main value — animated */}
              <div
                ref={(el) => { numRefs.current[i] = el; }}
                className="text-white leading-none tracking-tight mb-2.5"
                style={{
                  fontSize: numFontSize(proof.number),
                  fontWeight: 200,
                  /* initial state set imperatively in useEffect */
                }}
              >
                {proof.number}
              </div>

              {/* Description */}
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                {proof.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
