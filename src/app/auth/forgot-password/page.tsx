"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LangContext";

export default function ForgotPasswordPage() {
  const { t } = useLang();

  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: window.location.origin + "/auth/reset-password" },
      );
      if (resetError) throw resetError;
      setSubmitted(true);
    } catch {
      setError(t("forgot_error"));
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">{t("forgot_title")}</h1>
          <p className="text-white/40 text-sm">{t("forgot_sub")}</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border border-white/[0.08]"
          style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}
        >
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{t("forgot_success_title")}</p>
                <p className="text-white/40 text-sm mt-1">{t("forgot_success_sub")}</p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">{t("forgot_email")}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-60 text-sm"
                  style={{ background: "#7C3AED" }}
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("forgot_sending")}</>
                    : <>{t("forgot_submit")} <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-[#A78BFA] font-medium hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("forgot_back")}
          </Link>
        </p>
      </div>
    </div>
  );
}
