"use client";

import { useLang } from "@/contexts/LangContext";

const serifStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

export default function StatsSection() {
  const { t } = useLang();

  const proofs = [
    { badge: t("stats_proof1_badge"), number: t("stats_proof1_num"), desc: t("stats_proof1_desc") },
    { badge: t("stats_proof2_badge"), number: t("stats_proof2_num"), desc: t("stats_proof2_desc") },
    { badge: t("stats_proof3_badge"), number: t("stats_proof3_num"), desc: t("stats_proof3_desc") },
  ];

  return (
    <section>

      {/* ── Title + Subtitle ── */}
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

      {/* ── Proof elements ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-end">
          {proofs.map((proof, i) => (
            <div
              key={proof.badge}
              className={`reveal reveal-delay-${i + 1} px-8 lg:px-12 pt-8 pb-14 flex flex-col items-center text-center`}
              style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Pill badge */}
              <span
                className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 rounded-full px-3 py-1 mb-6"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {proof.badge}
              </span>

              {/* Main value */}
              <div
                className="text-white leading-none tracking-tight mb-2.5"
                style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 200 }}
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
