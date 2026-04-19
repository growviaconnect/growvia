"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

const categories = [
  {
    label: "Students",
    desc: "Find your academic and career direction",
    href: "/auth/register?category=students",
  },
  {
    label: "Career",
    desc: "Navigate transitions and land your dream role",
    href: "/auth/register?category=career",
  },
  {
    label: "Business",
    desc: "Scale your venture with proven mentorship",
    href: "/auth/register?category=business",
  },
  {
    label: "Personal Growth",
    desc: "Build confidence and unlock your potential",
    href: "/auth/register?category=personal_growth",
  },
];

const manifesto = [
  { num: "01", text: "Experience is only valuable when shared." },
  { num: "02", text: "The right mentor changes everything." },
  { num: "03", text: "Careers are built on real conversations." },
];

const mentorBenefits = [
  { title: "Lead generation on autopilot", desc: "Qualified mentees come to you — no cold outreach." },
  { title: "Zero admin", desc: "We handle scheduling, payments, and session tracking." },
  { title: "Your legacy, structured", desc: "Earn your Certified Mentor badge over time." },
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-end pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover object-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[#0D0A1A]/60" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0D0A1A 0%, #0D0A1A 15%, transparent 60%)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-5xl">
            <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8">
              Early Access · 2026
            </p>
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-extrabold text-white leading-[0.88] tracking-tight mb-10">
              Where<br />
              careers,<br />
              made.
            </h1>
            <p className="text-lg text-white/45 mb-12 max-w-md leading-relaxed">
              GrowVia connects ambitious professionals with mentors who have been exactly where you want to go.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors text-sm"
              >
                Build the future <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center gap-3 text-white/45 hover:text-white font-medium py-3.5 transition-colors text-sm">
                <span className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center flex-shrink-0">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                Watch the film
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ────────────────────────────────────────────── */}
      <section className="py-32 bg-[#0D0A1A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mb-16 reveal">
            <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8">Our Mission</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight">
              GrowVia turns decades of experience into the next generation&apos;s success.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {manifesto.map((item, i) => (
              <div key={item.num} className={`reveal reveal-delay-${i + 1} py-10 md:py-0 md:px-10 first:pl-0 last:pr-0`}>
                <p className="text-xs text-white/20 font-mono mb-5 tracking-widest">{item.num}</p>
                <p className="text-lg text-white/60 leading-relaxed font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 reveal">
            <div>
              <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">Mentoring Areas</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">What we cover.</h2>
            </div>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white transition-colors mt-6 md:mt-0"
            >
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5 border-t border-b border-white/5">
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                href={cat.href}
                className={`reveal reveal-delay-${i + 1} group flex flex-col justify-between p-8 hover:bg-[#7C3AED]/5 transition-colors duration-300`}
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#A78BFA] transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-sm text-white/35 leading-relaxed">{cat.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all mt-8" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR MENTORS ──────────────────────────────────────────── */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Text side */}
            <div className="reveal">
              <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8">For Mentors</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight">
                Turn your experience into someone&apos;s breakthrough.
              </h2>
              <p className="text-lg text-white/45 leading-relaxed mb-12">
                Your career took years to build. GrowVia lets you turn that expertise into real impact — on your schedule, with zero overhead.
              </p>
              <div className="space-y-8 mb-12">
                {mentorBenefits.map((b, i) => (
                  <div key={b.title} className={`reveal reveal-delay-${i + 1} flex gap-5`}>
                    <div className="w-px bg-[#7C3AED] flex-shrink-0 self-stretch" />
                    <div>
                      <p className="text-white font-semibold mb-1">{b.title}</p>
                      <p className="text-sm text-white/40 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/register?role=mentor"
                className="inline-flex items-center gap-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors text-sm"
              >
                Apply as a mentor <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Image side */}
            <div className="relative reveal">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=80"
                alt="Mentor session"
                className="w-full aspect-[4/5] object-cover rounded-xl"
                style={{ filter: "brightness(0.6) saturate(0.8)" }}
              />
              <div
                className="absolute inset-0 rounded-xl"
                style={{ background: "linear-gradient(to top, #0D0A1A 0%, transparent 55%)" }}
              />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Manual review</p>
                <p className="text-white font-semibold">Earn your Certified Mentor badge</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-40 border-t border-white/5 text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 reveal">
          <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-10">Get Started</p>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-[0.95] tracking-tight">
            Build the future,<br />starting today.
          </h2>
          <p className="text-xl text-white/35 mb-14 max-w-xl mx-auto leading-relaxed">
            Early access is open. Join GrowVia and shape what mentorship becomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
            >
              Find my mentor <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/register?role=mentor"
              className="inline-flex items-center justify-center gap-2.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
            >
              Apply as a mentor
            </Link>
          </div>
          <p className="text-sm text-white/20 mt-10">
            No commitment required · Discovery Session from 9.99€
          </p>
        </div>
      </section>
    </>
  );
}
