"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setAuthCookie } from "@/lib/auth";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";

type Role = "mentee" | "mentor" | "school_admin";

function RegisterContent() {
  const { t } = useLang();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const paramRole   = searchParams.get("role") as Role | null;
  const validRoles: Role[] = ["mentee", "mentor", "school_admin"];
  const defaultRole: Role  = paramRole && validRoles.includes(paramRole) ? paramRole : "mentee";

  const [role, setRole]               = useState<Role>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const roles: { value: Role; label: string }[] = [
    { value: "mentee",       label: t("reg_role_mentee") },
    { value: "mentor",       label: t("reg_role_mentor") },
    { value: "school_admin", label: t("reg_role_school") },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError(t("reg_error_mismatch"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("reg_error_short"));
      return;
    }

    setLoading(true);
    const email = form.email.trim().toLowerCase();
    const nom   = form.name.trim();

    try {
      // 1. Create account server-side with email_confirm:true (no verification email)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: form.password, role, nom }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = (json.error ?? "").toLowerCase();
        if (msg.includes("already") || msg.includes("duplicate") || msg.includes("unique")) {
          throw new Error(t("reg_error_duplicate"));
        }
        throw new Error(json.error ?? t("reg_error_generic"));
      }

      // 2. Sign in immediately (email already confirmed)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });
      if (signInError) throw signInError;

      // 3. Insert into domain table (best-effort)
      if (role === "mentor") {
        await supabase.from("mentors").insert({ nom, email, statut: "pending" });
      } else if (role === "mentee") {
        await supabase.from("mentees").insert({ nom, email, statut: "pending" });
      }

      // 4. Persist local session + 30-day auth cookie
      setSession({ nom, email, role, plan: "free" });
      setAuthCookie();

      // 5. Mentors go directly to onboarding; everyone else goes to the dashboard
      router.push(role === "mentor" ? "/onboarding/mentor" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("reg_error_generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-7">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
            >
              G
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">GrowVia</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">{t("reg_title")}</h1>
          <p className="text-white/40 text-sm">{t("reg_sub")}</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border border-white/[0.08]"
          style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}
        >
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">{t("reg_full_name")}</label>
              <input
                type="text" required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("reg_name_ph")}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">{t("reg_email")}</label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t("reg_email_ph")}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">{t("reg_password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={t("reg_password_ph")}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm pr-11 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">{t("reg_confirm")}</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"} required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder={t("reg_confirm_placeholder")}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm pr-11 transition-colors"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">{t("reg_role_label")}</label>
              <div className="space-y-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors text-left text-sm ${
                      role === r.value
                        ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white font-medium"
                        : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                    }`}
                  >
                    {r.label}
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 transition-colors ${
                      role === r.value ? "border-[#7C3AED] bg-[#7C3AED]" : "border-white/20"
                    }`}>
                      {role === r.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-60 text-sm"
              style={{ background: "#7C3AED" }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("reg_creating")}</>
                : <>{t("reg_submit")} <ArrowRight className="w-4 h-4" /></>
              }
            </button>

            <p className="text-xs text-white/25 text-center pt-1">
              {t("reg_agree")}{" "}
              <Link href="/legal/terms" className="text-[#A78BFA] hover:text-white transition-colors">{t("bam_terms")}</Link>
              {" "}{t("bam_and")}{" "}
              <Link href="/legal/privacy" className="text-[#A78BFA] hover:text-white transition-colors">{t("bam_privacy")}</Link>
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          {t("reg_have_account")}{" "}
          <Link href="/auth/login" className="text-[#A78BFA] font-medium hover:text-white transition-colors">
            {t("reg_signin")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0A1A]" />}>
      <RegisterContent />
    </Suspense>
  );
}
