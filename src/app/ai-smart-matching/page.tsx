"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle, ArrowRight, Zap, Target, Brain, BarChart3, Lock, TrendingUp } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const BG       = "#0D0A1A";
const ACCENT   = "#7C3AED";
const ACCENT_L = "#A78BFA";

const serif = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle:  "italic" as const,
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

function fadeUp(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity:    visible ? 1 : 0,
    transform:  visible ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
  };
}

const mockMentors = [
  { initials: "MA", role: "Product Manager · Scale-up Tech", pct: 98, tags: ["Reconversion", "Produit"] },
  { initials: "MB", role: "Fondateur · Startup Paris", pct: 94, tags: ["Entrepreneuriat", "Business"] },
  { initials: "MC", role: "DRH · Groupe international", pct: 89, tags: ["Développement personnel", "Carrière"] },
];

export default function AISmartMatchingPage() {
  const { t } = useLang();
  const [heroVisible, setHeroVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const { ref: sectionRef,   visible: sectionVisible   } = useVisible(0.1);
  const { ref: featuresRef,  visible: featuresVisible  } = useVisible(0.1);
  const { ref: stepsRef,     visible: stepsVisible     } = useVisible(0.1);
  const { ref: ctaRef,       visible: ctaVisible       } = useVisible(0.1);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { icon: Brain,    title: t("ai_feat1_title"), desc: t("ai_feat1_desc") },
    { icon: Target,   title: t("ai_feat2_title"), desc: t("ai_feat2_desc") },
    { icon: BarChart3, title: t("ai_feat3_title"), desc: t("ai_feat3_desc") },
    { icon: Lock,     title: t("ai_feat4_title"), desc: t("ai_feat4_desc") },
  ];

  const steps = [
    { num: "01", label: t("ai_s1_label"), desc: t("ai_s1_desc") },
    { num: "02", label: t("ai_s2_label"), desc: t("ai_s2_desc") },
    { num: "03", label: t("ai_s3_label"), desc: t("ai_s3_desc") },
    { num: "04", label: t("ai_s4_label"), desc: t("ai_s4_desc") },
  ];

  const bullets = [t("ai_f1"), t("ai_f2"), t("ai_f3"), t("ai_f4")];
  const discFeatures = [t("ai_disc_f1"), t("ai_disc_f2"), t("ai_disc_f3")];
  const premFeatures = [t("ai_prem_f1"), t("ai_prem_f2"), t("ai_prem_f3"), t("ai_prem_f4")];

  return (
    <>
      <style>{`
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes mockup-slide-in {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .ai-feat-card {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .ai-feat-card:hover {
          transform: translateY(-3px);
          border-color: rgba(157,141,241,0.4) !important;
          box-shadow: 0 8px 32px rgba(124,58,237,0.12);
        }
        .ai-step-card {
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .ai-mentor-card {
          transition: transform 0.25s ease, border-color 0.25s ease;
          cursor: default;
        }
        .ai-mentor-card:hover {
          transform: translateY(-2px);
          border-color: rgba(157,141,241,0.35) !important;
        }
        .ai-cta-btn {
          transition: background 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .ai-cta-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }
        .ai-cta-btn:hover::after { transform: translateX(100%); }
        .ai-cta-btn:hover { box-shadow: 0 4px 20px rgba(124,58,237,0.4); }
        .ai-ghost-btn {
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .ai-ghost-btn:hover {
          background: rgba(157,141,241,0.08) !important;
          border-color: rgba(157,141,241,0.5) !important;
        }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{ background: BG, paddingTop: "clamp(100px, 14vh, 160px)", paddingBottom: "clamp(60px, 8vh, 100px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Radial glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 450, background: "radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 740, margin: "0 auto", padding: "0 24px" }}>
          {/* Badge pill */}
          <div style={{
            ...fadeUp(heroVisible, 0),
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid rgba(124,58,237,0.45)", borderRadius: 100,
            padding: "6px 16px", marginBottom: 28,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
            color: ACCENT_L, background: "rgba(124,58,237,0.08)",
          }}>
            <Sparkles style={{ width: 13, height: 13 }} />
            {t("ai_badge")}
          </div>

          {/* Title */}
          <h1 style={{ ...fadeUp(heroVisible, 0.08), fontSize: "clamp(38px, 6vw, 70px)", fontWeight: 800, color: "white", lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 20px" }}>
            {t("ai_title1")}{" "}
            <span style={{
              ...serif,
              backgroundImage: `linear-gradient(90deg, ${ACCENT_L}, #c4b5fd, ${ACCENT_L}, #c4b5fd)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "shimmer-text 4s linear infinite",
            }}>
              {t("ai_title2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{ ...fadeUp(heroVisible, 0.16), fontSize: "clamp(16px, 2vw, 19px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: 560, margin: "0 auto" }}>
            {t("ai_sub")}
          </p>
        </div>
      </section>

      {/* ── SECTION : trouver le bon mentor ───────────────────────────── */}
      <section ref={sectionRef} style={{ background: BG, padding: "clamp(60px, 8vw, 100px) 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 5vw, 80px)", alignItems: "center" }}
            className="max-lg:grid-cols-1-ai">
            {/* Left — text */}
            <div style={fadeUp(sectionVisible, 0)}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: ACCENT, marginBottom: 16 }}>
                ✦ {t("ai_how_sub")}
              </p>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800, color: "white", lineHeight: 1.15, letterSpacing: "-0.022em", margin: "0 0 20px" }}>
                {t("ai_section_title")}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 16, fontSize: 15 }}>
                {t("ai_section_p1")}
              </p>
              <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 28, fontSize: 15 }}>
                {t("ai_section_p2")}
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {bullets.map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                    <CheckCircle style={{ width: 16, height: 16, color: ACCENT_L, flexShrink: 0, marginTop: 1 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — mockup */}
            <div style={{
              ...fadeUp(sectionVisible, 0.12),
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(157,141,241,0.2)",
              borderRadius: 16,
              padding: 20,
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ color: ACCENT_L, fontSize: 14 }}>✦</span>
                <span style={{ fontWeight: 700, color: "white", fontSize: 13 }}>{t("ai_matches_title")}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: ACCENT_L, background: "rgba(157,141,241,0.15)", padding: "3px 10px", borderRadius: 50 }}>
                  3 results
                </span>
              </div>

              {/* Mentor cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mockMentors.map((m, i) => (
                  <div
                    key={m.initials}
                    className="ai-mentor-card"
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: hoveredCard === i ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${hoveredCard === i ? "rgba(157,141,241,0.35)" : "rgba(157,141,241,0.12)"}`,
                      borderRadius: 12, padding: 14,
                      animation: sectionVisible ? `card-enter 0.4s ease ${i * 0.1 + 0.2}s both` : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: "white", fontWeight: 700, fontSize: 12 }}>{m.initials}</span>
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: "white", fontSize: 13, marginBottom: 2 }}>Mentor {m.initials.slice(-1)}</p>
                          <p style={{ fontSize: 11, color: "rgba(167,139,250,0.7)" }}>{m.role}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#4ade80", background: "rgba(74,222,128,0.08)", padding: "3px 9px", borderRadius: 50, flexShrink: 0 }}>
                        <TrendingUp style={{ width: 11, height: 11 }} />
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{m.pct}%</span>
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 4, marginBottom: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, #7c6af5, ${ACCENT_L})`, width: `${m.pct}%` }} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {m.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: 11, background: "rgba(157,141,241,0.1)", border: "1px solid rgba(157,141,241,0.2)", color: ACCENT_L, padding: "2px 10px", borderRadius: 50 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section ref={featuresRef} style={{ background: BG, padding: "clamp(60px, 8vw, 100px) 0", borderTop: "1px solid rgba(124,58,237,0.08)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px)" }}>
          <div style={{ textAlign: "center", marginBottom: 56, ...fadeUp(featuresVisible, 0) }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: ACCENT, marginBottom: 14 }}>
              ✦ Features
            </p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, color: "white", letterSpacing: "-0.022em", margin: "0 0 14px" }}>
              {t("ai_how_title")}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
              {t("ai_how_sub")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
            {features.map((f, i) => (
              <div
                key={f.title}
                className="ai-feat-card"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(157,141,241,0.12)",
                  borderRadius: 14, padding: "24px 22px",
                  ...fadeUp(featuresVisible, i * 0.07 + 0.05),
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <f.icon style={{ width: 22, height: 22, color: "white" }} />
                </div>
                <h3 style={{ fontWeight: 700, color: "white", fontSize: 15, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEPS ────────────────────────────────────────────────────── */}
      <section ref={stepsRef} style={{ background: BG, padding: "clamp(60px, 8vw, 100px) 0", borderTop: "1px solid rgba(124,58,237,0.08)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px)" }}>
          <div style={{ textAlign: "center", marginBottom: 48, ...fadeUp(stepsVisible, 0) }}>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, color: "white", letterSpacing: "-0.022em", margin: 0 }}>
              {t("ai_steps_title")}
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="ai-step-card"
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 20,
                  background: hoveredStep === i ? "rgba(157,141,241,0.06)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${hoveredStep === i ? "rgba(157,141,241,0.3)" : "rgba(157,141,241,0.12)"}`,
                  borderRadius: 14, padding: "18px 20px",
                  ...fadeUp(stepsVisible, i * 0.08 + 0.05),
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 900, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", flexShrink: 0, minWidth: 32, lineHeight: 1 }}>
                  {s.num}
                </span>
                <div>
                  <h3 style={{ fontWeight: 700, color: "white", fontSize: 15, marginBottom: 4 }}>{s.label}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / PRICING ────────────────────────────────────────────── */}
      <section ref={ctaRef} style={{ background: BG, padding: "clamp(60px, 8vw, 100px) 0", borderTop: "1px solid rgba(124,58,237,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, ...fadeUp(ctaVisible, 0) }}
            className="max-md:grid-cols-1-ai">

            {/* Discovery card */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(157,141,241,0.18)",
              borderRadius: 18, padding: 28,
              display: "flex", flexDirection: "column",
              ...fadeUp(ctaVisible, 0.05),
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT_L, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{t("ai_disc_label")}</p>
              <p style={{ fontSize: 34, fontWeight: 900, color: "white", margin: "0 0 4px" }}>9.99€</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 22 }}>{t("ai_disc_ai")}</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, flex: 1 }}>
                {discFeatures.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    <CheckCircle style={{ width: 15, height: 15, color: ACCENT_L, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="ai-cta-btn"
                style={{ display: "block", textAlign: "center", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`, color: "white", fontWeight: 700, fontSize: 14, padding: "12px 20px", borderRadius: 50, textDecoration: "none" }}
              >
                {t("ai_disc_btn")}
              </Link>
            </div>

            {/* Premium card */}
            <div style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(157,141,241,0.35)",
              borderRadius: 18, padding: 28,
              display: "flex", flexDirection: "column",
              boxShadow: "0 0 40px rgba(124,58,237,0.15)",
              ...fadeUp(ctaVisible, 0.1),
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT_L, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t("ai_prem_label")}</p>
                <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(157,141,241,0.15)", border: "1px solid rgba(157,141,241,0.4)", color: ACCENT_L, padding: "2px 8px", borderRadius: 50, letterSpacing: "0.08em" }}>
                  ✦ PREMIUM
                </span>
              </div>
              <p style={{ fontSize: 34, fontWeight: 900, color: "white", margin: "0 0 4px" }}>{t("ai_prem_value")}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 22 }}>{t("ai_prem_sub")}</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, flex: 1 }}>
                {premFeatures.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                    <CheckCircle style={{ width: 15, height: 15, color: ACCENT_L, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link
                  href="/pricing"
                  className="ai-cta-btn"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`, color: "white", fontWeight: 700, fontSize: 14, padding: "12px 20px", borderRadius: 50, textDecoration: "none" }}
                >
                  {t("ai_prem_btn")} <ArrowRight style={{ width: 15, height: 15 }} />
                </Link>
                <Link
                  href="/pricing"
                  className="ai-ghost-btn"
                  style={{ display: "block", textAlign: "center", border: "1px solid rgba(157,141,241,0.3)", color: ACCENT_L, fontWeight: 600, fontSize: 13, padding: "11px 20px", borderRadius: 50, textDecoration: "none", background: "transparent" }}
                >
                  Voir les tarifs
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          .max-lg\\:grid-cols-1-ai { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .max-md\\:grid-cols-1-ai { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
