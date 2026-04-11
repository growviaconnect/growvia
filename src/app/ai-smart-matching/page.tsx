import Link from "next/link";
import { Sparkles, CheckCircle, ArrowRight, Zap, Target, Brain, BarChart3, Lock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Understands your goals",
    desc: "The AI analyzes your career objectives, interests, and experience to find mentors who have walked the same path.",
  },
  {
    icon: Target,
    title: "Shows compatibility percentage",
    desc: "Each mentor match displays a compatibility score so you can make an informed, confident choice.",
  },
  {
    icon: BarChart3,
    title: "Multi-dimensional matching",
    desc: "We consider goals, personality type, industry background, availability, and communication style.",
  },
  {
    icon: Lock,
    title: "Private and secure",
    desc: "Your profile data is only used for matching. It is never shared with third parties.",
  },
];

const steps = [
  { num: "01", label: "Complete your profile", desc: "Add your goals, background, and what kind of guidance you need." },
  { num: "02", label: "AI analyzes your profile", desc: "Our algorithm processes your data against our mentor database in seconds." },
  { num: "03", label: "Receive your top matches", desc: "You get a ranked list of compatible mentors with a percentage score for each." },
  { num: "04", label: "Accept or browse", desc: "Accept the AI recommendation directly or browse mentors manually — your choice." },
];

export default function AISmartMatchingPage() {
  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            <Sparkles className="w-4 h-4" />
            Premium Feature
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            AI <span className="gradient-text">Smart Matching</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Stop guessing. Our AI analyzes your goals, personality, and experience to recommend the mentors most likely
            to help you grow — with a compatibility score for each match.
          </p>
        </div>
      </section>

      {/* What it does */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Finding the right mentor is the hardest part
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5">
                Most people choose a mentor based on job title or number of years of experience. But the mentors who
                truly help are those who understand your specific situation, goals, and personality.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                GrowVia's AI Smart Matching goes deeper. It considers what you want to achieve, how you learn, and what
                kind of guidance style works best for you — then surfaces the mentors who match on all these dimensions.
              </p>
              <ul className="space-y-3">
                {[
                  "One AI match included with Discovery Session (9.99€)",
                  "Unlimited matches with Basic (19.99€/mo) or Premium (39.99€/mo)",
                  "Compatibility score shown for each mentor",
                  "Based on goals, personality, and experience",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual mockup */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 border border-purple-100">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900 text-sm">Your AI Matches</span>
                <span className="ml-auto text-xs text-purple-600 bg-white px-2.5 py-1 rounded-full font-medium card-shadow">
                  3 results
                </span>
              </div>
              {[
                { name: "Sophie Chen", role: "Product Manager at Spotify", pct: 98, tags: ["Career Change", "Product"] },
                { name: "Marcus Dubois", role: "Founder, TechStart Paris", pct: 94, tags: ["Entrepreneurship", "Business"] },
                { name: "Aisha Patel", role: "HR Director at L'Oréal", pct: 89, tags: ["Personal Growth", "Students"] },
              ].map((m, i) => (
                <div key={m.name} className={`bg-white rounded-2xl p-5 card-shadow ${i < 2 ? "mb-3" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {m.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0">
                      <Zap className="w-3 h-3" />
                      {m.pct}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                    <div
                      className="gradient-bg h-1.5 rounded-full"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.tags.map((t) => (
                      <span key={t} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How the matching works</h2>
            <p className="text-gray-500 text-lg">More than a filter — a genuine compatibility engine.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 card-shadow">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get your match in 4 steps</h2>
          </div>
          <div className="space-y-4">
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-5 bg-gray-50 rounded-2xl p-5">
                <div className="text-2xl font-black gradient-text flex-shrink-0 w-8">{s.num}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.label}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing callout */}
      <section className="py-16 gradient-bg-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-7 card-shadow flex flex-col">
              <div className="text-sm font-semibold text-purple-600 mb-2">Discovery Session</div>
              <div className="text-3xl font-black text-gray-900 mb-1">9.99€</div>
              <p className="text-sm text-gray-400 mb-5">1 AI match included · 15–20 min session</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {["One AI Smart Match included", "Compatibility score shown", "Accept or browse manually"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="block text-center gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm">
                Book Discovery Session
              </Link>
            </div>
            <div className="gradient-bg rounded-2xl p-7 flex flex-col text-white shadow-2xl shadow-purple-300">
              <div className="text-sm font-semibold text-purple-200 mb-2">Premium Plan</div>
              <div className="text-3xl font-black text-white mb-1">Unlimited</div>
              <p className="text-sm text-purple-100 mb-5">Included with your 39.99€/month subscription</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {["Unlimited AI matches", "4 sessions per month", "Priority booking", "Cancel anytime"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                    <CheckCircle className="w-4 h-4 text-purple-200 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block text-center bg-white text-purple-700 font-semibold py-3 rounded-xl hover:bg-purple-50 transition-colors text-sm">
                Unlock AI Matching <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
