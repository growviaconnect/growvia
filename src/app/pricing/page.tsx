import Link from "next/link";
import { CheckCircle, ArrowRight, Sparkles, Zap, Clock, Users, TrendingUp } from "lucide-react";

const basicFeatures = [
  "Access to the platform",
  "AI mentor matching",
  "Mentor profiles browsing",
  "Calendar & session booking",
  "Secure integrated payment",
  "Community access",
];

const premiumFeatures = [
  "Everything in Basic",
  "Priority AI matching",
  "Personalized mentor recommendations",
  "Goals & progress tracking dashboard",
  "Access to premium mentors",
  "Priority session slots",
  "Events & group sessions",
  "Video courses & certifications",
];

const mentorPerks = [
  "You set your own rates",
  "You choose your availability",
  "GrowVia takes 5–10% commission per session only when you earn",
  "Commission covers: lead generation, payment processing, scheduling tools, dashboard access",
];

export default function PricingPage() {
  return (
    <>
      {/* ── Page header ─────────────────────────────────────────── */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            Simple pricing, <span className="gradient-text">no surprises</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Clear plans for mentees. Free to join for mentors. No hidden fees.
          </p>
        </div>
      </section>

      {/* ── SECTION 1 — For mentees ──────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">For mentees</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col card-shadow">
              <div className="mb-6">
                <p className="text-sm font-semibold text-purple-600 mb-2">Basic</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-5xl font-black text-gray-900">19.99€</span>
                  <span className="text-gray-400 mb-2">/ month</span>
                </div>
                <p className="text-sm text-gray-400">Everything you need to get started</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {basicFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register"
                className="block text-center gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Start Basic
              </Link>
            </div>

            {/* Premium */}
            <div className="relative rounded-2xl p-8 flex flex-col gradient-bg text-white shadow-2xl shadow-purple-300">
              {/* Recommended badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-5 py-1.5 rounded-full whitespace-nowrap">
                Recommended
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-purple-200 mb-2">Premium</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-5xl font-black text-white">39.99€</span>
                  <span className="text-purple-200 mb-2">/ month</span>
                </div>
                <p className="text-sm text-purple-100">Maximum growth, maximum impact</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white">
                    <CheckCircle className="w-4 h-4 text-purple-200 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register"
                className="block text-center bg-white text-purple-700 font-semibold py-3.5 rounded-xl hover:bg-purple-50 transition-colors text-sm"
              >
                Start Premium <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            All plans billed monthly. Cancel anytime. Prices include VAT where applicable.
          </p>
        </div>
      </section>

      {/* ── SECTION 2 — Discovery Session callout ───────────────── */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-amber-100 shadow-lg shadow-amber-100/60">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" }}>
                <Zap className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">No commitment needed</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Not sure yet? Start with a Discovery Session
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  A short, focused intro call with any mentor on the platform. No subscription required — just a one-time booking.
                </p>
              </div>

              <div className="flex-shrink-0">
                <div className="text-center bg-amber-50 border border-amber-200 rounded-2xl px-8 py-5">
                  <p className="text-4xl font-black text-gray-900 mb-0.5">9.99€</p>
                  <p className="text-xs text-gray-500 font-medium">flat price · one-time</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8">
              {[
                { icon: Clock, label: "15 to 20 minutes" },
                { icon: Sparkles, label: "AI matching included" },
                { icon: ArrowRight, label: "No subscription needed" },
                { icon: Users, label: "Available on every mentor profile" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-gray-600">
                  <item.icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {item.label}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" }}
              >
                Book a Discovery Session <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — For mentors ──────────────────────────────── */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #0F1020 0%, #1B1F3B 100%)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #5B3DF5 0%, #7C5CFF 100%)" }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">For mentors</h2>
          </div>

          <div className="rounded-2xl p-8 sm:p-12 border" style={{ background: "rgba(91,61,245,0.07)", borderColor: "rgba(91,61,245,0.25)" }}>
            <div className="flex flex-col lg:flex-row lg:items-start gap-10">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-purple-400">
                  Joining GrowVia as a mentor is free
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  You only pay when you earn.
                </h3>
                <p className="text-gray-400 leading-relaxed mb-8">
                  No setup fees. No monthly subscription. No risk. GrowVia takes a small commission only
                  when a mentee pays for a session — everything else is free.
                </p>

                <ul className="space-y-4">
                  {mentorPerks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-purple-400" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href="/auth/register?role=mentor"
                    className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm gradient-bg"
                    style={{ boxShadow: "0 8px 24px rgba(91,61,245,0.35)" }}
                  >
                    Apply to become a mentor <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right side commission callout */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="rounded-2xl p-6 text-center border" style={{ background: "rgba(91,61,245,0.1)", borderColor: "rgba(91,61,245,0.3)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 text-purple-400">
                    Commission
                  </p>
                  <p className="text-5xl font-black text-white mb-1">5–10%</p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Per session, only when you earn. Zero charge otherwise.
                  </p>
                  <div className="mt-5 pt-5 space-y-2">
                    {["Lead generation", "Payment processing", "Scheduling tools", "Dashboard access"].map((item) => (
                      <p key={item} className="text-xs text-gray-500">{item}</p>
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
