"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserSession } from "@/lib/session";

type MentorForm = {
  nom: string;
  job_title: string;
  company: string;
  industry: string;
  years_experience: string;
  seniority: string;
  expertise: string[];
  help_with: string;
  languages: string[];
};

type Phase = "form" | "price" | "availability" | "success";

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Marketing & Advertising",
  "Consulting", "Healthcare", "Education", "Legal", "Media & Entertainment",
  "Retail & E-commerce", "Manufacturing", "Real Estate", "Non-profit", "Other",
];
const YEARS_OPTIONS = [
  "0–2 years", "2–4 years", "4–7 years",
  "7–10 years", "10–15 years", "15+ years",
];
const SENIORITY_LEVELS = [
  "Intern / Student", "Junior", "Mid-level", "Senior",
  "Lead / Manager", "Director", "C-level / Founder",
];
const EXPERTISE_OPTIONS = [
  "Marketing", "Sales", "Tech", "Finance",
  "Entrepreneurship", "Design", "HR", "Strategy", "Other",
];
const LANGUAGE_OPTIONS = ["French", "English", "Spanish", "Other"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = [
  { key: "morning",   label: "Morning",   time: "7–12h"  },
  { key: "afternoon", label: "Afternoon", time: "12–18h" },
  { key: "evening",   label: "Evening",   time: "18–22h" },
];

const TOTAL_STEPS = 3;
const SLIDER_MIN = 20;
const SLIDER_MAX = 100;

// ─── Scoring & pricing helpers ────────────────────────────────────────────────

function calcMentorScore(form: MentorForm): number {
  const expPts: Record<string, number> = {
    "0–2 years": 5,  "2–4 years": 12, "4–7 years": 20,
    "7–10 years": 28, "10–15 years": 34, "15+ years": 40,
  };
  const senPts: Record<string, number> = {
    "Intern / Student": 0, "Junior": 6, "Mid-level": 12,
    "Senior": 20, "Lead / Manager": 28, "Director": 34, "C-level / Founder": 40,
  };
  const expertisePts = Math.min(Math.round((form.expertise.length / 9) * 20), 20);
  return (expPts[form.years_experience] ?? 0) + (senPts[form.seniority] ?? 0) + expertisePts;
}

function calcPriceBand(score: number): { min: number; max: number; suggested: number } {
  if (score <= 20) return { min: 20, max: 30,  suggested: 25  };
  if (score <= 40) return { min: 30, max: 45,  suggested: 35  };
  if (score <= 60) return { min: 45, max: 65,  suggested: 55  };
  if (score <= 75) return { min: 65, max: 80,  suggested: 75  };
  if (score <= 90) return { min: 80, max: 95,  suggested: 90  };
  return              { min: 95, max: 100, suggested: 100 };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40">Step {step} of {TOTAL_STEPS}</span>
        <span className="text-xs text-white/40">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/10">
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: "#7C3AED" }}
        />
      </div>
    </div>
  );
}

function RadioList({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt} type="button" onClick={() => onChange(opt)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition-colors ${
            value === opt
              ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white font-medium"
              : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
          }`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            value === opt ? "border-[#7C3AED] bg-[#7C3AED]" : "border-white/20"
          }`}>
            {value === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
          {opt}
        </button>
      ))}
    </div>
  );
}

function TagGrid({ options, selected, onToggle }: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt} type="button" onClick={() => onToggle(opt)}
          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
            selected.includes(opt)
              ? "border-[#7C3AED] bg-[#7C3AED]/15 text-white font-medium"
              : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
          }`}
        >
          {selected.includes(opt) && <span className="mr-1 text-[#A78BFA]">✓</span>}
          {opt}
        </button>
      ))}
    </div>
  );
}

function AvailabilityPicker({
  value,
  onChange,
}: {
  value: Record<string, string[]>;
  onChange: (v: Record<string, string[]>) => void;
}) {
  function toggleDay(day: string) {
    const next = { ...value };
    if (day in next) { delete next[day]; } else { next[day] = []; }
    onChange(next);
  }

  function toggleSlot(day: string, slot: string) {
    const slots = value[day] ?? [];
    onChange({
      ...value,
      [day]: slots.includes(slot) ? slots.filter(s => s !== slot) : [...slots, slot],
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {DAYS.map(day => (
          <button
            key={day} type="button" onClick={() => toggleDay(day)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              day in value
                ? "border-[#7C3AED] bg-[#7C3AED]/15 text-white"
                : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {DAYS.filter(d => d in value).map(day => (
        <div key={day} className="rounded-xl p-4 border border-white/[0.06]" style={{ background: "#0D0A1A" }}>
          <p className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-wide">{day}</p>
          <div className="flex gap-2">
            {SLOTS.map(slot => {
              const active = (value[day] ?? []).includes(slot.key);
              return (
                <button
                  key={slot.key} type="button"
                  onClick={() => toggleSlot(day, slot.key)}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-lg border text-xs transition-colors ${
                    active
                      ? "border-[#7C3AED] bg-[#7C3AED]/15 text-white font-medium"
                      : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  <span>{slot.label}</span>
                  <span className="text-[10px] opacity-50 mt-0.5">{slot.time}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(value).length === 0 && (
        <p className="text-xs text-white/25 text-center py-1">Select at least one day to set your slots.</p>
      )}
    </div>
  );
}

const GrowViaLogo = () => (
  <Link href="/" className="inline-flex items-center gap-2.5 mb-6 justify-center">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
      style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
    >G</div>
    <span className="font-extrabold text-xl text-white tracking-tight">GrowVia</span>
  </Link>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function MentorOnboarding() {
  const router = useRouter();
  const [phase, setPhase]           = useState<Phase>("form");
  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [email, setEmail]           = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [sessionPrice, setSessionPrice] = useState(SLIDER_MIN);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState<MentorForm>({
    nom: "", job_title: "", company: "", industry: "",
    years_experience: "", seniority: "", expertise: [],
    help_with: "", languages: [],
  });

  useEffect(() => {
    const session = getUserSession();
    if (!session) { router.push("/auth/login?next=/onboarding/mentor"); return; }
    setEmail(session.email);
    setForm(f => ({ ...f, nom: session.nom }));
  }, [router]);

  function toggle(field: "expertise" | "languages", val: string) {
    setForm(f => ({
      ...f,
      [field]: (f[field] as string[]).includes(val)
        ? (f[field] as string[]).filter(v => v !== val)
        : [...(f[field] as string[]), val],
    }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!form.nom.trim() && !!form.job_title.trim() && !!form.industry;
      case 2: return !!form.years_experience && !!form.seniority && form.expertise.length > 0;
      case 3: return form.help_with.trim().length >= 10 && form.languages.length > 0;
      default: return true;
    }
  }

  function canSaveAvailability(): boolean {
    return Object.keys(availability).some(d => (availability[d] ?? []).length > 0);
  }

  // Step 3 submit: save all questionnaire answers + mentor_score → price screen
  async function handleFinish() {
    setLoading(true);
    setError(null);
    try {
      const mentor_score = calcMentorScore(form);

      const { error: dbError } = await supabase
        .from("mentors")
        .update({
          nom:              form.nom.trim(),
          job_title:        form.job_title.trim(),
          company:          form.company.trim() || null,
          industry:         form.industry,
          years_experience: form.years_experience,
          seniority:        form.seniority,
          expertise:        form.expertise,
          help_with:        form.help_with.trim(),
          languages:        form.languages,
          mentor_score,
          statut:           "active",
        })
        .eq("email", email);

      if (dbError) throw dbError;

      const { suggested } = calcPriceBand(mentor_score);
      setFinalScore(mentor_score);
      setSessionPrice(suggested);
      setPhase("price");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Price screen: save session_price → availability screen
  async function handleConfirmPrice() {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from("mentors")
        .update({ session_price: sessionPrice })
        .eq("email", email);

      if (dbError) throw dbError;
      setPhase("availability");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save price. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Availability screen: save availability JSON + set onboarding_completed = true → success
  async function handleSaveAvailability() {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from("mentors")
        .update({
          availability:         JSON.stringify(availability),
          onboarding_completed: true,
        })
        .eq("email", email);

      if (dbError) throw dbError;
      setPhase("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save availability. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Price confirmation screen ───────────────────────────────────────────────
  if (phase === "price") {
    const { min: rangeMin, max: rangeMax, suggested } = calcPriceBand(finalScore);
    const scoreColor = finalScore >= 70 ? "#10B981" : finalScore >= 40 ? "#F59E0B" : "#EF4444";
    const fillPct = ((sessionPrice - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <GrowViaLogo />
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Set your session price</h1>
            <p className="text-white/40 text-sm">Based on your profile score and experience.</p>
          </div>

          <div
            className="rounded-2xl p-8 border border-white/[0.08]"
            style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}
          >
            {/* Score + recommended range */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: "#0D0A1A" }}>
                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wide font-medium">Your score</p>
                <p className="text-2xl font-extrabold" style={{ color: scoreColor }}>
                  {finalScore}
                  <span className="text-sm text-white/30 font-normal">/100</span>
                </p>
              </div>
              <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: "#0D0A1A" }}>
                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wide font-medium">Recommended range</p>
                <p className="text-2xl font-extrabold text-white">
                  {rangeMin}–{rangeMax}
                  <span className="text-sm text-white/30 font-normal">€</span>
                </p>
              </div>
            </div>

            {/* Suggested price callout */}
            <div
              className="rounded-xl px-5 py-4 mb-7 border border-[#7C3AED]/25 flex items-center justify-between"
              style={{ background: "rgba(124,58,237,0.08)" }}
            >
              <div>
                <p className="text-xs text-white/50 font-medium mb-0.5">Suggested optimal price</p>
                <p className="text-xs text-white/30">Midpoint of your recommended range</p>
              </div>
              <p className="text-2xl font-extrabold text-[#A78BFA]">{suggested}€</p>
            </div>

            {/* Slider — full 20€–100€ range */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white/60">Your price</p>
                <p className="text-xl font-extrabold text-white">
                  {sessionPrice}€
                  <span className="text-sm text-white/40 font-normal"> / session</span>
                </p>
              </div>
              <input
                type="range"
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={5}
                value={sessionPrice}
                onChange={e => setSessionPrice(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #7C3AED ${fillPct}%, rgba(255,255,255,0.1) ${fillPct}%)`,
                  accentColor: "#7C3AED",
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-white/30">{SLIDER_MIN}€</span>
                <span className="text-xs text-white/30">{SLIDER_MAX}€</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmPrice}
              disabled={loading}
              className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              style={{ background: "#7C3AED" }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <>Confirm & Continue <ArrowRight className="w-4 h-4" /></>
              }
            </button>

            <p className="text-center text-xs text-white/30 mt-4">
              You can change this anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Availability screen ─────────────────────────────────────────────────────
  if (phase === "availability") {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <GrowViaLogo />
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Set your availability</h1>
            <p className="text-white/40 text-sm">Choose the days and time slots that work for you.</p>
          </div>

          <div
            className="rounded-2xl p-8 border border-white/[0.08]"
            style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}
          >
            <AvailabilityPicker value={availability} onChange={setAvailability} />

            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mt-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              onClick={handleSaveAvailability}
              disabled={loading || !canSaveAvailability()}
              className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm disabled:opacity-40 mt-8"
              style={{ background: "#7C3AED" }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <>Save & go to dashboard <ArrowRight className="w-4 h-4" /></>
              }
            </button>

            <p className="text-center text-xs text-white/30 mt-4">
              You can update this anytime from your settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (phase === "success") {
    const scoreColor = finalScore >= 70 ? "#10B981" : finalScore >= 40 ? "#F59E0B" : "#EF4444";

    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <GrowViaLogo />

          <div
            className="rounded-2xl p-8 border border-white/[0.08]"
            style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(124,58,237,0.15)" }}
            >
              <Check className="w-7 h-7 text-[#A78BFA]" />
            </div>

            <h1 className="text-2xl font-extrabold text-white mb-1">Profile complete!</h1>
            <p className="text-white/40 text-sm mb-8">Your mentor profile is now active.</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-xl p-5 border border-white/[0.06] text-left" style={{ background: "#0D0A1A" }}>
                <p className="text-xs text-white/40 mb-2 uppercase tracking-wide font-medium">Mentor score</p>
                <p className="text-3xl font-extrabold" style={{ color: scoreColor }}>
                  {finalScore}
                  <span className="text-base text-white/30 font-normal">/100</span>
                </p>
                <p className="text-xs text-white/30 mt-1">
                  {finalScore >= 70 ? "Top tier" : finalScore >= 40 ? "Strong profile" : "Getting started"}
                </p>
              </div>
              <div className="rounded-xl p-5 border border-white/[0.06] text-left" style={{ background: "#0D0A1A" }}>
                <p className="text-xs text-white/40 mb-2 uppercase tracking-wide font-medium">Session price</p>
                <p className="text-3xl font-extrabold text-[#A78BFA]">
                  {sessionPrice}
                  <span className="text-base text-white/30 font-normal">€</span>
                </p>
                <p className="text-xs text-white/30 mt-1">per session</p>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
              style={{ background: "#7C3AED" }}
            >
              Go to my dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Multi-step form (phase === "form") ──────────────────────────────────────
  const stepTitles = ["Your background", "Your experience", "Mentoring preferences"];

  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <GrowViaLogo />
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">{stepTitles[step - 1]}</h1>
          <p className="text-white/40 text-sm">Help mentees find and trust you.</p>
        </div>

        <div
          className="rounded-2xl p-8 border border-white/[0.08]"
          style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}
        >
          <ProgressBar step={step} />

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Step 1 — Background */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Full name</label>
                <input
                  type="text" value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Luna Davin"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Current job title</label>
                <input
                  type="text" value={form.job_title}
                  onChange={e => setForm({ ...form, job_title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">
                  Current company <span className="text-white/30">(optional)</span>
                </label>
                <input
                  type="text" value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Stripe, Freelance, …"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Industry</label>
                <select
                  value={form.industry}
                  onChange={e => setForm({ ...form, industry: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                >
                  <option value="" disabled className="bg-[#13111F]">Select your industry…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i} className="bg-[#13111F]">{i}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 2 — Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Years of professional experience</label>
                <RadioList options={YEARS_OPTIONS} value={form.years_experience} onChange={v => setForm({ ...form, years_experience: v })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Seniority level</label>
                <div className="grid grid-cols-2 gap-2">
                  {SENIORITY_LEVELS.map(lvl => (
                    <button
                      key={lvl} type="button"
                      onClick={() => setForm({ ...form, seniority: lvl })}
                      className={`px-4 py-3 rounded-xl border-2 text-sm text-left transition-colors ${
                        form.seniority === lvl
                          ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white font-medium"
                          : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}
                    >{lvl}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2.5">
                  Areas of expertise <span className="text-white/30">(select all that apply)</span>
                </label>
                <TagGrid options={EXPERTISE_OPTIONS} selected={form.expertise} onToggle={v => toggle("expertise", v)} />
              </div>
            </div>
          )}

          {/* Step 3 — Mentoring preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">What can you help mentees with?</label>
                <p className="text-white/30 text-xs mb-2">Shown on your public profile. Min. 10 characters.</p>
                <textarea
                  rows={4} value={form.help_with}
                  onChange={e => setForm({ ...form, help_with: e.target.value })}
                  placeholder="I can help with landing a first role in tech, navigating career transitions, interview prep…"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2.5">
                  Preferred languages <span className="text-white/30">(select all that apply)</span>
                </label>
                <TagGrid options={LANGUAGE_OPTIONS} selected={form.languages} onToggle={v => toggle("languages", v)} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
            {step > 1
              ? <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              : <div />
            }
            {step < TOTAL_STEPS
              ? <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                  className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-opacity disabled:opacity-40 hover:opacity-90"
                  style={{ background: "#7C3AED" }}>
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              : <button type="button" onClick={handleFinish} disabled={!canProceed() || loading}
                  className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-opacity disabled:opacity-40 hover:opacity-90"
                  style={{ background: "#7C3AED" }}>
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : <><Check className="w-4 h-4" /> Complete profile</>
                  }
                </button>
            }
          </div>
        </div>

        <p className="text-center text-xs text-white/25 mt-5">
          You can update this later in your{" "}
          <Link href="/settings" className="text-[#A78BFA] hover:text-white transition-colors">settings</Link>.
        </p>
      </div>
    </div>
  );
}
