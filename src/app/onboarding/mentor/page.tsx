"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, ArrowLeft, Check, Loader2, AlertCircle,
  Upload, FileText, User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserSession } from "@/lib/session";

// ─── Constants ─────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4;

const SECTEURS_OPTIONS = [
  "Tech", "Finance", "Marketing", "Consulting", "Startup",
  "Healthcare", "Education", "Law", "Design", "HR", "Other",
];
const COMPETENCES_OPTIONS = [
  "Leadership", "Communication", "Strategy", "Technical skills",
  "Sales", "Product", "Data", "Creative", "Operations", "Coaching",
];
const TYPE_PROFILS_OPTIONS = [
  "First job", "Career change", "Promotion", "Entrepreneurship", "Specific skills",
];
const STYLE_OPTIONS = [
  { key: "directive",   label: "Directive coach",  desc: "Clear direction and action plans" },
  { key: "facilitator", label: "Facilitator",       desc: "Help mentees find their own path" },
  { key: "networker",   label: "Network-focused",   desc: "Open doors and make introductions" },
  { key: "technical",   label: "Technical expert",  desc: "Share deep technical knowledge" },
];
const FORMAT_OPTIONS  = ["Video calls", "Messages", "Both"];
const LANGUES_OPTIONS = ["French", "English", "Spanish", "Portuguese", "Other"];

// ─── Types ─────────────────────────────────────────────────────────────────────
type CompetenceEntry = { name: string; rating: number };

type S1 = {
  nom: string; photo_url: string; poste_actuel: string; entreprise: string;
  annees_experience: string; localisation: string; linkedin_url: string; bio: string;
};
type S2 = { secteurs: string[]; competences: CompetenceEntry[]; type_profils_aides: string[] };
type S3 = {
  style_mentorat: string; disponibilite_heures: number; max_mentees: number;
  format_prefere: string; langues: string[]; motivation: string;
};
type S4 = { cv_url: string };

// ─── Completion % ──────────────────────────────────────────────────────────────
function computeCompletion(s1: S1, s2: S2, s3: S3, s4: S4): number {
  const checks = [
    !!s1.nom.trim(), !!s1.photo_url, !!s1.poste_actuel.trim(),
    !!s1.entreprise.trim(), s1.annees_experience !== "",
    !!s1.localisation.trim(), !!s1.linkedin_url.trim(), !!s1.bio.trim(),
    s2.secteurs.length > 0, s2.competences.length > 0, s2.type_profils_aides.length > 0,
    !!s3.style_mentorat, s3.disponibilite_heures > 0, s3.max_mentees > 0,
    !!s3.format_prefere, s3.langues.length > 0, !!s3.motivation.trim(),
    !!s4.cv_url,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ─── Storage helper ────────────────────────────────────────────────────────────
async function uploadToStorage(bucket: string, path: string, file: File): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Shared UI helpers ─────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white " +
  "placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] " +
  "focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors";

const GrowViaLogo = () => (
  <Link href="/" className="inline-flex items-center gap-2.5 mb-6 justify-center">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
      style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>G</div>
    <span className="font-extrabold text-xl text-white tracking-tight">GrowVia</span>
  </Link>
);

function FieldLabel({ children, optional, extra }: {
  children: React.ReactNode; optional?: boolean; extra?: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-white/60 mb-1.5">
      {children}
      {optional && <span className="ml-1 text-white/30 font-normal">(optional)</span>}
      {extra}
    </label>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
        selected
          ? "border-[#7C3AED] bg-[#7C3AED]/15 text-white font-medium"
          : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
      }`}>
      {selected && <span className="mr-1 text-[#A78BFA]">✓</span>}
      {label}
    </button>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 p-0.5">
          <svg className="w-4 h-4" viewBox="0 0 20 20"
            fill={n <= (hovered || value) ? "#A78BFA" : "none"}
            stroke={n <= (hovered || value) ? "#A78BFA" : "rgba(255,255,255,0.2)"}
            strokeWidth={1.5}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function MentorOnboarding() {
  const router = useRouter();

  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [done, setDone]             = useState(false);
  const [userId, setUserId]         = useState("");
  const [email, setEmail]           = useState("");
  const [authNom, setAuthNom]       = useState(""); // fallback name from auth metadata

  // Photo upload
  const photoInputRef               = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  // CV upload — separate error state so a failed upload doesn't block form completion
  const cvInputRef                  = useRef<HTMLInputElement>(null);
  const [cvFileName, setCvFileName] = useState("");
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError]       = useState<string | null>(null);

  // Step data
  const [s1, setS1] = useState<S1>({
    nom: "", photo_url: "", poste_actuel: "", entreprise: "",
    annees_experience: "", localisation: "", linkedin_url: "", bio: "",
  });
  const [s2, setS2] = useState<S2>({ secteurs: [], competences: [], type_profils_aides: [] });
  const [s3, setS3] = useState<S3>({
    style_mentorat: "", disponibilite_heures: 3, max_mentees: 3,
    format_prefere: "", langues: [], motivation: "",
  });
  const [s4, setS4] = useState<S4>({ cv_url: "" });

  const completion = computeCompletion(s1, s2, s3, s4);

  // ── Init: load existing data ─────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const session = getUserSession();
      if (!session) { router.push("/auth/login?next=/onboarding/mentor"); return; }
      setEmail(session.email);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?next=/onboarding/mentor"); return; }
      setUserId(user.id);

      // Best-effort name from auth metadata — used as NOT NULL fallback at every upsert
      const metaName = (user.user_metadata?.full_name as string | undefined)
        ?? (user.user_metadata?.nom as string | undefined)
        ?? (session as { nom?: string }).nom
        ?? user.email
        ?? "";
      setAuthNom(metaName);

      const { data: existing } = await supabase
        .from("mentors").select("*").eq("id", user.id).single();

      if (existing) {
        setS1({
          nom:               existing.nom               ?? metaName,
          photo_url:         existing.photo_url         ?? "",
          poste_actuel:      existing.poste_actuel      ?? "",
          entreprise:        existing.entreprise        ?? "",
          annees_experience: existing.annees_experience != null
                               ? String(existing.annees_experience) : "",
          localisation:      existing.localisation      ?? "",
          linkedin_url:      existing.linkedin_url      ?? "",
          bio:               existing.bio               ?? "",
        });
        if (existing.photo_url) setPhotoPreview(existing.photo_url);
        setS2({
          secteurs:           existing.secteurs           ?? [],
          competences:        existing.competences        ?? [],
          type_profils_aides: existing.type_profils_aides ?? [],
        });
        setS3({
          style_mentorat:      existing.style_mentorat      ?? "",
          disponibilite_heures: existing.disponibilite_heures ?? 3,
          max_mentees:         existing.max_mentees         ?? 3,
          format_prefere:      existing.format_prefere      ?? "",
          langues:             existing.langues             ?? [],
          motivation:          existing.motivation          ?? "",
        });
        setS4({ cv_url: existing.cv_url ?? "" });
        if (existing.cv_url) setCvFileName("CV uploaded");
      } else {
        setS1(prev => ({ ...prev, nom: metaName }));
      }
      setPageLoading(false);
    }
    init();
  }, [router]);

  // ── Shared upload helper (server-side, uses service-role key) ────────────────
  async function uploadViaApi(file: File, bucket: string, path: string): Promise<string> {
    const body = new FormData();
    body.append("file",   file);
    body.append("bucket", bucket);
    body.append("path",   path);
    const res  = await fetch("/api/mentor/upload-file", { method: "POST", body });
    const json = await res.json() as { url?: string; error?: string };
    if (!res.ok) throw new Error(json.error ?? "Upload failed");
    return json.url!;
  }

  // ── Photo upload ─────────────────────────────────────────────────────────────
  async function handlePhotoSelect(file: File) {
    if (!userId) return;
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const url = await uploadViaApi(file, "avatars", `${userId}/avatar.${ext}`);
      setS1(prev => ({ ...prev, photo_url: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed — please try again.");
      setPhotoPreview(s1.photo_url);
    } finally {
      setPhotoUploading(false);
    }
  }

  // ── CV upload — failure is non-blocking (CV is optional) ─────────────────────
  async function handleCVSelect(file: File) {
    if (!userId) return;
    setCvUploading(true);
    setCvError(null);
    try {
      const path = await uploadViaApi(file, "cvs", `${userId}/cv.pdf`);
      setS4({ cv_url: path });
      setCvFileName(file.name);
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "CV upload failed — please try again.");
    } finally {
      setCvUploading(false);
    }
  }

  // ── Competences ──────────────────────────────────────────────────────────────
  function toggleCompetence(name: string) {
    setS2(prev => {
      const exists = prev.competences.find(c => c.name === name);
      return {
        ...prev,
        competences: exists
          ? prev.competences.filter(c => c.name !== name)
          : [...prev.competences, { name, rating: 3 }],
      };
    });
  }
  function rateCompetence(name: string, rating: number) {
    setS2(prev => ({
      ...prev,
      competences: prev.competences.map(c => c.name === name ? { ...c, rating } : c),
    }));
  }

  // ── Array toggles ────────────────────────────────────────────────────────────
  function toggleS2(field: "secteurs" | "type_profils_aides", val: string) {
    setS2(prev => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  }
  function toggleLang(val: string) {
    setS3(prev => ({
      ...prev,
      langues: prev.langues.includes(val) ? prev.langues.filter(v => v !== val) : [...prev.langues, val],
    }));
  }

  // ── Can proceed ──────────────────────────────────────────────────────────────
  function canProceed(): boolean {
    if (step === 1) return !!s1.nom.trim() && !!s1.poste_actuel.trim();
    if (step === 2) return !!s1.nom.trim() && s2.secteurs.length > 0;
    if (step === 3) return !!s3.style_mentorat && !!s3.format_prefere && s3.langues.length > 0;
    return true;
  }

  // ── Upsert on each Next ──────────────────────────────────────────────────────
  async function handleNext() {
    setLoading(true);
    setError(null);
    try {
      const base = { id: userId, email, updated_at: new Date().toISOString() };

      if (step === 1) {
        await supabase.from("mentors").upsert({
          ...base,
          nom:               s1.nom.trim(),
          photo_url:         s1.photo_url        || null,
          poste_actuel:      s1.poste_actuel.trim()  || null,
          entreprise:        s1.entreprise.trim()    || null,
          annees_experience: s1.annees_experience !== "" ? Number(s1.annees_experience) : null,
          localisation:      s1.localisation.trim()  || null,
          linkedin_url:      s1.linkedin_url.trim()  || null,
          bio:               s1.bio.trim()            || null,
        }).throwOnError();

      } else if (step === 2) {
        // Guard: step 1 must have been saved first — nom cannot be null in DB
        const nomValue = s1.nom.trim() || authNom;
        if (!nomValue) {
          throw new Error("Please complete step 1 first — your name is required.");
        }
        await supabase.from("mentors").upsert({
          ...base,
          nom:                nomValue,
          secteurs:           s2.secteurs,
          competences:        s2.competences,
          type_profils_aides: s2.type_profils_aides,
        }).throwOnError();

      } else if (step === 3) {
        const nomValue = s1.nom.trim() || authNom;
        if (!nomValue) {
          throw new Error("Please complete step 1 first — your name is required.");
        }
        await supabase.from("mentors").upsert({
          ...base,
          nom:                  nomValue,
          style_mentorat:      s3.style_mentorat || null,
          disponibilite_heures: s3.disponibilite_heures,
          max_mentees:         s3.max_mentees,
          format_prefere:      s3.format_prefere || null,
          langues:             s3.langues,
          motivation:          s3.motivation.trim() || null,
        }).throwOnError();

      } else {
        // Step 4 — final: save CV + mark complete.
        // Validate only the fields that are required AND visible before this step.
        // motivation lives in step 3 and is optional — do not block here.
        const aiRequired: [string, string][] = [
          ["Full name",  s1.nom.trim()],
          ["Job title",  s1.poste_actuel.trim()],
        ];
        for (const [label, val] of aiRequired) {
          if (!val) throw new Error(`'${label}' is empty — please go back to step 1.`);
        }

        await supabase.from("mentors").upsert({
          ...base,
          nom:              s1.nom.trim() || authNom,
          cv_url:           s4.cv_url || null,
          survey_completed: true,
          statut:           "active",
        }).throwOnError();

        // Fire AI score request — filter out any empty content blocks before sending
        const aiRes = await fetch("/api/mentor/ai-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom:        s1.nom.trim(),
            job_title:  s1.poste_actuel.trim(),
            company:    s1.entreprise.trim(),
            bio:        s1.bio.trim(),
            sectors:    s2.secteurs,
            skills:     s2.competences.map(c => c.name),
            motivation: s3.motivation.trim(),
            languages:  s3.langues,
          }),
        });
        if (aiRes.ok) {
          const aiJson = await aiRes.json() as { summary?: string };
          if (aiJson.summary) {
            // Persist AI-generated summary only if bio was blank (never overwrite user text)
            if (!s1.bio.trim()) {
              await supabase.from("mentors").upsert({ ...base, bio: aiJson.summary }).then(
                () => {}, () => {}
              );
            }
          }
        }

        setDone(true);
        return;
      }

      setStep(s => s + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save — please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <GrowViaLogo />
          <div className="rounded-2xl p-8 border border-white/[0.08]"
            style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(124,58,237,0.15)" }}>
              <Check className="w-7 h-7 text-[#A78BFA]" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Profile complete!</h1>
            <p className="text-white/40 text-sm mb-1">
              Your profile is{" "}
              <span className="text-[#A78BFA] font-semibold">{completion}%</span> filled.
            </p>
            <p className="text-white/30 text-xs mb-8">
              It's now under review — we'll notify you once it's approved.
            </p>
            <button onClick={() => router.push("/dashboard")}
              className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
              style={{ background: "#7C3AED" }}>
              Go to my dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading skeleton ────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8"><GrowViaLogo /></div>
          <div className="rounded-2xl p-8 border border-white/[0.08] space-y-4 animate-pulse"
            style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}>
            <div className="h-1.5 rounded-full bg-white/5 mb-8" />
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 rounded-xl bg-white/5" />)}
            <div className="h-12 rounded-xl bg-white/5 mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Step metadata ───────────────────────────────────────────────────────────
  const stepMeta = [
    { title: "Basic Profile",   sub: "Tell mentees who you are" },
    { title: "Your Expertise",  sub: "Show what you bring to the table" },
    { title: "Mentoring Style", sub: "How you like to work" },
    { title: "Upload your CV",  sub: "Optional — strengthens your profile" },
  ];

  const badgeColor = completion >= 75 ? "#10B981" : completion >= 40 ? "#F59E0B" : "#A78BFA";
  const sliderPct  = ((s3.disponibilite_heures - 1) / 9) * 100;

  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-6">
          <GrowViaLogo />
          {/* Completion badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold mb-4"
            style={{ background: "rgba(255,255,255,0.04)", color: badgeColor }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: badgeColor }} />
            Profile {completion}% complete
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
            {stepMeta[step - 1].title}
          </h1>
          <p className="text-white/40 text-sm">{stepMeta[step - 1].sub}</p>
        </div>

        <div className="rounded-2xl p-8 border border-white/[0.08]"
          style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Step {step} of {TOTAL_STEPS}</span>
              <span className="text-xs text-white/40">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/10">
              <div className="h-1 rounded-full transition-all duration-500"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: "#7C3AED" }} />
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* ── Step 1: Basic Profile ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">

              {/* Photo upload */}
              <div>
                <FieldLabel optional>Profile photo</FieldLabel>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden border-2 border-white/10 flex items-center justify-center"
                    style={{ background: "rgba(124,58,237,0.1)" }}>
                    {photoPreview
                      ? <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" />
                      : <User className="w-6 h-6 text-white/30" />
                    }
                  </div>
                  <div className="flex-1">
                    <button type="button" disabled={photoUploading}
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full px-4 py-2.5 rounded-xl border border-dashed border-white/20 text-sm text-white/50 hover:border-[#7C3AED]/50 hover:text-white/70 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                      {photoUploading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                        : <><Upload className="w-4 h-4" /> {photoPreview ? "Change photo" : "Upload photo"}</>
                      }
                    </button>
                    <p className="text-xs text-white/25 mt-1.5 text-center">JPG, PNG or WebP · max 5 MB</p>
                  </div>
                </div>
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoSelect(f); e.target.value = ""; }} />
              </div>

              <div>
                <FieldLabel>Full name</FieldLabel>
                <input type="text" className={inputCls} value={s1.nom}
                  onChange={e => setS1({ ...s1, nom: e.target.value })}
                  placeholder="Marie Dupont" />
              </div>

              <div>
                <FieldLabel>Current job title</FieldLabel>
                <input type="text" className={inputCls} value={s1.poste_actuel}
                  onChange={e => setS1({ ...s1, poste_actuel: e.target.value })}
                  placeholder="e.g. Senior Product Manager" />
              </div>

              <div>
                <FieldLabel optional>Company</FieldLabel>
                <input type="text" className={inputCls} value={s1.entreprise}
                  onChange={e => setS1({ ...s1, entreprise: e.target.value })}
                  placeholder="e.g. Stripe, Freelance" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Years of exp.</FieldLabel>
                  <input type="number" min={0} max={50} className={inputCls} value={s1.annees_experience}
                    onChange={e => setS1({ ...s1, annees_experience: e.target.value })}
                    placeholder="8" />
                </div>
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <input type="text" className={inputCls} value={s1.localisation}
                    onChange={e => setS1({ ...s1, localisation: e.target.value })}
                    placeholder="Paris, France" />
                </div>
              </div>

              <div>
                <FieldLabel optional>LinkedIn URL</FieldLabel>
                <input type="url" className={inputCls} value={s1.linkedin_url}
                  onChange={e => setS1({ ...s1, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..." />
              </div>

              <div>
                <FieldLabel
                  extra={
                    <span className="ml-2 text-white/30 font-normal text-xs">
                      {s1.bio.length}/300
                    </span>
                  }>
                  Bio
                </FieldLabel>
                <textarea rows={3} maxLength={300} className={`${inputCls} resize-none`} value={s1.bio}
                  onChange={e => setS1({ ...s1, bio: e.target.value })}
                  placeholder="A few sentences about your background and what drives you as a mentor…" />
              </div>
            </div>
          )}

          {/* ── Step 2: Expertise ─────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">

              {/* Sectors */}
              <div>
                <FieldLabel>Sectors of expertise</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {SECTEURS_OPTIONS.map(s => (
                    <Chip key={s} label={s}
                      selected={s2.secteurs.includes(s)}
                      onClick={() => toggleS2("secteurs", s)} />
                  ))}
                </div>
              </div>

              {/* Competences with star rating */}
              <div>
                <FieldLabel>
                  Transferable skills
                  <span className="ml-1.5 text-white/30 font-normal text-xs">rate each 1–5</span>
                </FieldLabel>
                <div className="space-y-2 mt-1">
                  {COMPETENCES_OPTIONS.map(name => {
                    const entry  = s2.competences.find(c => c.name === name);
                    const active = !!entry;
                    return (
                      <div key={name}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                          active ? "border-[#7C3AED]/40" : "border-white/[0.06] hover:border-white/10"
                        }`}
                        style={{ background: active ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.02)" }}>
                        <button type="button" onClick={() => toggleCompetence(name)}
                          className="flex items-center gap-2.5 flex-1 text-left">
                          <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            active ? "border-[#7C3AED] bg-[#7C3AED]" : "border-white/20"
                          }`}>
                            {active && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={`text-sm ${active ? "text-white font-medium" : "text-white/50"}`}>
                            {name}
                          </span>
                        </button>
                        {active && (
                          <StarRating value={entry!.rating}
                            onChange={r => rateCompetence(name, r)} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Profile types */}
              <div>
                <FieldLabel>Type of profiles I can help</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {TYPE_PROFILS_OPTIONS.map(s => (
                    <Chip key={s} label={s}
                      selected={s2.type_profils_aides.includes(s)}
                      onClick={() => toggleS2("type_profils_aides", s)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Mentoring Style ───────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">

              {/* Style cards */}
              <div>
                <FieldLabel>Preferred approach</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_OPTIONS.map(opt => (
                    <button key={opt.key} type="button"
                      onClick={() => setS3(prev => ({ ...prev, style_mentorat: opt.key }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        s3.style_mentorat === opt.key
                          ? "border-[#7C3AED] bg-[#7C3AED]/10"
                          : "border-white/10 hover:border-white/20"
                      }`}>
                      <p className={`text-sm font-semibold mb-1 ${
                        s3.style_mentorat === opt.key ? "text-white" : "text-white/60"
                      }`}>{opt.label}</p>
                      <p className="text-xs text-white/35 leading-snug">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel>Weekly availability</FieldLabel>
                  <span className="text-sm font-semibold text-[#A78BFA]">
                    {s3.disponibilite_heures}h / week
                  </span>
                </div>
                <input type="range" min={1} max={10} step={1} value={s3.disponibilite_heures}
                  onChange={e => setS3(prev => ({ ...prev, disponibilite_heures: Number(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #7C3AED ${sliderPct}%, rgba(255,255,255,0.1) ${sliderPct}%)`,
                    accentColor: "#7C3AED",
                  }} />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-white/25">1h</span>
                  <span className="text-xs text-white/25">10h</span>
                </div>
              </div>

              {/* Max mentees */}
              <div>
                <FieldLabel>Max simultaneous mentees</FieldLabel>
                <div className="flex gap-2 flex-wrap">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} type="button"
                      onClick={() => setS3(prev => ({ ...prev, max_mentees: n }))}
                      className={`w-10 h-10 rounded-xl border-2 text-sm font-semibold transition-colors ${
                        s3.max_mentees === n
                          ? "border-[#7C3AED] bg-[#7C3AED]/15 text-white"
                          : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <FieldLabel>Preferred format</FieldLabel>
                <div className="flex gap-2 flex-wrap">
                  {FORMAT_OPTIONS.map(f => (
                    <button key={f} type="button"
                      onClick={() => setS3(prev => ({ ...prev, format_prefere: f }))}
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                        s3.format_prefere === f
                          ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white"
                          : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <FieldLabel>Languages</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {LANGUES_OPTIONS.map(l => (
                    <Chip key={l} label={l} selected={s3.langues.includes(l)} onClick={() => toggleLang(l)} />
                  ))}
                </div>
              </div>

              {/* Motivation */}
              <div>
                <FieldLabel>Why do you mentor?</FieldLabel>
                <textarea rows={3} className={`${inputCls} resize-none`} value={s3.motivation}
                  onChange={e => setS3(prev => ({ ...prev, motivation: e.target.value }))}
                  placeholder="Sharing what I learned the hard way, opening doors I wish had been opened for me…" />
              </div>
            </div>
          )}

          {/* ── Step 4: CV Upload ─────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-white/40 leading-relaxed">
                Uploading your CV helps mentees understand your full background.
                It's optional but recommended.
              </p>

              {/* Drop zone */}
              <div
                onClick={() => !cvUploading && cvInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f?.type === "application/pdf") handleCVSelect(f);
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  cvUploading
                    ? "border-white/10 cursor-default"
                    : "border-white/15 cursor-pointer hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/5"
                }`}>
                {cvUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#A78BFA] animate-spin" />
                    <p className="text-sm text-white/50">Uploading…</p>
                  </div>
                ) : s4.cv_url ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(124,58,237,0.15)" }}>
                      <FileText className="w-6 h-6 text-[#A78BFA]" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium truncate max-w-[240px] mx-auto">
                        {cvFileName || "CV uploaded"}
                      </p>
                      <p className="text-xs text-white/35 mt-1">Click to replace</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                      <Check className="w-3 h-3" /> Uploaded successfully
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <Upload className="w-6 h-6 text-white/30" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">
                        <span className="text-[#A78BFA] font-medium">Click to upload</span> or drag & drop
                      </p>
                      <p className="text-xs text-white/30 mt-1">PDF only · max 10 MB</p>
                    </div>
                  </div>
                )}
              </div>

              <input ref={cvInputRef} type="file" accept="application/pdf" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleCVSelect(f); e.target.value = ""; }} />

              {/* CV upload error — shown inline, does NOT block completion */}
              {cvError && (
                <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{cvError} You can still complete your profile without a CV.</span>
                </div>
              )}

              <p className="text-xs text-white/25 text-center">
                Your CV is private and only shared with matched mentees.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
            {step > 1
              ? <button type="button" onClick={() => { setError(null); setStep(s => s - 1); }}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              : <div />
            }
            <button type="button" onClick={handleNext}
              disabled={!canProceed() || loading || photoUploading || cvUploading}
              className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-opacity disabled:opacity-40 hover:opacity-90"
              style={{ background: "#7C3AED" }}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : step === TOTAL_STEPS
                  ? <><Check className="w-4 h-4" /> Complete profile</>
                  : <>Continue <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/25 mt-5">
          Update this anytime from your{" "}
          <Link href="/settings" className="text-[#A78BFA] hover:text-white transition-colors">
            settings
          </Link>.
        </p>
      </div>
    </div>
  );
}
