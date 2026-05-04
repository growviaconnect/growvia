"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Crown, Loader2, ArrowLeft, Zap } from "lucide-react";
import { getUserSession } from "@/lib/session";

const PLANS = [
  {
    key:         "basic",
    label:       "Basic",
    price:       "4.99",
    priceNote:   "/ month",
    tagline:     "Get started with mentoring",
    scoreLimit:  75,
    features: [
      "Access to mentors (score ≤ 75)",
      "2–3 AI matchings per month",
      "Standard mentoring sessions",
      "Basic search filters",
      "Email support",
    ],
    highlight: false,
  },
  {
    key:         "standard",
    label:       "Standard",
    price:       "9.99",
    priceNote:   "/ month",
    tagline:     "Most popular for serious growth",
    scoreLimit:  90,
    features: [
      "Access to mentors (score ≤ 90)",
      "Extended AI matching",
      "Certified mentor access",
      "Advanced search filters",
      "Priority email support",
    ],
    highlight: true,
  },
  {
    key:         "premium",
    label:       "Premium",
    price:       "14.99",
    priceNote:   "/ month",
    tagline:     "Unlimited access, top mentors",
    scoreLimit:  100,
    features: [
      "Access to ALL mentors",
      "Unlimited AI matching",
      "Priority booking",
      "Top-rated & exclusive mentors",
      "Exclusive content & workshops",
    ],
    highlight: false,
  },
] as const;

export default function SubscribePage() {
  const router  = useRouter();
  const session = getUserSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubscribe(plan: string) {
    if (!session?.email) {
      router.push(`/auth/register?redirect=/subscribe`);
      return;
    }
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/create-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan, email: session.email }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-24">

        {/* Back */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" /> Back to explore
        </Link>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-[0.15em]">
            <Crown className="w-3.5 h-3.5 text-[#A78BFA]" />
            Choose your plan
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Unlock your{" "}
            <span style={{ color: "#A78BFA" }}>mentor network</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Subscribe once and book unlimited sessions at per-session rates. Your card is saved — sessions are charged automatically when the mentor confirms.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {PLANS.map(plan => (
            <div
              key={plan.key}
              className="relative rounded-2xl p-6 flex flex-col transition-all duration-300"
              style={{
                background:  plan.highlight ? "rgba(124,58,237,0.12)" : "#13111F",
                border:      plan.highlight
                  ? "1px solid rgba(124,58,237,0.45)"
                  : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                    style={{ background: "#7C3AED", color: "#fff" }}
                  >
                    <Zap className="w-3 h-3" /> Most popular
                  </span>
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/35 mb-3">{plan.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-white">{plan.price}€</span>
                  <span className="text-sm text-white/40">{plan.priceNote}</span>
                </div>
                <p className="text-sm text-white/45 mt-1.5">{plan.tagline}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                    <Check
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: plan.highlight ? "#A78BFA" : "#6D5CAE" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{
                  background: plan.highlight
                    ? "#7C3AED"
                    : "rgba(124,58,237,0.25)",
                  border: plan.highlight ? "none" : "1px solid rgba(124,58,237,0.35)",
                }}
              >
                {loading === plan.key ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                ) : (
                  `Start ${plan.label}`
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm text-red-400 text-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            {error}
          </div>
        )}

        {/* Trust note */}
        <div className="text-center space-y-2">
          <p className="text-xs text-white/30">
            Secure payment via Stripe · Cancel anytime · No hidden fees
          </p>
          <p className="text-xs text-white/25">
            Already subscribed?{" "}
            <Link href="/dashboard" className="text-[#A78BFA] hover:text-white transition-colors">
              Go to dashboard →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
