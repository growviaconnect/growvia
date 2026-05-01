"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/contexts/LangContext";

const ACCENT = "#A78BFA";

interface Testimonial {
  name: string;
  role: string;
  label: string;
  quoteKey: string;
  image?: string;
}

const TESTIMONIALS: Omit<Testimonial, "label">[] = [
  {
    name: "Sarah Chen",
    role: "Product Manager · Stripe",
    quoteKey: "founders_t1_quote",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
  },
  {
    name: "Marcus Johnson",
    role: "VP Engineering · Mentor",
    quoteKey: "founders_t2_quote",
  },
  {
    name: "Aisha Patel",
    role: "Founder · EduScale",
    quoteKey: "founders_t3_quote",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=600&q=80",
  },
  {
    name: "Thomas Dubois",
    role: "Strategy Consultant · Paris",
    quoteKey: "founders_t4_quote",
  },
  {
    name: "Elena Rossi",
    role: "Partner · McKinsey",
    quoteKey: "founders_t5_quote",
  },
  {
    name: "James Okonkwo",
    role: "Design Lead · Meta",
    quoteKey: "founders_t6_quote",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  },
  {
    name: "Sarah Chen",
    role: "Stripe",
    quoteKey: "founders_stat1_quote",
  },
  {
    name: "Marcus Johnson",
    role: "VP Engineering",
    quoteKey: "founders_stat2_quote",
  },
];

const MENTOR_KEYS = new Set([
  "founders_t2_quote",
  "founders_t5_quote",
  "founders_t6_quote",
  "founders_stat2_quote",
]);

function useStaggerReveal(count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cards = refs.current.filter(Boolean) as HTMLDivElement[];
    if (!cards.length) return;

    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(28px)";
      card.style.transition = `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${Math.floor(i / 2) * 80}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${Math.floor(i / 2) * 80}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        cards.forEach((card) => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        });
        observer.disconnect();
      },
      { threshold: 0.08 },
    );

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return {
    wrapperRef,
    cardRef: (i: number) => (el: HTMLDivElement | null) => {
      refs.current[i] = el;
    },
  };
}

export default function TestimonialsPage() {
  const { t } = useLang();
  const { wrapperRef, cardRef } = useStaggerReveal(TESTIMONIALS.length);

  return (
    <div className="min-h-screen bg-[#0D0A1A]">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 text-center px-6">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.32em] mb-6"
          style={{ color: ACCENT }}
        >
          {t("testimonials_page_label")}
        </p>
        <h1 className="text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
          {t("testimonials_page_title_pre")}{" "}
          <span style={{ color: ACCENT }}>{t("testimonials_page_title_hl")}</span>
        </h1>
      </section>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div
            ref={wrapperRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {TESTIMONIALS.map((item, i) => {
              const isMentor = MENTOR_KEYS.has(item.quoteKey);
              const label = isMentor
                ? t("founders_testimonial_mentor")
                : t("founders_testimonial_mentee");
              const quote = t(item.quoteKey);

              return (
                <div
                  key={`${item.name}-${item.quoteKey}`}
                  ref={cardRef(i)}
                  className="rounded-2xl p-8 flex flex-col gap-5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(124,58,237,0.06) 60%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(167,139,250,0.25)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 32px rgba(124,58,237,0.10)",
                  }}
                >
                  {/* Label */}
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: "#7C3AED" }}
                  >
                    {label}
                  </span>

                  {/* Photo (optional) */}
                  {item.image && (
                    <div className="overflow-hidden rounded-xl" style={{ height: 180 }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-center"
                        style={{ filter: "brightness(0.5) saturate(0.55)" }}
                      />
                    </div>
                  )}

                  {/* Quote */}
                  <blockquote className="flex-1">
                    <p
                      className="text-lg leading-snug text-white"
                      style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                    >
                      &ldquo;{quote}&rdquo;
                    </p>
                  </blockquote>

                  {/* Attribution */}
                  <div className="border-t border-white/8 pt-5">
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-white/35 mt-0.5">{item.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
