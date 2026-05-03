"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, ChevronLeft, ChevronRight,
  Clock, Globe, Loader2, CheckCircle,
} from "lucide-react";
import { supabase, type Mentor } from "@/lib/supabase";
import { getUserSession } from "@/lib/session";

// ── Day / time constants ──────────────────────────────────────────────────────

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const PERIOD_LABELS: Record<string, string> = {
  morning:   "Morning",
  afternoon: "Afternoon",
  evening:   "Evening",
};
const PERIOD_HOURS: Record<string, string> = {
  morning:   "8h – 12h",
  afternoon: "12h – 18h",
  evening:   "18h – 22h",
};
const PERIOD_SLOTS: Record<string, string[]> = {
  morning:   ["08:00", "09:00", "10:00", "11:00"],
  afternoon: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  evening:   ["18:00", "19:00", "20:00", "21:00"],
};
const PERIOD_ORDER = ["morning", "afternoon", "evening"];

/** Convert JS Date.getDay() (0=Sun) to our table convention (0=Mon). */
function jsDayToAvail(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function scoreColor(s: number) {
  return s >= 70 ? "#10B981" : s >= 40 ? "#F59E0B" : "#EF4444";
}
function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function fmt2(n: number) {
  return String(n).padStart(2, "0");
}
function toDateKey(d: Date) {
  return `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())}`;
}
function formatDisplayDate(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] ${className}`}
      style={{ background: "#13111F" }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/35 mb-5">
      {children}
    </p>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const params   = useParams();
  const router   = useRouter();
  const mentorId = params?.mentorId as string;

  // ── Data state
  const [mentor,   setMentor]   = useState<Mentor | null>(null);
  const [avail,    setAvail]    = useState<{ day_of_week: number; period: string }[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ── Calendar state
  const today      = useMemo(() => new Date(), []);
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selDate,  setSelDate]  = useState<Date | null>(null);
  const [selTime,  setSelTime]  = useState<string | null>(null);

  // ── Form state
  const [topic,    setTopic]    = useState("");
  const [language, setLanguage] = useState("");

  // ── Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState<string | null>(null);

  // ── Auth
  const session = getUserSession();

  useEffect(() => {
    if (!mentorId) return;

    Promise.all([
      supabase.from("mentors").select("*").eq("id", mentorId).single(),
      supabase.from("mentor_availability").select("day_of_week, period").eq("mentor_id", mentorId),
    ]).then(([{ data: m, error: mErr }, { data: av }]) => {
      if (mErr || !m) { setNotFound(true); setLoading(false); return; }
      setMentor(m as Mentor);
      setAvail(av ?? []);
      const langs = (m as Mentor).languages;
      if (langs && langs.length > 0) setLanguage(langs[0]);
      setLoading(false);
    });
  }, [mentorId]);

  // Available day_of_week set
  const availDaySet = useMemo(() => new Set(avail.map(a => a.day_of_week)), [avail]);

  // Periods available for a specific day_of_week value
  function periodsForDay(availDay: number): string[] {
    return avail.filter(a => a.day_of_week === availDay).map(a => a.period);
  }

  // ── Calendar helpers
  const firstOfMonth = new Date(calYear, calMonth, 1);
  const lastOfMonth  = new Date(calYear, calMonth + 1, 0);
  const startPad     = firstOfMonth.getDay(); // 0=Sun — calendar starts on Sun
  const monthLabel   = firstOfMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  const calDays: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastOfMonth.getDate() }, (_, i) => i + 1),
  ];

  function isDayAvailable(day: number) {
    const d = new Date(calYear, calMonth, day);
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false;
    return availDaySet.has(jsDayToAvail(d.getDay()));
  }

  function handleDayClick(day: number) {
    if (!isDayAvailable(day)) return;
    const d = new Date(calYear, calMonth, day);
    setSelDate(d);
    setSelTime(null);
  }

  function prevMonth() {
    const d = new Date(calYear, calMonth - 1);
    setCalYear(d.getFullYear()); setCalMonth(d.getMonth());
  }
  function nextMonth() {
    const d = new Date(calYear, calMonth + 1);
    setCalYear(d.getFullYear()); setCalMonth(d.getMonth());
  }

  // Time slots for the selected date
  const selectedPeriods = selDate ? periodsForDay(jsDayToAvail(selDate.getDay())) : [];

  // ── Submit
  async function handleSubmit() {
    if (!selDate || !selTime) { setSubmitErr("Please pick a date and time."); return; }
    if (!session?.email) { router.push(`/auth/register?redirect=/book/${mentorId}`); return; }

    setSubmitting(true);
    setSubmitErr(null);

    try {
      const res = await fetch("/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId,
          menteeEmail: session.email,
          topic,
          date: toDateKey(selDate),
          time: selTime,
          language,
        }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      router.push(`/book/${mentorId}/confirmation`);
    } catch (err) {
      setSubmitErr(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  // ── Render guards
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }
  if (notFound || !mentor) {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-white/50 text-sm">Mentor not found.</p>
        <Link href="/mentors" className="text-[#A78BFA] hover:text-white text-sm transition-colors">
          ← Back to mentors
        </Link>
      </div>
    );
  }

  const price   = mentor.session_price;
  const score   = mentor.mentor_score;
  const canBook = !!selDate && !!selTime;

  // ── Languages list for dropdown
  const langs = mentor.languages && mentor.languages.length > 0
    ? mentor.languages
    : ["English", "French"];

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-24">

        {/* Back nav */}
        <Link
          href={`/mentors/${mentorId}`}
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* SECTION 1 — Mentor summary */}
            <Card className="p-6">
              <SectionTitle>You&apos;re booking with</SectionTitle>

              <div className="flex items-start gap-4 mb-5">
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
                  <h1 className="text-xl font-extrabold text-white leading-tight">{mentor.nom}</h1>
                  <p className="text-white/55 text-sm mt-0.5">
                    {mentor.job_title}
                    {mentor.company && <span className="text-white/30"> @ {mentor.company}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {score != null && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: `${scoreColor(score)}18`, color: scoreColor(score) }}
                      >
                        <Star className="w-3 h-3" /> {score}/100
                      </span>
                    )}
                    {price != null && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/70 px-2.5 py-1 rounded-lg border border-white/10">
                        {price}€ / session
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {mentor.bio && (
                <p className="text-white/55 text-sm leading-relaxed mb-5 border-t border-white/[0.06] pt-5">
                  {mentor.bio}
                </p>
              )}
              {!mentor.bio && mentor.help_with && (
                <p className="text-white/55 text-sm leading-relaxed mb-5 border-t border-white/[0.06] pt-5">
                  {mentor.help_with}
                </p>
              )}

              {/* Availability schedule */}
              {avail.length > 0 && (
                <div className="border-t border-white/[0.06] pt-5">
                  <p className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-3">
                    Weekly availability
                  </p>
                  <div className="space-y-1.5">
                    {DAY_NAMES.map((day, idx) => {
                      const periods = periodsForDay(idx);
                      if (periods.length === 0) return null;
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-white/40 w-8 flex-shrink-0">{day}</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {PERIOD_ORDER.filter(p => periods.includes(p)).map(p => (
                              <span
                                key={p}
                                className="text-xs px-2 py-0.5 rounded text-[#A78BFA]"
                                style={{ background: "rgba(124,58,237,0.12)" }}
                              >
                                {PERIOD_LABELS[p]} · {PERIOD_HOURS[p]}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* SECTION 2 — Pick a date */}
            <Card className="p-6">
              <SectionTitle>Pick a date</SectionTitle>

              {avail.length === 0 ? (
                <p className="text-white/40 text-sm">
                  This mentor hasn&apos;t set their availability yet. Try reaching out directly.
                </p>
              ) : (
                <>
                  {/* Month nav */}
                  <div className="flex items-center justify-between mb-5">
                    <button
                      onClick={prevMonth}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:border-white/25 text-white/40 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-white capitalize">{monthLabel}</span>
                    <button
                      onClick={nextMonth}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:border-white/25 text-white/40 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day-of-week headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                      <div key={d} className="text-center text-xs font-semibold text-white/25 py-1">{d}</div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {calDays.map((day, idx) => {
                      if (day === null) return <div key={`p-${idx}`} />;
                      const available = isDayAvailable(day);
                      const dateObj   = new Date(calYear, calMonth, day);
                      const isToday   = toDateKey(dateObj) === toDateKey(today);
                      const isSel     = selDate ? toDateKey(dateObj) === toDateKey(selDate) : false;

                      return (
                        <button
                          key={day}
                          onClick={() => handleDayClick(day)}
                          disabled={!available}
                          className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                            isSel
                              ? "bg-[#7C3AED] text-white"
                              : available
                                ? isToday
                                  ? "border border-[#7C3AED]/50 text-[#A78BFA] hover:bg-[#7C3AED]/20"
                                  : "text-white hover:bg-[#7C3AED]/20 cursor-pointer"
                                : "text-white/15 cursor-not-allowed"
                          }`}
                          style={available && !isSel ? { background: "rgba(124,58,237,0.08)" } : undefined}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs text-white/25 mt-4">
                    Highlighted dates match the mentor&apos;s availability.
                  </p>
                </>
              )}
            </Card>

            {/* SECTION 2b — Pick a time (appears after date selected) */}
            {selDate && selectedPeriods.length > 0 && (
              <Card className="p-6">
                <SectionTitle>
                  Pick a time · {formatDisplayDate(selDate)}
                </SectionTitle>

                <div className="space-y-5">
                  {PERIOD_ORDER.filter(p => selectedPeriods.includes(p)).map(period => (
                    <div key={period}>
                      <p className="text-xs font-semibold text-white/40 mb-2.5">
                        {PERIOD_LABELS[period]}
                        <span className="text-white/25 ml-2">{PERIOD_HOURS[period]}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {PERIOD_SLOTS[period].map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelTime(slot)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                              selTime === slot
                                ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                                : "border-white/10 text-white/60 hover:border-[#7C3AED]/50 hover:text-white"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* SECTION 3 — Session details */}
            <Card className="p-6">
              <SectionTitle>Session details</SectionTitle>

              <div className="space-y-5">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    What do you want to work on?
                  </label>
                  <textarea
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Describe your goal, challenge, or what you'd like to get out of this session…"
                    rows={4}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition-shadow"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-white/35 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white/70">Duration</p>
                    <p className="text-xs text-white/35 mt-0.5">60 minutes</p>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-white/35" /> Session language
                  </label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition-shadow appearance-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {langs.map(l => <option key={l} value={l} style={{ background: "#13111F" }}>{l}</option>)}
                    {!langs.includes("English") && (
                      <option value="English" style={{ background: "#13111F" }}>English</option>
                    )}
                    {!langs.includes("French") && (
                      <option value="French" style={{ background: "#13111F" }}>French</option>
                    )}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* ── RIGHT COLUMN — Payment summary (sticky) ──────────────── */}
          <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-6">
            <Card className="p-6">
              <SectionTitle>Order summary</SectionTitle>

              {/* Selected date / time recap */}
              {(selDate || selTime) && (
                <div
                  className="rounded-xl p-3 mb-5 space-y-1"
                  style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
                >
                  {selDate && (
                    <p className="text-xs font-semibold text-[#A78BFA]">
                      {selDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                  )}
                  {selTime && (
                    <p className="text-xs text-white/50">{selTime} · 60 min</p>
                  )}
                </div>
              )}

              {/* Price breakdown */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Session (60 min)</span>
                  <span className="text-white font-semibold">
                    {price != null ? `${price}€` : "–"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">GrowVia fee</span>
                  <span className="text-[#10B981] text-xs font-semibold">Included</span>
                </div>
                <div
                  className="flex justify-between text-sm font-bold border-t border-white/[0.06] pt-3"
                >
                  <span className="text-white">Total</span>
                  <span className="text-white">
                    {price != null ? `${price}€` : "Price on request"}
                  </span>
                </div>
              </div>

              {/* Payment note */}
              <div
                className="rounded-lg px-3 py-2 mb-5 flex items-start gap-2"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
              >
                <span className="text-amber-400 text-xs mt-0.5">💳</span>
                <p className="text-xs text-amber-300/70 leading-relaxed">
                  Payment coming soon — submitting this request is free.
                </p>
              </div>

              {/* Error */}
              {submitErr && (
                <div
                  className="rounded-lg px-3 py-2 mb-4 text-xs text-red-400"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                >
                  {submitErr}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{ background: canBook ? "#7C3AED" : "rgba(124,58,237,0.35)" }}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending request…</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Request &amp; Pay {price != null ? `${price}€` : ""}
                  </>
                )}
              </button>

              {!canBook && !submitting && (
                <p className="text-xs text-white/25 text-center mt-3">
                  {!selDate ? "Select a date to continue" : "Select a time to continue"}
                </p>
              )}

              <p className="text-xs text-white/25 text-center mt-3 leading-relaxed">
                No charge until the mentor confirms. Cancel anytime before confirmation.
              </p>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
