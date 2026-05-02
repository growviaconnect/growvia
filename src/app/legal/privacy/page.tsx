"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BG       = "#0D0A1A";
const ACCENT   = "#7C3AED";
const ACCENT_L = "#A78BFA";

// ── Content (with all required fixes applied) ─────────────────────
const sections = [
  {
    id: "s1", num: "1", title: "Introduction",
    content: `GrowVia ("GrowVia", "we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use the GrowVia platform.

GrowVia is operated by GrowVia, headquartered in Montpellier, France. We serve users primarily in Spain, France, and other countries where our services are available. This policy is available in English, Español, and Français.

GrowVia is fully compliant with the General Data Protection Regulation (GDPR) and applicable French data protection law.`,
  },
  {
    id: "s2", num: "2", title: "Data We Collect",
    content: "We collect the following categories of personal data:",
    bullets: [
      { label: "Account data",       desc: "Name, email address, password (encrypted), and account type (mentee, mentor, school admin)" },
      { label: "Profile data",       desc: "Professional background, career goals, areas of interest, and availability preferences" },
      { label: "Session data",       desc: "Booked sessions, session history, and session status" },
      { label: "Payment data",       desc: "Billing information processed through Stripe. GrowVia does not store card details." },
      { label: "Usage data",         desc: "How you interact with the platform, pages visited, and features used" },
      { label: "Communication data", desc: "Messages sent through our contact forms" },
    ],
    labeledBullets: true,
  },
  {
    id: "s3", num: "3", title: "How We Use Your Data",
    bullets: [
      "To create and manage your account",
      "To facilitate AI-powered mentor matching and session bookings",
      "To send session confirmations and reminders via email",
      "To process payments securely through Stripe on behalf of mentors",
      "To improve the platform and user experience",
      "To comply with legal obligations under French and EU law",
    ],
  },
  {
    id: "s4", num: "4", title: "Data Storage & Security",
    content: `Your data is stored on secure, encrypted servers. We use industry-standard security measures to protect your information from unauthorized access, disclosure, or loss. Access to personal data is restricted to authorized GrowVia team members only.

As GrowVia operates as a marketplace, certain profile information (such as mentor name, photo, and professional background) is shared with mentees to facilitate bookings. Session details necessary for payment processing are shared with Stripe.`,
  },
  {
    id: "s5", num: "5", title: "Data Sharing",
    content: "We do not sell your personal data to third parties. We may share data with:",
    bullets: [
      "Stripe, for secure payment processing between mentees and the GrowVia platform",
      "Google, for Google Meet session link generation and integration",
      "Independent mentors, limited profile and booking data necessary to confirm and deliver sessions",
      "Service providers who help us operate the platform, under strict data processing agreements",
      "Law enforcement or regulatory authorities if required by applicable law",
    ],
  },
  {
    id: "s6", num: "6", title: "Your GDPR Rights",
    content: "Under GDPR and applicable EU data protection law, you have the following rights:",
    bullets: [
      "Right to access your personal data",
      "Right to correct inaccurate data",
      "Right to erasure (the right to be forgotten)",
      "Right to restrict processing",
      "Right to data portability",
      "Right to object to processing",
    ],
    gdprContact: true,
  },
  {
    id: "s7", num: "7", title: "Data Retention",
    content: `We retain your personal data for as long as your account is active or as needed to provide you with our services. If you close your account, we will delete or anonymize your data within 30 days, except where retention is required by law.

Session records and payment data may be retained for up to 5 years to comply with French fiscal and accounting obligations.`,
  },
  {
    id: "s8", num: "8", title: "Cookies",
    content: `We use cookies only for essential platform functionality, such as maintaining your login session and user preferences. We do not use advertising or tracking cookies.

You may disable non-essential cookies through your browser settings. Disabling essential cookies may affect platform functionality.`,
  },
  {
    id: "s9", num: "9", title: "Governing Law",
    content: `This Privacy Policy is governed by the laws of France and applicable EU regulations, including the GDPR. Any disputes arising from this policy shall be subject to the jurisdiction of the courts of Montpellier, France, unless otherwise required by mandatory consumer protection law in your country of residence.

Users located in other EU member states retain the right to lodge a complaint with their national data protection authority.`,
  },
  {
    id: "s10", num: "10", title: "Contact",
    content: `For any privacy-related inquiries or to exercise your GDPR rights, contact our Data Protection team at the address below, or by post at: GrowVia, Montpellier, France.`,
    email: "contact@growviaconnect.com",
  },
];

// ── Pill bullet row ───────────────────────────────────────────────
function BulletPill({ children }: { children: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? "rgba(157,141,241,0.25)" : "rgba(157,141,241,0.08)"}`,
        borderRadius: 8, padding: "12px 16px",
        transition: "border-color 0.25s ease",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
        background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="8" height="7" viewBox="0 0 8 7" fill="none" aria-hidden="true">
          <path d="M1 3.5L3 5.5L7 1.5" stroke={ACCENT_L} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontSize: 14, color: "rgba(200,190,230,0.85)", lineHeight: 1.65 }}>
        {children}
      </span>
    </div>
  );
}

// ── Ghost CTA link ────────────────────────────────────────────────
function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        border: `1px solid ${hov ? "rgba(157,141,241,0.6)" : "rgba(124,58,237,0.4)"}`,
        borderRadius: 10, padding: "10px 18px",
        fontSize: 13, fontWeight: 600, color: ACCENT_L,
        textDecoration: "none",
        background: hov ? "rgba(124,58,237,0.1)" : "transparent",
        transform: hov ? "scale(1.02)" : "scale(1)",
        boxShadow: hov ? "0 0 16px rgba(124,58,237,0.18)" : "none",
        transition: "all 0.25s ease",
      }}
    >
      {children} <ArrowRight style={{ width: 13, height: 13 }} />
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function PrivacyPage() {
  const [heroVisible,   setHeroVisible]   = useState(false);
  const [activeSection, setActiveSection] = useState("s1");
  const [activeLang,    setActiveLang]    = useState("en");
  const [isMobile,      setIsMobile]      = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const id = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll spy — update active TOC entry
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach((sec) => {
      const el = sectionRefs.current[sec.id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(sec.id); },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  function heroFade(delay: number): React.CSSProperties {
    return {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
    };
  }

  const langs = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        background: BG,
        paddingTop: "clamp(100px, 14vh, 160px)",
        paddingBottom: "clamp(48px, 6vh, 80px)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
          {/* Badge */}
          <div style={{
            ...heroFade(0),
            display: "inline-flex", alignItems: "center",
            border: "1px solid rgba(124,58,237,0.45)", borderRadius: 100,
            padding: "6px 16px", marginBottom: 22,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
            textTransform: "uppercase", color: ACCENT_L,
            background: "rgba(124,58,237,0.08)",
          }}>
            Legal
          </div>

          <h1 style={{
            ...heroFade(80),
            fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 800,
            color: "white", lineHeight: 1.1, letterSpacing: "-0.025em",
            margin: "0 0 14px",
          }}>
            Privacy Policy
          </h1>

          <p style={{
            ...heroFade(150),
            fontSize: 13, color: "rgba(200,190,230,0.6)",
            lineHeight: 1.6, marginBottom: 18,
          }}>
            Last updated: April 2026 · Applies to all users of GrowVia
          </p>

          {/* Language switcher */}
          <div style={{ ...heroFade(220), display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginRight: 4, fontWeight: 600, letterSpacing: "0.1em" }}>
              AVAILABLE IN
            </span>
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => setActiveLang(l.code)}
                style={{
                  fontSize: 11, fontWeight: 600,
                  padding: "4px 12px", borderRadius: 20,
                  border: `1px solid ${activeLang === l.code ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.1)"}`,
                  background: activeLang === l.code ? "rgba(124,58,237,0.15)" : "transparent",
                  color: activeLang === l.code ? ACCENT_L : "rgba(255,255,255,0.4)",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <section style={{
        background: BG,
        padding: "clamp(40px,5vh,72px) clamp(20px, 5vw, 60px) clamp(60px,8vh,120px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", gap: "clamp(32px, 4vw, 64px)",
          alignItems: "flex-start",
        }}>

          {/* ── LEFT — sticky TOC ──────────────────────────── */}
          {!isMobile && (
            <nav style={{
              flex: "0 0 220px",
              position: "sticky", top: 96,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(157,141,241,0.1)",
              borderRadius: 14, padding: "20px 16px",
              maxHeight: "calc(100vh - 120px)", overflowY: "auto",
            }}>
              <p style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.25em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                marginBottom: 14,
              }}>
                TABLE DES MATIÈRES
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {sections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      style={{
                        fontSize: 12, fontWeight: isActive ? 600 : 400,
                        color: isActive ? ACCENT_L : "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        padding: "6px 10px", borderRadius: 6,
                        background: isActive ? "rgba(124,58,237,0.1)" : "transparent",
                        borderLeft: `2px solid ${isActive ? ACCENT : "transparent"}`,
                        transition: "color 0.2s ease, background 0.2s ease, border-color 0.2s ease",
                        display: "flex", gap: 8, alignItems: "baseline",
                      }}
                    >
                      <span style={{ color: "rgba(157,141,241,0.4)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                        {sec.num}.
                      </span>
                      {sec.title}
                    </a>
                  );
                })}
              </div>
            </nav>
          )}

          {/* ── RIGHT — sections ───────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {sections.map((sec, idx) => (
              <SectionBlock
                key={sec.id}
                sec={sec}
                delay={Math.min(idx * 40, 200)}
                refCallback={(el) => { sectionRefs.current[sec.id] = el; }}
              />
            ))}

            {/* Bottom nav */}
            <div style={{
              marginTop: 56,
              paddingTop: 32,
              borderTop: "1px solid rgba(157,141,241,0.1)",
              display: "flex", flexWrap: "wrap", gap: 12,
            }}>
              <GhostLink href="/legal/terms">Terms of Service</GhostLink>
              <GhostLink href="/legal/mentor-agreement">Mentor Agreement</GhostLink>
              <GhostLink href="/legal/user-agreement">User Agreement</GhostLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Section block (extracted to use IntersectionObserver per section) ──
type SectionData = typeof sections[number];

function SectionBlock({
  sec, delay, refCallback,
}: {
  sec: SectionData;
  delay: number;
  refCallback: (el: HTMLDivElement | null) => void;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Forward ref to parent for scroll spy
  useEffect(() => { refCallback(ref.current); }, [refCallback]);

  return (
    <div
      id={sec.id}
      ref={ref}
      style={{
        marginBottom: 48,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        scrollMarginTop: 112,
      }}
    >
      {/* Section header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{
          fontSize: "clamp(17px, 2.2vw, 21px)", fontWeight: 700,
          color: "white", lineHeight: 1.3, margin: "0 0 12px",
          display: "flex", gap: 10, alignItems: "baseline",
        }}>
          <span style={{ color: "rgba(157,141,241,0.5)", fontWeight: 700, fontSize: "0.85em" }}>
            {sec.num}.
          </span>
          {sec.title}
        </h2>
        <div style={{ height: 1, background: "rgba(157,141,241,0.1)" }} />
      </div>

      {/* Body text */}
      {sec.content && (
        <p style={{
          fontSize: 14, color: "rgba(200,190,230,0.85)",
          lineHeight: 1.75, whiteSpace: "pre-line",
          marginBottom: sec.bullets ? 16 : 0,
        }}>
          {sec.content}
        </p>
      )}

      {/* Bullet lists */}
      {sec.bullets && !sec.labeledBullets && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(sec.bullets as string[]).map((b, i) => (
            <BulletPill key={i}>{b}</BulletPill>
          ))}
        </div>
      )}
      {sec.bullets && sec.labeledBullets && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(sec.bullets as { label: string; desc: string }[]).map((b, i) => (
            <BulletPill key={i}>
              <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{b.label}:</strong>{" "}
              {b.desc}
            </BulletPill>
          ))}
        </div>
      )}

      {/* GDPR contact */}
      {sec.gdprContact && (
        <p style={{ fontSize: 14, color: "rgba(200,190,230,0.75)", marginTop: 14, lineHeight: 1.7 }}>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:contact@growviaconnect.com" style={{
            color: ACCENT_L, textDecoration: "none",
            borderBottom: `1px solid rgba(167,139,250,0.3)`,
            transition: "border-color 0.2s ease",
          }}>
            contact@growviaconnect.com
          </a>.
        </p>
      )}

      {/* Section 10 email */}
      {sec.email && (
        <p style={{ fontSize: 14, color: "rgba(200,190,230,0.75)", marginTop: 10 }}>
          Contact:{" "}
          <a href={`mailto:${sec.email}`} style={{
            color: ACCENT_L, textDecoration: "none",
            borderBottom: `1px solid rgba(167,139,250,0.3)`,
            transition: "border-color 0.2s ease",
          }}>
            {sec.email}
          </a>
        </p>
      )}
    </div>
  );
}
