"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setUserSession } from "@/lib/session";
import { useLang } from "@/contexts/LangContext";

const BG       = "#0D0A1A";
const ACCENT   = "#7C3AED";
const ACCENT_L = "#A78BFA";

type Role = "mentee" | "mentor" | "school_admin";

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

function fadeUp(vis: boolean, delay = 0): React.CSSProperties {
  return {
    opacity:    vis ? 1 : 0,
    transform:  vis ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
  };
}

export default function BecomeAMentorPage() {
  const { t } = useLang();

  const [heroVisible, setHeroVisible] = useState(false);
  const [step,         setStep]        = useState(1);
  const [role,         setRole]        = useState<Role>("mentor");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState<string | null>(null);
  const [focused,      setFocused]     = useState<string | null>(null);
  const [form,         setForm]        = useState({
    firstName: "", lastName: "", email: "", password: "", specialite: "", objectif: "",
  });

  const { ref: formRef, visible: formVisible } = useVisible(0.08);

  useEffect(() => {
    const id = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(id);
  }, []);

  const benefits = [
    { title: t("bam_b1_title"), desc: t("bam_b1_desc") },
    { title: t("bam_b2_title"), desc: t("bam_b2_desc") },
    { title: t("bam_b3_title"), desc: t("bam_b3_desc") },
  ];

  const roles: { value: Role; label: string; desc: string }[] = [
    { value: "mentee",       label: t("bam_role_mentee_label"), desc: t("bam_role_mentee_desc") },
    { value: "mentor",       label: t("bam_role_mentor_label"), desc: t("bam_role_mentor_desc") },
    { value: "school_admin", label: t("bam_role_school_label"), desc: t("bam_role_school_desc") },
  ];

  const specialites = [
    t("bam_spec1"), t("bam_spec2"), t("bam_spec3"), t("bam_spec4"),
    t("bam_spec5"), t("bam_spec6"), t("bam_spec7"), t("bam_spec8"),
  ];

  const objectifs = [
    t("bam_obj1"), t("bam_obj2"), t("bam_obj3"), t("bam_obj4"),
    t("bam_obj5"), t("bam_obj6"), t("bam_obj7"),
  ];

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const nom = `${form.firstName.trim()} ${form.lastName.trim()}`;
    try {
      if (role === "mentor") {
        const { error: dbError } = await supabase.from("mentors").insert({
          nom, email: form.email.trim().toLowerCase(),
          specialite: form.specialite || null, statut: "pending",
        });
        if (dbError) throw dbError;
      } else if (role === "mentee") {
        const { error: dbError } = await supabase.from("mentees").insert({
          nom, email: form.email.trim().toLowerCase(),
          objectif: form.objectif || null, statut: "pending",
        });
        if (dbError) throw dbError;
      }
      setUserSession({
        nom, email: form.email.trim().toLowerCase(), role,
        specialite: role === "mentor" ? (form.specialite || null) : null,
        objectif:   role === "mentee" ? (form.objectif  || null) : null,
        plan: "free",
      });
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("duplicate") || msg.includes("unique")
        ? t("bam_error_duplicate")
        : t("bam_error_generic"));
    } finally {
      setLoading(false);
    }
  }

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
    color: "rgba(255,255,255,0.45)",
    marginBottom: 6,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  return (
    <>
      <style>{`
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .bam-apply-btn {
          position: relative; overflow: hidden;
          transition: box-shadow 0.25s ease;
        }
        .bam-apply-btn::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }
        .bam-apply-btn:hover::after { transform: translateX(100%); }
        .bam-apply-btn:hover { box-shadow: 0 4px 24px rgba(124,58,237,0.4); }
        .bam-benefit-row {
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .bam-benefit-row:hover {
          background: rgba(255,255,255,0.04) !important;
          border-color: rgba(157,141,241,0.25) !important;
        }
        .bam-role-btn {
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .bam-submit-btn {
          position: relative; overflow: hidden;
          transition: box-shadow 0.25s ease;
        }
        .bam-submit-btn::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }
        .bam-submit-btn:hover::after { transform: translateX(100%); }
        .bam-submit-btn:hover { box-shadow: 0 4px 20px rgba(124,58,237,0.4); }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #1a1430; color: white; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ background: BG, paddingTop: "clamp(100px, 14vh, 160px)", paddingBottom: "clamp(60px, 8vh, 100px)", position: "relative", overflow: "hidden" }}>
        {/* Radial glow */}
        <div style={{ position: "absolute", top: "40%", left: "30%", transform: "translate(-50%, -50%)", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px)", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 96px)", alignItems: "center" }}
            className="bam-hero-grid">

            {/* ── Text side ── */}
            <div>
              {/* Badge pill */}
              <div style={{
                ...fadeUp(heroVisible, 0),
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid rgba(124,58,237,0.45)", borderRadius: 100,
                padding: "6px 16px", marginBottom: 28,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                color: ACCENT_L, background: "rgba(124,58,237,0.08)",
              }}>
                ✦ {t("bam_label")}
              </div>

              {/* Title */}
              <h1 style={{
                ...fadeUp(heroVisible, 0.08),
                fontSize: "clamp(32px, 5vw, 58px)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                margin: "0 0 20px",
              }}>
                {t("bam_title")}
              </h1>

              {/* Subtitle */}
              <p style={{
                ...fadeUp(heroVisible, 0.16),
                fontSize: "clamp(15px, 1.8vw, 18px)",
                color: "rgba(255,255,255,0.52)",
                lineHeight: 1.75,
                marginBottom: 36,
                maxWidth: 480,
              }}>
                {t("bam_sub")}
              </p>

              {/* Benefits */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
                {benefits.map((b, i) => (
                  <div
                    key={i}
                    className="bam-benefit-row"
                    style={{
                      ...fadeUp(heroVisible, 0.22 + i * 0.07),
                      display: "flex", alignItems: "flex-start", gap: 0,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(157,141,241,0.1)",
                      borderLeft: `3px solid ${ACCENT}`,
                      borderRadius: 8,
                      padding: "14px 20px",
                    }}
                  >
                    <div>
                      <p style={{ color: "white", fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{b.title}</p>
                      <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, lineHeight: 1.55 }}>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={fadeUp(heroVisible, 0.44)}>
                <a
                  href="#apply"
                  className="bam-apply-btn"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`,
                    color: "white", fontWeight: 700, fontSize: 15,
                    padding: "13px 28px", borderRadius: 50,
                    textDecoration: "none",
                  }}
                >
                  {t("bam_apply_btn")} <ArrowRight style={{ width: 16, height: 16 }} />
                </a>
              </div>
            </div>

            {/* ── Image side ── */}
            <div style={{ ...fadeUp(heroVisible, 0.2), position: "relative", borderRadius: 16, overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=80"
                alt={t("bam_img_alt")}
                style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block", filter: "brightness(0.55) saturate(0.75)" }}
              />
              {/* Dark gradient overlay — all edges */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0D0A1A 0%, rgba(13,10,26,0.1) 55%, rgba(13,10,26,0.4) 100%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,10,26,0.35) 0%, transparent 40%, transparent 60%, rgba(13,10,26,0.35) 100%)" }} />
              {/* Caption */}
              <div style={{ position: "absolute", bottom: 28, left: 24, right: 24 }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 6 }}>{t("bam_review_label")}</p>
                <p style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{t("bam_badge_label")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REGISTER FORM ────────────────────────────────────────────── */}
      <section id="apply" ref={formRef} style={{ background: BG, padding: "clamp(60px, 8vw, 100px) 0 clamp(80px, 10vw, 120px)", borderTop: "1px solid rgba(124,58,237,0.08)" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 clamp(20px, 5vw, 32px)" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32, ...fadeUp(formVisible, 0) }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: "white", letterSpacing: "-0.02em", margin: "0 0 10px" }}>
              {t("bam_form_title")}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>{t("bam_form_sub")}</p>
          </div>

          {/* Step dots */}
          {step < 3 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28, ...fadeUp(formVisible, 0.05) }}>
              {[1, 2].map((s) => (
                <div key={s} style={{
                  height: 5, borderRadius: 99,
                  width: s <= step ? 40 : 20,
                  background: s <= step ? ACCENT : "rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                }} />
              ))}
            </div>
          )}

          {/* ── Card wrapper ── */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(157,141,241,0.15)",
            borderRadius: 16,
            padding: "clamp(24px, 4vw, 36px)",
            ...fadeUp(formVisible, 0.1),
          }}>

            {/* Error banner */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)",
                color: "#f87171", fontSize: 13, padding: "12px 16px", borderRadius: 10, marginBottom: 20,
              }}>
                <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />{error}
              </div>
            )}

            {/* ── Step 3: Success ── */}
            {step === 3 && (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 0 32px rgba(124,58,237,0.3)",
                }}>
                  <CheckCircle style={{ width: 28, height: 28, color: "white" }} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 8 }}>
                  {role === "mentor" ? t("bam_success_mentor") : t("bam_success_mentee")}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                  {role === "mentor" ? t("bam_success_mentor_sub") : t("bam_success_mentee_sub")}
                </p>
                <Link
                  href="/dashboard"
                  className="bam-apply-btn"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`,
                    color: "white", fontWeight: 700, fontSize: 14,
                    padding: "12px 28px", borderRadius: 50, textDecoration: "none",
                  }}
                >
                  {t("bam_go_dashboard")} <ArrowRight style={{ width: 15, height: 15 }} />
                </Link>
              </div>
            )}

            {/* ── Step 1: Role ── */}
            {step === 1 && (
              <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 4 }}>{t("bam_step1_title")}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className="bam-role-btn"
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px", borderRadius: 10, textAlign: "left",
                        background: role === r.value ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${role === r.value ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, color: "white", fontSize: 14, marginBottom: 2 }}>{r.label}</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>{r.desc}</p>
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${role === r.value ? ACCENT : "rgba(255,255,255,0.2)"}`,
                        background: role === r.value ? ACCENT : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s ease",
                      }}>
                        {role === r.value && <div style={{ width: 6, height: 6, background: "white", borderRadius: "50%" }} />}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="bam-submit-btn"
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`,
                    color: "white", fontWeight: 700, fontSize: 15,
                    padding: "13px 20px", borderRadius: 50, border: "none", cursor: "pointer", marginTop: 4,
                  }}
                >
                  {t("bam_continue")} <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </form>
            )}

            {/* ── Step 2: Details ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 4 }}>{t("bam_step2_title")}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{t("bam_first_name")}</label>
                    <input
                      type="text" required value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      onFocus={() => setFocused("firstName")} onBlur={() => setFocused(null)}
                      placeholder={t("bam_first_name_ph")}
                      style={inputStyle("firstName")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{t("bam_last_name")}</label>
                    <input
                      type="text" required value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      onFocus={() => setFocused("lastName")} onBlur={() => setFocused(null)}
                      placeholder={t("bam_last_name_ph")}
                      style={inputStyle("lastName")}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t("bam_email")}</label>
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                    placeholder="email@exemple.com"
                    style={inputStyle("email")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>{t("bam_password")}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"} required minLength={8}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                      placeholder={t("bam_password_placeholder")}
                      style={{ ...inputStyle("password"), paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                </div>

                {role === "mentor" && (
                  <div>
                    <label style={labelStyle}>{t("bam_speciality")}</label>
                    <select
                      value={form.specialite}
                      onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                      onFocus={() => setFocused("specialite")} onBlur={() => setFocused(null)}
                      style={{ ...inputStyle("specialite"), appearance: "none" as const }}
                    >
                      <option value="">{t("bam_speciality_select")}</option>
                      {specialites.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {role === "mentee" && (
                  <div>
                    <label style={labelStyle}>{t("bam_goal")}</label>
                    <select
                      value={form.objectif}
                      onChange={(e) => setForm({ ...form, objectif: e.target.value })}
                      onFocus={() => setFocused("objectif")} onBlur={() => setFocused(null)}
                      style={{ ...inputStyle("objectif"), appearance: "none" as const }}
                    >
                      <option value="">{t("bam_goal_select")}</option>
                      {objectifs.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="bam-submit-btn"
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_L})`,
                    color: "white", fontWeight: 700, fontSize: 15,
                    padding: "13px 20px", borderRadius: 50, border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1, marginTop: 4,
                  }}
                >
                  {loading
                    ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> {t("bam_saving")}</>
                    : <>{role === "mentor" ? t("bam_submit_mentor") : t("bam_create_account")} <ArrowRight style={{ width: 16, height: 16 }} /></>}
                </button>

                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                  {t("bam_agree")}{" "}
                  <Link href="/legal/terms" style={{ color: ACCENT_L, textDecoration: "none" }}>{t("bam_terms")}</Link>
                  {" "}{t("bam_and")}{" "}
                  <Link href="/legal/privacy" style={{ color: ACCENT_L, textDecoration: "none" }}>{t("bam_privacy")}</Link>
                </p>
              </form>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 20 }}>
            {t("bam_already")}{" "}
            <Link href="/auth/login" style={{ color: ACCENT_L, fontWeight: 600, textDecoration: "none" }}>{t("bam_signin")}</Link>
          </p>
        </div>
      </section>

      {/* Responsive */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .bam-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
