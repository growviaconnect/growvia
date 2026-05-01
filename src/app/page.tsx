"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";
import ManifestoSection from "@/components/ManifestoSection";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";
import ForYouSection from "@/components/ForYouSection";
import LogoTicker from "@/components/LogoTicker";
import MentorsSection from "@/components/MentorsSection";
import HeroParticles from "@/components/HeroParticles";
import SessionsGallery from "@/components/SessionsGallery";
import { useLang } from "@/contexts/LangContext";

const HERO_SECTORS = [
  "Finance", "Tech", "Marketing", "Consulting", "Design", "RH",
  "Stratégie", "Product", "Startups", "Growth", "Sales", "Data",
  "Legal", "Venture Capital", "Real Estate", "Management",
];

const ACCENT = "#A78BFA";
function hl(text: string, words: string[]) {
  if (!words.length) return <>{text}</>;
  const lower = words.map(w => w.toLowerCase());
  const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(regex).map((part, i) =>
    lower.includes(part.toLowerCase())
      ? <span key={i} style={{ color: ACCENT }}>{part}</span>
      : <span key={i}>{part}</span>
  );
}

export default function HomePage() {
  const { t } = useLang();

  const heroSectionRef = useRef<HTMLElement>(null);
  const heroImgRef     = useRef<HTMLImageElement>(null);
  useParallax(heroImgRef, heroSectionRef);

  const [mentorCount, setMentorCount] = useState(0);
  useEffect(() => {
    const target = 500;
    const duration = 1800;
    const totalFrames = Math.round(duration / (1000 / 60));
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setMentorCount(Math.round(progress * target));
      if (frame >= totalFrames) clearInterval(timer);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    {
      label: t("home_cat_students"),
      desc: t("home_cat_students_desc"),
      href: "/auth/register?category=students",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
    },
    {
      label: t("home_cat_career"),
      desc: t("home_cat_career_desc"),
      href: "/auth/register?category=career",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    },
    {
      label: t("home_cat_business"),
      desc: t("home_cat_business_desc"),
      href: "/auth/register?category=business",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
    },
    {
      label: t("home_cat_growth"),
      desc: t("home_cat_growth_desc"),
      href: "/auth/register?category=personal_growth",
      image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80",
    },
  ];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section ref={heroSectionRef} className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0">
          <img
            ref={heroImgRef}
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.25) saturate(0.4)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(13,10,26,0.5) 0%, transparent 30%, transparent 70%, #0D0A1A 100%)" }}
          />
          <HeroParticles />
        </div>

        {/* ── Main content — asymmetric grid ─────────────────────── */}
        <div className="relative flex-1 flex items-center pt-28 pb-8">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-center">

              {/* LEFT — massive bleeding headline */}
              <div>
                <p
                  className="animate-fade-up text-[10px] font-bold text-[#A78BFA] uppercase tracking-[0.32em] mb-8"
                  style={{ animationDelay: "0ms" }}
                >
                  {t("home_badge")}
                </p>
                <div className="animate-fade-up overflow-visible" style={{ animationDelay: "80ms" }}>
                  <p className="text-base md:text-lg font-semibold text-white/35 uppercase tracking-[0.25em] mb-1 leading-none">
                    {t("home_hero_eyebrow")}
                  </p>
                  <h1
                    className="font-extrabold text-white leading-[0.82] tracking-tighter whitespace-nowrap"
                    style={{ fontSize: "clamp(80px, 16vw, 230px)" }}
                  >
                    mentor.
                  </h1>
                  <p className="text-xl md:text-2xl font-semibold text-white/50 mt-5 leading-snug max-w-sm">
                    {t("home_hero_title3")}
                  </p>
                </div>
              </div>

              {/* RIGHT — counter + description + CTA */}
              <div
                className="animate-fade-up flex flex-col gap-8 lg:border-l lg:border-white/8 lg:pl-16"
                style={{ animationDelay: "220ms" }}
              >
                {/* Animated counter */}
                <div>
                  <div className="flex items-end gap-1 leading-none mb-2">
                    <span className="text-7xl font-extrabold text-white tabular-nums">
                      {mentorCount}
                    </span>
                    <span className="text-5xl font-extrabold mb-1" style={{ color: "#7C3AED" }}>+</span>
                  </div>
                  <p className="text-xs text-white/35 uppercase tracking-[0.25em]">
                    {t("home_counter_label")}
                  </p>
                </div>

                <div className="w-10 h-px bg-white/12" />

                {/* Description */}
                <p className="text-white/50 text-[15px] leading-relaxed">
                  {t("home_hero_sub")}
                </p>

                {/* Primary CTA */}
                <div className="flex flex-col gap-3">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center gap-2.5 text-white font-semibold px-7 py-4 rounded-lg transition-colors text-sm"
                    style={{ background: "#7C3AED" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#6D28D9"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#7C3AED"; }}
                  >
                    {t("home_build_future")} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/become-a-mentor"
                    className="inline-flex items-center justify-center gap-2 text-white/35 hover:text-white/70 font-medium py-2 transition-colors text-sm"
                  >
                    {t("home_watch_film")} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom sectors ticker ───────────────────────────────── */}
        <div className="relative border-t border-white/[0.07] py-5 overflow-hidden">
          <div className="animate-ticker flex items-center">
            {[...HERO_SECTORS, ...HERO_SECTORS].map((sector, i) => (
              <span
                key={i}
                className="flex-shrink-0 mx-10 text-[10px] font-bold uppercase tracking-[0.22em] text-white/25 whitespace-nowrap select-none"
                aria-hidden={i >= HERO_SECTORS.length ? "true" : undefined}
              >
                {sector}
              </span>
            ))}
          </div>
        </div>

      </section>

      {/* ── FOR YOU ──────────────────────────────────────────────── */}
      <ForYouSection />

      {/* ── MANIFESTO ────────────────────────────────────────────── */}
      <ManifestoSection />

      {/* ── SESSIONS GALLERY ─────────────────────────────────────── */}
      <SessionsGallery />

      {/* ── STATS ────────────────────────────────────────────────── */}
      <StatsSection />

      {/* ── LOGO TICKER ──────────────────────────────────────────── */}
      <LogoTicker />

      {/* ── MENTORS ──────────────────────────────────────────────── */}
      <MentorsSection />

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="reveal flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-[0.25em] mb-4">
                {t("home_cat_label")}
              </p>
              <h2 className="text-4xl md:text-[56px] lg:text-[76px] font-extrabold text-white tracking-tight leading-tight">
                {t("home_cat_title")}
              </h2>
            </div>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white transition-colors mb-1"
            >
              {t("home_browse_all")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={`reveal reveal-delay-${i + 1} group relative overflow-hidden rounded-xl flex flex-col justify-end border border-white/[0.08] hover:border-[#7C3AED]/60 transition-all duration-500`}
                style={{ background: "#1A1A2E", aspectRatio: "3 / 4" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 0 0 1px rgba(124,58,237,0.35), 0 8px 40px rgba(124,58,237,0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "";
                }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div className="w-full h-full transition-transform duration-700 group-hover:scale-[1.03]">
                    <img
                      src={cat.image}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover ken-burns-img"
                      style={{ animationDelay: `${i * 1.5}s` }}
                    />
                  </div>
                </div>
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)" }}
                />
                {/* Violet tint, fades in on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "linear-gradient(to top, rgba(76,29,149,0.45) 0%, transparent 60%)" }}
                />
                <div className="relative p-6">
                  <h3 className="text-white font-bold mb-2 leading-snug" style={{ fontSize: 20 }}>
                    {cat.label}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4">{cat.desc}</p>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <CTASection />
    </>
  );
}
