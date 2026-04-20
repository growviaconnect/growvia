"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setUserSession } from "@/lib/session";
import { setAuthCookie } from "@/lib/auth";
import type { Role } from "@/lib/session";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      setUserSession({ nom, email: user.email!, role, plan: "free" });
      setAuthCookie();

      router.push(next);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
            >
              G
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">GrowVia</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-white/40">Sign in to continue your journey.</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border border-white/[0.08]"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-white/[0.1] bg-white/[0.05] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED]/60 focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-white/60">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Your password"
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.1] bg-white/[0.05] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED]/60 focus:ring-1 focus:ring-[#7C3AED]/30 text-sm pr-11 transition-colors"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : <>Sign In <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm text-white/35">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-[#A78BFA] font-medium hover:text-white transition-colors">
                Create one for free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          By signing in, you agree to our{" "}
          <Link href="/legal/terms" className="text-white/35 hover:text-white/60">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/legal/privacy" className="text-white/35 hover:text-white/60">Privacy Policy</Link>
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
