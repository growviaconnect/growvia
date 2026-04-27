"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const serifStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

export default function ForYouSection() {
  const { t } = useLang();

  const cards = [
    {
      title: t("for_you_mentee_title"),
      target: t("for_you_mentee_target"),
      bullets: [
        t("for_you_mentee_b1"),
        t("for_you_mentee_b2"),
        t("for_you_mentee_b3"),
      ],
      cta: t("for_you_mentee_cta"),
      href: "/auth/register",
    },
    {
      title: t("for_you_mentor_title"),
      target: t("for_you_mentor_target"),
      bullets: [
        t("for_you_mentor_b1"),
        t("for_you_mentor_b2"),
        t("for_you_mentor_b3"),
      ],
      cta: t("for_you_mentor_cta"),
      href: "/become-a-mentor",
    },
  ];

  return (
    <section className="py-28 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <div className="reveal mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#7C3AED] mb-4">
            {t("for_you_label")}
          </p>
          <h2 className="text-4xl md:text-[56px] lg:text-[76px] font-extrabold text-white tracking-tight leading-[1.02]">
            {t("for_you_title").replace(/\s*\?$/, "")}
            <span style={serifStyle}> ?</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <div
              key={card.href}
              className={`reveal reveal-delay-${i + 1} relative rounded-2xl p-8 lg:p-10 flex flex-col justify-between transition-all duration-300`}
              style={{
                background: "linear-gradient(140deg, #12102A 0%, #180F2E 60%, #1A1535 100%)",
                border: "1px solid rgba(124,58,237,0.14)",
                boxShadow: "inset 0 1px 0 rgba(167,139,250,0.04)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(124,58,237,0.55)";
                el.style.boxShadow = "0 0 0 1px rgba(124,58,237,0.2), 0 8px 48px rgba(124,58,237,0.18), inset 0 1px 0 rgba(167,139,250,0.06)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(124,58,237,0.14)";
                el.style.boxShadow = "inset 0 1px 0 rgba(167,139,250,0.04)";
              }}
            >
              {/* Top content */}
              <div>
                {/* Target badge */}
                <span
                  className="inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A78BFA]/55 rounded-full px-3 py-1 mb-7"
                  style={{ border: "1px solid rgba(167,139,250,0.18)" }}
                >
                  {card.target}
                </span>

                {/* Card title */}
                <h3 className="text-2xl lg:text-[28px] font-extrabold text-white tracking-tight leading-tight mb-8">
                  {card.title}
                </h3>

                {/* Bullets */}
                <ul className="space-y-4 mb-10">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3.5">
                      <span
                        className="mt-[3px] w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(124,58,237,0.22)" }}
                      >
                        <Check className="w-2.5 h-2.5 text-[#A78BFA]" strokeWidth={3} />
                      </span>
                      <span className="text-sm text-white/50 leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link
                href={card.href}
                className="inline-flex items-center gap-2.5 self-start bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 text-sm"
              >
                {card.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
