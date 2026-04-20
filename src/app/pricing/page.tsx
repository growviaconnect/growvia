"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, TrendingUp, Loader2 } from "lucide-react";
import { getUserSession, type UserSession } from "@/lib/session";

const serifStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

const plans = [
  {
    name: "Basic",
    price: "4.99",
    desc: "Everything you need to get started",
    features: [
      "Access to more mentors than free",
      "2–3 AI matching/month",
      "Ability to book standard sessions",
      "Basic filters",
    ],
    cta: "Start Basic",
    recommended: false,
  },
  {
    name: "Standard",
    price: "9.99",
    desc: "The most popular plan for serious growth",
    features: [
      "Access to majority of mentors",
      "Extended AI matching",
      "Access to certified mentors",
      "Advanced filters (experience, domain)",
      "Personalized recommendations",
    ],
    cta: "Start Standard",
    recommended: true,
  },
  {
    name: "Premium",
    price: "14.99",
    desc: "Maximum access for maximum impact",
    features: [
      "Access to ALL mentors",
      "Unlimited AI matching",
      "Priority booking",
      "Access to top mentors",
      "Exclusive content (videos, tips)",
    ],
    cta: "Start Premium",
    recommended: false,
  },
];

const mentorPerks = [
  "You set your own rates",
  "You choose your availability",
  "GrowVia takes 20% commission per session only when you earn",
  "Commission covers: lead generation, payment processing, scheduling tools, dashboard access",
];

const freeFeatures = [
  "Limited platform access",
  "See some mentors (not all)",
  "1 AI matching maximum",
  "Ability to book 1 discovery session",
];

export default function PricingPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => { setSession(getUserSession()); }, []);

  async function handleCheckout(planKey: string) {
    if (!session) { router.push("/auth/register"); return; }
    setLoadingPlan(planKey);
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey.toLowerCase(), email: session.email }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) { window.location.href = data.url; return; }
      if (data.error) alert(data.error);
    } catch { alert("Something went wrong. Please try again."); }
    setLoadingPlan(null);
  }

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] flex items-center justify-center text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.28) saturate(0.55)" }}
        />
        <div className="absolute inset-0 bg-[#0D0A1A]/65" />
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: "35%", background: "linear-gradient(to bottom, transparent, #0D0A1A)" }}
        />

        <div className="relative px-6 max-w-3xl mx-auto">
          <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8">
            Pricing
          </p>
          <h1 className="reveal reveal-delay-1 text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-7">
            Simple pricing,{" "}
            <span style={{ ...serifStyle, color: "#A78BFA" }}>no surprises.</span>
          </h1>
          <p className="reveal reveal-delay-2 text-lg text-white/50 leading-relaxed max-w-xl mx-auto">
            Clear plans for mentees. Free to join for mentors. No hidden fees.
          </p>
        </div>
      </section>

      {/* ── SUBSCRIPTIONS ─────────────────────────────────────── */}
      <section className="relative py-36 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.18) saturate(0.45)" }}
        />
        <div className="absolute inset-0 bg-[#0D0A1A]/55" />

        {/* Top fade */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-10"
          style={{ height: "200px", background: "linear-gradient(to bottom, #0D0A1A 0%, transparent 100%)" }}
        />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
          style={{ height: "200px", background: "linear-gradient(to top, #0D0A1A 0%, transparent 100%)" }}
        />

        <div className="relative z-20 max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
              For Mentees
            </p>
            <h2 className="reveal reveal-delay-1 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Choose your plan.
            </h2>
            <p className="reveal reveal-delay-2 text-white/40 mt-4 text-base">
              All plans billed monthly. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`reveal reveal-delay-${i + 1} relative rounded-2xl p-8 flex flex-col border transition-colors duration-300 ${
                  plan.recommended
                    ? "border-[#7C3AED]/60"
                    : "border-white/[0.08] hover:border-[#7C3AED]/30"
                }`}
                style={{
                  background: plan.recommended
                    ? "rgba(124,58,237,0.18)"
                    : "rgba(255,255,255,0.04)",
                }}
              >
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-xs font-bold px-5 py-1.5 rounded-full whitespace-nowrap tracking-wide">
                    Recommended
                  </div>
                )}

                <div className="mb-8">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA] mb-4">
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1.5 mb-2">
                    <span className="text-5xl font-extrabold text-white leading-none">{plan.price}€</span>
                    <span className="text-white/35 mb-1.5 text-sm">/ month</span>
                  </div>
                  <p className="text-sm text-white/40">{plan.desc}</p>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.name)}
                  disabled={loadingPlan === plan.name}
                  className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-60 ${
                    plan.recommended
                      ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                      : "border border-white/15 text-white/70 hover:border-[#7C3AED]/50 hover:text-white"
                  }`}
                >
                  {loadingPlan === plan.name
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                    : plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREEMIUM ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div
            className="reveal rounded-2xl p-10 border border-white/[0.08]"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="flex flex-col md:flex-row md:items-start gap-10">
              {/* Left */}
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3">
                  No commitment needed
                </p>
                <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
                  Not sure yet?{" "}
                  <span style={serifStyle}>Start for free.</span>
                </h3>
                <p className="text-white/40 text-sm leading-relaxed mb-8">
                  Try GrowVia at no cost. Get a taste of what mentorship can do for you before committing to any plan.
                </p>
                <ul className="space-y-4">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-[#F97316] flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
                  >
                    Start for free <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right — free badge */}
              <div className="flex-shrink-0 md:pt-2">
                <div
                  className="text-center rounded-2xl px-10 py-8 border"
                  style={{ background: "rgba(249,115,22,0.08)", borderColor: "rgba(249,115,22,0.2)" }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#F97316]">Free plan</p>
                  <p className="text-5xl font-extrabold text-white mb-1">0€</p>
                  <p className="text-xs text-white/35 font-medium">forever · no card needed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR MENTORS ───────────────────────────────────────── */}
      <section className="relative py-36 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.22) saturate(0.5)" }}
        />
        <div className="absolute inset-0 bg-[#0D0A1A]/60" />

        {/* Top fade */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-10"
          style={{ height: "200px", background: "linear-gradient(to bottom, #0D0A1A 0%, transparent 100%)" }}
        />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
          style={{ height: "200px", background: "linear-gradient(to top, #0D0A1A 0%, transparent 100%)" }}
        />

        <div className="relative z-20 max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.35)" }}
            >
              <TrendingUp className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <h2 className="text-2xl font-bold text-white">For mentors</h2>
          </div>

          <div
            className="reveal rounded-2xl p-10 border border-[#7C3AED]/20"
            style={{ background: "rgba(13,10,26,0.75)" }}
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-10">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#A78BFA]">
                  Joining GrowVia as a mentor is free
                </p>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                  You only pay when you earn.
                </h3>
                <p className="text-white/40 leading-relaxed mb-8">
                  No setup fees. No monthly subscription. No risk. GrowVia takes a commission only
                  when a mentee pays for a session — everything else is free.
                </p>

                <ul className="space-y-4">
                  {mentorPerks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#7C3AED]" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href="/auth/register?role=mentor"
                    className="inline-flex items-center gap-2 bg-[#7C3AED] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#6D28D9] transition-colors text-sm"
                  >
                    Apply to become a mentor <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:w-64 flex-shrink-0">
                <div
                  className="rounded-2xl p-6 text-center border border-[#7C3AED]/25"
                  style={{ background: "rgba(124,58,237,0.12)" }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#A78BFA]">
                    Commission
                  </p>
                  <p className="text-5xl font-extrabold text-white mb-1">20%</p>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Per session, only when you earn. Zero charge otherwise.
                  </p>
                  <div
                    className="mt-5 pt-5 space-y-2"
                    style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}
                  >
                    {["Lead generation", "Payment processing", "Scheduling tools", "Dashboard access"].map((item) => (
                      <p key={item} className="text-xs text-white/30">{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
