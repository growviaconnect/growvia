"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserSession, setUserSession } from "@/lib/session";

type MenteeForm = {
  age_range: string;
  situation: string;
  field: string;
  main_goal: string;
  interests: string[];
  clarity_level: number;
  description: string;
};

const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45+"];
const SITUATIONS = [
  "Student", "Recent graduate", "Working professional",
  "Career changer", "Entrepreneur", "Looking for work",
];
const MAIN_GOALS = [
  "Land my first job", "Change career", "Get promoted",
  "Develop skills", "Start a business", "Expand my network", "Launch a project",
];
const INTEREST_OPTIONS = [
  "Technology", "Business", "Marketing", "Finance", "Design",
  "HR & Management", "Education", "Healthcare", "Data & AI",
  "Entrepreneurship", "Leadership", "Communication",
];
const CLARITY_LABELS: Record<number, string> = {
  1: "Very unclear — I'm exploring",
  2: "A bit blurry — I have some ideas",
  3: "Somewhat clear — I'm narrowing down",
  4: "Fairly clear — I know my direction",
  5: "Crystal clear — I know exactly what I want",
};

const TOTAL_STEPS = 4;

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

function RadioGrid({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-3 rounded-xl border-2 text-sm text-left transition-colors ${
            value === opt
              ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white font-medium"
              : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
          }`}
        >
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
          {selected.includes(opt) && <span className="mr-1.5 text-[#A78BFA]">✓</span>}
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function MenteeOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const [form, setForm] = useState<MenteeForm>({
    age_range: "",
    situation: "",
    field: "",
    main_goal: "",
    interests: [],
    clarity_level: 3,
    description: "",
  });

  useEffect(() => {
    const session = getUserSession();
    if (!session) { router.push("/auth/login?next=/onboarding/mentee"); return; }
    setEmail(session.email);
  }, [router]);

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!form.age_range && !!form.situation;
      case 2: return form.field.trim().length > 0 && !!form.main_goal;
      case 3: return form.interests.length > 0;
      case 4: return form.description.trim().length >= 10;
      default: return true;
    }
  }

  async function handleFinish() {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from("mentees")
        .update({
          age_range: form.age_range,
          situation: form.situation,
          field: form.field.trim(),
          main_goal: form.main_goal,
          interests: form.interests,
          clarity_level: form.clarity_level,
          description: form.description.trim(),
          statut: "active",
        })
        .eq("email", email);

      if (dbError) throw dbError;

      const session = getUserSession();
      if (session) setUserSession({ ...session, objectif: form.main_goal });

      router.push("/dashboard?onboarded=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      setLoading(false);
    }
  }

  const stepTitles = [
    "Tell us about yourself",
    "Your career path",
    "Your interests & clarity",
    "Your story",
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
          <p className="text-white/40 text-sm">Help us match you with the right mentor.</p>
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

          {/* Step 1 — About you */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">What is your age range?</label>
                <RadioGrid options={AGE_RANGES} value={form.age_range} onChange={(v) => setForm({ ...form, age_range: v })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">What best describes your current situation?</label>
                <RadioGrid options={SITUATIONS} value={form.situation} onChange={(v) => setForm({ ...form, situation: v })} />
              </div>
            </div>
          )}

          {/* Step 2 — Career path */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">What is your field or domain?</label>
                <input
                  type="text"
                  value={form.field}
                  onChange={(e) => setForm({ ...form, field: e.target.value })}
                  placeholder="e.g. Software engineering, Marketing, Finance…"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">What is your main goal with a mentor?</label>
                <div className="space-y-2">
                  {MAIN_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setForm({ ...form, main_goal: goal })}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition-colors ${
                        form.main_goal === goal
                          ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white font-medium"
                          : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        form.main_goal === goal ? "border-[#7C3AED] bg-[#7C3AED]" : "border-white/20"
                      }`}>
                        {form.main_goal === goal && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Interests & clarity */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">
                  What topics interest you? <span className="text-white/30">(select all that apply)</span>
                </label>
                <TagGrid
                  options={INTEREST_OPTIONS}
                  selected={form.interests}
                  onToggle={(v) => setForm(f => ({
                    ...f,
                    interests: f.interests.includes(v)
                      ? f.interests.filter(i => i !== v)
                      : [...f.interests, v],
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">
                  How clear is your goal right now? <span className="text-[#A78BFA]">{form.clarity_level}/5</span>
                </label>
                <p className="text-white/40 text-xs mb-4 italic">{CLARITY_LABELS[form.clarity_level]}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, clarity_level: n })}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                        form.clarity_level === n
                          ? "border-[#7C3AED] bg-[#7C3AED]/15 text-white"
                          : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Description */}
          {step === 4 && (
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Tell us more about yourself and what you're looking for
              </label>
              <p className="text-white/30 text-xs mb-3">This helps mentors understand your situation (min. 10 characters).</p>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="I'm a 2nd-year engineering student looking to break into the product world. I've built a few side projects but struggle with…"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors resize-none"
              />
              <p className="text-right text-xs text-white/25 mt-1">{form.description.length} chars</p>
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
