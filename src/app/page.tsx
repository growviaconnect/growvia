import Link from "next/link";
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star,
  BookOpen,
  Briefcase,
  TrendingUp,
  GraduationCap,
  Video,
  Shield,
  Users,
  UserCheck,
  Calendar,
  Heart,
} from "lucide-react";

const trustBadges = [
  { icon: Users, label: "One-to-one mentoring" },
  { icon: UserCheck, label: "Verified mentors" },
  { icon: Sparkles, label: "AI Smart Matching available" },
];

const heroStats = [
  { icon: Star, value: "4.9/5", label: "Avg. Rating" },
  { icon: Users, value: "50K+", label: "Sessions" },
  { icon: UserCheck, value: "98%", label: "Satisfaction" },
];

const categories = [
  {
    icon: GraduationCap,
    label: "Students",
    desc: "Helping students choose their future path, academic specialization, and university direction.",
    color: "bg-violet-50 text-violet-600",
    count: "320 mentors",
  },
  {
    icon: Briefcase,
    label: "Career",
    desc: "Navigate career transitions, discover your path, and land your dream job.",
    color: "bg-blue-50 text-blue-600",
    count: "450 mentors",
  },
  {
    icon: TrendingUp,
    label: "Business",
    desc: "Start, scale, and grow your professional or entrepreneurial journey.",
    color: "bg-green-50 text-green-600",
    count: "380 mentors",
  },
  {
    icon: Heart,
    label: "Personal Growth",
    desc: "Build confidence, clarity, and unlock your full potential.",
    color: "bg-pink-50 text-pink-600",
    count: "410 mentors",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Sign up and complete your profile by adding your career interests, goals, industry preferences, and experience level. This information helps GrowVia recommend the most relevant mentors for you.",
    color: "from-blue-500 to-blue-600",
    details: ["Career interests & goals", "Industry preferences", "Experience level", "What you want to achieve"],
    highlight: false,
  },
  {
    number: "02",
    title: "Try GrowVia With a Free Session",
    description:
      "New users can start with a Freemium trial session — completely free. This first session lets you discover the platform, connect with a mentor, and try the AI Smart Matching system once.",
    color: "from-green-500 to-emerald-600",
    details: [
      "First session is free",
      "1 trial AI Smart Match",
      "Personalized mentor recommendation",
      "No commitment required",
    ],
    highlight: true,
  },
  {
    number: "03",
    title: "Choose Your Mentor",
    description:
      "After receiving your AI recommendation, you can accept the suggestion or browse mentors manually. Each mentor profile includes their experience, expertise, ratings, and feedback from other mentees.",
    color: "from-purple-500 to-purple-600",
    details: [
      "Accept AI recommendation",
      "Or browse manually",
      "Read mentor reviews",
      "Filter by expertise",
    ],
    highlight: false,
  },
  {
    number: "04",
    title: "Book a Session",
    description:
      "Choose an available time slot in your mentor's calendar. Once booked, a Google Meet session is automatically generated and both mentor and mentee receive the same meeting link.",
    color: "from-orange-500 to-orange-600",
    details: [
      "Pick a time slot",
      "Google Meet auto-generated",
      "Both receive the same link",
      "Reminder emails sent",
    ],
    highlight: false,
  },
  {
    number: "05",
    title: "Continue Your Journey",
    description:
      "After your free session, continue growing with GrowVia by booking individual sessions or subscribing to the monthly plan for unlimited AI Smart Matching.",
    color: "from-pink-500 to-rose-600",
    details: [
      "Book individual sessions (€29)",
      "Or subscribe monthly (€39/mo)",
      "3 sessions + unlimited AI matching",
      "Cancel anytime",
    ],
    highlight: false,
  },
];

const testimonials = [
  {
    content:
      "GrowVia connected me with a mentor who completely transformed my career trajectory. Within 3 months, I landed my dream role at a top tech company.",
    author: "Emily Rodriguez",
    role: "Product Manager at Google",
    avatar: "ER",
    rating: 5,
  },
  {
    content:
      "The quality of mentors on this platform is exceptional. My business mentor helped me scale my startup from $0 to $2M ARR in just one year.",
    author: "Marcus Chen",
    role: "Founder, TechFlow",
    avatar: "MC",
    rating: 5,
  },
  {
    content:
      "I was skeptical at first, but the personalized matching and the depth of expertise available here exceeded all my expectations. Truly life-changing.",
    author: "Sarah Johnson",
    role: "Senior Software Engineer",
    avatar: "SJ",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* background blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-purple-100 opacity-50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-32 w-96 h-96 rounded-full bg-violet-100 opacity-30 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* ── LEFT: Text ── */}
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-7">
                <Sparkles className="w-4 h-4" />
                Mentorship reimagined with AI
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Grow with mentors who{" "}
                <span className="gradient-text">truly understand</span>{" "}
                your journey
              </h1>

              <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-xl">
                Connect with experienced professionals who share real-world insights to help you make better career
                decisions and accelerate your personal and professional growth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 gradient-bg text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 text-base w-full sm:w-auto"
                >
                  Find a Mentor <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/register?role=mentor"
                  className="inline-flex items-center justify-center gap-2 border border-purple-200 text-purple-700 font-semibold px-8 py-4 rounded-2xl hover:bg-purple-50 transition-colors text-base w-full sm:w-auto"
                >
                  <Heart className="w-4 h-4" />
                  Become a Mentor
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-10">
                {trustBadges.map((b) => (
                  <div key={b.label} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <b.icon className="w-4 h-4 text-purple-500" />
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                {heroStats.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-none">{s.value}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Image ── */}
            <div className="relative hidden lg:block">
              {/* Main image */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop"
                  alt="Mentor and mentee in a one-to-one session"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
              </div>

              {/* Floating card – mentor info */}
              <div className="absolute -left-8 top-20 bg-white rounded-2xl p-4 shadow-xl shadow-purple-500/10 z-20 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop"
                    alt="Sarah Chen"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Sarah Chen</p>
                    <p className="text-xs text-gray-500">Leadership Coach</p>
                    <p className="text-xs text-purple-600 font-medium">342 sessions</p>
                  </div>
                </div>
              </div>

              {/* Floating card – match */}
              <div className="absolute -right-6 bottom-24 bg-white rounded-2xl p-4 shadow-xl shadow-purple-500/10 z-20">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-gray-900">AI Match Found</span>
                </div>
                <p className="text-xs text-gray-500">98% compatibility</p>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div className="gradient-bg h-1.5 rounded-full" style={{ width: "98%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGOS / TRUST BAR ─────────────────────────────────── */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-400 mb-8 uppercase tracking-wider">
            Trusted by professionals from leading companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-50">
            {["Google", "Spotify", "L'Oréal", "BNP Paribas", "Adobe", "Airbnb"].map((c) => (
              <span key={c} className="text-gray-400 font-semibold text-lg tracking-tight">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Find your area of growth</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Whatever direction you want to grow, we have mentors who have been there before.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href="/auth/register"
                className="group flex flex-col items-start gap-4 p-6 rounded-2xl border border-gray-100 bg-white card-shadow-hover card-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-gray-400 leading-snug hidden sm:block">{cat.desc}</p>
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full mt-auto">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-5 card-shadow">
              The mentoring process
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From sign-up to your first session in minutes. Everything is structured to get you results fast.
            </p>
          </div>

          <div className="space-y-5">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`relative rounded-2xl p-6 sm:p-8 ${
                  step.highlight
                    ? "bg-white border-2 border-green-200 shadow-lg shadow-green-100"
                    : "bg-white border border-gray-100 card-shadow"
                }`}
              >
                {step.highlight && (
                  <div className="absolute -top-3 left-6 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    FREE
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-black text-lg`}
                    >
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.details.map((d) => (
                        <span
                          key={d}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${
                            step.highlight
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          <CheckCircle className="w-3 h-3 flex-shrink-0" />
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-purple-700 font-semibold hover:gap-3 transition-all"
            >
              See full details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PRICING TEASER ─────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Invest in your growth</h2>
            <p className="text-gray-500 text-lg">Start for free. Upgrade when you're ready. No hidden fees.</p>
          </div>

          {/* AI Matching callout */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-0.5">About AI Smart Matching</p>
                <p className="text-sm text-gray-500">
                  AI Smart Matching analyzes your career goals, experience, and interests to recommend the most compatible
                  mentors. One free use on sign-up. Unlimited with the monthly plan.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Free Trial",
                price: "Free",
                desc: "Discover the platform",
                features: [
                  "1 free mentoring session",
                  "1 trial AI Smart Match",
                  "Personalized mentor recommendation",
                  "No commitment required",
                ],
                cta: "Start Free Session",
                href: "/auth/register",
                highlight: false,
                badge: null,
              },
              {
                name: "Pay-Per-Session",
                price: "€29",
                per: "/ session",
                desc: "Flexible access",
                features: [
                  "Pay as you go",
                  "Choose any mentor",
                  "Google Meet included",
                  "No monthly commitment",
                ],
                cta: "Book a Session",
                href: "/auth/register",
                highlight: false,
                badge: null,
              },
              {
                name: "Monthly Plan",
                price: "€39",
                per: "/ month",
                desc: "Best value for growth",
                features: [
                  "3 sessions per month",
                  "Unlimited AI Smart Matching",
                  "Priority booking",
                  "Cancel anytime",
                ],
                cta: "Subscribe",
                href: "/auth/register",
                highlight: true,
                badge: "BEST VALUE",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 flex flex-col relative ${
                  plan.highlight
                    ? "gradient-bg text-white shadow-2xl shadow-purple-300"
                    : "bg-white border border-gray-100 card-shadow"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div className={`text-sm font-semibold mb-2 ${plan.highlight ? "text-purple-200" : "text-purple-600"}`}>
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  {plan.per && (
                    <span className={`text-sm mb-1 ${plan.highlight ? "text-purple-200" : "text-gray-400"}`}>
                      {plan.per}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-purple-100" : "text-gray-400"}`}>{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle
                        className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-purple-200" : "text-purple-500"}`}
                      />
                      <span className={plan.highlight ? "text-white" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center font-semibold py-3 rounded-xl transition-all text-sm ${
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

          <div className="text-center mt-8">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors">
              View full pricing details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS (dark bg) ──────────────────────────────── */}
      <section className="section-padding bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Trusted by thousands of professionals</h2>
            <p className="text-gray-400 text-lg">See how our mentors have helped people achieve their goals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="bg-gray-800/50 backdrop-blur rounded-2xl p-7 border border-gray-700/50"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 text-sm">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.author}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOR SCHOOLS ─────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-bg rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-white">
              <div className="text-purple-200 text-sm font-semibold mb-2 uppercase tracking-wide">For Institutions</div>
              <h2 className="text-3xl font-bold mb-3">Bring structured mentoring to your school</h2>
              <p className="text-purple-100 max-w-xl leading-relaxed">
                Connect students with verified professionals from any industry, anywhere in the world. Track
                participation, measure impact, and build a culture of growth.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/for-schools"
                className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-purple-50 transition-colors whitespace-nowrap"
              >
                For Schools & Universities
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors whitespace-nowrap"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA (purple gradient) ─────────────────────────── */}
      <section className="py-24 gradient-bg text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-5">Ready to accelerate your success?</h2>
          <p className="text-purple-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who have transformed their careers with personalized mentorship from
            world-class experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-purple-800 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-100 shadow-xl shadow-purple-900/30 text-lg"
            >
              Find a Mentor <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors text-lg"
            >
              Learn More
            </Link>
          </div>
          <p className="text-sm text-purple-300 mt-8">
            No commitment required &nbsp;•&nbsp; Free to browse &nbsp;•&nbsp; Book your first session for free
          </p>
        </div>
      </section>
    </>
  );
}
