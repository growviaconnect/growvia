"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Crown, Loader2, ArrowLeft, Zap } from "lucide-react";
import { getUserSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

const PAID_PLANS = [
  {
    key:        "basic",
    label:      "Basic",
    price:      "4.99",
    priceNote:  "/ month",
    tagline:    "Get started with mentoring",
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
    key:        "standard",
    label:      "Standard",
    price:      "9.99",
    priceNote:  "/ month",
    tagline:    "Most popular for serious growth",
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
    key:        "premium",
    label:      "Premium",
    price:      "14.99",
    priceNote:  "/ month",
    tagline:    "Unlimited access, top mentors",
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

function SubscribeContent() {
  const router      = useRouter();
  const params      = useSearchParams();
  const redirectUrl = params.get("redirect") ?? "";
  const session     = getUserSession();
  const [loading,         setLoading]         = useState<string | null>(null);
  const [error,           setError]           = useState<string | null>(null);
  const [currentPlan,     setCurrentPlan]     = useState<string | null>(null);
  const [freeSessionUsed, setFreeSessionUsed] = useState(false);
  const [planLoading,     setPlanLoading]     = useState(false);
  const [menteeId,        setMenteeId]        = useState<string | null>(null);

  useEffect(() => {
    if (!session?.email || session.role !== "mentee") return;
    setPlanLoading(true);
    supabase
      .from("mentees").select("id, free_session_used").eq("email", session.email).single()
      .then(({ data: menteeRow }) => {
        if (!menteeRow) { setCurrentPlan("free"); setPlanLoading(false); return; }
        const row = menteeRow as { id: string; free_session_used: boolean };
        setMenteeId(row.id);
        setFreeSessionUsed(row.free_session_used);
        supabase
          .from("mentee_subscriptions")
          .select("plan, status")
          .eq("mentee_id", row.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .then(({ data }) => {
            setCurrentPlan((data?.[0] as { plan: string } | undefined)?.plan ?? (row.free_session_used ? null : "free"));
            setPlanLoading(false);
          });
      });
  }, [session?.email, session?.role]);

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
        body:    JSON.stringify({ plan, email: session.email, ...(menteeId ? { menteeId } : {}), ...(redirectUrl ? { redirectUrl } : {}) }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  const isCurrent = (key: string) => !planLoading && currentPlan === key;

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-24">

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
            Start for free, upgrade when you&apos;re ready. Your card is saved on subscription — sessions are charged automatically when the mentor confirms.
          </p>
        </div>

        {/* Plan cards */}
        <div className={`grid grid-cols-1 gap-5 mb-10 ${freeSessionUsed ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>

          {/* ── FREE card — only shown while free session is still available ── */}
          {!freeSessionUsed && (
          <div
            className="relative rounded-2xl p-6 flex flex-col"
            style={{
              background: "#13111F",
              border: isCurrent("free")
                ? "1px solid rgba(124,58,237,0.45)"
                : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {isCurrent("free") && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap"
                  style={{ background: "#7C3AED", color: "#fff" }}
                >
                  Your current plan
                </span>
              </div>
            )}

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/35 mb-3">Free</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-white">0€</span>
                <span className="text-sm text-white/40">/ forever</span>
              </div>
              <p className="text-sm text-white/45 mt-1.5">Dip your toes in</p>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {[
                "1 discovery session",
                "See some mentors (score ≤ 60)",
                "1 AI matching max",
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#6D5CAE" }} />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push("/explore")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.35)" }}
            >
              Start for free →
            </button>
          </div>
          )}

          {/* ── Paid plan cards ── */}
          {PAID_PLANS.map(plan => (
            <div
              key={plan.key}
              className="relative rounded-2xl p-6 flex flex-col transition-all duration-300"
              style={{
                background: plan.highlight ? "rgba(124,58,237,0.12)" : "#13111F",
                border: isCurrent(plan.key)
                  ? "1px solid rgba(124,58,237,0.6)"
                  : plan.highlight
                    ? "1px solid rgba(124,58,237,0.45)"
                    : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {isCurrent(plan.key) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ background: "#7C3AED", color: "#fff" }}
                  >
                    Your current plan
                  </span>
                </div>
              )}

              {plan.highlight && !isCurrent(plan.key) && (
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
                disabled={loading !== null || isCurrent(plan.key)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{
                  background: plan.highlight ? "#7C3AED" : "rgba(124,58,237,0.25)",
                  border: plan.highlight ? "none" : "1px solid rgba(124,58,237,0.35)",
                }}
              >
                {loading === plan.key ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                ) : isCurrent(plan.key) ? (
                  "Current plan"
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

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0A1A]" />}>
      <SubscribeContent />
    </Suspense>
  );
}
