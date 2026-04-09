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
  Zap,
} from "lucide-react";

const trustBadges = [
  { icon: Shield, label: "Verified Mentors" },
  { icon: Video, label: "One-to-one Sessions" },
  { icon: Sparkles, label: "AI Smart Matching" },
];

const steps = [
  { num: "01", title: "Create your profile", desc: "Tell us about your goals, background, and where you want to go." },
  { num: "02", title: "Get AI-matched", desc: "Our algorithm suggests the best mentor based on your personality and goals." },
  { num: "03", title: "Try a free session", desc: "Book your first session for free. No credit card required." },
  { num: "04", title: "Grow with your mentor", desc: "Continue with a subscription or pay per session. Your choice." },
];

const categories = [
  { icon: Briefcase, label: "Career", color: "bg-blue-50 text-blue-600" },
  { icon: TrendingUp, label: "Business", color: "bg-emerald-50 text-emerald-600" },
  { icon: BookOpen, label: "Personal Growth", color: "bg-orange-50 text-orange-600" },
  { icon: GraduationCap, label: "Students", color: "bg-purple-50 text-purple-600" },
];

const testimonials = [
  {
    name: "Camille R.",
    role: "Marketing Student",
    text: "GrowVia helped me figure out exactly what I wanted to do after graduation. My mentor gave me clear, actionable steps instead of vague advice.",
    rating: 5,
    avatar: "CR",
  },
  {
    name: "Antoine M.",
    role: "Junior Developer",
    text: "The AI matching was spot-on. I was paired with a mentor who had the exact career path I wanted to follow. Two sessions in and I already feel more confident.",
    rating: 5,
    avatar: "AM",
  },
  {
    name: "Sofia L.",
    role: "MBA Student",
    text: "I tried other mentoring platforms but nothing felt personal. GrowVia is different. Every session is structured and ends with a concrete action plan.",
    rating: 5,
    avatar: "SL",
  },
];

const stats = [
  { value: "500+", label: "Verified Mentors" },
  { value: "2,000+", label: "Sessions Completed" },
  { value: "94%", label: "Satisfaction Rate" },
  { value: "40+", label: "Industries Covered" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white pt-10 pb-24 sm:pt-16 sm:pb-32">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-100 opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-40 w-80 h-80 rounded-full bg-violet-100 opacity-40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Mentorship Platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Grow with mentors who{" "}
              <span className="gradient-text">truly understand</span>{" "}
              your journey
            </h1>

            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with experienced professionals to make better career decisions and gain the clarity you deserve.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 gradient-bg text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-200 text-lg"
              >
                Find a Mentor
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/register?role=mentor"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold px-8 py-4 rounded-2xl border border-gray-200 hover:border-purple-300 hover:text-purple-700 transition-colors text-lg"
              >
                Become a Mentor
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2.5 text-gray-500 text-sm font-medium">
                  <badge.icon className="w-5 h-5 text-purple-600" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>

          {/* Hero mentor cards */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 border border-purple-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "Sophie Chen", role: "Product Manager at Spotify", match: "98%", tags: ["Career Change", "Product"] },
                  { name: "Marcus Dubois", role: "Founder at TechStart Paris", match: "95%", tags: ["Entrepreneurship", "Business"] },
                  { name: "Aisha Patel", role: "HR Director at L'Oréal", match: "91%", tags: ["Personal Growth", "Students"] },
                ].map((mentor) => (
                  <div key={mentor.name} className="bg-white rounded-2xl p-5 card-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {mentor.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <Zap className="w-3 h-3" /> {mentor.match} match
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{mentor.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 leading-tight">{mentor.role}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-400 mt-4 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                AI matching based on your goals, personality, and experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
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
                className="group flex flex-col items-center gap-4 p-8 rounded-2xl border border-gray-100 bg-white card-shadow-hover text-center"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <span className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works preview */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              From confused to confident in 4 steps
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              GrowVia is designed to turn uncertainty into clear, actionable plans.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-6 card-shadow">
                <div className="text-3xl font-black gradient-text mb-4">{step.num}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-purple-700 font-semibold hover:gap-3 transition-all"
            >
              See full process <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What our community says</h2>
            <p className="text-gray-500 text-lg">Real stories from people who found their direction.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-7 border border-gray-100 card-shadow card-shadow-hover"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500 text-lg">Start for free. Grow at your own pace.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Freemium",
                price: "Free",
                desc: "Try your first session",
                features: ["1 mentoring session", "1 AI Smart Matching", "Profile required"],
                cta: "Start for free",
                highlight: false,
              },
              {
                name: "Pay per Session",
                price: "29€",
                per: "/ session",
                desc: "Flexible access",
                features: ["Pay as you go", "Choose any mentor", "No commitment"],
                cta: "Book a session",
                highlight: false,
              },
              {
                name: "Subscription",
                price: "39€",
                per: "/ month",
                desc: "Best value for growth",
                features: [
                  "3 sessions / month",
                  "Unlimited AI matching",
                  "Priority booking",
                  "Personalized recommendations",
                ],
                cta: "Start subscription",
                highlight: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 relative ${
                  plan.highlight
                    ? "gradient-bg text-white shadow-xl shadow-purple-200"
                    : "bg-white border border-gray-100 card-shadow"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full">
                    Best Value
                  </div>
                )}
                <div className={`text-sm font-semibold mb-1 ${plan.highlight ? "text-purple-200" : "text-purple-600"}`}>
                  {plan.name}
                </div>
                <div className={`text-4xl font-black mb-0.5 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                  {plan.per && (
                    <span className="text-base font-normal ml-1">{plan.per}</span>
                  )}
                </div>
                <div className={`text-sm mb-5 ${plan.highlight ? "text-purple-200" : "text-gray-400"}`}>
                  {plan.desc}
                </div>
                <ul className="space-y-2.5 mb-7">
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
                  href="/pricing"
                  className={`block text-center font-semibold py-3 rounded-xl transition-all text-sm ${
                    plan.highlight ? "bg-white text-purple-700 hover:bg-purple-50" : "gradient-bg text-white hover:opacity-90"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For schools banner */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <div className="text-purple-400 text-sm font-semibold mb-2">For Institutions</div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Bring mentoring to your school or university
              </h2>
              <p className="text-gray-400 max-w-xl">
                Help your students navigate career decisions with structured mentoring. Track participation, measure impact,
                and build a culture of growth.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/for-schools"
                className="inline-flex items-center justify-center gap-2 gradient-bg text-white font-semibold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Request a Demo
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-gray-800 text-gray-200 font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            Your next step starts{" "}
            <span className="gradient-text">here</span>
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Join thousands of ambitious people who found clarity through GrowVia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 gradient-bg text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-200 text-lg"
            >
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 text-gray-600 font-semibold px-8 py-4 rounded-2xl border border-gray-200 hover:border-purple-300 hover:text-purple-700 transition-colors text-lg"
            >
              Learn More
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-5 flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            No credit card required. First session is always free.
          </p>
        </div>
      </section>
    </>
  );
}
