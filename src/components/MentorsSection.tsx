"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LangContext";

/* ── Types ──────────────────────────────────────────────────────── */
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

/* ── Stagger hook ───────────────────────────────────────────────── */
/**
 * Returns a ref to attach to each card element.
 * Once the wrapper is in view, cards are revealed one-by-one
 * with a 150 ms stagger via inline transitionDelay.
 */
function useSectionReveal(count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cards = refs.current.filter(Boolean) as HTMLDivElement[];
    if (!cards.length) return;

    // Reset all to initial hidden state
    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(32px)";
      card.style.transition = `opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)`;
      card.style.transitionDelay = `${i * 150}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // Reveal all cards staggered once the section enters the viewport
          cards.forEach((card) => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          });
          observer.disconnect();
        });
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return { sectionRef, cardRef: (i: number) => (el: HTMLDivElement | null) => { refs.current[i] = el; } };
}

/* ── Avatar ─────────────────────────────────────────────────────── */
function Avatar({ src, name }: { src: string | null; name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0"
      />
    );
  }

  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white/80 ring-2 ring-white/10"
      style={{ background: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)" }}
    >
      {initials}
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────────── */
export default function MentorsSection() {
  const { t } = useLang();
  const [mentors, setMentors] = useState<MentorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { sectionRef, cardRef } = useSectionReveal(mentors.length);

  useEffect(() => {
    supabase
      .from("mentors")
      .select("id, nom, poste_actuel, entreprise, secteurs, annees_experience, langues, photo_url")
      .eq("survey_completed", true)
      .eq("statut", "active")
      .limit(8)
      .then(({ data }) => {
        setMentors((data as MentorCard[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="reveal flex items-end justify-between mb-16">
          <div>
            <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-[0.25em] mb-4">
              {t("mentors_label")}
            </p>
            <h2 className="text-4xl md:text-[56px] lg:text-[76px] font-extrabold text-white tracking-tight leading-tight">
              {t("mentors_title")}
            </h2>
          </div>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white transition-colors mb-1"
          >
            {t("mentors_cta")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Grid ───────────────────────────────────────── */}
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-56 animate-pulse"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-20">{t("mentors_empty")}</p>
        ) : (
          <div
            ref={sectionRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {mentors.map((mentor, i) => (
              <MentorCardItem
                key={mentor.id}
                mentor={mentor}
                cardRef={cardRef(i)}
                yrsLabel={t("mentors_yrs")}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

/* ── Card ───────────────────────────────────────────────────────── */
function MentorCardItem({
  mentor,
  cardRef,
  yrsLabel,
}: {
  mentor: MentorCard;
  cardRef: (el: HTMLDivElement | null) => void;
  yrsLabel: string;
}) {
  return (
    <div
      ref={cardRef}
      className="group relative rounded-2xl p-6 flex flex-col gap-4 cursor-default"
      style={{
        background: "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(124,58,237,0.06) 50%, rgba(255,255,255,0.04) 100%)",
        border: "1px solid rgba(167,139,250,0.25)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 24px rgba(124,58,237,0.15)",
        /* initial state set by JS, avoid flash */
        opacity: 0,
        transform: "translateY(32px)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(167,139,250,0.5)";
        el.style.boxShadow =
          "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 40px rgba(124,58,237,0.2), 0 16px 48px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(167,139,250,0.25)";
        el.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 24px rgba(124,58,237,0.15)";
      }}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <Avatar src={mentor.photo_url} name={mentor.nom} />
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm leading-snug truncate">{mentor.nom}</p>
          {(mentor.poste_actuel || mentor.entreprise) && (
            <p className="text-white/45 text-xs leading-snug mt-0.5 truncate">
              {[mentor.poste_actuel, mentor.entreprise].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Sectors */}
      {mentor.secteurs && mentor.secteurs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {mentor.secteurs.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(124,58,237,0.15)",
                color: "#C4B5FD",
                border: "1px solid rgba(124,58,237,0.25)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Footer row: experience + languages */}
      <div className="mt-auto flex items-center justify-between">
        {mentor.annees_experience != null && (
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <Briefcase className="w-3 h-3 flex-shrink-0" />
            <span>
              {mentor.annees_experience}+ {yrsLabel}
            </span>
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
  );
}
