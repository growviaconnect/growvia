"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, MessageSquare, Clock, MapPin, Send } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const BG       = "#0D0A1A";
const ACCENT   = "#7C3AED";
const ACCENT_L = "#A78BFA";

const serif = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.89 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.27 6.27 0 0 0-6.27 6.27 6.27 6.27 0 0 0 6.27 6.27 6.27 6.27 0 0 0 6.27-6.27V9.51a8.14 8.14 0 0 0 4.75 1.5V7.57a4.84 4.84 0 0 1-.97-.88z" />
    </svg>
  );
}

function useVisible(threshold = 0.15) {
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
    transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
  };
}

export default function ContactPage() {
  const { t } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm]           = useState({ name: "", email: "", subject: "", message: "" });
  const [focused, setFocused]     = useState<string | null>(null);
  const [isMobile, setIsMobile]   = useState(false);

  const { ref: sectionRef, visible } = useVisible(0.1);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const contactCards = [
    {
      icon: Mail,
      label: "Contact général",
      value: "contact@growviaconnect.com",
      href: "mailto:contact@growviaconnect.com",
    },
    {
      icon: MessageSquare,
      label: "Co-fondatrice Luna Davin",
      value: "lunadavin@growviaconnect.com",
      href: "mailto:lunadavin@growviaconnect.com",
    },
    {
      icon: MessageSquare,
      label: "Co-fondatrice Yasmine Chunon",
      value: "yasminchunon@growviaconnect.com",
      href: "mailto:yasminchunon@growviaconnect.com",
    },
    {
      icon: Clock,
      label: t("contact_response_label"),
      value: t("contact_response_value"),
      href: null,
    },
    {
      icon: MapPin,
      label: t("contact_hq_label"),
      value: "Barcelone, Espagne",
      href: null,
    },
  ];

  const socials = [
    {
      Icon: LinkedInIcon,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/growvia-connect-7bb495402/",
    },
    {
      Icon: InstagramIcon,
      label: "Instagram",
      href: "https://www.instagram.com/growviaconnect",
    },
    {
      Icon: TikTokIcon,
      label: "TikTok",
      href: "https://www.tiktok.com/@growviaconnect",
    },
  ];

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused === name ? "#9d8df1" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10,
    color: "white",
    fontSize: 14,
    outline: "none",
    boxShadow: focused === name ? "0 0 0 3px rgba(157,141,241,0.15)" : "none",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    boxSizing: "border-box" as const,
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 6,
    letterSpacing: "0.04em",
  };

  return (
    <>
      <style>{`
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes contact-pulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
        .contact-card-hover {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .contact-card-hover:hover {
          transform: translateY(-2px);
          border-color: rgba(157,141,241,0.5) !important;
          box-shadow: 0 4px 24px rgba(124,58,237,0.12);
        }
        .social-pill:hover {
          transform: scale(1.03);
          border-color: rgba(157,141,241,0.6) !important;
          box-shadow: 0 0 16px rgba(157,141,241,0.3);
        }
        .contact-submit:hover {
          background: #9d8df1 !important;
        }
        input::placeholder, textarea::placeholder, select option:first-child {
          color: rgba(255,255,255,0.25);
        }
        select option {
          background: #1a1430;
          color: white;
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
        {/* Subtle radial glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          {/* Badge pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid rgba(124,58,237,0.45)",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 28,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: ACCENT_L,
            background: "rgba(124,58,237,0.08)",
          }}>
            {t("contact_badge")}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(38px, 6vw, 70px)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            margin: "0 0 20px",
          }}>
            {t("contact_title1")}{" "}
            <span style={{
              ...serif,
              backgroundImage: `linear-gradient(90deg, ${ACCENT_L}, #c4b5fd, ${ACCENT_L}, #c4b5fd)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer-text 4s linear infinite",
            }}>
              {t("contact_title2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            maxWidth: 520,
            margin: "0 auto",
          }}>
            {t("contact_sub")}
          </p>
        </div>
      </section>

      {/* ── MAIN SECTION ─────────────────────────────────────────── */}
      <section
        ref={sectionRef}
        style={{
          background: BG,
          padding: isMobile ? "60px 20px 80px" : "80px clamp(32px, 6vw, 100px) 120px",
        }}
      >
        <div style={{
          maxWidth: 1140,
          margin: "0 auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 48 : "clamp(48px, 6vw, 88px)",
          alignItems: "flex-start",
        }}>

          {/* ── LEFT — info + socials (40%) ──────────────────────── */}
          <div style={{ flex: isMobile ? undefined : "0 0 38%", width: isMobile ? "100%" : undefined }}>
            <h2 style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.28em",
              textTransform: "uppercase", color: ACCENT, marginBottom: 24,
              ...fadeUp(visible, 0),
            }}>
              {t("contact_get_in_touch")}
            </h2>

            {/* Contact cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {contactCards.map((card, i) => (
                <div
                  key={card.label}
                  className="contact-card-hover"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(157,141,241,0.15)",
                    borderRadius: 12,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    ...fadeUp(visible, i * 0.08),
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: 1,
                  }}>
                    <card.icon style={{ width: 16, height: 16, color: ACCENT_L }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                      {card.label}
                    </div>
                    {card.href ? (
                      <a href={card.href} style={{ fontSize: 13, fontWeight: 600, color: ACCENT_L, textDecoration: "none", wordBreak: "break-all" }}>
                        {card.value}
                      </a>
                    ) : (
                      <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", wordBreak: "break-all" }}>
                        {card.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Schools card */}
            <div
              className="contact-card-hover"
              style={{
                background: "rgba(124,58,237,0.07)",
                border: "1px solid rgba(124,58,237,0.25)",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 28,
                ...fadeUp(visible, contactCards.length * 0.08),
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ACCENT_L, marginBottom: 6 }}>
                {t("contact_schools_title")}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: "0 0 10px" }}>
                {t("contact_schools_sub")}
              </p>
              <a href="mailto:contact@growviaconnect.com" style={{ fontSize: 13, fontWeight: 600, color: ACCENT_L, textDecoration: "none" }}>
                contact@growviaconnect.com
              </a>
            </div>

            {/* Social pills */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              ...fadeUp(visible, (contactCards.length + 1) * 0.08),
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                Réseaux sociaux
              </div>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-pill"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 12,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(157,141,241,0.15)",
                    borderRadius: 10,
                    padding: "11px 16px",
                    textDecoration: "none",
                    transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
                  }}
                >
                  <span style={{ color: ACCENT_L, display: "flex", alignItems: "center" }}>
                    <s.Icon size={16} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                    {s.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* ── RIGHT — form (60%) ────────────────────────────────── */}
          <div style={{
            flex: 1,
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(157,141,241,0.12)",
            borderRadius: 20,
            padding: isMobile ? "28px 20px" : "36px 40px",
            ...fadeUp(visible, 0.2),
          }}>
            {submitted ? (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                minHeight: 360, textAlign: "center",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, marginBottom: 20,
                  background: "rgba(124,58,237,0.2)",
                  border: "1px solid rgba(124,58,237,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Send style={{ width: 28, height: 28, color: ACCENT_L }} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 10 }}>
                  {t("contact_success_title")}
                </h3>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                  {t("contact_success_sub")}
                </p>
              </div>
            ) : (
              <>
                <h2 style={{
                  fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 800,
                  color: "white", marginBottom: 28, letterSpacing: "-0.02em",
                }}>
                  Envoyez-nous un message
                </h2>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>{t("contact_form_name")}</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused(null)}
                        placeholder={t("contact_form_name_ph")}
                        style={inputStyle("name")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{t("contact_form_email")}</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused(null)}
                        placeholder={t("contact_form_email_ph")}
                        style={inputStyle("email")}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>{t("contact_form_subject")}</label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      onFocus={() => setFocused("subject")}
                      onBlur={() => setFocused(null)}
                      style={{
                        ...inputStyle("subject"),
                        appearance: "none" as const,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239d8df1' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 14px center",
                        paddingRight: 36,
                        cursor: "pointer",
                      }}
                    >
                      <option value="">{t("contact_form_select")}</option>
                      <option value="general">{t("contact_form_general")}</option>
                      <option value="mentoring">{t("contact_form_mentoring")}</option>
                      <option value="schools">{t("contact_form_schools")}</option>
                      <option value="billing">{t("contact_form_billing")}</option>
                      <option value="safety">{t("contact_form_safety")}</option>
                      <option value="other">{t("contact_form_other")}</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>{t("contact_form_message")}</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      onFocus={() => setFocused("message")}
                      onBlur={() => setFocused(null)}
                      placeholder={t("contact_form_msg_ph")}
                      style={{
                        ...inputStyle("message"),
                        minHeight: 140,
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="contact-submit"
                    style={{
                      width: "100%",
                      background: ACCENT,
                      color: "white",
                      fontWeight: 700,
                      fontSize: 15,
                      padding: "15px 24px",
                      borderRadius: 50,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "background 0.25s ease",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {t("contact_form_submit")} <Send style={{ width: 16, height: 16 }} />
                  </button>

                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", margin: 0 }}>
                    {t("contact_form_privacy")}
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
