import Link from "next/link";
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  UserCheck,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Heart,
  Quote,
} from "lucide-react";

const categories = [
  {
    icon: GraduationCap,
    label: "Students",
    desc: "Helping students choose their future path, academic specialization, and university direction with guidance from experienced mentors.",
    iconColor: "#8b5cf6",
    bgColor: "bg-violet-50",
    count: 320,
    href: "/auth/register?category=students",
  },
  {
    icon: Briefcase,
    label: "Career",
    desc: "Navigate career transitions, discover your path, and land your dream job.",
    iconColor: "#3b82f6",
    bgColor: "bg-blue-50",
    count: 450,
    href: "/auth/register?category=career",
  },
  {
    icon: TrendingUp,
    label: "Business",
    desc: "Start, scale, and grow your professional or entrepreneurial journey.",
    iconColor: "#22c55e",
    bgColor: "bg-green-50",
    count: 380,
    href: "/auth/register?category=business",
  },
  {
    icon: Heart,
    label: "Personal Growth",
    desc: "Build confidence, clarity, and unlock your full potential.",
    iconColor: "#ec4899",
    bgColor: "bg-pink-50",
    count: 410,
    href: "/auth/register?category=personal_growth",
  },
];

const featuredMentors = [
  {
    name: "Sophie Chen",
    title: "Product Manager at Spotify",
    expertise: ["Career Change", "Product"],
    rating: 5.0,
    sessions: 128,
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop",
    initials: "SC",
  },
  {
    name: "Marcus Dubois",
    title: "Founder, TechStart Paris",
    expertise: ["Entrepreneurship", "Business"],
    rating: 4.9,
    sessions: 94,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
    initials: "MD",
  },
  {
    name: "Aisha Patel",
    title: "HR Director at L'Oréal",
    expertise: ["Personal Growth", "Students"],
    rating: 5.0,
    sessions: 212,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop",
    initials: "AP",
  },
  {
    name: "James Miller",
    title: "Engineering Lead at Airbnb",
    expertise: ["Career", "Tech"],
    rating: 4.8,
    sessions: 76,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop",
    initials: "JM",
  },
];

const testimonials = [
  {
    content:
      "GrowVia connected me with a mentor who completely transformed my career trajectory. Within 3 months, I landed my dream role at a top tech company.",
    author: "Emily Rodriguez",
    role: "Product Manager at Google",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
    rating: 5,
  },
  {
    content:
      "The quality of mentors on this platform is exceptional. My business mentor helped me scale my startup from $0 to $2M ARR in just one year.",
    author: "Marcus Chen",
    role: "Founder, TechFlow",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
    rating: 5,
  },
  {
    content:
      "I was skeptical at first, but the personalized matching and the depth of expertise available here exceeded all my expectations. Truly life-changing.",
    author: "Sarah Johnson",
    role: "Engineering Lead at Meta",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&auto=format&fit=crop",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Full gradient background */}
        <div className="absolute inset-0 gradient-bg-soft" />
        {/* Blur orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse-soft" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse-soft"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* ── LEFT: Text ── */}
            <div>
              {/* Avatar strip badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-purple-100 shadow-sm mb-8">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
                    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100",
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-purple-700">2,500+</span> mentors worldwide
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Grow with mentors who{" "}
                <span className="gradient-text">truly understand</span>{" "}
                your journey
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
                Connect with experienced professionals who share real-world insights to help you make better career
                decisions and accelerate your personal and professional growth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 text-base w-full sm:w-auto"
                >
                  Find a Mentor <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/register?role=mentor"
                  className="inline-flex items-center justify-center gap-2 border border-purple-200 hover:bg-purple-50 text-purple-700 font-semibold px-8 py-4 rounded-2xl transition-colors text-base w-full sm:w-auto"
                >
                  <Heart className="w-4 h-4" />
                  Become a Mentor
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-10">
                {[
                  { icon: Users, text: "One-to-one mentoring" },
                  { icon: UserCheck, text: "Verified mentors" },
                  { icon: Sparkles, text: "AI Smart Matching available" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <b.icon className="w-4 h-4 text-purple-500" />
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                {[
                  { icon: Star, value: "4.9/5", label: "Avg. Rating" },
                  { icon: Users, value: "50K+", label: "Sessions" },
                  { icon: UserCheck, value: "98%", label: "Satisfaction" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{s.value}</p>
                      <p className="text-sm text-gray-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Image ── */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main image */}
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20">
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800"
                    alt="Mentor and mentee in a one-to-one session"
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
                </div>

                {/* Floating card – mentor */}
                <div className="absolute -left-8 top-20 bg-white rounded-2xl p-4 shadow-xl shadow-purple-500/10 z-20 animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100"
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">Sarah Chen</p>
                      <p className="text-xs text-gray-500">Leadership Coach</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">5.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating card – success stories */}
                <div
                  className="absolute -right-6 bottom-32 bg-white rounded-2xl p-4 shadow-xl shadow-purple-500/10 z-20"
                  style={{ animation: "bounce-slow 5s ease-in-out infinite" }}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-700">15K+</p>
                    <p className="text-xs text-gray-500">Success Stories</p>
                  </div>
                </div>

                {/* Background decoration */}
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
                <p className="text-sm text-purple-600 font-medium">{cat.count}+ mentors</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED MENTORS ──────────────────────────────────── */}
      <section className="py-24 gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured mentors</h2>
              <p className="text-lg text-gray-600 max-w-xl">Hand-picked experts ready to guide you to success</p>
            </div>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-medium mt-4 md:mt-0 text-sm"
            >
              View all mentors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMentors.map((mentor) => (
              <Link
                key={mentor.name}
                href="/auth/register"
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{mentor.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                    {mentor.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{mentor.title}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{mentor.sessions} sessions</span>
                    <span className="font-semibold text-purple-700">€29/hr</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS (dark bg) ──────────────────────────────── */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by thousands of professionals</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              See how our mentors have helped people achieve their goals
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={t.author} className="relative">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-8 h-full hover:border-purple-500/50 transition-colors">
                  <Quote className="w-10 h-10 text-purple-500/30 mb-6" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-8 leading-relaxed">"{t.content}"</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={t.avatar}
                      alt={t.author}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
                    />
                    <div>
                      <p className="font-semibold text-white">{t.author}</p>
                      <p className="text-sm text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                <span className="text-sm text-purple-200">Start your growth journey today</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to accelerate your success?
              </h2>
              <p className="text-lg md:text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
                Join thousands of professionals who have transformed their careers with personalized mentorship from
                world-class experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-purple-800 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-100 shadow-xl shadow-purple-900/30 text-base"
                >
                  Find a Mentor <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors text-base"
                >
                  Learn More
                </Link>
              </div>
              <p className="text-sm text-purple-300 mt-8">
                No commitment required • Free to browse • Book your first session in minutes
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
