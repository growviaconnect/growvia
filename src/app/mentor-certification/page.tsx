"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BadgeCheck, PlayCircle, ClipboardList, Award, ArrowRight, Users, TrendingUp } from "lucide-react";
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

function useCount(target: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return val;
}

function StatCard({ value, suffix, label, delay, active }: { value: number; suffix: string; label: string; delay: number; active: boolean }) {
  const count = useCount(value, active);
  return (
    <div style={{
      background: "rgba(157,141,241,0.06)",
      border: "1px solid rgba(157,141,241,0.15)",
      borderRadius: 12,
      padding: "20px 16px",
      textAlign: "center",
      ...fadeUp(active, delay),
    }}>
      <p style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 900, color: "white", lineHeight: 1, marginBottom: 6 }}>
        {count}{suffix}
      </p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{label}</p>
    </div>
  );
}

export default function MentorCertificationPage() {
  const { t } = useLang();
  const [heroVisible, setHeroVisible] = useState(false);
  const [hoveredStep, setHoveredStep]   = useState<number | null>(null);
  const [hoveredCard, setHoveredCard]   = useState<number | null>(null);

  const { ref: processRef, visible: processVisible } = useVisible(0.1);
  const { ref: impactRef,  visible: impactVisible  } = useVisible(0.1);
  const { ref: statsRef,   visible: statsVisible   } = useVisible(0.15);
  const { ref: ctaRef,     visible: ctaVisible     } = useVisible(0.15);

  useEffect(() => {
    const id = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(id);
  }, []);

  const steps = [
    { num: "01", icon: PlayCircle,    title: t("cert_s1_title"), desc: t("cert_s1_desc") },
    { num: "02", icon: ClipboardList, title: t("cert_s2_title"), desc: t("cert_s2_desc") },
    { num: "03", icon: Award,         title: t("cert_s3_title"), desc: t("cert_s3_desc") },
  ];

  const stats = [
    { value: 500,  suffix: "+", label: "Mentors certifiés" },
    { value: 98,   suffix: "%", label: "Taux de satisfaction" },
    { value: 45,   suffix: " min", label: "Durée moyenne" },
    { value: 100,  suffix: "%", label: "Gratuit pour les mentors" },
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.0); }
          50%       { box-shadow: 0 0 0 6px rgba(124,58,237,0.12); }
        }
        @keyframes badge-glow {
          0%, 100% { filter: drop-shadow(0 0 16px rgba(157,141,241,0.3)); }
          50%       { filter: drop-shadow(0 0 28px rgba(157,141,241,0.55)); }
        }
        .cert-step-card {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .cert-step-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(124,58,237,0.1);
        }
        .cert-impact-card {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .cert-impact-card:hover {
          transform: translateY(-3px);
          border-color: rgba(157,141,241,0.4) !important;
          box-shadow: 0 8px 32px rgba(124,58,237,0.1);
        }
        .cert-cta-btn {
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.25s ease;
        }
        .cert-cta-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }
        .cert-cta-btn:hover::after { transform: translateX(100%); }
        .cert-cta-btn:hover { box-shadow: 0 4px 24px rgba(124,58,237,0.45); }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{
        background: BG,
        paddingTop: "clamp(100px, 14vh, 160px)",
        paddingBottom: "clamp(60px, 8vh, 100px)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700, height: 450,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 740, margin: "0 auto", padding: "0 24px" }}>
          {/* Badge */}
          <div style={{
            ...fadeUp(heroVisible, 0),
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid rgba(124,58,237,0.45)", borderRadius: 100,
            padding: "6px 16px", marginBottom: 28,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
            color: ACCENT_L, background: "rgba(124,58,237,0.08)",
            animation: "badge-pulse 3s ease-in-out infinite",
          }}>
            <BadgeCheck style={{ width: 13, height: 13 }} />
            {t("cert_badge")}
          </div>

          {/* Title */}
          <h1 style={{
            ...fadeUp(heroVisible, 0.08),
            fontSize: "clamp(36px, 6vw, 68px)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            margin: "0 0 20px",
          }}>
            {t("cert_title1")}{" "}
            <span style={{
              ...serif,
              backgroundImage: `linear-gradient(90deg, ${ACCENT_L}, #c4b5fd, ${ACCENT_L}, #c4b5fd)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "shimmer-text 4s linear infinite",
            }}>
              {t("cert_title2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            ...fadeUp(heroVisible, 0.16),
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            maxWidth: 560,
            margin: "0 auto",
          }}>
            {t("cert_sub")}
          </p>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section ref={statsRef} style={{ background: BG, padding: "0 0 clamp(48px, 6vw, 72px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}
            className="cert-stats-grid">
            {stats.map((s, i) => (
              <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} delay={i * 0.07} active={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ───────────────────────────────────────────────────── */}
      <section ref={processRef} style={{ background: BG, padding: "clamp(60px, 8vw, 100px) 0", borderTop: "1px solid rgba(124,58,237,0.08)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px)" }}>
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: 56, ...fadeUp(processVisible, 0) }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: ACCENT, marginBottom: 14 }}>
              ✦ {t("cert_process_label")}
            </p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800, color: "white", letterSpacing: "-0.022em", margin: "0 0 12px" }}>
              {t("cert_process_title")}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 420, margin: "0 auto" }}>
              {t("cert_process_sub")}
            </p>
          </div>

          {/* Steps grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, position: "relative" }}
            className="cert-steps-grid">
            {/* Dashed connector — desktop only */}
            <div className="cert-connector" style={{
              position: "absolute",
              top: 44,
              left: "calc(33.33% - 8px)",
              right: "calc(33.33% - 8px)",
              height: 1,
              borderTop: "1px dashed rgba(157,141,241,0.25)",
              pointerEvents: "none",
              zIndex: 0,
            }} />

            {steps.map((step, i) => (
              <div
                key={step.num}
                className="cert-step-card"
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  background: hoveredStep === i ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${hoveredStep === i ? "rgba(157,141,241,0.35)" : "rgba(157,141,241,0.12)"}`,
                  borderRadius: 14,
                  padding: 24,
                  position: "relative",
                  zIndex: 1,
                  ...fadeUp(processVisible, i * 0.12 + 0.05),
                }}
              >
                {/* Decorative number */}
                <span style={{
                  position: "absolute", top: 12, right: 16,
                  fontSize: 52, fontWeight: 900,
                  color: "rgba(157,141,241,0.12)",
                  lineHeight: 1, pointerEvents: "none", userSelect: "none",
                }}>
                  {step.num}
                </span>

                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, position: "relative", zIndex: 1,
                }}>
                  <step.icon style={{ width: 22, height: 22, color: "white" }} />
                </div>

                {/* Step label */}
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 }}>
                  {t("cert_step")} {step.num}
                </p>

                {/* Title */}
                <h3 style={{ fontWeight: 700, color: "white", fontSize: 16, marginBottom: 10, lineHeight: 1.3 }}>
                  {step.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT ────────────────────────────────────────────────────── */}
      <section ref={impactRef} style={{ background: BG, padding: "clamp(60px, 8vw, 100px) 0", borderTop: "1px solid rgba(124,58,237,0.08)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px)" }}>
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: 48, ...fadeUp(impactVisible, 0) }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: ACCENT, marginBottom: 14 }}>
              ✦ {t("cert_impact_label")}
            </p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800, color: "white", letterSpacing: "-0.022em", margin: "0 0 12px" }}>
              {t("cert_impact_title")}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>
              {t("cert_impact_sub")}
            </p>
          </div>

          {/* Two cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
            className="cert-impact-grid">
            {[
              { icon: Users,     label: t("cert_mentees_label"), title: t("cert_mentees_title"), desc: t("cert_mentees_desc"), delay: 0.05 },
              { icon: TrendingUp, label: t("cert_mentors_label"), title: t("cert_mentors_title"), desc: t("cert_mentors_desc"), delay: 0.12 },
            ].map((card, i) => (
              <div
                key={card.label}
                className="cert-impact-card"
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: hoveredCard === i ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${hoveredCard === i ? "rgba(157,141,241,0.4)" : "rgba(157,141,241,0.12)"}`,
                  borderRadius: 14,
                  padding: "28px 28px",
                  ...fadeUp(impactVisible, card.delay),
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 18,
                }}>
                  <card.icon style={{ width: 22, height: 22, color: "white" }} />
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>
                  {card.label}
                </p>
                <h3 style={{ fontWeight: 700, color: "white", fontSize: 18, marginBottom: 12, lineHeight: 1.3 }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section ref={ctaRef} style={{ background: BG, padding: "clamp(60px, 8vw, 100px) 0 clamp(80px, 10vw, 120px)", borderTop: "1px solid rgba(124,58,237,0.08)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px)" }}>
          <div style={{
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(157,141,241,0.3)",
            borderRadius: 20,
            padding: "clamp(40px, 6vw, 64px) clamp(28px, 5vw, 56px)",
            textAlign: "center",
            boxShadow: "0 0 60px rgba(124,58,237,0.1)",
            ...fadeUp(ctaVisible, 0),
          }}>
            {/* Badge icon */}
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 64, height: 64, borderRadius: "50%",
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`,
              marginBottom: 24,
              animation: "badge-glow 3s ease-in-out infinite",
            }}>
              <BadgeCheck style={{ width: 30, height: 30, color: "white" }} />
            </div>

            <h2 style={{
              fontSize: "clamp(24px, 3.5vw, 38px)",
              fontWeight: 800, color: "white",
              letterSpacing: "-0.022em",
              margin: "0 0 16px",
            }}>
              {t("cert_cta_title")}
            </h2>

            <p style={{
              fontSize: 15, color: "rgba(255,255,255,0.5)",
              lineHeight: 1.75, maxWidth: 480, margin: "0 auto 32px",
            }}>
              {t("cert_cta_sub")}
            </p>

            <Link
              href="/auth/register?role=mentor"
              className="cert-cta-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`,
                color: "white", fontWeight: 700, fontSize: 15,
                padding: "14px 32px", borderRadius: 50,
                textDecoration: "none",
              }}
            >
              {t("cert_cta_btn")} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>

            <p style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
              Moins d&apos;une heure · Gratuit pour les mentors approuvés
            </p>
          </div>
        </div>
      </section>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .cert-steps-grid  { grid-template-columns: 1fr !important; }
          .cert-impact-grid { grid-template-columns: 1fr !important; }
          .cert-stats-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .cert-connector   { display: none !important; }
        }
        @media (max-width: 480px) {
          .cert-stats-grid  { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}
