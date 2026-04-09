import Link from "next/link";
import { CheckCircle, ArrowRight, Sparkles, Zap, CreditCard, Shield } from "lucide-react";

const plans = [
  {
    name: "Freemium",
    price: "Free",
    desc: "Try GrowVia risk-free",
    features: [
      { label: "1 mentoring session", included: true },
      { label: "1 AI Smart Matching use", included: true },
      { label: "Profile & mentor browsing", included: true },
      { label: "Email confirmation & reminders", included: true },
      { label: "Unlimited AI matching", included: false },
      { label: "Priority booking", included: false },
      { label: "Personalized recommendations", included: false },
    ],
    cta: "Start for Free",
    href: "/auth/register",
    highlight: false,
    badge: null,
  },
  {
    name: "Pay per Session",
    price: "29€",
    per: "per session",
    desc: "Flexible, no commitment",
    features: [
      { label: "1 mentoring session", included: true },
      { label: "Choose any available mentor", included: true },
      { label: "Google Meet integrated", included: true },
      { label: "Email confirmation & reminders", included: true },
      { label: "Unlimited AI matching", included: false },
      { label: "Priority booking", included: false },
      { label: "Personalized recommendations", included: false },
    ],
    cta: "Book a Session",
    href: "/auth/register",
    highlight: false,
    badge: null,
  },
  {
    name: "Subscription",
    price: "39€",
    per: "/ month",
    desc: "Everything you need to grow",
    features: [
      { label: "3 sessions per month", included: true },
      { label: "Unlimited AI Smart Matching", included: true },
      { label: "Priority booking", included: true },
      { label: "Personalized recommendations", included: true },
      { label: "Google Meet integrated", included: true },
      { label: "Email confirmation & reminders", included: true },
      { label: "Cancel anytime", included: true },
    ],
    cta: "Start Subscription",
    href: "/auth/register",
    highlight: true,
    badge: "Best Value",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            Simple pricing, <span className="gradient-text">no surprises</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Start for free. Scale as you grow. Every plan includes a Google Meet integrated session.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 relative flex flex-col ${
                  plan.highlight
                    ? "gradient-bg text-white shadow-2xl shadow-purple-200 scale-105"
                    : "bg-white border border-gray-100 card-shadow"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-5 py-1.5 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div>
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      plan.highlight ? "text-purple-200" : "text-purple-600"
                    }`}
                  >
                    {plan.name}
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span
                      className={`text-5xl font-black ${
                        plan.highlight ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.per && (
                      <span
                        className={`text-base mb-1.5 ${
                          plan.highlight ? "text-purple-200" : "text-gray-400"
                        }`}
                      >
                        {plan.per}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm mb-7 ${
                      plan.highlight ? "text-purple-100" : "text-gray-400"
                    }`}
                  >
                    {plan.desc}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-center gap-3 text-sm">
                        <CheckCircle
                          className={`w-4 h-4 flex-shrink-0 ${
                            f.included
                              ? plan.highlight
                                ? "text-purple-200"
                                : "text-purple-500"
                              : "text-gray-200"
                          }`}
                        />
                        <span
                          className={
                            f.included
                              ? plan.highlight
                                ? "text-white"
                                : "text-gray-700"
                              : "text-gray-300 line-through"
                          }
                        >
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={plan.href}
                  className={`mt-auto block text-center font-semibold py-3.5 rounded-xl transition-all ${
                    plan.highlight
                      ? "bg-white text-purple-700 hover:bg-purple-50"
                      : "gradient-bg text-white hover:opacity-90"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            All prices include VAT where applicable. Cancel your subscription at any time.
          </p>
        </div>
      </section>

      {/* AI Matching callout */}
      <section className="py-16 gradient-bg-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 sm:p-10 card-shadow">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Smart Matching</h3>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Our AI analyzes your profile, goals, personality, and experience to recommend the mentors most likely to help you grow. It considers compatibility on multiple dimensions to ensure the best possible match.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Zap className="w-4 h-4 text-purple-500" />
                    Shows compatibility percentage
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Zap className="w-4 h-4 text-purple-500" />
                    1 free use on sign-up
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Zap className="w-4 h-4 text-purple-500" />
                    Unlimited with subscription
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure payments</h2>
            <p className="text-gray-500 text-lg">We use Stripe, the industry standard for online payments.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: CreditCard,
                title: "Powered by Stripe",
                desc: "All payments are processed securely through Stripe. Your card information is never stored on our servers.",
              },
              {
                icon: Shield,
                title: "Encrypted & Safe",
                desc: "Bank-grade TLS encryption protects every transaction. Your financial data is always secure.",
              },
              {
                icon: CheckCircle,
                title: "Simple Flow",
                desc: "Book a session, pay securely, receive confirmation, and join your session. That is it.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-bg text-white text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Start with your free session today</h2>
          <p className="text-purple-100 mb-8">No credit card required. Experience GrowVia before you commit.</p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-8 py-4 rounded-2xl hover:bg-purple-50 transition-colors"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
