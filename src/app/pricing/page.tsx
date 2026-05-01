"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Loader2 } from "lucide-react";
import { getUserSession, type UserSession } from "@/lib/session";
import { useLang } from "@/contexts/LangContext";

const serif: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic",
  fontWeight: 400,
};
const ACCENT       = "#7C3AED";
const ACCENT_LIGHT = "#A78BFA";
const EASE         = "cubic-bezier(0.16,1,0.3,1)";
const PRICES       = ["4.99", "9.99", "14.99"];
const PLAN_LABELS  = ["BASIQUE", "STANDARD", "PREMIUM"];

// ── Orb visuals — crossfade on activePlan ────────────────────────────────

function OrbBasique({ active }: { active: boolean }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      opacity: active ? 1 : 0,
      transition: "opacity 0.6s ease",
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
    }}>
      <div style={{
        width: "min(300px, 46vw)", height: "min(300px, 46vw)", borderRadius: "50%",
        background: "radial-gradient(circle at 42% 38%, rgba(124,58,237,0.55) 0%, rgba(124,58,237,0.2) 45%, transparent 72%)",
        animation: "orb-float 7s ease-in-out infinite",
        boxShadow: "0 0 90px 25px rgba(124,58,237,0.14)",
      }} />
    </div>
  );
}

function OrbStandard({ active }: { active: boolean }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      opacity: active ? 1 : 0,
      transition: "opacity 0.6s ease",
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
    }}>
      {/* Pulsing rings */}
      <div className="ring-pulse-a" style={{
        position: "absolute", left: "50%", top: "50%",
        width: "min(420px, 64vw)", height: "min(420px, 64vw)", borderRadius: "50%",
        border: "1px solid rgba(167,139,250,0.28)",
        transform: "translate(-50%,-50%)",
      }} />
      <div className="ring-pulse-b" style={{
        position: "absolute", left: "50%", top: "50%",
        width: "min(380px, 58vw)", height: "min(380px, 58vw)", borderRadius: "50%",
        border: "1px solid rgba(167,139,250,0.18)",
        transform: "translate(-50%,-50%)",
      }} />
      {/* Core orb */}
      <div style={{
        width: "min(270px, 42vw)", height: "min(270px, 42vw)", borderRadius: "50%",
        background: "radial-gradient(circle at 38% 34%, rgba(180,150,255,0.7) 0%, rgba(124,58,237,0.4) 45%, transparent 72%)",
        animation: "orb-float 5.5s ease-in-out infinite",
        boxShadow: "0 0 110px 35px rgba(124,58,237,0.20), 0 0 45px 12px rgba(167,139,250,0.14)",
      }} />
    </div>
  );
}

function OrbPremium({ active }: { active: boolean }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      opacity: active ? 1 : 0,
      transition: "opacity 0.6s ease",
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
    }}>
      {/* Rear satellite orbs */}
      <div style={{
        position: "absolute",
        left: "calc(50% - min(170px, 26vw))", top: "calc(50% - min(90px, 14vw))",
        width: "min(210px, 32vw)", height: "min(210px, 32vw)", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(109,40,217,0.45) 0%, transparent 70%)",
        animation: "orb-float 8s ease-in-out infinite 1.2s",
        filter: "blur(10px)",
      }} />
      <div style={{
        position: "absolute",
        right: "calc(50% - min(170px, 26vw))", top: "calc(50% - min(110px, 17vw))",
        width: "min(190px, 29vw)", height: "min(190px, 29vw)", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.38) 0%, transparent 70%)",
        animation: "orb-float 6s ease-in-out infinite 0.6s",
        filter: "blur(7px)",
      }} />
      {/* Main central orb */}
      <div style={{
        width: "min(330px, 50vw)", height: "min(330px, 50vw)", borderRadius: "50%",
        background: "radial-gradient(circle at 33% 28%, rgba(210,185,255,0.75) 0%, rgba(167,139,250,0.52) 28%, rgba(124,58,237,0.30) 56%, transparent 75%)",
        animation: "orb-float 5s ease-in-out infinite",
        boxShadow: "0 0 130px 50px rgba(124,58,237,0.26), 0 0 60px 18px rgba(167,139,250,0.20)",
        position: "relative",
      }} />
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { t } = useLang();
  const router = useRouter();

  const [session,     setSession]     = useState<UserSession | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [activePlan,  setActivePlan]  = useState(0);
  const [planVis,     setPlanVis]     = useState([false, false, false]);
  const [extraVis,    setExtraVis]    = useState([false, false]);
  const [priceDisplay, setPriceDisplay] = useState<string[]>([...PRICES]);
  const [isMobile,    setIsMobile]    = useState(false);

  const animatedPrices = useRef<Set<number>>(new Set());
  const planRefs  = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const extraRefs = useRef<(HTMLDivElement | null)[]>([null, null]);

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
  const freeFeatures = [t("pricing_free_f1"), t("pricing_free_f2"), t("pricing_free_f3"), t("pricing_free_f4")];
  const mentorPerks  = [t("pricing_mentor_p1"), t("pricing_mentor_p2"), t("pricing_mentor_p3"), t("pricing_mentor_p4")];

  // IntersectionObserver — plan sections
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = parseInt(entry.target.getAttribute("data-plan") ?? "0");
        setActivePlan(idx);
        setPlanVis((prev) => {
          if (prev[idx]) return prev;
          const next = [...prev]; next[idx] = true; return next;
        });
        if (!animatedPrices.current.has(idx)) {
          animatedPrices.current.add(idx);
          const target = parseFloat(PRICES[idx]);
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - t0) / 600, 1);
            const e = 1 - Math.pow(1 - p, 3);
            const val = (e * target).toFixed(2);
            setPriceDisplay((prev) => { const n = [...prev]; n[idx] = val; return n; });
            if (p < 1) requestAnimationFrame(tick);
            else setPriceDisplay((prev) => { const n = [...prev]; n[idx] = PRICES[idx]; return n; });
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.45 });

    planRefs.current.forEach((el, i) => {
      if (el) { el.setAttribute("data-plan", String(i)); obs.observe(el); }
    });
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // IntersectionObserver — extra sections
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = parseInt(entry.target.getAttribute("data-extra") ?? "0");
        setExtraVis((prev) => {
          if (prev[idx]) return prev;
          const next = [...prev]; next[idx] = true; return next;
        });
      });
    }, { threshold: 0.2 });

    extraRefs.current.forEach((el, i) => {
      if (el) { el.setAttribute("data-extra", String(i)); obs.observe(el); }
    });
    return () => obs.disconnect();
  }, []);

  function scrollToPlans() {
    planRefs.current[0]?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function fadeUp(show: boolean, delay = 0): React.CSSProperties {
    return {
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.7s ${EASE} ${delay}s, transform 0.7s ${EASE} ${delay}s`,
    };
  }

  function featureAnim(show: boolean, fi: number): React.CSSProperties {
    return {
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(10px)",
      transition: `opacity 0.5s ${EASE} ${0.35 + fi * 0.055}s, transform 0.5s ${EASE} ${0.35 + fi * 0.055}s`,
    };
  }

  const miniOrbs = [
    "radial-gradient(circle, rgba(124,58,237,0.55) 0%, transparent 70%)",
    "radial-gradient(circle, rgba(167,139,250,0.65) 0%, rgba(124,58,237,0.3) 40%, transparent 70%)",
    "radial-gradient(circle, rgba(210,185,255,0.70) 0%, rgba(167,139,250,0.45) 35%, transparent 70%)",
  ];

  return (
    <>
      <div style={{ marginTop: "-64px", background: "#0D0A1A" }}>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section style={{
          height: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 68% 55% at 50% 58%, rgba(124,58,237,0.22) 0%, transparent 68%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", textAlign: "center", maxWidth: 680, padding: "0 32px" }}>
            <p
              className="animate-fade-up"
              style={{ animationDelay: "0ms", fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT_LIGHT, marginBottom: 28 }}
            >
              {t("pricing_label")}
            </p>
            <h1 style={{ margin: "0 0 28px", lineHeight: 1.04, letterSpacing: "-0.025em" }}>
              <span
                className="animate-fade-up"
                style={{ animationDelay: "80ms", display: "block", fontSize: "clamp(52px, 9vw, 100px)", fontWeight: 800, color: "white" }}
              >
                {t("pricing_title1")}
              </span>
              <span
                className="animate-fade-up"
                style={{ animationDelay: "180ms", display: "block", fontSize: "clamp(52px, 9vw, 100px)", fontWeight: 800, color: ACCENT_LIGHT, ...serif }}
              >
                {t("pricing_title2")}
              </span>
            </h1>
            <p
              className="animate-fade-up"
              style={{ animationDelay: "300ms", fontSize: "clamp(15px, 1.8vw, 18px)", color: "rgba(255,255,255,0.38)", lineHeight: 1.75 }}
            >
              {t("pricing_sub")}
            </p>
          </div>
          {!isMobile && (
            <button
              onClick={scrollToPlans}
              aria-label="Scroll to plans"
              className="pricing-bounce-arrow"
              style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}
            >
              <ChevronDown size={28} />
            </button>
          )}
        </section>

        {/* ── STICKY SPLIT — PLANS ──────────────────────────────────── */}
        {!isMobile ? (
          <div style={{ display: "flex", alignItems: "flex-start" }}>

            {/* LEFT — sticky orb panel (45%) */}
            <div style={{
              width: "45%", flexShrink: 0,
              position: "sticky", top: 0, height: "100vh",
              overflow: "hidden",
              background: "linear-gradient(160deg, #08051A 0%, #120930 50%, #07041A 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {/* Subtle vignette */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 88% 88% at 50% 50%, transparent 40%, rgba(4,2,12,0.6) 100%)",
              }} />

              {/* Orbs */}
              <div style={{ position: "absolute", inset: 0 }}>
                <OrbBasique   active={activePlan === 0} />
                <OrbStandard  active={activePlan === 1} />
                <OrbPremium   active={activePlan === 2} />
              </div>

              {/* Progress dots */}
              <div style={{
                position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
              }}>
                <div style={{ display: "flex", gap: 10 }}>
                  {plans.map((plan, i) => (
                    <button
                      key={plan.key}
                      onClick={() => planRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                      aria-label={plan.name}
                      style={{
                        width: 8, height: 8, borderRadius: "50%", padding: 0, border: "none", cursor: "pointer",
                        background: activePlan === i ? "white" : "rgba(255,255,255,0.2)",
                        transition: `background 0.3s ease`,
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.22em", margin: 0, transition: "none" }}>
                  {plans[activePlan]?.name}
                </p>
              </div>
            </div>

            {/* RIGHT — scrolling plan content (55%) */}
            <div style={{ width: "55%", flexShrink: 0 }}>
              {plans.map((plan, pi) => {
                const show = planVis[pi];
                const isActive = activePlan === pi;

                return (
                  <div
                    key={plan.key}
                    ref={(el) => { planRefs.current[pi] = el; }}
                    style={{
                      minHeight: "100vh", display: "flex", alignItems: "center",
                      padding: "80px clamp(48px, 7vw, 96px) 80px clamp(32px, 5vw, 64px)",
                      opacity: isActive ? 1 : 0.22,
                      transition: "opacity 0.55s ease",
                    }}
                  >
                    <div style={{ maxWidth: 520 }}>

                      {/* Plan label */}
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT, marginBottom: 14, ...fadeUp(show, 0) }}>
                        {PLAN_LABELS[pi]}
                      </p>

                      {/* RECOMMANDÉ badge */}
                      {plan.recommended && (
                        <div style={{ marginBottom: 12, ...fadeUp(show, 0.05) }}>
                          <span style={{
                            display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                            color: ACCENT_LIGHT, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.28)",
                            borderRadius: 4, padding: "4px 9px",
                          }}>
                            RECOMMANDÉ
                          </span>
                        </div>
                      )}

                      {/* Plan name — MASSIVE */}
                      <h2 style={{
                        fontSize: "clamp(52px, 9vw, 96px)", fontWeight: 800, color: "white",
                        lineHeight: 0.9, margin: "0 0 18px", letterSpacing: "-0.03em",
                        ...fadeUp(show, 0.08),
                      }}>
                        {plan.name}
                      </h2>

                      {/* Price — tiny, muted, same across all plans */}
                      <p style={{
                        fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 400, color: "rgba(255,255,255,0.35)",
                        margin: "0 0 22px", fontVariantNumeric: "tabular-nums",
                        ...fadeUp(show, 0.13),
                      }}>
                        {priceDisplay[pi]}€ / {t("pricing_month")}
                      </p>

                      {/* Description — prominent */}
                      <p style={{
                        fontSize: "clamp(16px, 2vw, 22px)", color: "rgba(255,255,255,0.68)",
                        lineHeight: 1.62, margin: "0 0 38px",
                        ...fadeUp(show, 0.18),
                      }}>
                        {plan.desc}
                      </p>

                      {/* Features — left border, no bullets */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 44 }}>
                        {plan.features.map((f, fi) => (
                          <div
                            key={f}
                            style={{
                              ...featureAnim(show, fi),
                              paddingLeft: 16, paddingTop: 11, paddingBottom: 11,
                              borderLeft: "2px solid rgba(124,58,237,0.3)",
                              fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.5,
                            }}
                          >
                            {f}
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div style={fadeUp(show, 0.42)}>
                        <button
                          onClick={() => handleCheckout(plan.key)}
                          disabled={!!loadingPlan}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: plan.recommended ? ACCENT : "transparent",
                            color: "white",
                            border: plan.recommended ? "none" : "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 12, padding: "14px 28px",
                            fontSize: 14, fontWeight: 600, cursor: "pointer",
                            opacity: loadingPlan === plan.key ? 0.6 : 1,
                            transition: "opacity 0.2s ease",
                          }}
                        >
                          {loadingPlan === plan.key
                            ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                            : null}
                          {plan.cta}
                          {loadingPlan !== plan.key && <ArrowRight style={{ width: 16, height: 16 }} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Mobile: vertical stack ─────────────────────────────── */
          <div>
            {plans.map((plan, pi) => (
              <div
                key={plan.key}
                ref={(el) => { planRefs.current[pi] = el; }}
                style={{ padding: "80px 24px 60px", borderTop: pi > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              >
                {/* Mini orb */}
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: miniOrbs[pi], marginBottom: 24,
                  boxShadow: "0 0 36px 10px rgba(124,58,237,0.18)",
                }} />

                {plan.recommended && (
                  <div style={{ marginBottom: 10 }}>
                    <span style={{
                      display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                      color: ACCENT_LIGHT, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.28)",
                      borderRadius: 4, padding: "4px 9px",
                    }}>
                      RECOMMANDÉ
                    </span>
                  </div>
                )}

                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>
                  {PLAN_LABELS[pi]}
                </p>
                <h2 style={{ fontSize: "clamp(52px, 16vw, 72px)", fontWeight: 800, color: "white", lineHeight: 0.9, margin: "0 0 14px", letterSpacing: "-0.03em" }}>
                  {plan.name}
                </h2>
                <p style={{ fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 400, color: "rgba(255,255,255,0.35)", margin: "0 0 18px" }}>
                  {PRICES[pi]}€ / {t("pricing_month")}
                </p>
                <p style={{ fontSize: "clamp(16px, 2vw, 22px)", color: "rgba(255,255,255,0.68)", lineHeight: 1.62, margin: "0 0 28px" }}>
                  {plan.desc}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 32 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ paddingLeft: 16, paddingTop: 11, paddingBottom: 11, borderLeft: "2px solid rgba(124,58,237,0.3)", fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleCheckout(plan.key)}
                  disabled={!!loadingPlan}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    width: "100%",
                    background: plan.recommended ? ACCENT : "transparent",
                    color: "white",
                    border: plan.recommended ? "none" : "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 12, padding: "14px 28px",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {loadingPlan === plan.key ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : null}
                  {plan.cta}
                  {loadingPlan !== plan.key && <ArrowRight style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── FREE PLAN ─────────────────────────────────────────────── */}
        <div
          ref={(el) => { extraRefs.current[0] = el; }}
          style={{
            padding: isMobile ? "80px 24px 72px" : "130px clamp(48px, 8vw, 120px)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 65% at 15% 50%, rgba(124,58,237,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{
            display: "flex", flexDirection: isMobile ? "column" : "row",
            alignItems: "center", gap: "clamp(48px, 8vw, 120px)",
            maxWidth: 1100, margin: "0 auto", position: "relative",
          }}>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT, marginBottom: 16, ...fadeUp(extraVis[0], 0) }}>
                {t("pricing_free_badge")}
              </p>
              <h2 style={{ fontSize: "clamp(38px, 6vw, 68px)", fontWeight: 800, color: "white", lineHeight: 1.05, margin: "0 0 20px", letterSpacing: "-0.02em", ...fadeUp(extraVis[0], 0.07) }}>
                {t("pricing_free_title1")}{" "}
                <span style={{ ...serif, color: ACCENT_LIGHT }}>{t("pricing_free_title2")}</span>
              </h2>
              <p style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: "rgba(255,255,255,0.42)", lineHeight: 1.75, margin: "0 0 36px", ...fadeUp(extraVis[0], 0.13) }}>
                {t("pricing_free_sub")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 40 }}>
                {freeFeatures.map((f, fi) => (
                  <div key={f} style={{
                    ...featureAnim(extraVis[0], fi),
                    paddingLeft: 16, paddingTop: 11, paddingBottom: 11,
                    borderLeft: "2px solid rgba(124,58,237,0.3)",
                    fontSize: 14, color: "rgba(255,255,255,0.55)",
                  }}>
                    {f}
                  </div>
                ))}
              </div>
              <div style={fadeUp(extraVis[0], 0.42)}>
                <Link href="/auth/register" style={{
                  display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
                  background: "transparent", color: "white",
                  border: `1px solid ${ACCENT}`, borderRadius: 12, padding: "14px 28px",
                  fontSize: 14, fontWeight: 600,
                }}>
                  {t("pricing_free_cta")} <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>
            </div>

            {/* 0€ stat */}
            <div style={{ flexShrink: 0, textAlign: "center", ...fadeUp(extraVis[0], 0.12) }}>
              <p style={{ fontSize: "clamp(48px, 8vw, 72px)", fontWeight: 800, color: "white", lineHeight: 1, letterSpacing: "-0.04em", margin: "0 0 10px" }}>
                0€
              </p>
              <p style={{ fontSize: 12, color: ACCENT_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                {t("pricing_free_forever")}
              </p>
            </div>
          </div>
        </div>

        {/* ── MENTOR SECTION ────────────────────────────────────────── */}
        <div
          ref={(el) => { extraRefs.current[1] = el; }}
          style={{
            padding: isMobile ? "80px 24px 100px" : "130px clamp(48px, 8vw, 120px)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 85% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{
            display: "flex", flexDirection: isMobile ? "column" : "row",
            alignItems: "center", gap: "clamp(48px, 8vw, 100px)",
            maxWidth: 1100, margin: "0 auto", position: "relative",
          }}>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT_LIGHT, marginBottom: 16, ...fadeUp(extraVis[1], 0) }}>
                {t("pricing_mentor_label")}
              </p>
              <h2 style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 800, color: "white", lineHeight: 1.15, margin: "0 0 16px", ...fadeUp(extraVis[1], 0.07) }}>
                {t("pricing_mentor_title")}
              </h2>
              <p style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: "rgba(255,255,255,0.42)", lineHeight: 1.75, margin: "0 0 32px", ...fadeUp(extraVis[1], 0.13) }}>
                {t("pricing_mentor_sub")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 40 }}>
                {mentorPerks.map((perk, i) => (
                  <div key={perk} style={{
                    ...featureAnim(extraVis[1], i),
                    paddingLeft: 16, paddingTop: 11, paddingBottom: 11,
                    borderLeft: "2px solid rgba(124,58,237,0.3)",
                    fontSize: 14, color: "rgba(255,255,255,0.55)",
                  }}>
                    {perk}
                  </div>
                ))}
              </div>
              <div style={fadeUp(extraVis[1], 0.42)}>
                <Link href="/auth/register?role=mentor" style={{
                  display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
                  background: ACCENT, color: "white", border: "none",
                  borderRadius: 12, padding: "14px 28px", fontSize: 14, fontWeight: 600,
                }}>
                  {t("pricing_mentor_cta")} <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>
            </div>

            {/* Commission metric card */}
            <div style={{ flexShrink: 0, ...fadeUp(extraVis[1], 0.16) }}>
              <div style={{
                background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 12, padding: "28px 36px", textAlign: "center", minWidth: 190,
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: ACCENT, margin: "0 0 14px" }}>
                  COMMISSION
                </p>
                <p style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: ACCENT, lineHeight: 1, margin: "0 0 10px" }}>
                  20%
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", lineHeight: 1.5, margin: 0 }}>
                  {t("pricing_commission_sub")}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes orb-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-18px) scale(1.025); }
        }
        @keyframes ring-pulse-anim {
          0%   { transform: translate(-50%,-50%) scale(1);    opacity: 0.55; }
          65%  { transform: translate(-50%,-50%) scale(1.30); opacity: 0; }
          100% { transform: translate(-50%,-50%) scale(1.30); opacity: 0; }
        }
        .ring-pulse-a { animation: ring-pulse-anim 3s ease-in-out infinite; }
        .ring-pulse-b { animation: ring-pulse-anim 3s ease-in-out infinite 0.55s; }
        @keyframes pricing-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(-9px); }
        }
        .pricing-bounce-arrow { animation: pricing-bounce 2s ease-in-out infinite; }
      `}</style>
    </>
  );
}
