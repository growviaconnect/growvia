"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Briefcase, Globe, GraduationCap, TrendingUp, Building2, Sparkles, type LucideIcon } from "lucide-react";
import AnimatedHeroBg from "@/components/AnimatedHeroBg";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LangContext";

/* ── Types ─────────────────────────────────────────────────────── */
interface MentorCard {
  id: string;
  nom: string;
  poste_actuel: string | null;
  entreprise: string | null;
  secteurs: string[] | null;
  annees_experience: number | null;
  langues: string[] | null;
  photo_url: string | null;
}

type CategorySlug = "students" | "career" | "business" | "personal-growth";
/* ── Static config per category ─────────────────────────────────── */
const CATEGORY_CONFIG: Record<CategorySlug, {
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  color: string;
  bullets: string[];
  image: string;
}> = {
  students: {
    titleKey: "cat_students",
    descKey: "cat_students_desc",
    icon: GraduationCap,
    color: "#7C3AED",
    bullets: [
      "Choosing the right degree or programme",
      "University applications and interviews",
      "Internships and first job search",
      "Academic performance and study strategies",
    ],
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80",
  },
  career: {
    titleKey: "cat_career",
    descKey: "cat_career_desc",
    icon: TrendingUp,
    color: "#2563EB",
    bullets: [
      "Career pivots and industry transitions",
      "Resume, portfolio, and LinkedIn optimisation",
      "Salary negotiation and offer evaluation",
      "Interview preparation with industry insiders",
    ],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80",
  },
  business: {
    titleKey: "cat_business",
    descKey: "cat_business_desc",
    icon: Building2,
    color: "#0891B2",
    bullets: [
      "Launching and validating your startup idea",
      "Fundraising, pitch decks, and investor relations",
      "Scaling operations and building teams",
      "Go-to-market strategy and growth levers",
    ],
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1600&q=80",
  },
  "personal-growth": {
    titleKey: "cat_growth",
    descKey: "cat_growth_desc",
    icon: Sparkles,
    color: "#DB2777",
    bullets: [
      "Building self-confidence and decision-making",
      "Work-life balance and burnout prevention",
      "Leadership presence and communication",
      "Clarity on life goals and personal values",
    ],
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1600&q=80",
  },
};

/* ── Avatar ─────────────────────────────────────────────────────── */
function Avatar({ src, name }: { src: string | null; name: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
      style={{ background: "linear-gradient(135deg, #7C3AED, #4C1D95)" }}
    >
      {initials}
    </div>
  );
}

/* ── Mentor card ────────────────────────────────────────────────── */
function MentorCard({ mentor, accent }: { mentor: MentorCard; accent: string }) {
  return (
    <Link href={`/mentors/${mentor.id}`} className="block group">
      <div
        className="relative rounded-2xl p-6 flex flex-col gap-4 cursor-pointer transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(124,58,237,0.05) 100%)",
          border: "1px solid rgba(167,139,250,0.2)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = `${accent}66`;
          el.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 24px ${accent}22, 0 16px 48px rgba(0,0,0,0.3)`;
          el.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(167,139,250,0.2)";
          el.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.08)";
          el.style.transform = "translateY(0)";
        }}
      >
        <div className="flex items-center gap-3">
          <Avatar src={mentor.photo_url} name={mentor.nom} />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-snug truncate">{mentor.nom}</p>
            {(mentor.poste_actuel || mentor.entreprise) && (
              <p className="text-white/45 text-xs mt-0.5 truncate">
                {[mentor.poste_actuel, mentor.entreprise].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>

        {mentor.secteurs && mentor.secteurs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {mentor.secteurs.slice(0, 3).map(s => (
              <span
                key={s}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(124,58,237,0.15)", color: "#C4B5FD", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
          {mentor.annees_experience != null && (
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <Briefcase className="w-3 h-3 flex-shrink-0" />
              <span>{mentor.annees_experience}+ yrs</span>
            </div>
          )}
          {mentor.langues && mentor.langues.length > 0 && (
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <Globe className="w-3 h-3 flex-shrink-0" />
              <span>{mentor.langues.slice(0, 2).join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function MentoringAreaPage({ slug }: { slug: CategorySlug }) {
  const { t } = useLang();
  const config = CATEGORY_CONFIG[slug];
  const Icon = config.icon;

  const [mentors, setMentors] = useState<MentorCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("mentors")
      .select("id, nom, poste_actuel, entreprise, secteurs, annees_experience, langues, photo_url")
      .eq("survey_completed", true)
      .eq("statut", "active")
      .limit(12)
      .then(({ data }) => {
        setMentors((data as MentorCard[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="relative min-h-screen bg-[#0D0A1A] overflow-x-hidden">
        <AnimatedHeroBg className="fixed" />

        {/* Top vignette */}
        <div
          className="fixed inset-x-0 top-0 h-32 pointer-events-none z-[1]"
          style={{ background: "linear-gradient(to bottom, #0D0A1A 0%, transparent 100%)" }}
          aria-hidden="true"
        />

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative z-10 pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">

            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            {/* Category badge */}
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-[0.15em]"
              style={{ background: `${config.color}22`, color: config.color, border: `1px solid ${config.color}44` }}
            >
              <Icon className="w-3.5 h-3.5" />
              Mentoring Area
            </div>

            <h1
              className="font-extrabold text-white tracking-tight mb-5"
              style={{ fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 1.05 }}
            >
              {t(config.titleKey)}
            </h1>
            <p className="text-white/55 text-xl leading-relaxed max-w-2xl mb-10">
              {t(config.descKey)}
            </p>

            {/* What we cover */}
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
              {config.bullets.map((b, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                    style={{ background: config.color }}
                  />
                  <span className="text-white/70 text-sm leading-relaxed">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mentors ──────────────────────────────────── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white font-bold text-2xl">Mentors available</h2>
            <Link
              href="/explore/find-a-mentor"
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
            >
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl h-52 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                />
              ))}
            </div>
          ) : mentors.length === 0 ? (
            <p className="text-white/30 text-center py-20 text-sm">No mentors available yet in this area.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {mentors.map((m: MentorCard) => (
                <MentorCard key={m.id} mentor={m} accent={config.color} />
              ))}
            </div>
          )}
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 pb-32 text-center">
          <div
            className="rounded-3xl p-12"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(76,29,149,0.1) 100%)",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <h2
              className="font-extrabold text-white mb-4"
              style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
            >
              Ready to find your mentor?
            </h2>
            <p className="text-white/55 text-lg mb-8 max-w-xl mx-auto">
              Your first session is free. No subscription required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:opacity-90"
                style={{ background: config.color }}
              >
                Find my mentor <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/become-a-mentor"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white/70 font-semibold text-sm border border-white/15 hover:border-white/35 transition-colors"
              >
                Become a mentor
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
