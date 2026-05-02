"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Video, Bell, Clock, CheckCircle, Mail } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const serif = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

const ACCENT       = "#7C3AED";
const ACCENT_LIGHT = "#A78BFA";

// Slightly different bg per card — visual depth as they stack
const CARD_BG = [
  "#0D0A1A",
  "#100D1E",
  "#131023",
  "#161228",
  "#19152D",
  "#1C1832",
  "#1F1B37",
];

// Subtle per-card tilt — organic "physical deck" feel
const CARD_ROTATIONS = [-0.4, 0.3, -0.2, 0.4, -0.3, 0.2, -0.4];

const stepImages = [
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80", // 01 — Créez votre profil
  "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80", // 02 — Match IA
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80", // 03 — Session Découverte
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80",
  "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=900&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
];

export default function HowItWorksPage() {
  const { t } = useLang();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const steps = [
    {
      num: "01", title: t("hiw_s1_title"), desc: t("hiw_s1_desc"),
      detail: [t("hiw_s1_d1"), t("hiw_s1_d2"), t("hiw_s1_d3")],
      image: stepImages[0],
    },
    {
      num: "02", title: t("hiw_s2_title"), desc: t("hiw_s2_desc"),
      detail: [t("hiw_s2_d1"), t("hiw_s2_d2"), t("hiw_s2_d3")],
      image: stepImages[1],
    },
    {
      num: "03", title: t("hiw_s3_title"), desc: t("hiw_s3_desc"),
      detail: [t("hiw_s3_d1"), t("hiw_s3_d2"), t("hiw_s3_d3")],
      image: stepImages[2],
    },
    {
      num: "04", title: t("hiw_s4_title"), desc: t("hiw_s4_desc"),
      detail: [t("hiw_s4_d1"), t("hiw_s4_d2"), t("hiw_s4_d3")],
      image: stepImages[3],
    },
    {
      num: "05", title: t("hiw_s5_title"), desc: t("hiw_s5_desc"),
      detail: [t("hiw_s5_d1"), t("hiw_s5_d2"), t("hiw_s5_d3")],
      image: stepImages[4],
    },
    {
      num: "06", title: t("hiw_s6_title"), desc: t("hiw_s6_desc"),
      detail: [t("hiw_s6_d1"), t("hiw_s6_d2"), t("hiw_s6_d3")],
      image: stepImages[5],
    },
    {
      num: "07", title: t("hiw_s7_title"), desc: t("hiw_s7_desc"),
      detail: [t("hiw_s7_d1"), t("hiw_s7_d2"), t("hiw_s7_d3")],
      image: stepImages[6],
    },
  ];

  const N = steps.length;

  const sessionCards = [
    { Icon: Video, title: t("hiw_c1_title"), desc: t("hiw_c1_desc") },
    { Icon: Bell,  title: t("hiw_c2_title"), desc: t("hiw_c2_desc") },
    { Icon: Clock, title: t("hiw_c3_title"), desc: t("hiw_c3_desc") },
  ];
  const notifications = [
    { time: "Now",            msg: t("hiw_notif_confirmed"), dot: "#10b981" },
    { time: "Tomorrow 09:00", msg: t("hiw_notif_reminder24"), dot: "#60a5fa" },
    { time: "Tomorrow 09:59", msg: t("hiw_notif_reminder1"),  dot: "#f59e0b" },
    { time: "Tomorrow 11:00", msg: t("hiw_notif_join"),       dot: ACCENT },
  ];
  const notifItems = [
    { Icon: Mail,        label: t("hiw_n1") },
    { Icon: Bell,        label: t("hiw_n2") },
    { Icon: Bell,        label: t("hiw_n3") },
    { Icon: CheckCircle, label: t("hiw_n4") },
  ];


  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80"
          alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.35) saturate(0.6)" }}
        />
        <div className="absolute inset-0 bg-[#0D0A1A]/65" />
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: "30%", background: "linear-gradient(to bottom, transparent, #0D0A1A)" }}
        />
        <div className="relative px-6 max-w-4xl mx-auto">
          <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8">
            {t("hiw_label")}
          </p>
          <h1 className="reveal reveal-delay-1 text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-8">
            {t("hiw_title1")}{" "}
            <span style={{ ...serif, color: ACCENT_LIGHT }}>{t("hiw_title2")}</span>
          </h1>
          <p className="reveal reveal-delay-2 text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto">
            {t("hiw_sub")}
          </p>
        </div>
      </section>

      {/* ── CARD STACK — desktop ──────────────────────────────────────── */}
      {!isMobile ? (
        <section aria-label="Étapes — comment ça marche">
          <div id="hiw-container" style={{ position: "relative", height: `calc(${N} * 85vh + 100px)` }}>
          {steps.map((step, i) => {
            const bg = CARD_BG[i % CARD_BG.length];
            return (
              <div
                key={step.num}
                style={{
                  position:    "sticky",
                  top:         80,
                  minHeight:   i === N - 1 ? "100vh" : "85vh",
                  height:      "auto",
                  overflow:    "hidden",
                  borderRadius: 24,
                  zIndex:      (i + 1) * 10,
                  background:  bg,
                  display:     "flex",
                  width:       "calc(100% - 64px)",
                  marginLeft:  32,
                  marginRight: 32,
                  marginTop:   i > 0 ? -60 : 0,
                  paddingBottom: 80,
                  transform:   `rotate(${CARD_ROTATIONS[i]}deg)`,
                  boxShadow:   "0 2px 0 0 rgba(124,58,237,0.15), 0 20px 80px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)",
                  borderTop:   "1px solid rgba(124,58,237,0.15)",
                }}
              >
                {/* ── LEFT — text content (50%) ──────────────── */}
                <div style={{
                  width: "50%", flexShrink: 0,
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  padding: "0 clamp(36px, 6vw, 88px)",
                  position: "relative", zIndex: 1,
                }}>
                  {/* Decorative step number — watermark */}
                  <div style={{
                    position: "absolute", top: "50%", left: "clamp(36px, 6vw, 88px)",
                    transform: "translateY(-60%)",
                    fontSize: "clamp(100px, 18vw, 160px)", fontWeight: 800,
                    color: "rgba(124,58,237,0.07)", lineHeight: 1,
                    userSelect: "none", pointerEvents: "none",
                    letterSpacing: "-0.04em",
                  }}>
                    {step.num}
                  </div>

                  <div style={{ position: "relative" }}>
                    <p style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.32em",
                      textTransform: "uppercase", color: ACCENT, marginBottom: 18,
                    }}>
                      ÉTAPE {step.num}
                    </p>
                    <h2 style={{
                      fontSize: "clamp(28px, 3.8vw, 52px)", fontWeight: 800,
                      color: "white", lineHeight: 1.12, margin: "0 0 20px",
                      letterSpacing: "-0.025em",
                    }}>
                      {step.title}
                    </h2>
                    <p style={{
                      fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.48)",
                      lineHeight: 1.78, margin: "0 0 30px", maxWidth: 460,
                    }}>
                      {step.desc}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {step.detail.map((d) => (
                        <div key={d} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: "50%",
                            background: "rgba(124,58,237,0.15)",
                            border: "1px solid rgba(124,58,237,0.35)",
                            flexShrink: 0, marginTop: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <svg width="8" height="7" viewBox="0 0 8 7" fill="none" aria-hidden="true">
                              <path d="M1 3.5L3 5.5L7 1.5" stroke={ACCENT_LIGHT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
                            {d}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── RIGHT — full-bleed photo ─────────────────── */}
                <div style={{ width: "50%", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                  <img
                    src={step.image}
                    alt={step.title}
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "cover", objectPosition: "center",
                    }}
                    loading="lazy"
                  />
                  {/* Gradient left → transparent so image bleeds into card bg */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(to right, ${bg} 0%, ${bg}88 12%, transparent 35%)`,
                  }} />
                  {/* Subtle violet tint */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(145deg, rgba(76,29,149,0.38) 0%, transparent 60%)",
                  }} />
                  {/* Bottom fade */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
                    background: `linear-gradient(to top, ${bg} 0%, transparent 100%)`,
                  }} />
                </div>

                {/* ── Progress bar — bottom of card ──────────── */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: 2, background: "rgba(255,255,255,0.04)",
                  zIndex: 2,
                }}>
                  <div style={{
                    height: "100%",
                    width: `${((i + 1) / N) * 100}%`,
                    background: `linear-gradient(to right, rgba(124,58,237,0.6), ${ACCENT_LIGHT})`,
                  }} />
                </div>

                {/* ── Step counter — bottom right ─────────────── */}
                <div style={{
                  position: "absolute", bottom: 20, right: 28,
                  fontFamily: "monospace", fontSize: 11,
                  color: "rgba(255,255,255,0.18)", userSelect: "none", zIndex: 3,
                }}>
                  {step.num} / {String(N).padStart(2, "0")}
                </div>

                {/* ── Scroll cue — only on first card ─────────── */}
                {i === 0 && (
                  <div style={{
                    position: "absolute", bottom: 28, left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    pointerEvents: "none", zIndex: 3,
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>
                      DÉFILER
                    </span>
                    <div style={{
                      width: 1, height: 28,
                      background: "linear-gradient(to bottom, rgba(124,58,237,0.5), transparent)",
                      animation: "hiw-pulse 2s ease-in-out infinite",
                    }} />
                  </div>
                )}
              </div>
            );
          })}
          </div>{/* end #hiw-container */}
        </section>
      ) : (
        /* ── MOBILE — simple vertical stack ─────────────────────── */
        <section style={{ background: "#0D0A1A" }}>
          {steps.map((step, i) => (
            <div
              key={step.num}
              style={{
                padding: "72px 24px 60px",
                width: "calc(100% - 32px)",
                marginLeft: 16,
                marginRight: 16,
                borderRadius: 16,
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                boxSizing: "border-box",
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: 12, marginBottom: 32 }}>
                <img src={step.image} alt={step.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(76,29,149,0.4) 0%, transparent 60%)" }} />
              </div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>
                ÉTAPE {step.num}
              </p>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", lineHeight: 1.15, margin: "0 0 16px" }}>
                {step.title}
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.48)", lineHeight: 1.75, margin: "0 0 20px" }}>
                {step.desc}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {step.detail.map((d) => (
                  <div key={d} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="7" height="6" viewBox="0 0 8 7" fill="none"><path d="M1 3.5L3 5.5L7 1.5" stroke={ACCENT_LIGHT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── SECTION 3 — Sessions ─────────────────────────────────────── */}
      <section className="py-32" style={{ background: "#0D0A1A" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
              {t("hiw_sessions_label")}
            </p>
            <h2 className="reveal reveal-delay-1 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {t("hiw_sessions_title")}
            </h2>
            <p className="reveal reveal-delay-2 text-lg text-white/40 mt-5 max-w-xl mx-auto">
              {t("hiw_sessions_sub")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessionCards.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                className={`reveal reveal-delay-${i + 1} rounded-2xl p-8 border border-white/[0.07] hover:border-[#7C3AED]/40 transition-colors duration-300`}
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
                >
                  <Icon className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — Notifications ────────────────────────────────── */}
      <section className="py-32" style={{ background: "#0D0A1A" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
                {t("hiw_notif_label")}
              </p>
              <h2 className="reveal reveal-delay-1 text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-7">
                {t("hiw_notif_title1")}{" "}
                <span style={serif}>{t("hiw_notif_title2")}</span>
              </h2>
              <p className="reveal reveal-delay-2 text-white/45 leading-relaxed mb-10 text-base">
                {t("hiw_notif_sub")}
              </p>
              <div className="reveal reveal-delay-3 space-y-5">
                {notifItems.map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                    >
                      <Icon className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <span className="text-white/60 text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="reveal reveal-delay-2 rounded-2xl p-8 border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/25 mb-6">
                {t("hiw_activity")}
              </p>
              <div className="space-y-3">
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl p-4 border border-white/[0.05]"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: n.dot, boxShadow: `0 0 8px ${n.dot}80` }}
                    />
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{n.time}</div>
                      <div className="text-sm font-medium text-white/75">{n.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5 — CTA ──────────────────────────────────────────── */}
      <section className="relative py-40 text-center overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src="https://videos.pexels.com/video-files/3252312/3252312-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-10" style={{ background: "rgba(60,20,100,0.75)" }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none z-20" style={{ height: "220px", background: "linear-gradient(to bottom, #0D0A1A 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-20" style={{ height: "220px", background: "linear-gradient(to top, #0D0A1A 0%, transparent 100%)" }} />
        <div className="relative z-30 max-w-2xl mx-auto px-6">
          <p className="reveal text-xs font-semibold text-[#C4B5FD] uppercase tracking-[0.25em] mb-8">
            {t("hiw_cta_label")}
          </p>
          <h2 className="reveal reveal-delay-1 text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-7">
            {t("hiw_cta_title1")}{" "}
            <span style={serif}>{t("hiw_cta_title2")}</span>
          </h2>
          <p className="reveal reveal-delay-2 text-white/60 text-lg leading-relaxed mb-12">
            {t("hiw_cta_sub")}
          </p>
          <div className="reveal reveal-delay-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2.5 bg-white text-[#4C1D95] font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-colors text-sm"
            >
              {t("hiw_cta_btn")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes hiw-pulse {
          0%, 100% { opacity: 0.5; transform: scaleY(1); }
          50%       { opacity: 1;   transform: scaleY(1.15); }
        }
      `}</style>
    </>
  );
}
