"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, ChevronDown, Loader2 } from "lucide-react";
import { getUserSession, type UserSession } from "@/lib/session";
import { useLang } from "@/contexts/LangContext";

const serif: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic",
  fontWeight: 400,
};
const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A78BFA";
const EASE = "cubic-bezier(0.16,1,0.3,1)";
const PRICES = ["4.99", "9.99", "14.99"];

export default function PricingPage() {
  const { t } = useLang();
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState(0);
  const [vis, setVis] = useState<boolean[]>(new Array(6).fill(false));
  const [priceDisplay, setPriceDisplay] = useState<string[]>([...PRICES]);
  const [isMobile, setIsMobile] = useState(false);
  const animatedPrices = useRef<Set<number>>(new Set());
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setSession(getUserSession());
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const plans = [
    {
      name: t("pricing_plan_basic"), key: "Basic",
      desc: t("pricing_plan_basic_desc"),
      features: [t("pricing_plan_basic_f1"), t("pricing_plan_basic_f2"), t("pricing_plan_basic_f3"), t("pricing_plan_basic_f4")],
      cta: t("pricing_plan_basic_cta"), recommended: false,
    },
    {
      name: t("pricing_plan_std"), key: "Standard",
      desc: t("pricing_plan_std_desc"),
      features: [t("pricing_plan_std_f1"), t("pricing_plan_std_f2"), t("pricing_plan_std_f3"), t("pricing_plan_std_f4"), t("pricing_plan_std_f5")],
      cta: t("pricing_plan_std_cta"), recommended: true,
    },
    {
      name: t("pricing_plan_prem"), key: "Premium",
      desc: t("pricing_plan_prem_desc"),
      features: [t("pricing_plan_prem_f1"), t("pricing_plan_prem_f2"), t("pricing_plan_prem_f3"), t("pricing_plan_prem_f4"), t("pricing_plan_prem_f5")],
      cta: t("pricing_plan_prem_cta"), recommended: false,
    },
  ];
  const mentorPerks = [t("pricing_mentor_p1"), t("pricing_mentor_p2"), t("pricing_mentor_p3"), t("pricing_mentor_p4")];
  const freeFeatures = [t("pricing_free_f1"), t("pricing_free_f2"), t("pricing_free_f3"), t("pricing_free_f4")];

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = parseInt(entry.target.getAttribute("data-pidx") ?? "0");
        setActivePanel(idx);
        setVis((prev) => {
          if (prev[idx]) return prev;
          const next = [...prev];
          next[idx] = true;
          return next;
        });
        // Price count-up for plan panels 1–3
        if (idx >= 1 && idx <= 3 && !animatedPrices.current.has(idx)) {
          animatedPrices.current.add(idx);
          const pi = idx - 1;
          const target = parseFloat(PRICES[pi]);
          const dur = 700;
          const t0 = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = (eased * target).toFixed(2);
            setPriceDisplay((prev) => { const n = [...prev]; n[pi] = val; return n; });
            if (progress < 1) requestAnimationFrame(tick);
            else setPriceDisplay((prev) => { const n = [...prev]; n[pi] = PRICES[pi]; return n; });
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.2 });

    panelRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refPanel(i: number) {
    return (el: HTMLDivElement | null) => {
      panelRefs.current[i] = el;
      if (el) el.setAttribute("data-pidx", String(i));
    };
  }

  function scrollToPanel(i: number) {
    panelRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleCheckout(planKey: string) {
    if (!session) { router.push("/auth/register"); return; }
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey.toLowerCase(), email: session.email }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) { window.location.href = data.url; return; }
      if (data.error) alert(data.error);
    } catch { alert(t("pricing_error")); }
    setLoadingPlan(null);
  }

  // ── Style helpers ────────────────────────────────────────────
  const panelBase: React.CSSProperties = {
    scrollSnapAlign: isMobile ? "none" : "start",
    minHeight: isMobile ? "auto" : "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: isMobile ? "80px 24px 60px" : "0 clamp(24px, 5vw, 80px)",
  };

  function slideIn(show: boolean, fromLeft = true, delay = 0): React.CSSProperties {
    return {
      opacity: show || isMobile ? 1 : 0,
      transform: show || isMobile ? "translateX(0)" : `translateX(${fromLeft ? -60 : 60}px)`,
      transition: `opacity 0.8s ${EASE} ${delay}s, transform 0.8s ${EASE} ${delay}s`,
    };
  }

  function featureItem(show: boolean, fi: number): React.CSSProperties {
    return {
      display: "flex", alignItems: "flex-start", gap: 12,
      fontSize: 14, color: "rgba(255,255,255,0.6)",
      opacity: show || isMobile ? 1 : 0,
      transform: show || isMobile ? "translateY(0)" : "translateY(10px)",
      transition: `opacity 0.5s ${EASE} ${0.3 + fi * 0.06}s, transform 0.5s ${EASE} ${0.3 + fi * 0.06}s`,
    };
  }

  const ctaBtn = (highlighted: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 8,
    background: highlighted ? ACCENT : "transparent",
    color: "white",
    border: highlighted ? "none" : "1px solid rgba(255,255,255,0.2)",
    borderRadius: 12, padding: "14px 28px",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
  });

  return (
    <>
      {/* ── Full-screen scroll-snap wrapper ──────────────────────── */}
      {/* margin-top: -64px cancels main's pt-16 so panels are truly full-viewport */}
      <div
        style={{
          marginTop: "-64px",
          height: isMobile ? "auto" : "100vh",
          overflowY: isMobile ? "visible" : "scroll",
          scrollSnapType: isMobile ? "none" : "y mandatory",
        }}
      >

        {/* ── Panel 1 — Hero ───────────────────────────────────── */}
        <div
          ref={refPanel(0)}
          style={{
            ...panelBase,
            background: "#0D0A1A",
            flexDirection: "column",
            textAlign: "center",
            paddingTop: isMobile ? "100px" : 0,
          }}
        >
          {/* Radial glow */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", maxWidth: 680, padding: "0 24px" }}>
            <p className="animate-fade-up" style={{ animationDelay: "0ms", fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT_LIGHT, marginBottom: 24 }}>
              {t("pricing_label")}
            </p>
            <h1 style={{ margin: "0 0 24px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              <span className="animate-fade-up" style={{ animationDelay: "100ms", display: "block", fontSize: "clamp(52px, 9vw, 100px)", fontWeight: 800, color: "white" }}>
                {t("pricing_title1")}
              </span>
              <span className="animate-fade-up" style={{ animationDelay: "200ms", display: "block", fontSize: "clamp(52px, 9vw, 100px)", fontWeight: 800, color: ACCENT_LIGHT, ...serif }}>
                {t("pricing_title2")}
              </span>
            </h1>
            <p className="animate-fade-up" style={{ animationDelay: "320ms", fontSize: "clamp(15px, 1.8vw, 18px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
              {t("pricing_sub")}
            </p>
          </div>

          {/* Bouncing arrow */}
          {!isMobile && (
            <button
              onClick={() => scrollToPanel(1)}
              aria-label="Scroll to plans"
              style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}
              className="pricing-bounce-arrow"
            >
              <ChevronDown size={28} />
            </button>
          )}
        </div>

        {/* ── Panels 2–4 — Basique, Standard, Premium ──────────── */}
        {plans.map((plan, pi) => {
          const idx = pi + 1;
          const show = vis[idx];
          const isStd = plan.recommended;
          const fromLeft = pi % 2 === 0;

          return (
            <div
              key={plan.key}
              ref={refPanel(idx)}
              style={{
                ...panelBase,
                background: isStd ? "rgba(124,58,237,0.04)" : "#0D0A1A",
                borderLeft: isStd && !isMobile ? "2px solid rgba(124,58,237,0.4)" : "none",
              }}
            >
              <div style={{
                display: "flex",
                flexDirection: isMobile ? "column" : fromLeft ? "row" : "row-reverse",
                alignItems: "center",
                gap: "clamp(32px, 6vw, 100px)",
                width: "100%", maxWidth: 1200,
              }}>

                {/* Content */}
                <div style={{ flex: 1, ...slideIn(show, fromLeft) }}>
                  {isStd && (
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT_LIGHT, marginBottom: 12 }}>
                      {t("pricing_recommended")}
                    </p>
                  )}
                  {/* Plan name — BIG */}
                  <h2 style={{ fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 800, color: "white", lineHeight: 1, margin: "0 0 10px" }}>
                    {plan.name}
                  </h2>
                  {/* Price — small, muted */}
                  <p style={{
                    fontSize: isStd ? 16 : "clamp(18px, 2.5vw, 24px)",
                    fontWeight: 400,
                    color: isStd ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.45)",
                    margin: "0 0 14px",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {priceDisplay[pi]}€ / {t("pricing_month")}
                  </p>
                  {/* Description — prominent */}
                  <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: "0 0 32px" }}>
                    {plan.desc}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {plan.features.map((f, fi) => (
                      <li key={f} style={featureItem(show, fi)}>
                        <CheckCircle style={{ width: 16, height: 16, color: ACCENT, flexShrink: 0, marginTop: 2 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={!!loadingPlan}
                    style={{ ...ctaBtn(isStd), opacity: loadingPlan === plan.key ? 0.6 : 1 }}
                  >
                    {loadingPlan === plan.key && <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />}
                    {plan.cta}
                    {loadingPlan !== plan.key && <ArrowRight style={{ width: 16, height: 16 }} />}
                  </button>
                </div>

                {/* Decorative number */}
                {!isMobile && (
                  <div aria-hidden="true" style={{ flexShrink: 0, fontSize: "clamp(120px, 20vw, 240px)", fontWeight: 800, color: "rgba(124,58,237,0.05)", lineHeight: 1, userSelect: "none", letterSpacing: "-0.04em" }}>
                    0{pi + 1}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ── Panel 5 — Gratuit ─────────────────────────────────── */}
        <div ref={refPanel(4)} style={{ ...panelBase, background: "#0D0A1A" }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: "clamp(32px, 6vw, 100px)", width: "100%", maxWidth: 1200 }}>

            {/* Left: content */}
            <div style={{ flex: 1, ...slideIn(vis[4]) }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT, marginBottom: 16 }}>
                {t("pricing_free_badge")}
              </p>
              <h2 style={{ fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 800, color: "white", lineHeight: 1, margin: "0 0 16px" }}>
                {t("pricing_free_title1")}{" "}
                <span style={serif}>{t("pricing_free_title2")}</span>
              </h2>
              <p style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 32px" }}>
                {t("pricing_free_sub")}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 14 }}>
                {freeFeatures.map((f, fi) => (
                  <li key={f} style={featureItem(vis[4], fi)}>
                    <CheckCircle style={{ width: 16, height: 16, color: ACCENT, flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" style={{ ...ctaBtn(true), textDecoration: "none" }}>
                {t("pricing_free_cta")} <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>

            {/* Right: GRATUIT + 0€ */}
            <div style={{ flexShrink: 0, textAlign: "center", ...slideIn(vis[4], false) }}>
              <p style={{ fontSize: "clamp(40px, 7vw, 88px)", fontWeight: 800, color: ACCENT, lineHeight: 1, letterSpacing: "-0.03em", margin: 0 }}>
                GRATUIT
              </p>
              <p style={{ fontSize: "clamp(60px, 11vw, 130px)", fontWeight: 800, color: "white", lineHeight: 0.9, letterSpacing: "-0.04em", margin: 0 }}>
                0€
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {t("pricing_free_forever")}
              </p>
            </div>
          </div>
        </div>

        {/* ── Panel 6 — Pour les mentors ───────────────────────── */}
        <div ref={refPanel(5)} style={{ ...panelBase, background: "#0D0A1A" }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: "clamp(32px, 6vw, 100px)", width: "100%", maxWidth: 1200 }}>

            {/* Left: content */}
            <div style={{ flex: 1, ...slideIn(vis[5]) }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT_LIGHT, marginBottom: 16 }}>
                {t("pricing_mentor_label")}
              </p>
              <h2 style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 800, color: "white", lineHeight: 1.15, margin: "0 0 16px" }}>
                {t("pricing_mentor_title")}
              </h2>
              <p style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 32px" }}>
                {t("pricing_mentor_sub")}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 14 }}>
                {mentorPerks.map((perk, pi) => (
                  <li key={perk} style={featureItem(vis[5], pi)}>
                    <CheckCircle style={{ width: 16, height: 16, color: ACCENT, flexShrink: 0, marginTop: 2 }} />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register?role=mentor" style={{ ...ctaBtn(true), textDecoration: "none" }}>
                {t("pricing_mentor_cta")} <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>

            {/* Right: 20% */}
            <div style={{ flexShrink: 0, textAlign: "center", ...slideIn(vis[5], false) }}>
              <p style={{ fontSize: "clamp(100px, 18vw, 180px)", fontWeight: 800, color: ACCENT, lineHeight: 1, letterSpacing: "-0.04em", margin: 0 }}>
                20%
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8, lineHeight: 1.5, maxWidth: 200 }}>
                {t("pricing_commission_sub")}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Nav dots — fixed right side, desktop only ─────────── */}
      <div className="hidden md:flex flex-col" style={{ position: "fixed", right: 28, top: "50%", transform: "translateY(-50%)", zIndex: 100, gap: 10 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <button
            key={i}
            onClick={() => scrollToPanel(i)}
            aria-label={`Panel ${i + 1}`}
            style={{
              width: 9, height: 9, borderRadius: "50%", padding: 0,
              background: activePanel === i ? "white" : "transparent",
              border: `1.5px solid ${activePanel === i ? "white" : "rgba(255,255,255,0.35)"}`,
              cursor: "pointer",
              transition: "all 0.25s ease",
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pricing-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(-9px); }
        }
        .pricing-bounce-arrow {
          animation: pricing-bounce 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
