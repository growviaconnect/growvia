"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";
import ManifestoSection from "@/components/ManifestoSection";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";
import ForYouSection from "@/components/ForYouSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LogoTicker from "@/components/LogoTicker";
import MentorsSection from "@/components/MentorsSection";
import HeroParticles from "@/components/HeroParticles";
import TypewriterText from "@/components/TypewriterText";
import { useLang } from "@/contexts/LangContext";

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
      <section ref={heroSectionRef} className="relative min-h-screen flex items-end pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            ref={heroImgRef}
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover object-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[#0D0A1A]/60" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0D0A1A 0%, #0D0A1A 8%, rgba(13,10,26,0.7) 40%, rgba(13,10,26,0.2) 75%, transparent 100%)" }} />
          <HeroParticles />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <p className="animate-fade-up text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8" style={{ animationDelay: "0ms" }}>
              {t("home_badge")}
            </p>
            <h1 className="animate-fade-up text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[0.92] tracking-tight mb-10" style={{ animationDelay: "120ms" }}>
              {hl(t("home_hero_title1"), ["mentor"])}<br />{t("home_hero_title2")}<br />{hl(t("home_hero_title3"), ["you", "tu", "tú"])}
            </h1>
            <p className="animate-fade-up text-lg text-white/45 mb-12 max-w-md mx-auto leading-relaxed" style={{ animationDelay: "240ms" }}>
              {hl(t("home_hero_sub_pre"), ["mentors", "matching"])}{" "}
              <TypewriterText
                texts={[
                  t("home_hero_sub_typed"),
                  t("home_hero_sub_typed_2"),
                  t("home_hero_sub_typed_3"),
                  t("home_hero_sub_typed_4"),
                ]}
                delay={1400}
                speed={50}
                className="text-white/70"
              />
            </p>
            <div className="animate-fade-up flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "360ms" }}>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors text-sm"
              >
                {t("home_build_future")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/become-a-mentor"
                className="inline-flex items-center gap-3 text-white/45 hover:text-white font-medium py-3.5 transition-colors text-sm"
              >
                <span className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3 h-3" />
                </span>
                {t("home_watch_film")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR YOU ──────────────────────────────────────────────── */}
      <ForYouSection />

      {/* ── MANIFESTO ────────────────────────────────────────────── */}
      <ManifestoSection />

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
                {/* Violet tint — fades in on hover */}
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

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <CTASection />
    </>
  );
}
