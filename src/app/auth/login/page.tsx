"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setAuthCookie } from "@/lib/auth";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/session";

function LoginContent() {
  const { t } = useLang();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const next        = searchParams.get("next") || "/dashboard";
  const { setSession } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (authError) throw authError;

      const user = data.user;
      const meta = user.user_metadata ?? {};
      const role = (meta.role as Role) || "mentee";
      const nom  = (meta.nom  as string) || user.email || "";

      setSession({ nom, email: user.email!, role, plan: (meta.plan as "free" | "pro" | "school") || "free" });
      setAuthCookie();

      router.push(next);
    } catch {
      setError(t("login_error"));
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">{t("login_welcome")}</h1>
          <p className="text-white/40 text-sm">{t("login_sub")}</p>
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

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">{t("login_email")}</label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t("login_email_ph")}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">{t("login_password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={t("login_password_placeholder")}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm pr-11 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("login_signing")}</>
                : <>{t("login_submit")} <ArrowRight className="w-4 h-4" /></>
              }
            </button>

            <p className="text-xs text-white/25 text-center pt-1">
              {t("login_agree")}{" "}
              <Link href="/legal/terms" className="text-[#A78BFA] hover:text-white transition-colors">{t("bam_terms")}</Link>
              {" "}{t("bam_and")}{" "}
              <Link href="/legal/privacy" className="text-[#A78BFA] hover:text-white transition-colors">{t("bam_privacy")}</Link>
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          {t("login_no_account")}{" "}
          <Link href="/auth/register" className="text-[#A78BFA] font-medium hover:text-white transition-colors">
            {t("login_register")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0A1A]" />}>
      <LoginContent />
    </Suspense>
  );
}
