import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Users,
  UserCheck,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Heart,
  Rocket,
  UserPlus,
  Clock,
  Star,
  Zap,
  Settings,
  Award,
} from "lucide-react";

const categories = [
  {
    icon: GraduationCap,
    label: "Students",
    desc: "Helping students choose their future path, academic specialization, and university direction with guidance from experienced mentors.",
    iconColor: "#8b5cf6",
    bgColor: "bg-violet-50",
    href: "/auth/register?category=students",
  },
  {
    icon: Briefcase,
    label: "Career",
    desc: "Navigate career transitions, discover your path, and land your dream job.",
    iconColor: "#3b82f6",
    bgColor: "bg-blue-50",
    href: "/auth/register?category=career",
  },
  {
    icon: TrendingUp,
    label: "Business",
    desc: "Start, scale, and grow your professional or entrepreneurial journey.",
    iconColor: "#22c55e",
    bgColor: "bg-green-50",
    href: "/auth/register?category=business",
  },
  {
    icon: Heart,
    label: "Personal Growth",
    desc: "Build confidence, clarity, and unlock your full potential.",
    iconColor: "#ec4899",
    bgColor: "bg-pink-50",
    href: "/auth/register?category=personal_growth",
  },
];

const mentorBenefits = [
  {
    icon: Zap,
    title: "Lead generation on autopilot",
    desc: "Qualified mentees come to you — no cold outreach, no self-promotion. GrowVia brings the right people to your profile.",
  },
  {
    icon: Settings,
    title: "Zero admin",
    desc: "GrowVia handles scheduling, payments, and session tracking. You focus entirely on the mentee in front of you.",
  },
  {
    icon: Award,
    title: "Your legacy, structured",
    desc: "Track mentee progress over time and earn your Certified Mentor badge — a mark of trust visible to every mentee on the platform.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-bg-soft" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse-soft" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse-soft"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* ── LEFT ── */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-purple-100 shadow-sm mb-8">
                <Rocket className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700 font-medium">Now launching — early access open</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Find the mentor who&apos;s been{" "}
                <span className="gradient-text">exactly where</span>{" "}
                you want to go
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
                GrowVia matches ambitious students and young professionals with experienced mentors through AI — in
                minutes, not months.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 text-base w-full sm:w-auto"
                >
                  Find my mentor <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/register?role=mentor"
                  className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base w-full sm:w-auto"
                  style={{ background: "linear-gradient(135deg, #1D9E75 0%, #22b87f 100%)" }}
                >
                  <Heart className="w-4 h-4" />
                  Become a mentor
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { icon: Users, text: "One-to-one mentoring" },
                  { icon: UserCheck, text: "Verified mentors" },
                  { icon: Sparkles, text: "AI Smart Matching" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <b.icon className="w-4 h-4 text-purple-500" />
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Image ── */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20">
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800"
                    alt="Mentor and mentee in a one-to-one session"
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
                </div>

                {/* Floating card – discovery session */}
                <div className="absolute -left-8 top-20 bg-white rounded-2xl p-4 shadow-xl shadow-purple-500/10 z-20 animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Discovery Session</p>
                      <p className="text-xs text-gray-500">9.99€ · 15–20 min</p>
                    </div>
                  </div>
                </div>

                {/* Floating card – become a mentor */}
                <div className="absolute -right-6 bottom-32 bg-white rounded-2xl p-4 shadow-xl shadow-purple-500/10 z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#d1f5e9" }}>
                      <UserPlus className="w-5 h-5" style={{ color: "#1D9E75" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Mentors welcome</p>
                      <p className="text-xs text-gray-500">Apply to join</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -z-10 -bottom-8 -right-8 w-72 h-72 bg-purple-100 rounded-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore mentoring categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              GrowVia supports people at every stage of life — from students choosing their path to professionals
              seeking growth or a new direction.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group block p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 bg-white h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${cat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <cat.icon className="w-7 h-7" style={{ color: cat.iconColor }} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{cat.desc}</p>
                <p className="text-xs text-purple-600 font-medium inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Accepting mentors now
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MENTOR VALUE SECTION ──────────────────────────────── */}
      <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f1a16 0%, #111827 100%)" }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#1D9E75" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: "#1D9E75" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 text-sm font-medium" style={{ borderColor: "#1D9E75", color: "#1D9E75", background: "rgba(29,158,117,0.08)" }}>
              <Award className="w-4 h-4" />
              For mentors
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Turn your experience into{" "}
              <span style={{ color: "#1D9E75" }}>someone&apos;s breakthrough</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Your career took years to build. GrowVia lets you turn that expertise into real impact — on your schedule, with zero overhead.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-14">
            {mentorBenefits.map((b) => (
              <div key={b.title} className="rounded-2xl p-8 border" style={{ background: "rgba(29,158,117,0.06)", borderColor: "rgba(29,158,117,0.2)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(29,158,117,0.15)" }}>
                  <b.icon className="w-6 h-6" style={{ color: "#1D9E75" }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{b.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/auth/register?role=mentor"
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl text-base"
              style={{ background: "linear-gradient(135deg, #1D9E75 0%, #22b87f 100%)", boxShadow: "0 12px 32px rgba(29,158,117,0.3)" }}
            >
              <UserPlus className="w-5 h-5" />
              Apply to become a mentor
            </Link>
            <p className="text-sm text-gray-500 mt-4">Manual review · Earn your Certified Mentor badge</p>
          </div>
        </div>
      </section>

      {/* ─── MENTOR PROFILES (pre-launch placeholder) ─────────── */}
      <section className="py-24 gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet our mentors</h2>
              <p className="text-lg text-gray-600 max-w-xl">
                We are currently onboarding our first cohort of verified mentors.
              </p>
            </div>
            <Link
              href="/auth/register?role=mentor"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mt-4 md:mt-0 text-sm"
            >
              Apply as a mentor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Career & Leadership", color: "bg-blue-50", iconColor: "text-blue-400" },
              { label: "Entrepreneurship", color: "bg-green-50", iconColor: "text-green-400" },
              { label: "Personal Development", color: "bg-pink-50", iconColor: "text-pink-400" },
              { label: "Student Guidance", color: "bg-violet-50", iconColor: "text-violet-400" },
            ].map((slot) => (
              <div
                key={slot.label}
                className="bg-white rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden"
              >
                <div className={`h-48 ${slot.color} flex flex-col items-center justify-center gap-3`}>
                  <UserCheck className={`w-10 h-10 ${slot.iconColor}`} />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{slot.label}</span>
                </div>
                <div className="p-5 text-center">
                  <p className="font-semibold text-gray-400 text-sm mb-1">Mentor profile coming soon</p>
                  <p className="text-xs text-gray-400">We are reviewing applications</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Are you an expert in your field?{" "}
            <Link href="/auth/register?role=mentor" className="text-purple-600 font-semibold hover:underline">
              Apply to become a mentor →
            </Link>
          </p>
        </div>
      </section>

      {/* ─── FIRST SUCCESS STORY CTA ─────────────────────────────── */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-purple-200">We are just getting started</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Be our first success story</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            GrowVia is launching now. We are onboarding our first mentors and mentees. Sign up today and help shape
            the platform — your story could be the one that inspires thousands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 gradient-bg text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-xl text-base"
            >
              Find my mentor <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/register?role=mentor"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors text-base"
            >
              <UserPlus className="w-5 h-5" />
              Apply as a mentor
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-24 gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 rounded-3xl p-12 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="relative text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-8">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-sm text-purple-200">Where careers are built.</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to accelerate your success?
              </h2>
              <p className="text-lg md:text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
                GrowVia is open for early access. Sign up now, get matched with your first mentor, and start with a
                Discovery Session at just 9.99€.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-purple-800 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-100 shadow-xl shadow-purple-900/30 text-base"
                >
                  Find my mentor <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors text-base"
                >
                  Learn more
                </Link>
              </div>
              <p className="text-sm text-purple-300 mt-8">
                No commitment required • Free to browse • Discovery Session from 9.99€
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
