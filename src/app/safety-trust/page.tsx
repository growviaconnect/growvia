"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Shield, CheckCircle, Lock, Eye, UserCheck,
  AlertTriangle, Phone, ArrowRight,
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

function fadeUp(visible: boolean, delay: number): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
  };
}

// ── Hover card wrapper ────────────────────────────────────────────
function DarkCard({
  children, style, delay, visible,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay: number;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(157,141,241,0.4)" : "rgba(157,141,241,0.12)"}`,
        borderRadius: 12,
        padding: "20px 24px",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.25s ease, border-color 0.25s ease, background 0.25s ease",
        ...fadeUp(visible, delay),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Data protection pill row ──────────────────────────────────────
function DataPill({ item, style }: { item: string; style?: React.CSSProperties }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? "rgba(157,141,241,0.35)" : "rgba(157,141,241,0.1)"}`,
        borderRadius: 8,
        padding: "14px 18px",
        transition: "border-color 0.25s ease",
        ...style,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
        background: "rgba(124,58,237,0.15)",
        border: "1px solid rgba(124,58,237,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="9" height="8" viewBox="0 0 9 8" fill="none" aria-hidden="true">
          <path d="M1 4L3.5 6.5L8 1.5" stroke={ACCENT_L} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontSize: 13, color: "rgba(200,190,230,0.8)", lineHeight: 1.6 }}>
        {item}
      </span>
    </div>
  );
}

// ── Section eyebrow ───────────────────────────────────────────────
function Eyebrow({ label }: { label: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.28em",
        textTransform: "uppercase", color: ACCENT, marginBottom: 10,
      }}>
        {label}
      </p>
      <div style={{
        height: 1,
        background: "linear-gradient(to right, rgba(124,58,237,0.4), transparent)",
      }} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function SafetyTrustPage() {
  const { t } = useLang();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(id);
  }, []);

  const { ref: verifRef,    visible: verifVis    } = useVisible();
  const { ref: sessionRef,  visible: sessionVis  } = useVisible();
  const { ref: dataRef,     visible: dataVis     } = useVisible();
  const { ref: concernRef,  visible: concernVis  } = useVisible();

  const verificationSteps = [
    { label: t("safety_v1_label"), desc: t("safety_v1_desc") },
    { label: t("safety_v2_label"), desc: t("safety_v2_desc") },
    { label: t("safety_v3_label"), desc: t("safety_v3_desc") },
    { label: t("safety_v4_label"), desc: t("safety_v4_desc") },
  ];

  const processSteps = [
    t("safety_verif_step1"),
    t("safety_verif_step2"),
    t("safety_verif_step3"),
    t("safety_verif_step4"),
  ];

  const sessionCards = [
    { icon: Lock,          title: t("safety_s1_title"), desc: t("safety_s1_desc") },
    { icon: Eye,           title: t("safety_s2_title"), desc: t("safety_s2_desc") },
    { icon: UserCheck,     title: t("safety_s3_title"), desc: t("safety_s3_desc") },
    { icon: Shield,        title: t("safety_s4_title"), desc: t("safety_s4_desc") },
    { icon: AlertTriangle, title: t("safety_s5_title"), desc: t("safety_s5_desc") },
    { icon: Phone,         title: t("safety_s6_title"), desc: t("safety_s6_desc") },
  ];

  const dataItems = [
    t("safety_d1"), t("safety_d2"), t("safety_d3"),
    t("safety_d4"), t("safety_d5"), t("safety_d6"),
  ];

  function heroFadeUp(delay: number): React.CSSProperties {
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
        .safety-submit:hover { background: #9d8df1 !important; }
        .safety-ghost:hover {
          background: rgba(124,58,237,0.12) !important;
          color: #c4b5fd !important;
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        background: BG,
        paddingTop: "clamp(100px, 14vh, 160px)",
        paddingBottom: "clamp(60px, 8vh, 100px)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            ...heroFadeUp(0),
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
            {t("safety_badge")}
          </div>

          <h1 style={{
            ...heroFadeUp(100),
            fontSize: "clamp(36px, 5.5vw, 66px)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            margin: "0 0 20px",
          }}>
            {t("safety_title1")}{" "}
            <span style={{
              ...serif,
              backgroundImage: `linear-gradient(90deg, ${ACCENT_L}, #c4b5fd, ${ACCENT_L}, #c4b5fd)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer-text 4s linear infinite",
            }}>
              {t("safety_title2")}
            </span>
          </h1>

          <p style={{
            ...heroFadeUp(200),
            fontSize: "clamp(15px, 1.9vw, 18px)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            maxWidth: 560,
            margin: "0 auto",
          }}>
            {t("safety_sub")}
          </p>
        </div>
      </section>

      {/* ── SECTION 1 — Mentor Verification ──────────────────────── */}
      <section style={{
        background: BG,
        padding: "clamp(60px, 8vh, 100px) clamp(24px, 5vw, 80px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div ref={verifRef} style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Eyebrow label={t("safety_verif_label")} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "clamp(32px, 5vw, 72px)",
            alignItems: "start",
          }}>
            {/* Left — steps + description */}
            <div>
              <h2 style={{
                ...fadeUp(verifVis, 0),
                fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800,
                color: "white", lineHeight: 1.15, margin: "0 0 16px",
                letterSpacing: "-0.02em",
              }}>
                {t("safety_verif_title")}
              </h2>
              <p style={{
                ...fadeUp(verifVis, 80),
                fontSize: 15, color: "rgba(255,255,255,0.45)",
                lineHeight: 1.75, marginBottom: 28,
              }}>
                {t("safety_verif_sub")}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {verificationSteps.map((item, i) => (
                  <DarkCard key={item.label} delay={160 + i * 70} visible={verifVis}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: "rgba(124,58,237,0.15)",
                        border: "1px solid rgba(124,58,237,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CheckCircle style={{ width: 15, height: 15, color: ACCENT_L }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 3 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(200,190,230,0.7)", lineHeight: 1.6 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  </DarkCard>
                ))}
              </div>
            </div>

            {/* Right — verification pipeline */}
            <div style={{ ...fadeUp(verifVis, 200) }}>
              <div style={{
                background: "rgba(124,58,237,0.05)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 16,
                padding: "28px 24px",
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                {processSteps.map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(124,58,237,0.18)",
                      border: "1px solid rgba(124,58,237,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: ACCENT_L,
                    }}>
                      {i + 1}
                    </div>
                    {/* dashed connector */}
                    <div style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(157,141,241,0.12)",
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
                        {step}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Final — Mentor Vérifié */}
                <div style={{
                  marginTop: 4,
                  background: "rgba(124,58,237,0.2)",
                  border: "1px solid rgba(124,58,237,0.5)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 10,
                  boxShadow: "0 0 20px rgba(124,58,237,0.15)",
                }}>
                  <CheckCircle style={{ width: 18, height: 18, color: ACCENT_L, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT_L }}>
                    {t("safety_verif_badge")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — Sessions sécurisées ──────────────────────── */}
      <section style={{
        background: BG,
        padding: "clamp(60px, 8vh, 100px) clamp(24px, 5vw, 80px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div ref={sessionRef} style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Eyebrow label={t("safety_sessions_title")} />

          <div style={{ marginBottom: 40 }}>
            <h2 style={{
              ...fadeUp(sessionVis, 0),
              fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800,
              color: "white", lineHeight: 1.15, margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}>
              {t("safety_sessions_title")}
            </h2>
            <p style={{
              ...fadeUp(sessionVis, 80),
              fontSize: 15, color: "rgba(255,255,255,0.45)",
              lineHeight: 1.75, maxWidth: 560,
            }}>
              {t("safety_sessions_sub")}
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}>
            {sessionCards.map((item, i) => (
              <DarkCard key={item.title} delay={120 + i * 60} visible={sessionVis}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.28)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <item.icon style={{ width: 18, height: 18, color: ACCENT_L }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 5 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(200,190,230,0.7)", lineHeight: 1.65 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              </DarkCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — Protection des données ───────────────────── */}
      <section style={{
        background: BG,
        padding: "clamp(60px, 8vh, 100px) clamp(24px, 5vw, 80px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div ref={dataRef} style={{ maxWidth: 860, margin: "0 auto" }}>
          <Eyebrow label={t("safety_data_title")} />

          <h2 style={{
            ...fadeUp(dataVis, 0),
            fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800,
            color: "white", lineHeight: 1.15, margin: "0 0 12px",
            letterSpacing: "-0.02em",
          }}>
            {t("safety_data_title")}
          </h2>
          <p style={{
            ...fadeUp(dataVis, 80),
            fontSize: 15, color: "rgba(255,255,255,0.45)",
            lineHeight: 1.75, marginBottom: 32,
          }}>
            {t("safety_data_sub")}
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 10,
            marginBottom: 36,
          }}>
            {dataItems.map((item, i) => (
              <DataPill key={i} item={item} style={fadeUp(dataVis, 120 + i * 50)} />
            ))}
          </div>

          <div style={{ ...fadeUp(dataVis, 420), textAlign: "center" }}>
            <Link
              href="/legal/privacy"
              className="safety-ghost"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid rgba(124,58,237,0.45)",
                borderRadius: 10,
                padding: "11px 22px",
                fontSize: 13, fontWeight: 600, color: ACCENT_L,
                textDecoration: "none",
                transition: "background 0.25s ease, color 0.25s ease",
              }}
            >
              {t("safety_privacy_link")} <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — Préoccupation de sécurité ────────────────── */}
      <section style={{
        background: BG,
        padding: "clamp(60px, 8vh, 100px) clamp(24px, 5vw, 80px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div ref={concernRef} style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              ...fadeUp(concernVis, 0),
              background: "rgba(124,58,237,0.07)",
              border: "1px solid rgba(124,58,237,0.28)",
              borderRadius: 20,
              padding: "clamp(32px, 5vw, 56px)",
              boxShadow: "0 0 48px rgba(124,58,237,0.08)",
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14, margin: "0 auto 20px",
              background: "rgba(124,58,237,0.18)",
              border: "1px solid rgba(124,58,237,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield style={{ width: 24, height: 24, color: ACCENT_L }} />
            </div>

            <h2 style={{
              fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800,
              color: "white", marginBottom: 12, letterSpacing: "-0.02em",
            }}>
              {t("safety_concern_title")}
            </h2>
            <p style={{
              fontSize: 15, color: "rgba(255,255,255,0.45)",
              lineHeight: 1.75, marginBottom: 28,
            }}>
              {t("safety_concern_sub")}
            </p>
            <Link
              href="/contact"
              className="safety-submit"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: ACCENT,
                color: "white",
                fontWeight: 700, fontSize: 15,
                padding: "14px 32px",
                borderRadius: 50,
                textDecoration: "none",
                transition: "background 0.25s ease",
              }}
            >
              {t("safety_concern_cta")} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
