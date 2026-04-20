"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserSession } from "@/lib/session";

type MentorForm = {
  location: string;
  languages: string[];
  industry: string;
  job_title: string;
  years_experience: string;
  seniority: string;
  expertise: string[];
  mentoring_experience: string;
  motivation: string;
  availability: string;
  session_preferences: string[];
  certification_willing: boolean | null;
  bio: string;
};

const LANGUAGES = [
  "French", "English", "Spanish", "Arabic", "German",
  "Italian", "Portuguese", "Chinese", "Japanese", "Other",
];
const INDUSTRIES = [
  "Technology", "Finance & Banking", "Marketing & Advertising",
  "Consulting", "Healthcare", "Education", "Legal", "Media & Entertainment",
  "Retail & E-commerce", "Manufacturing", "Real Estate", "Non-profit", "Other",
];
const SENIORITY_LEVELS = [
  "Junior", "Mid-level", "Senior", "Lead", "Director", "VP", "C-Suite",
];
const YEARS_OPTIONS = ["0–2 years", "3–5 years", "6–10 years", "10+ years"];
const EXPERTISE_OPTIONS = [
  "Leadership", "Career planning", "Technical skills", "Communication",
  "Product management", "Engineering", "Sales & Growth", "Fundraising",
  "Personal branding", "Networking", "Work-life balance", "Negotiation",
  "Data & Analytics", "Design thinking", "Public speaking", "Finance",
];
const MENTORING_EXP = [
  "Never mentored before", "1–5 people", "6–20 people", "20+ people",
];
const AVAILABILITY_OPTIONS = [
  "1–2 hours/month", "3–5 hours/month", "5–10 hours/month", "10+ hours/month",
];
const SESSION_PREF_OPTIONS = [
  "Video call", "Phone call", "In-person", "Written / async",
];

const TOTAL_STEPS = 4;

// ─── Score & price helpers ─────────────────────────────────────────────────────

function calcMentorScore(form: MentorForm): number {
  let score = 0;

  const expPts: Record<string, number> = {
    "0–2 years": 10, "3–5 years": 18, "6–10 years": 26, "10+ years": 34,
  };
  score += expPts[form.years_experience] ?? 0;

  const senPts: Record<string, number> = {
    Junior: 4, "Mid-level": 8, Senior: 14, Lead: 18, Director: 22, VP: 26, "C-Suite": 30,
  };
  score += senPts[form.seniority] ?? 0;

  const menPts: Record<string, number> = {
    "Never mentored before": 0, "1–5 people": 8, "6–20 people": 16, "20+ people": 22,
  };
  score += menPts[form.mentoring_experience] ?? 0;

  if (form.certification_willing === true) score += 6;
  score += Math.min(form.expertise.length * 1.5, 8);

  return Math.min(Math.round(score), 100);
}

function calcRecommendedPrice(form: MentorForm): number {
  const base: Record<string, number> = {
    Junior: 20, "Mid-level": 35, Senior: 55,
    Lead: 70, Director: 85, VP: 100, "C-Suite": 130,
  };
  let price = base[form.seniority] ?? 35;
  if (form.years_experience === "10+ years") price = Math.round(price * 1.15);
  return price;
}

// ─── Shared sub-components ─────────────────────────────────────────────────────

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

// ─── Main component ────────────────────────────────────────────────────────────

export default function MentorOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const [form, setForm] = useState<MentorForm>({
    location: "",
    languages: [],
    industry: "",
    job_title: "",
    years_experience: "",
    seniority: "",
    expertise: [],
    mentoring_experience: "",
    motivation: "",
    availability: "",
    session_preferences: [],
    certification_willing: null,
    bio: "",
  });

  useEffect(() => {
    const session = getUserSession();
    if (!session) { router.push("/auth/login?next=/onboarding/mentor"); return; }
    setEmail(session.email);
  }, [router]);

  function toggle(field: "languages" | "expertise" | "session_preferences", val: string) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val)
        ? (f[field] as string[]).filter(v => v !== val)
        : [...(f[field] as string[]), val],
    }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!form.location.trim() && form.languages.length > 0 && !!form.industry && !!form.job_title.trim();
      case 2: return !!form.years_experience && !!form.seniority && form.expertise.length > 0;
      case 3: return !!form.mentoring_experience && form.motivation.trim().length >= 10 && !!form.availability;
      case 4: return form.session_preferences.length > 0 && form.certification_willing !== null && form.bio.trim().length >= 20;
      default: return true;
    }
  }

  async function handleFinish() {
    setLoading(true);
    setError(null);
    try {
      const mentor_score = calcMentorScore(form);
      const recommended_price = calcRecommendedPrice(form);

      const { error: dbError } = await supabase
        .from("mentors")
        .update({
          location: form.location.trim(),
          languages: form.languages,
          industry: form.industry,
          job_title: form.job_title.trim(),
          years_experience: form.years_experience,
          seniority: form.seniority,
          expertise: form.expertise,
          mentoring_experience: form.mentoring_experience,
          motivation: form.motivation.trim(),
          availability: form.availability,
          session_preferences: form.session_preferences,
          certification_willing: form.certification_willing,
          bio: form.bio.trim(),
          mentor_score,
          recommended_price,
          statut: "active",
        })
        .eq("email", email);

      if (dbError) throw dbError;

      router.push("/dashboard?onboarded=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      setLoading(false);
    }
  }

  const stepTitles = [
    "Your background",
    "Your experience",
    "Your mentoring style",
    "Final setup",
  ];

  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
            >G</div>
            <span className="font-extrabold text-xl text-white tracking-tight">GrowVia</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
            {stepTitles[step - 1]}
          </h1>
          <p className="text-white/40 text-sm">Help mentees find and trust you.</p>
        </div>

        {/* Card */}
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
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Where are you based?</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Paris, France"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2.5">
                  Languages you can mentor in <span className="text-white/30">(select all that apply)</span>
                </label>
                <TagGrid options={LANGUAGES} selected={form.languages} onToggle={(v) => toggle("languages", v)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Your industry</label>
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
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Your current job title</label>
                <input
                  type="text"
                  value={form.job_title}
                  onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 2 — Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Years of professional experience</label>
                <RadioList options={YEARS_OPTIONS} value={form.years_experience} onChange={(v) => setForm({ ...form, years_experience: v })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Your seniority level</label>
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
                <TagGrid options={EXPERTISE_OPTIONS} selected={form.expertise} onToggle={(v) => toggle("expertise", v)} />
              </div>
            </div>
          )}

          {/* Step 3 — Mentoring style */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">How many people have you mentored?</label>
                <RadioList options={MENTORING_EXP} value={form.mentoring_experience} onChange={(v) => setForm({ ...form, mentoring_experience: v })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Why do you want to be a mentor?</label>
                <p className="text-white/30 text-xs mb-2">Min. 10 characters.</p>
                <textarea
                  rows={4}
                  value={form.motivation}
                  onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                  placeholder="I want to give back by sharing what I've learned through my career…"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">How much time can you commit?</label>
                <RadioList options={AVAILABILITY_OPTIONS} value={form.availability} onChange={(v) => setForm({ ...form, availability: v })} />
              </div>
            </div>
          )}

          {/* Step 4 — Final setup */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2.5">
                  Preferred session formats <span className="text-white/30">(select all that apply)</span>
                </label>
                <TagGrid options={SESSION_PREF_OPTIONS} selected={form.session_preferences} onToggle={(v) => toggle("session_preferences", v)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">
                  Are you open to GrowVia certification?
                </label>
                <p className="text-white/30 text-xs mb-3">Certified mentors get a badge and higher visibility.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setForm({ ...form, certification_willing: val })}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                        form.certification_willing === val
                          ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white"
                          : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      {val ? "Yes, absolutely" : "Not for now"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Your public bio</label>
                <p className="text-white/30 text-xs mb-2">Min. 20 characters — shown to mentees on your profile.</p>
                <textarea
                  rows={5}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Senior engineer at a scale-up with 8 years building distributed systems. Passionate about helping early-career devs level up…"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors resize-none"
                />
                <p className="text-right text-xs text-white/25 mt-1">{form.bio.length} chars</p>
              </div>

              {/* Score preview */}
              {canProceed() && (
                <div
                  className="rounded-xl p-4 border border-[#7C3AED]/20"
                  style={{ background: "rgba(124,58,237,0.06)" }}
                >
                  <p className="text-xs text-white/50 mb-2 font-medium uppercase tracking-wide">Your profile score</p>
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-2xl font-extrabold text-white">{calcMentorScore(form)}<span className="text-base text-white/40">/100</span></p>
                      <p className="text-xs text-white/40 mt-0.5">Mentor score</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-[#A78BFA]">{calcRecommendedPrice(form)}€<span className="text-base text-white/40">/session</span></p>
                      <p className="text-xs text-white/40 mt-0.5">Suggested price</p>
                    </div>
                  </div>
                </div>
              )}
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
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  <><Check className="w-4 h-4" /> Complete profile</>
                )}
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
