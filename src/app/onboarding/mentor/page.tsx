"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, ArrowLeft, Check, Loader2, AlertCircle,
  Upload, FileText, User, Plus, X, Search, Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserSession } from "@/lib/session";

// ─── Constants ─────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4;

const SECTEURS_OPTIONS = [
  "Tech", "Finance", "Marketing", "Consulting", "Startup",
  "Healthcare", "Education", "Law", "Design", "HR",
];
const COMPETENCES_OPTIONS = [
  "Leadership", "Communication", "Strategy", "Technical skills",
  "Sales", "Product management", "Data analysis", "Creative",
  "Operations", "Coaching", "Project management", "Public speaking",
  "Negotiation", "Financial analysis", "Marketing", "UX/Design",
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
const FORMAT_OPTIONS = ["Video calls", "Messages", "Both"];

const QUICK_LANGUES = [
  "French", "English", "Spanish", "Portuguese", "Arabic",
  "German", "Italian", "Japanese", "Korean", "Mandarin", "Russian",
];
const OTHER_LANGUES = [
  "Afrikaans", "Albanian", "Amharic", "Armenian", "Azerbaijani",
  "Basque", "Bengali", "Bosnian", "Bulgarian", "Burmese",
  "Catalan", "Croatian", "Czech", "Danish", "Dutch",
  "Estonian", "Finnish", "Georgian", "Greek", "Gujarati",
  "Hebrew", "Hindi", "Hungarian", "Indonesian", "Irish",
  "Kannada", "Kazakh", "Khmer", "Lao", "Latvian",
  "Lithuanian", "Macedonian", "Malay", "Malayalam", "Maltese",
  "Marathi", "Mongolian", "Nepali", "Norwegian", "Persian",
  "Polish", "Punjabi", "Romanian", "Serbian", "Sinhala",
  "Slovak", "Slovenian", "Swahili", "Swedish", "Tagalog",
  "Tamil", "Telugu", "Thai", "Turkish", "Turkmen",
  "Ukrainian", "Urdu", "Uzbek", "Vietnamese", "Welsh",
].sort();

// ─── Types ─────────────────────────────────────────────────────────────────────
type CompetenceEntry = { name: string; rating: number };

type S1 = {
  nom: string; photo_url: string; poste_actuel: string; entreprise: string;
  annees_experience: string; localisation: string; linkedin_url: string; bio: string;
};
type S2 = { secteurs: string[]; competences: CompetenceEntry[]; type_profils_aides: string[] };
type S3 = {
  style_mentorat: string; disponibilite_heures: string; max_mentees: number;
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
    !!s3.style_mentorat, !!s3.disponibilite_heures, s3.max_mentees > 0,
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

// ─── Pricing grid ──────────────────────────────────────────────────────────────
const PRICING_GRID = [
  { maxScore: 20,  level: "Débutant",      priceMin: 20, priceMax: 30  },
  { maxScore: 40,  level: "Junior",         priceMin: 30, priceMax: 45  },
  { maxScore: 60,  level: "Intermédiaire",  priceMin: 45, priceMax: 65  },
  { maxScore: 75,  level: "Confirmé",       priceMin: 65, priceMax: 80  },
  { maxScore: 90,  level: "Expert",         priceMin: 80, priceMax: 95  },
  { maxScore: 100, level: "Top Mentor",     priceMin: 95, priceMax: 100 },
] as const;

type PricingTier = typeof PRICING_GRID[number];

function getPricingTier(score: number): PricingTier {
  return PRICING_GRID.find(t => score <= t.maxScore) ?? PRICING_GRID[PRICING_GRID.length - 1];
}

function midPrice(tier: PricingTier): number {
  return Math.round((tier.priceMin + tier.priceMax) / 2 / 5) * 5;
}

function calcMentorScore(s1: S1, s2: S2, s4: S4): number {
  const years = s1.annees_experience !== "" ? Number(s1.annees_experience) : 0;
  const expPts =
    years <= 2 ? 5 : years <= 5 ? 12 : years <= 10 ? 20 :
    years <= 15 ? 28 : years <= 20 ? 35 : 40;
  const compCount = Math.min(s2.competences.length, 10);
  const avgRating = compCount > 0
    ? s2.competences.reduce((sum, c) => sum + c.rating, 0) / compCount : 0;
  const compPts = Math.round((compCount / 10) * (avgRating / 5) * 40);
  const profilePts = [
    !!s1.bio.trim(), !!s1.photo_url, !!s4.cv_url,
    !!s1.linkedin_url.trim(), s2.secteurs.length > 0,
  ].filter(Boolean).length * 4;
  return Math.min(expPts + compPts + profilePts, 100);
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

  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [phase, setPhase]             = useState<"form" | "scoring">("form");
  const [mentorScore, setMentorScore] = useState(0);
  const [showPriceSlider, setShowPriceSlider] = useState(false);
  const [sliderPrice, setSliderPrice] = useState(20);
  const [savingPrice, setSavingPrice] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [userId, setUserId]           = useState("");
  const [email, setEmail]             = useState("");
  const [authNom, setAuthNom]         = useState("");

  // Photo upload
  const photoInputRef                           = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview]         = useState("");
  const [photoUploading, setPhotoUploading]     = useState(false);

  // CV upload
  const cvInputRef                          = useRef<HTMLInputElement>(null);
  const [cvFileName, setCvFileName]         = useState("");
  const [cvUploading, setCvUploading]       = useState(false);
  const [cvError, setCvError]               = useState<string | null>(null);

  // Availability
  const [availCount, setAvailCount] = useState(3);
  const [availUnit, setAvailUnit]   = useState<"week" | "month">("week");

  // Language other dropdown
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [langSearch, setLangSearch]             = useState("");
  const langDropdownRef                          = useRef<HTMLDivElement>(null);

  // Sector "Other" inline input
  const [showSectorInput, setShowSectorInput]   = useState(false);
  const [customSectorText, setCustomSectorText] = useState("");
  const sectorInputRef                           = useRef<HTMLInputElement>(null);

  // Custom skill
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false);
  const [customSkillName, setCustomSkillName]           = useState("");
  const [customSkillRating, setCustomSkillRating]       = useState(3);

  // Step data
  const [s1, setS1] = useState<S1>({
    nom: "", photo_url: "", poste_actuel: "", entreprise: "",
    annees_experience: "", localisation: "", linkedin_url: "", bio: "",
  });
  const [s2, setS2] = useState<S2>({ secteurs: [], competences: [], type_profils_aides: [] });
  const [s3, setS3] = useState<S3>({
    style_mentorat: "", disponibilite_heures: "", max_mentees: 3,
    format_prefere: "", langues: [], motivation: "",
  });
  const [s4, setS4] = useState<S4>({ cv_url: "" });

  // Close lang dropdown on outside click
  useEffect(() => {
    if (!showLangDropdown) return;
    function handleClick(e: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
        setLangSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showLangDropdown]);

  // Focus sector input when shown
  useEffect(() => {
    if (showSectorInput) sectorInputRef.current?.focus();
  }, [showSectorInput]);


  // ── Init: load existing data ─────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const session = getUserSession();
      if (!session) { router.push("/auth/login?next=/onboarding/mentor"); return; }
      setEmail(session.email);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?next=/onboarding/mentor"); return; }
      setUserId(user.id);

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

        // Parse disponibilite_heures, supports new string format and legacy number
        const rawDisp = existing.disponibilite_heures;
        if (typeof rawDisp === "string") {
          const m = rawDisp.match(/^(\d+)h\/(week|month)$/);
          if (m) {
            setAvailCount(parseInt(m[1]));
            setAvailUnit(m[2] as "week" | "month");
          }
        } else if (typeof rawDisp === "number" && rawDisp > 0) {
          setAvailCount(rawDisp);
          setAvailUnit("week");
        }

        setS3({
          style_mentorat:      existing.style_mentorat ?? "",
          disponibilite_heures: typeof rawDisp === "string" ? rawDisp
                                : typeof rawDisp === "number" && rawDisp > 0 ? `${rawDisp}h/week`
                                : "",
          max_mentees:         existing.max_mentees ?? 3,
          format_prefere:      existing.format_prefere ?? "",
          langues:             existing.langues         ?? [],
          motivation:          existing.motivation      ?? "",
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

  // ── Upload helpers ───────────────────────────────────────────────────────────
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
      setError(err instanceof Error ? err.message : "Photo upload failed, please try again.");
      setPhotoPreview(s1.photo_url);
    } finally {
      setPhotoUploading(false);
    }
  }

  // ── CV upload, direct Supabase Storage ─────────────────────────────────────
  async function handleCVSelect(file: File) {
    if (!userId) return;
    setCvUploading(true);
    setCvError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const path = `${userId}/cv-${Date.now()}.${ext}`;
      const url = await uploadToStorage("cvs", path, file);
      setS4({ cv_url: url });
      setCvFileName(file.name);
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "CV upload failed, please try again.");
    } finally {
      setCvUploading(false);
    }
  }

  function handleCVRemove() {
    setS4({ cv_url: "" });
    setCvFileName("");
    setCvError(null);
  }

  // ── Availability ─────────────────────────────────────────────────────────────
  function updateAvail(count: number, unit: "week" | "month") {
    setAvailCount(count);
    setAvailUnit(unit);
    setS3(prev => ({ ...prev, disponibilite_heures: `${count}h/${unit}` }));
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
  function removeCompetence(name: string) {
    setS2(prev => ({ ...prev, competences: prev.competences.filter(c => c.name !== name) }));
  }
  function addCustomSkill() {
    const name = customSkillName.trim();
    if (!name || s2.competences.find(c => c.name === name)) return;
    setS2(prev => ({ ...prev, competences: [...prev.competences, { name, rating: customSkillRating }] }));
    setCustomSkillName("");
    setCustomSkillRating(3);
    setShowCustomSkillInput(false);
  }

  // ── Sectors ──────────────────────────────────────────────────────────────────
  function toggleSecteur(val: string) {
    setS2(prev => ({
      ...prev,
      secteurs: prev.secteurs.includes(val)
        ? prev.secteurs.filter(v => v !== val)
        : [...prev.secteurs, val],
    }));
  }
  function addCustomSector() {
    const text = customSectorText.trim();
    if (!text) return;
    if (!s2.secteurs.includes(text)) {
      setS2(prev => ({ ...prev, secteurs: [...prev.secteurs, text] }));
    }
    setCustomSectorText("");
  }

  // ── Array toggles ────────────────────────────────────────────────────────────
  function toggleS2field(field: "type_profils_aides", val: string) {
    setS2(prev => {
      const arr = prev[field];
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

  // ── Upsert all fields on each step ───────────────────────────────────────────
  async function handleNext() {
    setLoading(true);
    setError(null);
    try {
      const nomValue = s1.nom.trim() || authNom;
      if (!nomValue) throw new Error("Please complete step 1 first, your name is required.");

      const allData = {
        id:         userId,
        email,
        updated_at: new Date().toISOString(),
        nom:               nomValue,
        photo_url:         s1.photo_url        || null,
        poste_actuel:      s1.poste_actuel.trim()  || null,
        entreprise:        s1.entreprise.trim()    || null,
        annees_experience: s1.annees_experience !== "" ? Number(s1.annees_experience) : null,
        localisation:      s1.localisation.trim()  || null,
        linkedin_url:      s1.linkedin_url.trim()  || null,
        bio:               s1.bio.trim()            || null,
        secteurs:           s2.secteurs,
        competences:        s2.competences,
        type_profils_aides: s2.type_profils_aides,
        style_mentorat:      s3.style_mentorat      || null,
        disponibilite_heures: s3.disponibilite_heures || null,
        max_mentees:         s3.max_mentees,
        format_prefere:      s3.format_prefere      || null,
        langues:             s3.langues,
        motivation:          s3.motivation.trim()   || null,
        cv_url:              s4.cv_url              || null,
      };

      if (step === TOTAL_STEPS) {
        if (!s1.poste_actuel.trim()) throw new Error("'Job title' is empty, please go back to step 1.");

        const score = calcMentorScore(s1, s2, s4);
        const tier  = getPricingTier(score);

        await supabase.from("mentors").upsert({
          ...allData,
          mentor_score:     score,
          survey_completed: true,
          statut:           "active",
        }).throwOnError();

        // Best-effort AI score (never blocks completion)
        fetch("/api/mentor/ai-score", {
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
        }).then(async res => {
          if (!res.ok) return;
          const json = await res.json() as { summary?: string };
          if (json.summary && !s1.bio.trim()) {
            await supabase.from("mentors").upsert({
              id: userId, email, updated_at: new Date().toISOString(), bio: json.summary,
            }).then(() => {}, () => {});
          }
        }).catch(() => {});

        setMentorScore(score);
        setSliderPrice(midPrice(tier));
        setPhase("scoring");
        return;
      }

      await supabase.from("mentors").upsert(allData).throwOnError();
      setStep(s => s + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save, please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Scoring screen ──────────────────────────────────────────────────────────
  if (phase === "scoring") {
    const tier      = getPricingTier(mentorScore);
    const recommended   = midPrice(tier);
    const sliderFillPct = ((sliderPrice - 20) / (100 - 20)) * 100;

    const ringColor =
      mentorScore >= 91 ? "#A78BFA" :
      mentorScore >= 76 ? "#10B981" :
      mentorScore >= 61 ? "#3B82F6" :
      mentorScore >= 41 ? "#F59E0B" :
      mentorScore >= 21 ? "#94A3B8" : "#EF4444";

    async function handleSavePrice(price: number) {
      setSavingPrice(true);
      setScoringError(null);
      console.log("[handleSavePrice] called with price:", price, "email:", email, "userId:", userId);
      try {
        const res = await fetch("/api/mentor/save-onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            userId,
            data: { session_price: price, onboarding_completed: true },
          }),
        });
        const json = await res.json() as { error?: string; success?: boolean };
        console.log("[handleSavePrice] API response:", res.status, json);
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
        console.log("[handleSavePrice] save confirmed, redirecting to /dashboard/mentor");
        router.push("/dashboard/mentor");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Save failed — please try again.";
        console.error("[handleSavePrice] error:", msg);
        setScoringError(msg);
        setSavingPrice(false);
      }
    }

    const circumference = 2 * Math.PI * 42;
    const dashFill = (mentorScore / 100) * circumference;

    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <button type="button"
            onClick={() => { setPhase("form"); setStep(4); setShowPriceSlider(false); setScoringError(null); }}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour à l'étape 4
          </button>
          {scoringError && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {scoringError}
            </div>
          )}
          <div className="text-center mb-8">
            <GrowViaLogo />
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Votre score de mentor</h1>
            <p className="text-white/40 text-sm">Basé sur votre profil et votre expérience.</p>
          </div>
          <div className="rounded-2xl p-8 border border-white/[0.08]"
            style={{ background: "#13111F", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}>
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={ringColor} strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={`${dashFill} ${circumference}`}
                    style={{ transition: "stroke-dasharray 1s ease" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white leading-none">{mentorScore}</span>
                  <span className="text-xs text-white/35 mt-0.5">/100</span>
                </div>
              </div>
              <span className="text-xl font-bold text-white mb-1">{tier.level}</span>
              <span className="text-xs text-white/40 uppercase tracking-widest">Score de mentor</span>
            </div>
            <div className="rounded-xl px-5 py-4 mb-6 border border-[#7C3AED]/25"
              style={{ background: "rgba(124,58,237,0.08)" }}>
              <p className="text-xs text-white/50 font-medium uppercase tracking-widest mb-1">
                Fourchette recommandée
              </p>
              <p className="text-3xl font-extrabold text-[#A78BFA]">
                {tier.priceMin}€ – {tier.priceMax}€
              </p>
              <p className="text-xs text-white/30 mt-1">par session · basé sur votre profil</p>
            </div>
            {showPriceSlider ? (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/60">Votre tarif</span>
                  <span className="text-2xl font-extrabold text-white">
                    {sliderPrice}€
                    <span className="text-sm text-white/40 font-normal"> / session</span>
                  </span>
                </div>
                <input type="range" min={20} max={100} step={5} value={sliderPrice}
                  onChange={e => setSliderPrice(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #7C3AED ${sliderFillPct}%, rgba(255,255,255,0.1) ${sliderFillPct}%)`,
                    accentColor: "#7C3AED",
                  }} />
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-white/30">20€</span>
                  <span className="text-[#A78BFA]">Recommandé : {tier.priceMin}€–{tier.priceMax}€</span>
                  <span className="text-white/30">100€</span>
                </div>
                <button onClick={() => handleSavePrice(sliderPrice)} disabled={savingPrice}
                  className="w-full mt-5 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                  style={{ background: "#7C3AED" }}>
                  {savingPrice
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
                    : <>Confirmer {sliderPrice}€ <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={() => handleSavePrice(recommended)} disabled={savingPrice}
                  className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                  style={{ background: "#7C3AED" }}>
                  {savingPrice
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
                    : <><Check className="w-4 h-4" /> Accepter le prix recommandé ({recommended}€)</>}
                </button>
                <button onClick={() => setShowPriceSlider(true)}
                  className="w-full py-3 text-sm font-medium text-[#A78BFA] hover:text-white transition-colors">
                  Définir mon propre prix →
                </button>
              </div>
            )}
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

  // ─── Render helpers ──────────────────────────────────────────────────────────
  const stepMeta = [
    { title: "Basic Profile",   sub: "Tell mentees who you are" },
    { title: "Your Expertise",  sub: "Show what you bring to the table" },
    { title: "Mentoring Style", sub: "How you like to work" },
    { title: "Upload your CV",  sub: "Optional, strengthens your profile" },
  ];

  const stepPct    = step * 25;
  const badgeColor = stepPct >= 75 ? "#10B981" : stepPct >= 50 ? "#F59E0B" : "#A78BFA";
  const customSectors = s2.secteurs.filter(s => !SECTEURS_OPTIONS.includes(s));
  const customSkills  = s2.competences.filter(c => !COMPETENCES_OPTIONS.includes(c.name));
  const otherLangsSelected = s3.langues.filter(l => !QUICK_LANGUES.includes(l));
  const filteredOtherLangs = OTHER_LANGUES.filter(l =>
    l.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-6">
          <GrowViaLogo />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold mb-4"
            style={{ background: "rgba(255,255,255,0.04)", color: badgeColor }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: badgeColor }} />
            Profile {stepPct}% complete
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
                  extra={<span className="ml-2 text-white/30 font-normal text-xs">{s1.bio.length}/300</span>}>
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
                      onClick={() => toggleSecteur(s)} />
                  ))}
                  {/* Custom sectors */}
                  {customSectors.map(s => (
                    <button key={s} type="button"
                      onClick={() => toggleSecteur(s)}
                      className="px-3 py-2 rounded-lg border border-[#7C3AED] bg-[#7C3AED]/15 text-white text-sm font-medium flex items-center gap-1.5">
                      <span className="text-[#A78BFA]">✓</span>
                      {s}
                      <X className="w-3 h-3 text-[#A78BFA] ml-0.5" />
                    </button>
                  ))}
                  {/* Other button */}
                  <button type="button"
                    onClick={() => setShowSectorInput(v => !v)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-1.5 ${
                      showSectorInput
                        ? "border-[#7C3AED] bg-[#7C3AED]/15 text-white font-medium"
                        : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                    }`}>
                    <Plus className="w-3.5 h-3.5" />
                    Other
                  </button>
                </div>
                {showSectorInput && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      ref={sectorInputRef}
                      type="text"
                      value={customSectorText}
                      onChange={e => setCustomSectorText(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomSector(); } }}
                      placeholder="Type a sector and press Enter…"
                      className="flex-1 px-3 py-2.5 rounded-xl border border-white/10 bg-[#0D0A1A] text-white placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
                    />
                    <button type="button"
                      onClick={addCustomSector}
                      disabled={!customSectorText.trim()}
                      className="px-3 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium disabled:opacity-40 flex-shrink-0">
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Transferable skills with star rating + custom */}
              <div>
                <FieldLabel>
                  Transferable skills
                  <span className="ml-1.5 text-white/30 font-normal text-xs">rate each 1–5</span>
                </FieldLabel>
                <div className="space-y-2 mt-1">
                  {/* Predefined skills */}
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
                          <StarRating value={entry!.rating} onChange={r => rateCompetence(name, r)} />
                        )}
                      </div>
                    );
                  })}
                  {/* Custom skills */}
                  {customSkills.map(c => (
                    <div key={c.name}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#7C3AED]/40"
                      style={{ background: "rgba(124,58,237,0.08)" }}>
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="w-4 h-4 rounded border-2 border-[#7C3AED] bg-[#7C3AED] flex-shrink-0 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-sm text-white font-medium">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating value={c.rating} onChange={r => rateCompetence(c.name, r)} />
                        <button type="button" onClick={() => removeCompetence(c.name)}
                          className="text-white/30 hover:text-white/60 ml-1 p-0.5">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add custom skill */}
                {showCustomSkillInput ? (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2.5 rounded-xl border border-white/10"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <input
                      type="text"
                      value={customSkillName}
                      onChange={e => setCustomSkillName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                      placeholder="Skill name…"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none min-w-0"
                      autoFocus
                    />
                    <StarRating value={customSkillRating} onChange={setCustomSkillRating} />
                    <button type="button" onClick={addCustomSkill}
                      disabled={!customSkillName.trim()}
                      className="px-2.5 py-1.5 rounded-lg bg-[#7C3AED] text-white text-xs font-medium disabled:opacity-40 flex-shrink-0">
                      Add
                    </button>
                    <button type="button"
                      onClick={() => { setShowCustomSkillInput(false); setCustomSkillName(""); }}
                      className="text-white/30 hover:text-white/60 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button"
                    onClick={() => setShowCustomSkillInput(true)}
                    className="mt-2 flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors">
                    <Plus className="w-4 h-4" /> Add custom skill
                  </button>
                )}
              </div>

              {/* Profile types */}
              <div>
                <FieldLabel>Type of profiles I can help</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {TYPE_PROFILS_OPTIONS.map(s => (
                    <Chip key={s} label={s}
                      selected={s2.type_profils_aides.includes(s)}
                      onClick={() => toggleS2field("type_profils_aides", s)} />
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

              {/* Availability, count + unit toggle */}
              <div>
                <FieldLabel>Availability</FieldLabel>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Number select */}
                  <div className="relative">
                    <select
                      value={availCount}
                      onChange={e => updateAvail(parseInt(e.target.value), availUnit)}
                      className="pl-3 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#0D0A1A] text-white text-sm focus:outline-none focus:border-[#7C3AED] appearance-none cursor-pointer">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/30">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-white/40 text-sm">hours</span>
                  {/* Per week / Per month toggle */}
                  <div className="flex rounded-xl border border-white/10 overflow-hidden">
                    {(["week", "month"] as const).map(unit => (
                      <button key={unit} type="button"
                        onClick={() => updateAvail(availCount, unit)}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                          availUnit === unit
                            ? "bg-[#7C3AED] text-white"
                            : "text-white/50 hover:text-white/70"
                        }`}>
                        Per {unit}
                      </button>
                    ))}
                  </div>
                  <span className="text-white/25 text-xs">→ {availCount}h/{availUnit}</span>
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
                  {QUICK_LANGUES.map(l => (
                    <Chip key={l} label={l} selected={s3.langues.includes(l)} onClick={() => toggleLang(l)} />
                  ))}
                  {/* Already-selected "other" languages */}
                  {otherLangsSelected.map(l => (
                    <button key={l} type="button"
                      onClick={() => toggleLang(l)}
                      className="px-3 py-2 rounded-lg border border-[#7C3AED] bg-[#7C3AED]/15 text-white text-sm font-medium flex items-center gap-1.5">
                      <span className="text-[#A78BFA]">✓</span>
                      {l}
                      <X className="w-3 h-3 text-[#A78BFA] ml-0.5" />
                    </button>
                  ))}
                  {/* Other chip + dropdown */}
                  <div className="relative" ref={langDropdownRef}>
                    <button type="button"
                      onClick={() => { setShowLangDropdown(v => !v); setLangSearch(""); }}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-1.5 ${
                        showLangDropdown || otherLangsSelected.length > 0
                          ? "border-[#7C3AED] bg-[#7C3AED]/15 text-white font-medium"
                          : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}>
                      <Search className="w-3.5 h-3.5" />
                      Other
                    </button>
                    {showLangDropdown && (
                      <div className="absolute top-full left-0 mt-1.5 w-56 rounded-xl border border-white/10 shadow-2xl z-20"
                        style={{ background: "#1A1630" }}>
                        <div className="p-2 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
                            <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                            <input
                              type="text"
                              className="bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none w-full"
                              placeholder="Search language…"
                              value={langSearch}
                              onChange={e => setLangSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-52 overflow-y-auto py-1">
                          {filteredOtherLangs.length === 0 ? (
                            <p className="text-xs text-white/30 px-3 py-3 text-center">No match</p>
                          ) : filteredOtherLangs.map(l => (
                            <button key={l} type="button"
                              onClick={() => toggleLang(l)}
                              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                                s3.langues.includes(l)
                                  ? "text-white bg-[#7C3AED]/10"
                                  : "text-white/60 hover:text-white hover:bg-white/5"
                              }`}>
                              {l}
                              {s3.langues.includes(l) && <Check className="w-3.5 h-3.5 text-[#A78BFA]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
                It&apos;s optional but recommended.
              </p>

              {cvUploading ? (
                /* Upload in progress */
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#A78BFA] animate-spin" />
                    <p className="text-sm text-white/50">Uploading…</p>
                    <p className="text-xs text-white/25">{cvFileName}</p>
                  </div>
                </div>
              ) : s4.cv_url ? (
                /* File uploaded, show name + actions */
                <div className="rounded-2xl border border-[#7C3AED]/30 p-5"
                  style={{ background: "rgba(124,58,237,0.06)" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.15)" }}>
                      <FileText className="w-5 h-5 text-[#A78BFA]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{cvFileName || "CV uploaded"}</p>
                      <div className="inline-flex items-center gap-1 mt-0.5 text-xs font-medium"
                        style={{ color: "#10B981" }}>
                        <Check className="w-3 h-3" /> Uploaded successfully
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button type="button"
                        onClick={() => cvInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white/70 hover:border-white/20 transition-colors">
                        Replace
                      </button>
                      <button type="button"
                        onClick={handleCVRemove}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Drop zone */
                <div
                  onClick={() => cvInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f) handleCVSelect(f);
                  }}
                  className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center cursor-pointer hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/5 transition-all">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <Upload className="w-6 h-6 text-white/30" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">
                        <span className="text-[#A78BFA] font-medium">Click to upload</span> or drag &amp; drop
                      </p>
                      <p className="text-xs text-white/30 mt-1">PDF, DOC or DOCX · max 10 MB</p>
                    </div>
                  </div>
                </div>
              )}

              <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleCVSelect(f); e.target.value = ""; }} />

              {/* CV upload error, non-blocking */}
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
              ? <button type="button"
                  onClick={() => { setError(null); setCvError(null); setStep(s => s - 1); }}
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
