"use client";

import Link from "next/link";
import { ArrowRight, Heart, Target, Globe, Lightbulb, Play } from "lucide-react";

/* ── Real founders data ───────────────────────────────────────── */
const founders = [
  {
    name: "Luna Davin",
    role: "Co-Founder & CEO",
    initials: "LD",
    bio: "Luna experienced firsthand the confusion of choosing a career path after graduating. Unable to find mentors who truly understood her journey, she decided to build the platform she wished had existed. Her vision is to make quality mentoring accessible to every ambitious young person, regardless of their background.",
  },
  {
    name: "Yasmine Tunon",
    role: "Co-Founder & COO",
    initials: "YT",
    bio: "Yasmine brings a deep passion for human-centered design and community building. Having worked across multiple countries and industries, she understands the complexities of navigating a global job market. She leads operations, mentor quality, and the school partnerships program at GrowVia.",
  },
];

/* ── Real values data ─────────────────────────────────────────── */
const values = [
  {
    icon: Heart,
    title: "Human First",
    desc: "Every interaction on GrowVia is built around real human connection. We believe the most powerful guidance comes from people who truly care.",
  },
  {
    icon: Target,
    title: "Clarity Over Noise",
    desc: "We cut through the confusion. Every session ends with concrete next steps, not just inspiration.",
  },
  {
    icon: Globe,
    title: "Accessible to All",
    desc: "Career guidance should not be a privilege. We make quality mentoring available to students and professionals everywhere.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Growth",
    desc: "We believe in lifelong learning for everyone on the platform — mentors and mentees alike.",
  },
];

/* ── Testimonials (fake, for masonry) ─────────────────────────── */
const testimonials = [
  {
    type: "photo",
    name: "Sarah Chen",
    role: "Product Manager · Stripe",
    label: "MENTEE",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    imageH: "h-64",
    quote: "GrowVia didn't just connect me with a mentor. It changed how I see my potential entirely.",
  },
  {
    type: "quote",
    name: "Marcus Johnson",
    role: "VP Engineering · Mentor",
    label: "MENTOR",
    image: null,
    imageH: null,
    quote: "Seeing my mentee land their dream role reminded me why experience is meant to be shared. GrowVia makes that genuinely effortless — no scheduling back-and-forth, no admin.",
  },
  {
    type: "photo",
    name: "Aisha Patel",
    role: "Founder · EduScale",
    label: "MENTEE",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=600&q=80",
    imageH: "h-72",
    quote: "The AI matching was uncanny. My mentor had faced the exact same crossroads I was standing at.",
  },
  {
    type: "quote",
    name: "Thomas Dubois",
    role: "Strategy Consultant · Paris",
    label: "MENTEE",
    image: null,
    imageH: null,
    quote: "I had the direction, not the confidence. GrowVia gave me both — in my very first session.",
  },
  {
    type: "quote",
    name: "Elena Rossi",
    role: "Partner · McKinsey",
    label: "MENTOR",
    image: null,
    imageH: null,
    quote: "My schedule is packed, but GrowVia makes giving back genuinely frictionless. Zero overhead, maximum impact on someone's life.",
  },
  {
    type: "photo",
    name: "James Okonkwo",
    role: "Design Lead · Meta",
    label: "MENTOR",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    imageH: "h-60",
    quote: "I joined GrowVia to give back. I ended up learning as much as I taught.",
  },
];

/* ── Ticker names ─────────────────────────────────────────────── */
const tickerNames = [
  "Luna Davin", "Yasmine Tunon", "Sarah Chen", "Marcus Johnson",
  "Aisha Patel", "Thomas Dubois", "Elena Rossi", "James Okonkwo",
  "Priya Sharma", "Kwame Asante", "Isabel Ferreira", "Noah Blanc",
];

export default function FoundersPage() {
  return (
    <div className="bg-[#0D0A1A]">

      {/* ── SECTION 1: Hero ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-32">
        <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-10">
          Founders · GrowVia
        </p>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.0] tracking-tight max-w-5xl mb-8">
          We accelerate the world&apos;s best{" "}
          <span
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontWeight: 400,
              textShadow: "0 0 60px rgba(124,58,237,0.3)",
              textDecoration: "underline",
              textDecorationColor: "rgba(76,29,149,0.5)",
              textDecorationThickness: "2px",
              textUnderlineOffset: "6px",
            }}
          >
            careers
          </span>{" "}
          with mentoring,<br />
          network &amp; expertise.
        </h1>

        <p className="text-lg text-white/45 max-w-2xl leading-relaxed mb-12">
          GrowVia connects ambitious professionals with world-class mentors through AI — in minutes, not months.
        </p>

        <Link
          href="/auth/register"
          className="text-sm font-semibold text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all duration-200 inline-flex items-center gap-2"
        >
          Apply to GrowVia <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── SECTION 2: Testimonials masonry ──────────────────── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">Stories</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Words that matter.
            </h2>
          </div>

          {/* Masonry grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="break-inside-avoid mb-5">
                {t.type === "photo" ? (
                  /* Photo card */
                  <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/8">
                    <img
                      src={t.image!}
                      alt={t.name}
                      className={`w-full object-cover object-center ${t.imageH}`}
                      style={{ filter: "brightness(0.45) saturate(0.5)" }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, #0D0A1A 0%, rgba(13,10,26,0.6) 55%, transparent 100%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-[0.2em] mb-3 block">
                        {t.label}
                      </span>
                      <p className="text-base font-semibold text-white leading-snug mb-4">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <div className="border-t border-white/8 pt-3">
                        <p className="text-xs font-semibold text-white">{t.name}</p>
                        <p className="text-xs text-white/35 mt-0.5">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Quote card */
                  <div
                    className="rounded-2xl p-7 ring-1 ring-white/8"
                    style={{ background: "#1A1A2E" }}
                  >
                    <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-[0.2em] mb-6 block">
                      {t.label}
                    </span>
                    <p className="text-xl font-bold text-white leading-snug mb-7">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="border-t border-white/8 pt-5">
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-white/35 mt-1">{t.role}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Ticker ────────────────────────────────── */}
      <section className="border-t border-white/5 py-7 overflow-hidden">
        <div className="animate-ticker flex">
          {[...tickerNames, ...tickerNames].map((name, i) => (
            <span key={i} className="flex items-center whitespace-nowrap">
              <span className="text-sm font-medium text-white/35 px-7">{name}</span>
              <span className="text-[#7C3AED] text-base leading-none">·</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: Video placeholder ─────────────────────── */}
      <section className="relative overflow-hidden" style={{ aspectRatio: "16 / 7" }}>
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.3) saturate(0.4)" }}
        />
        {/* Dark violet overlay */}
        <div className="absolute inset-0" style={{ background: "rgba(76,29,149,0.18)" }} />
        {/* Bottom fade into page */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0D0A1A 0%, transparent 30%)" }} />

        {/* Play button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <button
            className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center hover:border-white/50 hover:bg-white/8 transition-all duration-300 group"
            aria-label="Play video"
          >
            <Play className="w-7 h-7 text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
          </button>
          <p className="text-xs text-white/30 uppercase tracking-[0.25em]">Watch our story</p>
        </div>
      </section>

      {/* ── SECTION 5: Stats ─────────────────────────────────── */}
      <section className="border-t border-white/5 py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 items-center gap-16">

            {/* Left tilted card */}
            <div className="hidden lg:flex justify-end">
              <div
                className="w-52 rounded-2xl p-6 ring-1 ring-white/8 flex-shrink-0"
                style={{ background: "#1A1A2E", transform: "rotate(-9deg)" }}
              >
                <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-4">MENTEE</p>
                <p className="text-sm font-bold text-white leading-snug">
                  &ldquo;Three sessions in, I had a clear five-year plan. Nothing else came close.&rdquo;
                </p>
                <p className="text-xs text-white/25 mt-5">Sarah Chen · Stripe</p>
              </div>
            </div>

            {/* Center stats — vertical stack */}
            <div className="text-center space-y-8">
              <div>
                <p className="text-7xl md:text-8xl font-extrabold text-white tracking-tight leading-none">500+</p>
                <p className="text-xs text-white/25 uppercase tracking-[0.3em] mt-3">Mentors</p>
              </div>
              <div className="w-10 h-px bg-[#4C1D95]/40 mx-auto" />
              <div>
                <p className="text-7xl md:text-8xl font-extrabold text-white tracking-tight leading-none">95%</p>
                <p className="text-xs text-white/25 uppercase tracking-[0.3em] mt-3">Satisfaction</p>
              </div>
              <div className="w-10 h-px bg-[#4C1D95]/40 mx-auto" />
              <div>
                <p className="text-7xl md:text-8xl font-extrabold text-white tracking-tight leading-none">10K+</p>
                <p className="text-xs text-white/25 uppercase tracking-[0.3em] mt-3">Sessions</p>
              </div>
            </div>

            {/* Right tilted card */}
            <div className="hidden lg:flex justify-start">
              <div
                className="w-52 rounded-2xl p-6 ring-1 ring-white/8 flex-shrink-0"
                style={{ background: "#1A1A2E", transform: "rotate(9deg)" }}
              >
                <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-4">MENTOR</p>
                <p className="text-sm font-bold text-white leading-snug">
                  &ldquo;My mentee&apos;s progress amazes me every week. This platform just works.&rdquo;
                </p>
                <p className="text-xs text-white/25 mt-5">Marcus Johnson · VP Eng</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 6: Partner with us ───────────────────────── */}
      <section className="border-t border-white/5 py-40 text-center">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-6xl md:text-7xl lg:text-[6rem] font-extrabold text-white tracking-tight leading-none mb-12">
            Partner with us.
          </h2>
          <Link
            href="/contact"
            className="text-xs font-bold text-white uppercase tracking-[0.3em] underline underline-offset-8 decoration-white/20 hover:decoration-white transition-all duration-200"
          >
            Get in touch
          </Link>
        </div>
      </section>

      {/* ── SECTION 7: Founders ───────────────────────────────── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">The Team</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Meet the founders.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            {founders.map((f) => (
              <div
                key={f.name}
                className="rounded-2xl p-8 ring-1 ring-white/8"
                style={{ background: "#0F0D1F" }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-base mb-7 ring-1 ring-[#7C3AED]/20"
                  style={{ background: "rgba(76,29,149,0.35)" }}
                >
                  {f.initials}
                </div>
                <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-[0.2em] mb-2">
                  {f.role}
                </p>
                <h3 className="text-xl font-bold text-white mb-4">{f.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Mission ────────────────────────────────── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8">
                Our Mission
              </p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-8">
                Connect generations and unlock potential.
              </h2>
              <div className="space-y-5 text-white/45 text-base leading-relaxed">
                <p>
                  Too many students and young professionals face the same challenge: they have ambition, but lack direction. They are overwhelmed by choices, unsure of their strengths, and unable to find someone who truly understands their situation.
                </p>
                <p>
                  At the same time, thousands of experienced professionals want to give back, share their knowledge, and make a real difference in someone else&apos;s career.
                </p>
                <p>
                  GrowVia bridges that gap — creating the conditions for genuine, structured, and impactful mentoring relationships.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "2024", label: "Year Founded" },
                { value: "Paris", label: "Headquarters" },
                { value: "3+", label: "Languages" },
                { value: "Global", label: "Vision" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-7 ring-1 ring-white/8"
                  style={{ background: "#0F0D1F" }}
                >
                  <p className="text-3xl font-extrabold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-white/35 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Values ─────────────────────────────────── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
              What we believe in
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Principles that guide us.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-xl p-7 ring-1 ring-white/8"
                style={{ background: "#0F0D1F" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 ring-1 ring-[#7C3AED]/15"
                  style={{ background: "rgba(76,29,149,0.25)" }}
                >
                  <v.icon className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: CTA ────────────────────────────────────── */}
      <section className="border-t border-white/5 py-40 text-center">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-10">
            Join us
          </p>
          <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-8">
            Join us on this journey.
          </h2>
          <p className="text-lg text-white/40 mb-14 leading-relaxed">
            Whether you want to grow or give back, there is a place for you at GrowVia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
