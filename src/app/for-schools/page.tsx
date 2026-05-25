"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap, BarChart3, Users, CheckCircle, ArrowRight,
  Shield, Sparkles, Send, BookOpen, TrendingUp,
} from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const BG       = "#0D0A1A";
const ACCENT   = "#7C3AED";
const ACCENT_L = "#A78BFA";

const serif = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

// ── Scroll reveal hook ────────────────────────────────────────────
function useVisible(threshold = 0.1) {
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

function fadeUp(visible: boolean, delay: number): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
  };
}

// ── Count-up hook ─────────────────────────────────────────────────
function useCountUp(target: string, triggered: boolean) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!triggered) return;
    const suffix = target.replace(/[\d,]/g, "");
    const num = parseInt(target.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) { setDisplay(target); return; }
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = num / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= num) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start).toLocaleString() + suffix);
    }, step);
    return () => clearInterval(timer);
  }, [triggered, target]);
  return display;
}

// ── Stat card with count-up ───────────────────────────────────────
function StatCard({ value, label, delay, visible }: {
  value: string; label: string; delay: number; visible: boolean;
}) {
  const [hov, setHov] = useState(false);
  const display = useCountUp(value, visible);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(157,141,241,0.06)",
        border: `1px solid ${hov ? "rgba(157,141,241,0.4)" : "rgba(157,141,241,0.15)"}`,
        borderRadius: 12, padding: "24px 20px", textAlign: "center",
        transform: hov ? "scale(1.02)" : "scale(1)",
        transition: "all 0.25s ease",
        ...fadeUp(visible, delay),
      }}
    >
      <div style={{
        fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800,
        color: "white", lineHeight: 1, marginBottom: 8,
        backgroundImage: `linear-gradient(135deg, white, ${ACCENT_L})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        {display}
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{label}</div>
    </div>
  );
}

// ── Hover feature card ────────────────────────────────────────────
function FeatureCard({
  Icon, title, desc, delay, visible,
}: {
  Icon: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string; desc: string; delay: number; visible: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? "rgba(157,141,241,0.4)" : "rgba(157,141,241,0.12)"}`,
        borderRadius: 14, padding: 24,
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? "0 8px 32px rgba(157,141,241,0.1)" : "none",
        transition: "all 0.25s ease",
        ...fadeUp(visible, delay),
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, marginBottom: 16,
        background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.28)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon style={{ width: 20, height: 20, color: ACCENT_L } as React.CSSProperties} />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: "white", marginBottom: 8 }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: "rgba(200,190,230,0.7)", lineHeight: 1.7, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function ForSchoolsPage() {
  const { t } = useLang();
  const [submitted, setSubmitted]   = useState(false);
  const [form, setForm]             = useState({ name: "", institution: "", email: "", message: "" });
  const [focused, setFocused]       = useState<string | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);

  const { ref: benefitsRef, visible: benefitsVis } = useVisible();
  const { ref: hiwRef,      visible: hiwVis      } = useVisible();
  const { ref: dashRef,     visible: dashVis     } = useVisible();
  const { ref: statsRef,    visible: statsVis    } = useVisible();
  const { ref: formRef,     visible: formVis     } = useVisible();

  useEffect(() => {
    const id = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const benefits = [
    { Icon: GraduationCap, title: t("schools_b1_title"), desc: t("schools_b1_desc") },
    { Icon: BarChart3,      title: t("schools_b2_title"), desc: t("schools_b2_desc") },
    { Icon: Users,          title: t("schools_b3_title"), desc: t("schools_b3_desc") },
    { Icon: Shield,         title: t("schools_b4_title"), desc: t("schools_b4_desc") },
    { Icon: Sparkles,       title: t("schools_b5_title"), desc: t("schools_b5_desc") },
    { Icon: BookOpen,       title: t("schools_b6_title"), desc: t("schools_b6_desc") },
  ];

  const dashboardFeatures = [
    t("schools_f1"), t("schools_f2"), t("schools_f3"),
    t("schools_f4"), t("schools_f5"), t("schools_f6"),
  ];

  const steps = [
    { num: "01", title: t("schools_step1_title"), desc: t("schools_step1_desc") },
    { num: "02", title: t("schools_step2_title"), desc: t("schools_step2_desc") },
    { num: "03", title: t("schools_step3_title"), desc: t("schools_step3_desc") },
    { num: "04", title: t("schools_step4_title"), desc: t("schools_step4_desc") },
  ];

  const dashboardStats = [
    { label: t("schools_stat_students"),      value: "142", trend: t("schools_stat_trend1") },
    { label: t("schools_stat_sessions"),      value: "89",  trend: t("schools_stat_trend2") },
    { label: t("schools_stat_mentors"),       value: "28",  trend: t("schools_stat_trend3") },
    { label: t("schools_stat_participation"), value: "76%", trend: t("schools_stat_trend4") },
  ];

  const pageStats = [
    { value: "50+",    label: t("schools_stats_partners") },
    { value: "5000+",  label: t("schools_stats_students") },
    { value: "94%",    label: t("schools_stats_satisfaction") },
    { value: "3x",     label: t("schools_stats_decisions") },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%", padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused === name ? "#9d8df1" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10, color: "white", fontSize: 14, outline: "none",
    boxShadow: focused === name ? "0 0 0 3px rgba(157,141,241,0.15)" : "none",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    boxSizing: "border-box" as const,
  });

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: "0.04em",
  };

  function heroFade(delay: number): React.CSSProperties {
    return {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    };
  }

  return (
    <>
      <style>{`
        @keyframes shimmer-sweep {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
        .schools-demo-btn:hover { background: #9d8df1 !important; }
        .schools-ghost-btn:hover {
          background: rgba(124,58,237,0.12) !important;
          border-color: rgba(157,141,241,0.6) !important;
        }
        .schools-submit:hover { background: #9d8df1 !important; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        background: BG,
        paddingTop: "clamp(110px, 15vh, 180px)",
        paddingBottom: "clamp(70px, 9vh, 120px)",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "80%", height: "60%",
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          {/* Badge */}
          <div style={{
            ...heroFade(0),
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid rgba(124,58,237,0.45)", borderRadius: 100,
            padding: "6px 16px", marginBottom: 28,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
            textTransform: "uppercase", color: ACCENT_L,
            background: "rgba(124,58,237,0.08)",
          }}>
            <GraduationCap style={{ width: 13, height: 13 } as React.CSSProperties} />
            {t("schools_badge")}
          </div>

          {/* Title */}
          <h1 style={{
            ...heroFade(100),
            fontSize: "clamp(32px, 5.5vw, 64px)", fontWeight: 800,
            color: "white", lineHeight: 1.1, letterSpacing: "-0.025em",
            margin: "0 0 20px",
          }}>
            <span style={{
              ...serif,
              backgroundImage: `linear-gradient(90deg, white, #c4b5fd, white, #c4b5fd)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer-sweep 5s linear infinite",
            }}>
              {t("schools_hero_title")}
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            ...heroFade(200),
            fontSize: "clamp(15px, 1.9vw, 18px)", color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75, maxWidth: 560, margin: "0 auto 36px",
          }}>
            {t("schools_hero_sub")}
          </p>

          {/* CTAs */}
          <div style={{
            ...heroFade(300),
            display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center",
          }}>
            <button
              className="schools-demo-btn"
              onClick={() => document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: ACCENT, color: "white",
                fontWeight: 700, fontSize: 14,
                padding: "14px 30px", borderRadius: 50,
                border: "none", cursor: "pointer",
                transition: "background 0.25s ease",
              }}
            >
              {t("schools_hero_demo")} <ArrowRight style={{ width: 16, height: 16 } as React.CSSProperties} />
            </button>
            <Link
              href="/contact"
              className="schools-ghost-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid rgba(124,58,237,0.45)", borderRadius: 50,
                padding: "13px 28px", fontSize: 14, fontWeight: 600,
                color: ACCENT_L, textDecoration: "none",
                transition: "background 0.25s ease, border-color 0.25s ease",
              }}
            >
              {t("schools_hero_contact")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────── */}
      <section style={{
        background: BG,
        padding: "clamp(60px,8vh,100px) clamp(20px,5vw,80px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div ref={benefitsRef} style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Eyebrow */}
          <div style={{ ...fadeUp(benefitsVis, 0), marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>
              {t("schools_why_label") || "Pourquoi GrowVia"}
            </p>
            <div style={{ height: 1, background: "linear-gradient(to right, rgba(124,58,237,0.4), transparent)", marginBottom: 24 }} />
          </div>

          <h2 style={{
            ...fadeUp(benefitsVis, 60),
            fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800,
            color: "white", lineHeight: 1.15, margin: "0 0 10px",
            letterSpacing: "-0.02em",
          }}>
            {t("schools_why_title")}
          </h2>
          <p style={{
            ...fadeUp(benefitsVis, 120),
            fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75,
            maxWidth: 560, marginBottom: 40,
          }}>
            {t("schools_why_sub")}
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 14,
          }}>
            {benefits.map((b, i) => (
              <FeatureCard
                key={b.title}
                Icon={b.Icon}
                title={b.title}
                desc={b.desc}
                delay={160 + i * 60}
                visible={benefitsVis}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section style={{
        background: BG,
        padding: "clamp(60px,8vh,100px) clamp(20px,5vw,80px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div ref={hiwRef} style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Eyebrow */}
          <div style={{ ...fadeUp(hiwVis, 0), marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>
              {t("schools_hiw_label")}
            </p>
            <div style={{ height: 1, background: "linear-gradient(to right, rgba(124,58,237,0.4), transparent)", marginBottom: 24 }} />
          </div>

          <h2 style={{
            ...fadeUp(hiwVis, 60),
            fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800,
            color: "white", lineHeight: 1.15, margin: "0 0 40px",
            letterSpacing: "-0.02em",
          }}>
            {t("schools_hiw_title")}
          </h2>

          {/* Steps — horizontal on desktop, vertical on mobile */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
            gap: 16, position: "relative",
          }}>
            {/* Dashed connector line (desktop only) */}
            {!isMobile && (
              <div style={{
                position: "absolute",
                top: 36, left: "12.5%", right: "12.5%",
                height: 1,
                backgroundImage: "repeating-linear-gradient(to right, rgba(124,58,237,0.3) 0px, rgba(124,58,237,0.3) 6px, transparent 6px, transparent 14px)",
                pointerEvents: "none", zIndex: 0,
              }} />
            )}

            {steps.map((step, i) => (
              <div
                key={step.num}
                style={{
                  position: "relative", zIndex: 1,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(157,141,241,0.15)",
                  borderRadius: 14, padding: "24px 20px",
                  ...fadeUp(hiwVis, 120 + i * 120),
                }}
              >
                {/* Decorative large number */}
                <div style={{
                  position: "absolute", top: 10, right: 14,
                  fontSize: 52, fontWeight: 800, lineHeight: 1,
                  color: "rgba(157,141,241,0.1)", pointerEvents: "none",
                  userSelect: "none",
                }}>
                  {step.num}
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", marginBottom: 14,
                  background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: ACCENT_L,
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: "rgba(200,190,230,0.65)", lineHeight: 1.65, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Dashboard preview */}
          <div
            ref={dashRef}
            style={{
              marginTop: 56,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(157,141,241,0.2)",
              borderRadius: 16, padding: "clamp(20px,3vw,36px)",
              ...fadeUp(dashVis, 0),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>
                {t("schools_dashboard_title")}
              </h3>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 11, fontWeight: 600, color: "#10b981",
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
                padding: "4px 10px", borderRadius: 20,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", background: "#10b981",
                  animation: "live-pulse 2s ease-in-out infinite",
                  display: "inline-block",
                }} />
                {t("schools_dashboard_live")}
              </span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
              gap: 12, marginBottom: 24,
            }}>
              {dashboardStats.map((stat) => (
                <div key={stat.label} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(157,141,241,0.12)",
                  borderRadius: 12, padding: "16px 14px",
                }}>
                  <div style={{
                    fontSize: "clamp(22px,2.5vw,28px)", fontWeight: 800,
                    color: "white", lineHeight: 1, marginBottom: 4,
                    backgroundImage: `linear-gradient(135deg, white, ${ACCENT_L})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#10b981" }}>{stat.trend}</div>
                </div>
              ))}
            </div>

            <div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
                {t("schools_features_label")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dashboardFeatures.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="8" height="7" viewBox="0 0 8 7" fill="none" aria-hidden="true">
                        <path d="M1 3.5L3 5.5L7 1.5" stroke={ACCENT_L} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(200,190,230,0.8)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section style={{
        background: BG,
        padding: "clamp(48px,6vh,80px) clamp(20px,5vw,80px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div ref={statsRef} style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: 14,
          }}>
            {pageStats.map((stat, i) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                delay={i * 80}
                visible={statsVis}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO FORM ────────────────────────────────────────────── */}
      <section
        id="demo-form"
        style={{
          background: BG,
          padding: "clamp(60px,8vh,100px) clamp(20px,5vw,80px)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div ref={formRef} style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36, ...fadeUp(formVis, 0) }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: ACCENT, marginBottom: 14 }}>
              {t("schools_form_eyebrow") || "Démo Gratuite"}
            </p>
            <h2 style={{
              fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 800,
              color: "white", lineHeight: 1.15, margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}>
              {t("schools_form_title")}
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
              {t("schools_form_sub")}
            </p>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(157,141,241,0.15)",
            borderRadius: 16,
            padding: isMobile ? "24px 20px" : "36px 40px",
            ...fadeUp(formVis, 100),
          }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 16, margin: "0 auto 18px",
                  background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <TrendingUp style={{ width: 26, height: 26, color: ACCENT_L } as React.CSSProperties} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10 }}>
                  {t("schools_success_title")}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                  {t("schools_success_sub")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>{t("schools_form_name")}</label>
                    <input type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                      placeholder={t("schools_form_name_ph")} style={inputStyle("name")} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t("schools_form_institution")}</label>
                    <input type="text" required value={form.institution}
                      onChange={(e) => setForm({ ...form, institution: e.target.value })}
                      onFocus={() => setFocused("institution")} onBlur={() => setFocused(null)}
                      placeholder={t("schools_form_inst_ph")} style={inputStyle("institution")} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t("schools_form_email")}</label>
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                    placeholder={t("schools_form_email_ph")} style={inputStyle("email")} />
                </div>
                <div>
                  <label style={labelStyle}>{t("schools_form_message")}</label>
                  <textarea value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                    placeholder={t("schools_form_msg_ph")}
                    style={{ ...inputStyle("message"), minHeight: 120, resize: "vertical", fontFamily: "inherit" }} />
                </div>
                <button type="submit" className="schools-submit" style={{
                  width: "100%", background: ACCENT, color: "white",
                  fontWeight: 700, fontSize: 15, padding: "14px 24px",
                  borderRadius: 50, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.25s ease",
                }}>
                  {t("schools_form_submit")} <Send style={{ width: 16, height: 16 } as React.CSSProperties} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
