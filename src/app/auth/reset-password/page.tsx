"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LangContext";

type Status = "loading" | "ready" | "invalid" | "submitting";

export default function ResetPasswordPage() {
  const { t } = useLang();
  const router = useRouter();

  const [status, setStatus]             = useState<Status>("loading");
  const [form, setForm]                 = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    let settled = false;

    // Supabase fires PASSWORD_RECOVERY when it detects a recovery token in the URL
    // (hash-based: #access_token=...&type=recovery, or PKCE: ?code=...)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        settled = true;
        setStatus("ready");
      }
    });

    // For PKCE flow the SDK may have already exchanged the code before we subscribed;
    // fall back to checking for an active session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !settled) {
        settled = true;
        setStatus("ready");
      }
    });

    // If neither fires within 3 s the link is invalid / expired
    const timer = setTimeout(() => {
      if (!settled) setStatus("invalid");
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError(t("reset_error_mismatch"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("reset_error_short"));
      return;
    }

    setStatus("submitting");

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: form.password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      router.push("/auth/login?reset=success");
    } catch {
      setError(t("reset_error_generic"));
      setStatus("ready");
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {status === "invalid" ? t("reset_invalid_title") : t("reset_title")}
          </h1>
          <p className="text-white/40 text-sm">
            {status === "invalid" ? t("reset_invalid_sub") : t("reset_sub")}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border border-white/[0.08]"
          style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}
        >
          {/* Loading skeleton */}
          {status === "loading" && (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 rounded-xl bg-white/5" />
              <div className="h-10 rounded-xl bg-white/5" />
              <div className="h-12 rounded-xl bg-white/5 mt-2" />
            </div>
          )}

          {/* Invalid / expired link */}
          {status === "invalid" && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-red-400" />
              </div>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#7C3AED] px-5 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                {t("reset_request_new")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Form */}
          {(status === "ready" || status === "submitting") && (
            <>
              {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">
                    {t("reset_new_password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
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

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">
                    {t("reset_confirm_password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm pr-11 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-60 text-sm"
                  style={{ background: "#7C3AED" }}
                >
                  {status === "submitting"
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("reset_updating")}</>
                    : <>{t("reset_submit")} <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>
            </>
          )}
        </div>

        {status !== "invalid" && (
          <p className="text-center text-sm text-white/40 mt-6">
            <Link
              href="/auth/login"
              className="text-[#A78BFA] font-medium hover:text-white transition-colors"
            >
              {t("forgot_back")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
