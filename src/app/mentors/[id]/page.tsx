"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Star, Languages, Calendar } from "lucide-react";
import { supabase, type Mentor } from "@/lib/supabase";

const SLOT_LABELS: Record<string, string> = {
  morning: "Morning (7–12h)",
  afternoon: "Afternoon (12–18h)",
  evening: "Evening (18–22h)",
};
const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function scoreColor(s: number) {
  return s >= 70 ? "#10B981" : s >= 40 ? "#F59E0B" : "#EF4444";
}

function scoreLabel(s: number) {
  return s >= 70 ? "Top tier" : s >= 40 ? "Strong profile" : "Getting started";
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
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
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 text-sm text-[#A78BFA] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to mentors
        </Link>
      </div>
    );
  }

  const score = mentor.mentor_score;
  const color = score != null ? scoreColor(score) : "#6B7280";

  let availability: Record<string, string[]> = {};
  try {
    if (mentor.availability) availability = JSON.parse(mentor.availability);
  } catch { /* invalid JSON — treat as empty */ }

  const availDays = DAY_ORDER.filter(d => (availability[d] ?? []).length > 0);

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

        {/* Hero card */}
        <div
          className="rounded-2xl p-8 border border-white/[0.08]"
          style={{ background: "#13111F" }}
        >
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
            >
              {initials(mentor.nom)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-white mb-1">{mentor.nom}</h1>
              <p className="text-white/60 text-sm">
                {mentor.job_title}
                {mentor.company && (
                  <span className="text-white/35"> @ {mentor.company}</span>
                )}
              </p>
              {mentor.industry && (
                <p className="text-xs text-white/30 mt-1">{mentor.industry}</p>
              )}
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {score != null && (
              <div
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.06]"
                style={{ background: "#0D0A1A" }}
              >
                <Star className="w-4 h-4 flex-shrink-0" style={{ color }} />
                <span className="font-bold text-sm" style={{ color }}>{score}</span>
                <span className="text-xs text-white/30">/100</span>
                <span className="text-xs text-white/25 ml-1">{scoreLabel(score)}</span>
              </div>
            )}
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
          </div>
        </div>

        {/* How I can help */}
        {mentor.help_with && (
          <div
            className="rounded-2xl p-6 border border-white/[0.08]"
            style={{ background: "#13111F" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
              How I can help
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">{mentor.help_with}</p>
          </div>
        )}

        {/* Expertise */}
        {mentor.expertise && mentor.expertise.length > 0 && (
          <div
            className="rounded-2xl p-6 border border-white/[0.08]"
            style={{ background: "#13111F" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
              Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#A78BFA] border border-[#7C3AED]/20"
                  style={{ background: "rgba(124,58,237,0.08)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages + Availability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {mentor.languages && mentor.languages.length > 0 && (
            <div
              className="rounded-2xl p-6 border border-white/[0.08]"
              style={{ background: "#13111F" }}
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                <Languages className="w-3.5 h-3.5" /> Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {mentor.languages.map(lang => (
                  <span
                    key={lang}
                    className="px-3 py-1.5 rounded-lg text-sm text-white/70 border border-white/10"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {availDays.length > 0 && (
            <div
              className="rounded-2xl p-6 border border-white/[0.08]"
              style={{ background: "#13111F" }}
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Availability
              </h2>
              <div className="space-y-2">
                {availDays.map(day => (
                  <div key={day} className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-white/50 w-8 flex-shrink-0 pt-0.5">
                      {day}
                    </span>
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
        </div>

        {/* Book CTA */}
        <div
          className="rounded-2xl p-6 border border-[#7C3AED]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: "rgba(124,58,237,0.06)" }}
        >
          <div>
            <p className="text-white font-semibold mb-0.5">Ready to start?</p>
            <p className="text-white/40 text-sm">
              {mentor.session_price != null
                ? `${mentor.session_price}€ per session · No commitment`
                : "Price on request"}
            </p>
          </div>
          <Link
            href="/auth/register"
            className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ background: "#7C3AED" }}
          >
            Book a session <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
