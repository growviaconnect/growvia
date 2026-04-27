"use client";

import { useLang } from "@/contexts/LangContext";

const serifStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

const AVATAR_COLORS = [
  { bg: "rgba(124,58,237,0.25)", border: "rgba(124,58,237,0.4)",  text: "#C4B5FD" },
  { bg: "rgba(76,29,149,0.30)",  border: "rgba(109,40,217,0.45)", text: "#A78BFA" },
  { bg: "rgba(139,92,246,0.22)", border: "rgba(139,92,246,0.4)",  text: "#DDD6FE" },
];

function StarRow() {
  return (
    <div className="flex gap-0.5" aria-label="5 étoiles sur 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="#A78BFA">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const { t } = useLang();

  const testimonials = [
    {
      initials: t("testimonials_t1_initials"),
      name:     t("testimonials_t1_name"),
      role:     t("testimonials_t1_role"),
      quote:    t("testimonials_t1_quote"),
      color:    AVATAR_COLORS[0],
    },
    {
      initials: t("testimonials_t2_initials"),
      name:     t("testimonials_t2_name"),
      role:     t("testimonials_t2_role"),
      quote:    t("testimonials_t2_quote"),
      color:    AVATAR_COLORS[1],
    },
    {
      initials: t("testimonials_t3_initials"),
      name:     t("testimonials_t3_name"),
      role:     t("testimonials_t3_role"),
      quote:    t("testimonials_t3_quote"),
      color:    AVATAR_COLORS[2],
    },
  ];

  return (
    <section className="py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="reveal mb-16 lg:mb-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#7C3AED] mb-5">
            {t("testimonials_label")}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white tracking-tight leading-[1.02]">
            {t("testimonials_title_pre")}{" "}
            <span style={serifStyle}>{t("testimonials_title_hl")}</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t_, i) => (
            <div
              key={t_.name}
              className={`reveal reveal-delay-${i + 1} relative rounded-2xl p-8 flex flex-col gap-6`}
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(124,58,237,0.06) 100%)",
                border: "1px solid rgba(124,58,237,0.18)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "inset 0 1px 0 rgba(167,139,250,0.06)",
              }}
            >
              {/* Top row: stars + badge */}
              <div className="flex items-center justify-between">
                <StarRow />
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.2em] rounded-full px-2.5 py-1"
                  style={{
                    color: "rgba(167,139,250,0.6)",
                    border: "1px solid rgba(167,139,250,0.18)",
                  }}
                >
                  {t("testimonials_badge")}
                </span>
              </div>

              {/* Quote */}
              <p
                className="text-white/75 leading-relaxed flex-1"
                style={{ ...serifStyle, fontSize: "1.0625rem" }}
              >
                &ldquo;{t_.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3.5 pt-2 border-t border-white/[0.06]">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold tracking-wide select-none"
                  style={{
                    background: t_.color.bg,
                    border: `1px solid ${t_.color.border}`,
                    color: t_.color.text,
                  }}
                >
                  {t_.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{t_.name}</p>
                  <p className="text-xs text-white/35 mt-0.5 leading-tight">{t_.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
