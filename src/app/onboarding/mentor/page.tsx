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
  availability: string;
};

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

const AVAILABILITY_OPTIONS = ["Once a month", "Twice a month", "Weekly"];

const TOTAL_STEPS = 3;

// ─── Scoring ──────────────────────────────────────────────────────────────────

function calcMentorScore(form: MentorForm): number {
  const expPts: Record<string, number> = {
    "0–2 years": 5, "2–4 years": 12, "4–7 years": 20,
    "7–10 years": 28, "10–15 years": 34, "15+ years": 40,
  };
  const senPts: Record<string, number> = {
    "Intern / Student": 0, "Junior": 6, "Mid-level": 12,
    "Senior": 20, "Lead / Manager": 28, "Director": 34, "C-level / Founder": 40,
  };
  const expertisePts = Math.min(Math.round((form.expertise.length / 9) * 20), 20);
  return (expPts[form.years_experience] ?? 0) + (senPts[form.seniority] ?? 0) + expertisePts;
}

function calcPriceRange(seniority: string): string {
  const ranges: Record<string, string> = {
    "Intern / Student": "Free – 20€",
    "Junior":           "20 – 40€",
    "Mid-level":        "40 – 70€",
    "Senior":           "70 – 100€",
    "Lead / Manager":   "100 – 150€",
    "Director":         "150 – 200€",
    "C-level / Founder":"200 – 300€",
  };
  return ranges[seniority] ?? "–";
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
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
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
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function MentorOnboarding() {
  const router = useRouter();
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalSeniority, setFinalSeniority] = useState("");

  const [form, setForm] = useState<MentorForm>({
    nom: "",
    job_title: "",
    company: "",
    industry: "",
    years_experience: "",
    seniority: "",
    expertise: [],
    help_with: "",
    languages: [],
    availability: "",
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
      case 3: return form.help_with.trim().length >= 10 && form.languages.length > 0 && !!form.availability;
      default: return true;
    }
  }

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
          availability:     form.availability,
          mentor_score,
          statut:           "active",
        })
        .eq("email", email);

      if (dbError) throw dbError;

      setFinalScore(mentor_score);
      setFinalSeniority(form.seniority);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      setLoading(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    const priceRange  = calcPriceRange(finalSeniority);
    const scoreColor  = finalScore >= 70 ? "#10B981" : finalScore >= 40 ? "#F59E0B" : "#EF4444";

    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 justify-center">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
            >G</div>
            <span className="font-extrabold text-xl text-white tracking-tight">GrowVia</span>
          </Link>

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
              <div
                className="rounded-xl p-5 border border-white/[0.06] text-left"
                style={{ background: "#0D0A1A" }}
              >
                <p className="text-xs text-white/40 mb-2 uppercase tracking-wide font-medium">Mentor score</p>
                <p className="text-3xl font-extrabold" style={{ color: scoreColor }}>
                  {finalScore}
                  <span className="text-base text-white/30 font-normal">/100</span>
                </p>
                <p className="text-xs text-white/30 mt-1">
                  {finalScore >= 70 ? "Top tier" : finalScore >= 40 ? "Strong profile" : "Getting started"}
                </p>
              </div>
              <div
                className="rounded-xl p-5 border border-white/[0.06] text-left"
                style={{ background: "#0D0A1A" }}
              >
                <p className="text-xs text-white/40 mb-2 uppercase tracking-wide font-medium">Suggested price</p>
                <p className="text-lg font-extrabold text-[#A78BFA] leading-tight">{priceRange}</p>
                <p className="text-xs text-white/30 mt-1">per session</p>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard?onboarded=1")}
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

  // ── Multi-step form ─────────────────────────────────────────────────────────
  const stepTitles = ["Your background", "Your experience", "Mentoring preferences"];

  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
            >G</div>
            <span className="font-extrabold text-xl text-white tracking-tight">GrowVia</span>
          </Link>
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
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Luna Davin"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Current job title</label>
                <input
                  type="text"
                  value={form.job_title}
                  onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">
                  Current company <span className="text-white/30">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Stripe, Freelance, …"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Industry</label>
                <select
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                >
                  <option value="" disabled className="bg-[#13111F]">Select your industry…</option>
                  {INDUSTRIES.map(i => (
                    <option key={i} value={i} className="bg-[#13111F]">{i}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2 — Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Years of professional experience</label>
                <RadioList
                  options={YEARS_OPTIONS}
                  value={form.years_experience}
                  onChange={(v) => setForm({ ...form, years_experience: v })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Seniority level</label>
                <div className="grid grid-cols-2 gap-2">
                  {SENIORITY_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setForm({ ...form, seniority: lvl })}
                      className={`px-4 py-3 rounded-xl border-2 text-sm text-left transition-colors ${
                        form.seniority === lvl
                          ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white font-medium"
                          : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2.5">
                  Areas of expertise <span className="text-white/30">(select all that apply)</span>
                </label>
                <TagGrid
                  options={EXPERTISE_OPTIONS}
                  selected={form.expertise}
                  onToggle={(v) => toggle("expertise", v)}
                />
              </div>
            </div>
          )}

          {/* Step 3 — Mentoring preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">
                  What can you help mentees with?
                </label>
                <p className="text-white/30 text-xs mb-2">Shown on your public profile. Min. 10 characters.</p>
                <textarea
                  rows={4}
                  value={form.help_with}
                  onChange={(e) => setForm({ ...form, help_with: e.target.value })}
                  placeholder="I can help with landing a first role in tech, navigating career transitions, interview prep…"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2.5">
                  Preferred languages <span className="text-white/30">(select all that apply)</span>
                </label>
                <TagGrid
                  options={LANGUAGE_OPTIONS}
                  selected={form.languages}
                  onToggle={(v) => toggle("languages", v)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Availability</label>
                <RadioList
                  options={AVAILABILITY_OPTIONS}
                  value={form.availability}
                  onChange={(v) => setForm({ ...form, availability: v })}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-opacity disabled:opacity-40 hover:opacity-90"
                style={{ background: "#7C3AED" }}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-opacity disabled:opacity-40 hover:opacity-90"
                style={{ background: "#7C3AED" }}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Check className="w-4 h-4" /> Complete profile</>
                }
              </button>
            )}
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
