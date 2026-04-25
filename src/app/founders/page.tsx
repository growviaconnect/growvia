"use client";

import Link from "next/link";
import { ArrowRight, Heart, Target, Globe, Lightbulb, Play } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

/* ── Ticker names ─────────────────────────────────────────────── */
const tickerNames = [
  "Luna Davin", "Yasmine Tunon", "Sarah Chen", "Marcus Johnson",
  "Aisha Patel", "Thomas Dubois", "Elena Rossi", "James Okonkwo",
  "Priya Sharma", "Kwame Asante", "Isabel Ferreira", "Noah Blanc",
];

export default function FoundersPage() {
  const { t } = useLang();

  const founders = [
    {
      name: "Luna Davin",
      role: "Co-Founder & CEO",
      initials: "LD",
      bio: t("founders_founder1_bio"),
    },
    {
      name: "Yasmine Tunon",
      role: "Co-Founder & COO",
      initials: "YT",
      bio: t("founders_founder2_bio"),
    },
  ];

  const values = [
    { icon: Heart,    title: t("founders_value1_title"), desc: t("founders_value1_desc") },
    { icon: Target,   title: t("founders_value2_title"), desc: t("founders_value2_desc") },
    { icon: Globe,    title: t("founders_value3_title"), desc: t("founders_value3_desc") },
    { icon: Lightbulb, title: t("founders_value4_title"), desc: t("founders_value4_desc") },
  ];

  const testimonials = [
    {
      type: "photo",
      name: "Sarah Chen",
      role: "Product Manager · Stripe",
      label: t("founders_testimonial_mentee"),
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
      imageH: "h-64",
      quote: t("founders_t1_quote"),
    },
    {
      type: "quote",
      name: "Marcus Johnson",
      role: "VP Engineering · Mentor",
      label: t("founders_testimonial_mentor"),
      image: null,
      imageH: null,
      quote: t("founders_t2_quote"),
    },
    {
      type: "photo",
      name: "Aisha Patel",
      role: "Founder · EduScale",
      label: t("founders_testimonial_mentee"),
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=600&q=80",
      imageH: "h-72",
      quote: t("founders_t3_quote"),
    },
    {
      type: "quote",
      name: "Thomas Dubois",
      role: "Strategy Consultant · Paris",
      label: t("founders_testimonial_mentee"),
      image: null,
      imageH: null,
      quote: t("founders_t4_quote"),
    },
    {
      type: "quote",
      name: "Elena Rossi",
      role: "Partner · McKinsey",
      label: t("founders_testimonial_mentor"),
      image: null,
      imageH: null,
      quote: t("founders_t5_quote"),
    },
    {
      type: "photo",
      name: "James Okonkwo",
      role: "Design Lead · Meta",
      label: t("founders_testimonial_mentor"),
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
      imageH: "h-60",
      quote: t("founders_t6_quote"),
    },
  ];

  return (
    <div className="bg-[#0D0A1A]">

      {/* ── SECTION 1: Hero ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-32">
        <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-10">
          {t("founders_label")}
        </p>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.0] tracking-tight max-w-5xl mb-8">
          {t("founders_hero_before")}
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
            {t("founders_hero_italic")}
          </span>
          {t("founders_hero_after")}
        </h1>

        <p className="text-lg text-white/45 max-w-2xl leading-relaxed mb-12">
          {t("founders_hero_sub")}
        </p>

        <Link
          href="/auth/register"
          className="text-sm font-semibold text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all duration-200 inline-flex items-center gap-2"
        >
          {t("founders_hero_cta")} <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── SECTION 2: Testimonials masonry ──────────────────── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
              {t("founders_stories_label")}
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {t("founders_stories_title")}
            </h2>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
            {testimonials.map((item) => (
              <div key={item.name} className="break-inside-avoid mb-5">
                {item.type === "photo" ? (
                  <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/8">
                    <img
                      src={item.image!}
                      alt={item.name}
                      className={`w-full object-cover object-center ${item.imageH}`}
                      style={{ filter: "brightness(0.45) saturate(0.5)" }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, #0D0A1A 0%, rgba(13,10,26,0.6) 55%, transparent 100%)" }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-[0.2em] mb-3 block">
                        {item.label}
                      </span>
                      <p className="text-base font-semibold text-white leading-snug mb-4">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div className="border-t border-white/8 pt-3">
                        <p className="text-xs font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-white/35 mt-0.5">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl p-7 ring-1 ring-white/8" style={{ background: "#1A1A2E" }}>
                    <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-[0.2em] mb-6 block">
                      {item.label}
                    </span>
                    <p className="text-xl font-bold text-white leading-snug mb-7">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <div className="border-t border-white/8 pt-5">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-white/35 mt-1">{item.role}</p>
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
        <img
          src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.3) saturate(0.4)" }}
        />
        <div className="absolute inset-0" style={{ background: "rgba(76,29,149,0.18)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0D0A1A 0%, transparent 30%)" }} />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <button
            className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center hover:border-white/50 hover:bg-white/8 transition-all duration-300 group"
            aria-label="Play video"
          >
            <Play className="w-7 h-7 text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
          </button>
          <p className="text-xs text-white/30 uppercase tracking-[0.25em]">{t("founders_video_label")}</p>
        </div>
      </section>

      {/* ── SECTION 5: Stats ─────────────────────────────────── */}
      <section className="border-t border-white/5 py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 items-center gap-16">

            <div className="hidden lg:flex justify-end">
              <div
                className="w-52 rounded-2xl p-6 ring-1 ring-white/8 flex-shrink-0"
                style={{ background: "#1A1A2E", transform: "rotate(-9deg)" }}
              >
                <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-4">
                  {t("founders_testimonial_mentee")}
                </p>
                <p className="text-sm font-bold text-white leading-snug">
                  &ldquo;{t("founders_stat1_quote")}&rdquo;
                </p>
                <p className="text-xs text-white/25 mt-5">Sarah Chen · Stripe</p>
              </div>
            </div>

            <div className="text-center space-y-8">
              <div>
                <p className="text-7xl md:text-8xl font-extrabold text-white tracking-tight leading-none">500+</p>
                <p className="text-xs text-white/25 uppercase tracking-[0.3em] mt-3">{t("stats_badge_mentors")}</p>
              </div>
              <div className="w-10 h-px bg-[#4C1D95]/40 mx-auto" />
              <div>
                <p className="text-7xl md:text-8xl font-extrabold text-white tracking-tight leading-none">95%</p>
                <p className="text-xs text-white/25 uppercase tracking-[0.3em] mt-3">{t("stats_badge_success")}</p>
              </div>
              <div className="w-10 h-px bg-[#4C1D95]/40 mx-auto" />
              <div>
                <p className="text-7xl md:text-8xl font-extrabold text-white tracking-tight leading-none">10K+</p>
                <p className="text-xs text-white/25 uppercase tracking-[0.3em] mt-3">{t("stats_badge_sessions")}</p>
              </div>
            </div>

            <div className="hidden lg:flex justify-start">
              <div
                className="w-52 rounded-2xl p-6 ring-1 ring-white/8 flex-shrink-0"
                style={{ background: "#1A1A2E", transform: "rotate(9deg)" }}
              >
                <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-4">
                  {t("founders_testimonial_mentor")}
                </p>
                <p className="text-sm font-bold text-white leading-snug">
                  &ldquo;{t("founders_stat2_quote")}&rdquo;
                </p>
                <p className="text-xs text-white/25 mt-5">Marcus Johnson · VP Eng</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 6: Partner ───────────────────────────────── */}
      <section className="border-t border-white/5 py-40 text-center">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-6xl md:text-7xl lg:text-[6rem] font-extrabold text-white tracking-tight leading-none mb-12">
            {t("founders_partner_title")}
          </h2>
          <Link
            href="/contact"
            className="text-xs font-bold text-white uppercase tracking-[0.3em] underline underline-offset-8 decoration-white/20 hover:decoration-white transition-all duration-200"
          >
            {t("founders_partner_cta")}
          </Link>
        </div>
      </section>

      {/* ── SECTION 7: Founders ───────────────────────────────── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
              {t("founders_team_label")}
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {t("founders_team_title")}
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

      {/* ── SECTION 8: Mission ────────────────────────────────── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8">
                {t("founders_mission_label")}
              </p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-8">
                {t("founders_mission_title")}
              </h2>
              <div className="space-y-5 text-white/45 text-base leading-relaxed">
                <p>{t("founders_mission_p1")}</p>
                <p>{t("founders_mission_p2")}</p>
                <p>{t("founders_mission_p3")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "2024", label: t("founders_stat_founded") },
                { value: "Paris", label: t("founders_stat_hq") },
                { value: "3+",    label: t("founders_stat_langs") },
                { value: "Global", label: t("founders_stat_vision") },
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

      {/* ── SECTION 9: Values ─────────────────────────────────── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
              {t("founders_values_label")}
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {t("founders_values_title")}
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

      {/* ── SECTION 10: CTA ───────────────────────────────────── */}
      <section className="border-t border-white/5 py-40 text-center">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-10">
            {t("founders_cta_label")}
          </p>
          <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-8">
            {t("founders_cta_title")}
          </h2>
          <p className="text-lg text-white/40 mb-14 leading-relaxed">
            {t("founders_cta_sub")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
            >
              {t("founders_cta_start")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
            >
              {t("founders_cta_contact")}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
