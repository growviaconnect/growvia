"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const BG       = "#0D0A1A";
const ACCENT   = "#7C3AED";
const ACCENT_L = "#A78BFA";

const serif = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

function useVisible(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Accordion item ────────────────────────────────────────────────
function FAQItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (answerRef.current) {
      setHeight(open ? answerRef.current.scrollHeight : 0);
    }
  }, [open]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12,
        border: `1px solid ${
          open    ? "rgba(157,141,241,0.4)"  :
          hovered ? "rgba(157,141,241,0.35)" :
                    "rgba(157,141,241,0.12)"
        }`,
        background: open
          ? "rgba(157,141,241,0.06)"
          : hovered
            ? "rgba(157,141,241,0.04)"
            : "rgba(255,255,255,0.03)",
        transition: "border-color 0.25s ease, background 0.25s ease",
        overflow: "hidden",
        animationDelay: `${delay}ms`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          gap: 16,
        }}
      >
        <span style={{
          fontWeight: 500,
          color: "rgba(255,255,255,0.9)",
          fontSize: "clamp(14px, 1.6vw, 15px)",
          lineHeight: 1.5,
          flex: 1,
        }}>
          {q}
        </span>
        <ChevronDown
          style={{
            width: 18, height: 18,
            color: ACCENT_L,
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>

      {/* Smooth height animation */}
      <div style={{
        maxHeight: height,
        overflow: "hidden",
        transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div ref={answerRef} style={{
          padding: "0 20px 18px",
          color: "rgba(200,190,230,0.8)",
          fontSize: 14,
          lineHeight: 1.7,
          borderTop: "1px solid rgba(157,141,241,0.1)",
          paddingTop: 14,
        }}>
          {a}
        </div>
      </div>
    </div>
  );
}

// ── Category section ──────────────────────────────────────────────
function FAQCategory({ category, questions, baseDelay }: {
  category: string;
  questions: { q: string; a: string }[];
  baseDelay: number;
}) {
  const { ref, visible } = useVisible();

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.55s ease ${baseDelay}ms, transform 0.55s ease ${baseDelay}ms`,
      }}
    >
      {/* Category eyebrow */}
      <div style={{ marginBottom: 16 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.28em",
          textTransform: "uppercase", color: ACCENT,
          marginBottom: 10,
        }}>
          {category}
        </p>
        <div style={{
          height: 1,
          background: "linear-gradient(to right, rgba(124,58,237,0.4), transparent)",
        }} />
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {questions.map((item, i) => (
          <FAQItem key={item.q} q={item.q} a={item.a} delay={i * 40} />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function FAQPage() {
  const { t } = useLang();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(id);
  }, []);

  const faqs = [
    {
      category: t("faq_cat1"),
      questions: [
        { q: t("faq_cat1_q1"), a: t("faq_cat1_a1") },
        { q: t("faq_cat1_q2"), a: t("faq_cat1_a2") },
        { q: t("faq_cat1_q3"), a: t("faq_cat1_a3") },
      ],
    },
    {
      category: t("faq_cat2"),
      questions: [
        { q: t("faq_cat2_q1"), a: t("faq_cat2_a1") },
        { q: t("faq_cat2_q2"), a: t("faq_cat2_a2") },
        { q: t("faq_cat2_q3"), a: t("faq_cat2_a3") },
      ],
    },
    {
      category: t("faq_cat3"),
      questions: [
        { q: t("faq_cat3_q1"), a: t("faq_cat3_a1") },
        { q: t("faq_cat3_q2"), a: t("faq_cat3_a2") },
        { q: t("faq_cat3_q3"), a: t("faq_cat3_a3") },
        { q: t("faq_cat3_q4"), a: t("faq_cat3_a4") },
      ],
    },
    {
      category: t("faq_cat4"),
      questions: [
        { q: t("faq_cat4_q1"), a: t("faq_cat4_a1") },
        { q: t("faq_cat4_q2"), a: t("faq_cat4_a2") },
      ],
    },
    {
      category: t("faq_cat5"),
      questions: [
        { q: t("faq_cat5_q1"), a: t("faq_cat5_a1") },
        { q: t("faq_cat5_q2"), a: t("faq_cat5_a2") },
        { q: t("faq_cat5_q3"), a: t("faq_cat5_a3") },
      ],
    },
    {
      category: t("faq_cat6"),
      questions: [
        { q: t("faq_cat6_q1"), a: t("faq_cat6_a1") },
        { q: t("faq_cat6_q2"), a: t("faq_cat6_a2") },
      ],
    },
  ];

  function fadeUp(delay: number): React.CSSProperties {
    return {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    };
  }

  return (
    <>
      <style>{`
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: BG,
          paddingTop: "clamp(100px, 14vh, 160px)",
          paddingBottom: "clamp(60px, 8vh, 100px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          {/* Badge */}
          <div style={{
            ...fadeUp(0),
            display: "inline-flex", alignItems: "center",
            border: "1px solid rgba(124,58,237,0.45)",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 28,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: ACCENT_L,
            background: "rgba(124,58,237,0.08)",
          }}>
            {t("faq_badge")}
          </div>

          {/* Title */}
          <h1 style={{
            ...fadeUp(100),
            fontSize: "clamp(38px, 6vw, 70px)",
            fontWeight: 800,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            margin: "0 0 20px",
          }}>
            {t("faq_title1")}{" "}
            <span style={{
              ...serif,
              backgroundImage: `linear-gradient(90deg, ${ACCENT_L}, #c4b5fd, ${ACCENT_L}, #c4b5fd)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer-text 4s linear infinite",
            }}>
              {t("faq_title2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            ...fadeUp(200),
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            maxWidth: 520,
            margin: "0 auto",
          }}>
            {t("faq_sub")}
          </p>
        </div>
      </section>

      {/* ── FAQ SECTIONS ─────────────────────────────────────────── */}
      <section style={{
        background: BG,
        padding: "clamp(60px, 8vh, 100px) 24px clamp(80px, 10vh, 140px)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {faqs.map((section, i) => (
              <FAQCategory
                key={section.category}
                category={section.category}
                questions={section.questions}
                baseDelay={i * 60}
              />
            ))}
          </div>

          {/* ── Still have questions CTA ─────────────────────────── */}
          <div style={{
            marginTop: 64,
            background: "rgba(124,58,237,0.07)",
            border: "1px solid rgba(124,58,237,0.25)",
            borderRadius: 20,
            padding: "clamp(28px, 4vw, 48px)",
            textAlign: "center",
          }}>
            <h3 style={{
              fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 800,
              color: "white", marginBottom: 10,
            }}>
              {t("faq_still")}
            </h3>
            <p style={{
              fontSize: 15, color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7, marginBottom: 28,
            }}>
              {t("faq_still_sub")}
            </p>
            <Link
              href="/contact"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: ACCENT,
                color: "white",
                fontWeight: 700, fontSize: 14,
                padding: "13px 28px",
                borderRadius: 50,
                textDecoration: "none",
                transition: "background 0.25s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#9d8df1")}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              {t("faq_still_cta")} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
