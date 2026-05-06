"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Languages, Calendar, Briefcase, Clock, MessageSquare, MapPin, Monitor, Crown } from "lucide-react";
import { supabase, type Mentor } from "@/lib/supabase";
import { getUserSession } from "@/lib/session";
import SaveMentorButton from "@/components/SaveMentorButton";

const PLAN_SCORE_LIMITS: Record<string, number> = {
  free:     60,
  basic:    75,
  standard: 90,
  premium:  Infinity,
};

const SLOT_LABELS: Record<string, string> = {
  morning:   "Morning (8–12h)",
  afternoon: "Afternoon (12–18h)",
  evening:   "Evening (18–22h)",
};
const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function BookCTA({ mentorId, price, mentorScore }: {
  mentorId:    string;
  price:       number | null | undefined;
  mentorScore: number | null | undefined;
}) {
  const session = getUserSession();

  // null = still loading
  const [subPlan,         setSubPlan]         = useState<string | null>(null);
  const [freeSessionUsed, setFreeSessionUsed] = useState<boolean | null>(null);
  const [subLoading,      setSubLoading]      = useState(false);

  useEffect(() => {
    if (session?.role !== "mentee" || !session.email) return;
    setSubLoading(true);
    supabase
      .from("mentees")
      .select("id, free_session_used")
      .eq("email", session.email)
      .single()
      .then(({ data: menteeRow }) => {
        if (!menteeRow) { setFreeSessionUsed(true); setSubLoading(false); return; }
        const row = menteeRow as { id: string; free_session_used: boolean };
        setFreeSessionUsed(row.free_session_used);
        supabase
          .from("mentee_subscriptions")
          .select("plan, status")
          .eq("mentee_id", row.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .then(({ data }) => {
            setSubPlan((data?.[0] as { plan: string } | undefined)?.plan ?? null);
            setSubLoading(false);
          });
      });
  }, [session?.role, session?.email]);

  // Not logged in
  if (!session) {
    return (
      <div
        className="rounded-2xl p-6 border border-[#7C3AED]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "rgba(124,58,237,0.06)" }}
      >
        <div>
          <p className="text-white font-semibold mb-0.5">Ready to start?</p>
          <p className="text-white/40 text-sm">Create a free account to book a session.</p>
        </div>
        <Link
          href={`/auth/register?redirect=/book/${mentorId}`}
          className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ background: "#7C3AED" }}
        >
          Sign up to book <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (session.role !== "mentee") return null;

  if (subLoading || freeSessionUsed === null) {
    return (
      <div
        className="rounded-2xl p-6 border border-white/[0.06] animate-pulse h-24"
        style={{ background: "#13111F" }}
      />
    );
  }

  // Free session used + no active subscription → upsell (pass redirect so user returns here after subscribing)
  if (freeSessionUsed && !subPlan) {
    const subscribeUrl = `/subscribe?redirect=/mentors/${mentorId}`;
    return (
      <div
        className="rounded-2xl p-6 border border-[#7C3AED]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "rgba(124,58,237,0.06)" }}
      >
        <div>
          <p className="text-white font-semibold mb-0.5">You&apos;ve used your free session!</p>
          <p className="text-white/40 text-sm">
            Subscribe to keep growing 🚀 — from 4.99€/month, cancel anytime.
          </p>
        </div>
        <Link
          href={subscribeUrl}
          className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ background: "#7C3AED" }}
        >
          <Crown className="w-4 h-4" /> Choose a plan
        </Link>
      </div>
    );
  }

  // Score gating
  const effectivePlan = subPlan ?? "free";
  const scoreLimit    = PLAN_SCORE_LIMITS[effectivePlan] ?? 60;
  const mentorScoreN  = mentorScore ?? 0;
  const scoreBlocked  = mentorScoreN > 0 && mentorScoreN > scoreLimit;

  if (scoreBlocked) {
    const requiredPlan  = mentorScoreN <= 75 ? "Basic" : mentorScoreN <= 90 ? "Standard" : "Premium";
    const upgradeUrl    = `/subscribe?redirect=/mentors/${mentorId}`;
    return (
      <div
        className="rounded-2xl p-6 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "rgba(245,158,11,0.05)" }}
      >
        <div>
          <p className="text-white font-semibold mb-0.5">Upgrade to book this mentor</p>
          <p className="text-white/40 text-sm">
            This mentor is available on the <span className="text-[#A78BFA]">{requiredPlan}</span> plan and above.
          </p>
        </div>
        <Link
          href={upgradeUrl}
          className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ background: "#7C3AED" }}
        >
          <Crown className="w-4 h-4" /> {subPlan ? "Upgrade plan" : "Choose a plan"}
        </Link>
      </div>
    );
  }

  // All clear — book button
  return (
    <div
      className="rounded-2xl p-6 border border-[#7C3AED]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{ background: "rgba(124,58,237,0.06)" }}
    >
      <div>
        <p className="text-white font-semibold mb-0.5">Ready to start?</p>
        <p className="text-white/40 text-sm">
          {!freeSessionUsed && !subPlan
            ? "🎁 Your first session is free — no subscription needed."
            : "Take the first step toward your goals 🚀"}
          {price != null && subPlan && <span className="text-white/30"> · {price}€ / session</span>}
        </p>
      </div>
      <Link
        href={`/book/${mentorId}`}
        className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
        style={{ background: "#7C3AED" }}
      >
        Book a session <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#A78BFA] border border-[#7C3AED]/20"
      style={{ background: "rgba(124,58,237,0.08)" }}
    >
      {children}
    </span>
  );
}

export default function MentorProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("mentors")
      .select("*")
      .eq("id", id)
      .eq("onboarding_completed", true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setMentor(data as Mentor);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (notFound || !mentor) {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-white/50 text-sm">Mentor not found.</p>
        <Link href="/mentors" className="inline-flex items-center gap-2 text-sm text-[#A78BFA] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to mentors
        </Link>
      </div>
    );
  }

  let availability: Record<string, string[]> = {};
  try {
    if (mentor.availability) availability = JSON.parse(mentor.availability);
  } catch { /* invalid JSON */ }

  const availDays = DAY_ORDER.filter(d => (availability[d] ?? []).length > 0);

  // Merge languages from both fields, deduplicated
  const allLanguages = Array.from(new Set([
    ...(mentor.languages ?? []),
    ...(mentor.langues ?? []),
  ]));

  // Sectors and expertise
  const sectors   = mentor.secteurs ?? [];
  const expertise = mentor.expertise ?? [];

  // competences is stored as CompetenceEntry[] = [{ name, rating }]
  // Handle all shapes defensively: array of objects, plain object, comma-string, null.
  const rawComp = mentor.competences as unknown;
  const skills: string[] = (() => {
    if (!rawComp) return [];
    if (Array.isArray(rawComp)) {
      // Normal format: [{ name: "Leadership", rating: 3 }, …]
      return (rawComp as unknown[])
        .map(c => (c && typeof c === "object" && "name" in c ? (c as { name: string }).name : null))
        .filter((n): n is string => typeof n === "string" && n.length > 0);
    }
    if (typeof rawComp === "string") {
      return rawComp.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (typeof rawComp === "object") {
      // Legacy: { skill: rating } map — use keys where value is truthy
      return Object.entries(rawComp).filter(([, v]) => !!v).map(([k]) => k);
    }
    return [];
  })();
  return (
    <div className="min-h-screen bg-[#0D0A1A]">

      {/* Back nav */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-4">
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to mentors
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 space-y-5">

        {/* ── Hero card ──────────────────────────────────────────────── */}
        <div className="rounded-2xl p-8 border border-white/[0.08]" style={{ background: "#13111F" }}>
          <div className="flex items-start gap-5">
            {mentor.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mentor.photo_url}
                alt={mentor.nom}
                className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
              >
                {initials(mentor.nom)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-white mb-1">{mentor.nom}</h1>
              <p className="text-white/60 text-sm">
                {mentor.job_title}
                {mentor.company && <span className="text-white/35"> @ {mentor.company}</span>}
              </p>
              {mentor.industry && (
                <p className="text-xs text-white/30 mt-1">{mentor.industry}</p>
              )}
            </div>
            <SaveMentorButton mentorId={id} size="w-5 h-5" className="w-10 h-10 flex-shrink-0" />
          </div>

          {/* Badges — price + seniority only (no score on public view) */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {mentor.session_price != null && (
              <div
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.06]"
                style={{ background: "#0D0A1A" }}
              >
                <span className="font-bold text-white text-sm">{mentor.session_price}€</span>
                <span className="text-xs text-white/35">/ session</span>
              </div>
            )}
            {mentor.seniority && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 border border-white/10">
                {mentor.seniority}
              </span>
            )}
            {mentor.annees_experience != null && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 border border-white/10 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> {mentor.annees_experience} yrs exp.
              </span>
            )}
          </div>
        </div>

        {/* ── Full description card ───────────────────────────────────── */}
        <div className="rounded-2xl p-6 border border-white/[0.08] space-y-6" style={{ background: "#13111F" }}>

          {/* Bio */}
          {mentor.bio && (
            <Section title="About">
              <p className="text-white/70 text-sm leading-relaxed">{mentor.bio}</p>
            </Section>
          )}

          {/* Role + experience + location */}
          <Section title="Professional background">
            <div className="space-y-2.5">
              {(mentor.job_title || mentor.company) && (
                <div className="flex items-start gap-2.5">
                  <Briefcase className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/70">
                    {mentor.poste_actuel || mentor.job_title}
                    {(mentor.entreprise || mentor.company) &&
                      <span className="text-white/40"> at {mentor.entreprise || mentor.company}</span>
                    }
                  </p>
                </div>
              )}
              {mentor.annees_experience != null && (
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/70">{mentor.annees_experience} years of experience</p>
                </div>
              )}
              {mentor.years_experience && !mentor.annees_experience && (
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/70">{mentor.years_experience} of experience</p>
                </div>
              )}
              {mentor.localisation && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/70">{mentor.localisation}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Sectors */}
          {sectors.length > 0 && (
            <Section title="Sectors">
              <div className="flex flex-wrap gap-2">
                {sectors.map(s => <Tag key={s}>{s}</Tag>)}
              </div>
            </Section>
          )}

          {/* Expertise / skills */}
          {expertise.length > 0 && (
            <Section title="Areas of expertise">
              <div className="flex flex-wrap gap-2">
                {expertise.map(tag => <Tag key={tag}>{tag}</Tag>)}
              </div>
            </Section>
          )}

          {/* Competences / skills map */}
          {skills.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map(s => <Tag key={s}>{s}</Tag>)}
              </div>
            </Section>
          )}

          {/* What they help with */}
          {mentor.help_with && (
            <Section title="What I can help you with">
              <p className="text-white/70 text-sm leading-relaxed">{mentor.help_with}</p>
            </Section>
          )}

          {/* Mentoring style */}
          {mentor.style_mentorat && (
            <Section title="Mentoring style">
              <div className="flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/70">{mentor.style_mentorat}</p>
              </div>
            </Section>
          )}

          {/* Preferred format */}
          {mentor.format_prefere && (
            <Section title="Preferred format">
              <div className="flex items-start gap-2.5">
                <Monitor className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/70">{mentor.format_prefere}</p>
              </div>
            </Section>
          )}

          {/* Languages */}
          {allLanguages.length > 0 && (
            <Section title="Languages">
              <div className="flex items-center gap-2 flex-wrap">
                <Languages className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                {allLanguages.map(lang => (
                  <span key={lang} className="px-3 py-1.5 rounded-lg text-sm text-white/70 border border-white/10">
                    {lang}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── Availability ────────────────────────────────────────────── */}
        {availDays.length > 0 && (
          <div className="rounded-2xl p-6 border border-white/[0.08]" style={{ background: "#13111F" }}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/35 mb-4 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Availability
            </h2>
            <div className="space-y-2">
              {availDays.map(day => (
                <div key={day} className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-white/50 w-8 flex-shrink-0 pt-0.5">{day}</span>
                  <div className="flex flex-wrap gap-1">
                    {availability[day].map(slot => (
                      <span
                        key={slot}
                        className="text-xs px-2 py-0.5 rounded text-white/50"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        {SLOT_LABELS[slot] ?? slot}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Book CTA ────────────────────────────────────────────────── */}
        <BookCTA mentorId={id} price={mentor.session_price} mentorScore={mentor.mentor_score} />

      </div>
    </div>
  );
}
