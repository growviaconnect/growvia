"use client";

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
import { useLang } from "@/contexts/LangContext";

export default function HomePage() {
  const { t } = useLang();

  const categories = [
    {
      icon: GraduationCap,
      label: t("cat_students"),
      desc: t("cat_students_desc"),
      href: "/auth/register?category=students",
    },
    {
      icon: Briefcase,
      label: t("cat_career"),
      desc: t("cat_career_desc"),
      href: "/auth/register?category=career",
    },
    {
      icon: TrendingUp,
      label: t("cat_business"),
      desc: t("cat_business_desc"),
      href: "/auth/register?category=business",
    },
    {
      icon: Heart,
      label: t("cat_growth"),
      desc: t("cat_growth_desc"),
      href: "/auth/register?category=personal_growth",
    },
  ];

  const mentorBenefits = [
    {
      icon: Zap,
      title: t("mentor_b1_title"),
      desc: t("mentor_b1_desc"),
    },
    {
      icon: Settings,
      title: t("mentor_b2_title"),
      desc: t("mentor_b2_desc"),
    },
    {
      icon: Award,
      title: t("mentor_b3_title"),
      desc: t("mentor_b3_desc"),
    },
  ];

  const communitySlots = [
    t("community_slot_career"),
    t("community_slot_entrepreneur"),
    t("community_slot_personal"),
    t("community_slot_student"),
  ];

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F1020 0%, #1B1F3B 100%)" }}
      >
        {/* Glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-soft" style={{ background: "#5B3DF5" }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 animate-pulse-soft" style={{ background: "#7C5CFF", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-5" style={{ background: "#5B3DF5" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── LEFT ── */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium" style={{ background: "rgba(91,61,245,0.15)", color: "#9B8FFF", border: "1px solid rgba(91,61,245,0.3)" }}>
                <Rocket className="w-3.5 h-3.5" />
                {t("hero_badge")}
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
                {t("hero_title_1")}<br />
                {t("hero_title_2")}{" "}
                <span className="gradient-text">{t("hero_title_hl")}</span><br />
                {t("hero_title_3")}
              </h1>

              <p className="text-lg md:text-xl mb-10 max-w-lg leading-relaxed" style={{ color: "#9B8FFF" }}>
                {t("hero_sub")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 gradient-bg text-white font-semibold px-8 py-4 rounded-xl transition-all hover:opacity-90 shadow-2xl text-base w-full sm:w-auto"
                  style={{ boxShadow: "0 12px 32px rgba(91,61,245,0.4)" }}
                >
                  {t("hero_find")} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/register?role=mentor"
                  className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl transition-all text-base w-full sm:w-auto"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#E8E4FF", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <UserPlus className="w-4 h-4" />
                  {t("hero_become")}
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { icon: Users, key: "trust_one2one" },
                  { icon: UserCheck, key: "trust_verified" },
                  { icon: Sparkles, key: "trust_ai" },
                ].map((b) => (
                  <div key={b.key} className="flex items-center gap-1.5 text-sm" style={{ color: "#6B6F80" }}>
                    <b.icon className="w-4 h-4 text-purple-500" />
                    <span>{t(b.key)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="relative z-10 rounded-3xl overflow-hidden" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(91,61,245,0.2)" }}>
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800"
                    alt="Mentor and mentee in a one-to-one session"
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,16,32,0.5) 0%, transparent 60%)" }} />
                </div>

                {/* Floating card – discovery session */}
                <div className="absolute -left-10 top-16 bg-white rounded-2xl p-4 z-20 animate-float" style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(91,61,245,0.1)" }}>
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{t("hero_card_discovery")}</p>
                      <p className="text-xs" style={{ color: "#6B6F80" }}>{t("hero_card_price")}</p>
                    </div>
                  </div>
                </div>

                {/* Floating card – mentors */}
                <div className="absolute -right-8 bottom-28 bg-white rounded-2xl p-4 z-20 animate-float" style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.15)", animationDelay: "1.5s" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(91,61,245,0.1)" }}>
                      <UserPlus className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{t("hero_card_mentors")}</p>
                      <p className="text-xs" style={{ color: "#6B6F80" }}>{t("hero_card_join")}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -z-10 -bottom-8 -right-8 w-72 h-72 rounded-3xl" style={{ background: "rgba(91,61,245,0.12)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-3">{t("cat_label")}</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
              {t("cat_title")}
            </h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#6B6F80" }}>
              {t("cat_sub")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                href={cat.href}
                className={`reveal reveal-delay-${i + 1} group block p-7 rounded-2xl border border-gray-100 hover:border-purple-200 card-shadow-hover bg-white h-full transition-all duration-300`}
                style={{ boxShadow: "0 2px 16px rgba(91,61,245,0.05)" }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center" style={{ background: "rgba(91,61,245,0.08)", width: "52px", height: "52px" }}>
                    <cat.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 mt-1 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: "#6B6F80" }}>{cat.desc}</p>
                <p className="text-xs text-purple-600 font-medium inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t("cat_accepting")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MENTOR VALUE SECTION ───────────────────────────────── */}
      <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F1020 0%, #1B1F3B 100%)" }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15 animate-pulse-soft" style={{ background: "#5B3DF5" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-10 animate-pulse-soft" style={{ background: "#7C5CFF", animationDelay: "2s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold" style={{ background: "rgba(91,61,245,0.15)", color: "#9B8FFF", border: "1px solid rgba(91,61,245,0.3)" }}>
              <Award className="w-4 h-4" />
              {t("mentor_badge")}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t("mentor_title_1")}{" "}
              <span className="gradient-text">{t("mentor_title_hl")}</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#9B8FFF" }}>
              {t("mentor_sub")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {mentorBenefits.map((b, i) => (
              <div
                key={b.title}
                className={`reveal reveal-delay-${i + 1} rounded-2xl p-8`}
                style={{ background: "rgba(91,61,245,0.07)", border: "1px solid rgba(91,61,245,0.18)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(91,61,245,0.15)" }}>
                  <b.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#9B8FFF" }}>{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center reveal">
            <Link
              href="/auth/register?role=mentor"
              className="inline-flex items-center gap-2 gradient-bg text-white font-semibold px-8 py-4 rounded-xl transition-all hover:opacity-90 text-base"
              style={{ boxShadow: "0 12px 32px rgba(91,61,245,0.35)" }}
            >
              <UserPlus className="w-5 h-5" />
              {t("mentor_apply")}
            </Link>
            <p className="text-sm mt-4" style={{ color: "#6B6F80" }}>{t("mentor_apply_sub")}</p>
          </div>
        </div>
      </section>

      {/* ─── MENTOR PROFILES PLACEHOLDER ──────────────────────── */}
      <section className="py-28 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 reveal">
            <div>
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-3">{t("community_label")}</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("community_title")}</h2>
              <p className="text-lg max-w-xl leading-relaxed" style={{ color: "#6B6F80" }}>
                {t("community_sub")}
              </p>
            </div>
            <Link
              href="/auth/register?role=mentor"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mt-4 md:mt-0 text-sm transition-colors"
            >
              {t("community_apply_link")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communitySlots.map((label, i) => (
              <div
                key={label}
                className={`reveal reveal-delay-${i + 1} bg-white rounded-2xl overflow-hidden`}
                style={{ border: "2px dashed rgba(91,61,245,0.2)", boxShadow: "0 2px 16px rgba(91,61,245,0.04)" }}
              >
                <div className="h-44 flex flex-col items-center justify-center gap-3" style={{ background: "rgba(91,61,245,0.04)" }}>
                  <UserCheck className="w-10 h-10 text-purple-300" />
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">{label}</span>
                </div>
                <div className="p-5 text-center">
                  <p className="font-semibold text-sm mb-1" style={{ color: "#6B6F80" }}>{t("community_slot_coming")}</p>
                  <p className="text-xs" style={{ color: "#9B8FFF" }}>{t("community_slot_reviewing")}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm mt-10" style={{ color: "#6B6F80" }}>
            {t("community_expert")}{" "}
            <Link href="/auth/register?role=mentor" className="text-purple-600 font-semibold hover:underline">
              {t("community_apply_text")}
            </Link>
          </p>
        </div>
      </section>

      {/* ─── FIRST SUCCESS STORY CTA ─────────────────────────── */}
      <section className="py-28 relative overflow-hidden" style={{ background: "#0F1020" }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: "#5B3DF5" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: "#7C5CFF" }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm" style={{ background: "rgba(91,61,245,0.15)", color: "#9B8FFF", border: "1px solid rgba(91,61,245,0.25)" }}>
            <Sparkles className="w-4 h-4" />
            {t("success_badge")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 reveal">{t("success_title")}</h2>
          <p className="text-lg max-w-2xl mx-auto mb-10 reveal" style={{ color: "#9B8FFF" }}>
            {t("success_sub")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center reveal">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 gradient-bg text-white font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity text-base"
              style={{ boxShadow: "0 12px 32px rgba(91,61,245,0.35)" }}
            >
              {t("success_cta_find")} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/register?role=mentor"
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl transition-colors text-base"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}
            >
              <UserPlus className="w-5 h-5" />
              {t("success_cta_apply")}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative rounded-3xl p-12 md:p-20 overflow-hidden text-center reveal"
            style={{ background: "linear-gradient(135deg, #5B3DF5 0%, #7C5CFF 100%)" }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: "#fff" }} />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: "#fff" }} />
            <div className="relative max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <Sparkles className="w-4 h-4" />
                {t("final_badge")}
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                {t("final_title")}
              </h2>
              <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                {t("final_sub")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-white font-bold px-8 py-4 rounded-xl hover:bg-purple-50 transition-colors text-base"
                  style={{ color: "#5B3DF5", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
                >
                  {t("final_cta_find")} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                  style={{ border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.9)" }}
                >
                  {t("final_cta_learn")}
                </Link>
              </div>
              <p className="text-sm mt-8" style={{ color: "rgba(255,255,255,0.6)" }}>
                {t("final_footnote")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
