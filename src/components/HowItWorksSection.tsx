"use client";

import { Sparkles, Zap, CalendarDays } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const serifStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

export default function HowItWorksSection() {
  const { t } = useLang();

  const steps = [
    {
      num: "01",
      Icon: Sparkles,
      title: t("steps_1_title"),
      desc: t("steps_1_desc"),
    },
    {
      num: "02",
      Icon: Zap,
      title: t("steps_2_title"),
      desc: t("steps_2_desc"),
    },
    {
      num: "03",
      Icon: CalendarDays,
      title: t("steps_3_title"),
      desc: t("steps_3_desc"),
    },
  ];

  return (
    <section className="py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="reveal mb-16 lg:mb-20 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#7C3AED] mb-5">
            {t("steps_label")}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white tracking-tight leading-[1.02] mb-5">
            {t("steps_title").replace(/\.$/, "")}
            <span style={serifStyle}>.</span>
          </h2>
          <p className="text-base text-white/40 leading-relaxed">
            {t("steps_sub")}
          </p>
        </div>

        {/* Steps grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`reveal reveal-delay-${i + 1} relative bg-[#0D0A1A] px-8 lg:px-12 pt-10 pb-12 flex flex-col`}
            >
              {/* Number + icon row */}
              <div className="flex items-start justify-between mb-8">
                <span
                  className="font-extrabold leading-none tracking-tight select-none"
                  style={{
                    fontSize: "clamp(48px, 6vw, 80px)",
                    color: "rgba(124,58,237,0.10)",
                  }}
                  aria-hidden="true"
                >
                  {step.num}
                </span>
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: "rgba(124,58,237,0.12)" }}
                >
                  <step.Icon className="w-5 h-5 text-[#A78BFA]" strokeWidth={1.75} />
                </span>
              </div>

              {/* Thin violet accent line */}
              <div className="w-8 h-px bg-[#7C3AED] mb-6" />

              {/* Title */}
              <h3 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight leading-snug mb-4">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-white/40 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
