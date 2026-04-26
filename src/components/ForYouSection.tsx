"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

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
      accent: "#7C3AED",
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
      accent: "#4C1D95",
    },
  ];

  return (
    <section className="py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Title */}
        <p className="reveal text-xs font-bold uppercase tracking-[0.22em] text-[#7C3AED] mb-5">
          {t("for_you_title")}
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <div
              key={card.href}
              className={`reveal reveal-delay-${i + 1} group relative rounded-2xl p-8 lg:p-10 flex flex-col justify-between transition-all duration-300`}
              style={{
                background: "linear-gradient(135deg, #12102A 0%, #1A1535 100%)",
                border: "1px solid rgba(124,58,237,0.15)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.6)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(124,58,237,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.15)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {/* Top */}
              <div>
                {/* Target badge */}
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#A78BFA]/60 rounded-full px-3 py-1 mb-6"
                  style={{ border: "1px solid rgba(167,139,250,0.2)" }}
                >
                  {card.target}
                </span>

                {/* Card title */}
                <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight mb-8">
                  {card.title}
                </h3>

                {/* Bullets */}
                <ul className="space-y-4 mb-10">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(124,58,237,0.2)" }}
                      >
                        <Check className="w-3 h-3 text-[#A78BFA]" strokeWidth={2.5} />
                      </span>
                      <span className="text-sm text-white/55 leading-snug">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link
                href={card.href}
                className="inline-flex items-center gap-2.5 self-start bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
              >
                {card.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
