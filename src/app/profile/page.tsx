"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Edit3, Save, X, Check, Loader2, Upload,
  User, FileText, AlertCircle, CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SECTEURS_OPTIONS      = ["Tech","Finance","Marketing","Consulting","Startup","Healthcare","Education","Law","Design","HR","Other"];
const COMPETENCES_OPTIONS   = ["Leadership","Communication","Strategy","Technical skills","Sales","Product","Data","Creative","Operations","Coaching"];
const COMPETENCES_MENTEE    = ["Leadership","Communication","Strategy","Technical skills","Sales","Product","Data","Creative","Operations"];
const TYPE_PROFILS_OPTIONS  = ["First job","Career change","Promotion","Entrepreneurship","Specific skills"];
const STYLE_MENTOR_OPTIONS  = [
  { key: "directive",   label: "Directive coach",  desc: "Clear direction and action plans" },
  { key: "facilitator", label: "Facilitator",       desc: "Help mentees find their own path" },
  { key: "networker",   label: "Network-focused",   desc: "Open doors and make introductions" },
  { key: "technical",   label: "Technical expert",  desc: "Share deep technical knowledge" },
];
const STYLE_MENTEE_OPTIONS  = [
  { key: "structured",     label: "Structured & framed",       desc: "Clear agenda, goals, and action items" },
  { key: "conversational", label: "Flexible & conversational", desc: "Open discussions and organic flow" },
  { key: "practice",       label: "Practice-based exercises",  desc: "Learn by doing with real tasks" },
];
const OBJECTIF_OPTIONS = [
  { key: "first_job",      label: "First job" },
  { key: "career_change",  label: "Career change" },
  { key: "get_promoted",   label: "Get promoted" },
  { key: "start_business", label: "Start a business" },
  { key: "learn_skills",   label: "Learn specific skills" },
];
const NIVEAU_ETUDES_OPTIONS = ["High school","Bachelor","Master","MBA","PhD","Self-taught","Other"];
const HORIZON_OPTIONS       = ["3 months","6 months","1 year","2 years+"];
const FREQUENCE_OPTIONS     = ["1x/week","2x/month","1x/month"];
const FORMAT_OPTIONS        = ["Video calls","Messages","Both"];
const LANGUES_OPTIONS       = ["French","English","Spanish","Portuguese","Other"];

// ─── Types ─────────────────────────────────────────────────────────────────────
type CompetenceEntry = { name: string; rating: number };
type Role = "mentor" | "mentee" | null;

interface MentorProfile {
  nom: string; photo_url: string; poste_actuel: string; entreprise: string;
  annees_experience: string; localisation: string; linkedin_url: string; bio: string;
  secteurs: string[]; competences: CompetenceEntry[]; type_profils_aides: string[];
  style_mentorat: string; disponibilite_heures: number; max_mentees: number;
  format_prefere: string; langues: string[]; motivation: string; cv_url: string;
  survey_completed: boolean;
}
interface MenteeProfile {
  nom: string; photo_url: string; niveau_etudes: string; ecole: string;
  localisation: string; linkedin_url: string; bio: string;
  objectif_principal: string; secteurs_vises: string[]; poste_cible: string;
  horizon_temporel: string; experiences: string;
  competences: CompetenceEntry[]; style_apprentissage: string;
  frequence_souhaitee: string; format_prefere: string; langues: string[]; motivation: string;
  cv_url: string; survey_completed: boolean;
}

// ─── Completion helpers ─────────────────────────────────────────────────────────
function mentorCompletion(p: MentorProfile): number {
  const checks = [
    !!p.nom.trim(), !!p.photo_url, !!p.poste_actuel.trim(), !!p.entreprise.trim(),
    p.annees_experience !== "", !!p.localisation.trim(), !!p.linkedin_url.trim(), !!p.bio.trim(),
    p.secteurs.length > 0, p.competences.length > 0, p.type_profils_aides.length > 0,
    !!p.style_mentorat, p.disponibilite_heures > 0, p.max_mentees > 0,
    !!p.format_prefere, p.langues.length > 0, !!p.motivation.trim(), !!p.cv_url,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
function menteeCompletion(p: MenteeProfile): number {
  const checks = [
    !!p.nom.trim(), !!p.photo_url, !!p.niveau_etudes, !!p.ecole.trim(),
    !!p.localisation.trim(), !!p.bio.trim(),
    !!p.objectif_principal, p.secteurs_vises.length > 0, !!p.poste_cible.trim(),
    !!p.horizon_temporel, !!p.experiences.trim(),
    p.competences.length > 0, !!p.style_apprentissage,
    !!p.frequence_souhaitee, !!p.format_prefere, p.langues.length > 0,
    !!p.motivation.trim(), !!p.cv_url,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ─── Storage helper ─────────────────────────────────────────────────────────────
async function uploadPhotoViaApi(userId: string, file: File): Promise<string> {
  const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;

  const form = new FormData();
  form.append("file",   file);
  form.append("bucket", "avatars");
  form.append("path",   path);

  const res  = await fetch("/api/mentor/upload-file", { method: "POST", body: form });
  const json = await res.json();

  if (!res.ok || json.error) {
    console.error("[photo-upload] server error:", json.error);
    throw new Error(json.error ?? `Upload failed (${res.status})`);
  }

  return json.url as string;
}

// ─── Shared UI ──────────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white " +
  "placeholder:text-white/25 focus:outline-none focus:border-[#7C3AED] " +
  "focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors";

const selectCls =
  "w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0D0A1A] text-white " +
  "focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 " +
  "text-sm transition-colors appearance-none cursor-pointer";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-white/35 uppercase tracking-[0.18em] mb-5">
      {children}
    </h2>
  );
}
function ViewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-white/[0.05] last:border-0">
      <p className="text-xs text-white/35 mb-1">{label}</p>
      <div className="text-sm text-white/80">{children}</div>
    </div>
  );
}
function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-sm font-medium text-white/60 mb-1.5">
      {children}
      {optional && <span className="ml-1 text-white/30 font-normal">(optional)</span>}
    </label>
  );
}
function Chip({ label, selected, onClick, disabled }: {
  label: string; selected: boolean; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
        selected
          ? "border-[#7C3AED] bg-[#7C3AED]/15 text-white font-medium"
          : disabled
            ? "border-white/10 text-white/30 cursor-default"
            : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
      }`}>
      {selected && !disabled && <span className="mr-1 text-[#A78BFA]">✓</span>}
      {label}
    </button>
  );
}
function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} className="w-3.5 h-3.5" viewBox="0 0 20 20"
          fill={n <= value ? "#A78BFA" : "none"}
          stroke={n <= value ? "#A78BFA" : "rgba(255,255,255,0.15)"}
          strokeWidth={1.5}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)} className="p-0.5 transition-transform hover:scale-110">
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
function SelectArrow() {
  return (
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

// ─── Default shapes ─────────────────────────────────────────────────────────────
const defaultMentor: MentorProfile = {
  nom:"", photo_url:"", poste_actuel:"", entreprise:"", annees_experience:"",
  localisation:"", linkedin_url:"", bio:"",
  secteurs:[], competences:[], type_profils_aides:[],
  style_mentorat:"", disponibilite_heures:3, max_mentees:3,
  format_prefere:"", langues:[], motivation:"", cv_url:"", survey_completed:false,
};
const defaultMentee: MenteeProfile = {
  nom:"", photo_url:"", niveau_etudes:"", ecole:"", localisation:"", linkedin_url:"", bio:"",
  objectif_principal:"", secteurs_vises:[], poste_cible:"", horizon_temporel:"", experiences:"",
  competences:[], style_apprentissage:"", frequence_souhaitee:"",
  format_prefere:"", langues:[], motivation:"", cv_url:"", survey_completed:false,
};

// ─── Crop modal ──────────────────────────────────────────────────────────────────
const CROP_SIZE = 280; // px — diameter of the circular crop viewport

function CropModal({
  objectUrl,
  onConfirm,
  onCancel,
}: {
  objectUrl: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const imgRef                      = useRef<HTMLImageElement>(null);
  const [ready,      setReady]      = useState(false);
  const [imgNW,      setImgNW]      = useState(0);
  const [imgNH,      setImgNH]      = useState(0);
  const [cropScale,  setCropScale]  = useState(1);
  const [offsetX,    setOffsetX]    = useState(0);
  const [offsetY,    setOffsetY]    = useState(0);

  // Refs mirror state so handlers never read stale closures
  const fitScaleRef  = useRef(1);
  const cropScaleRef = useRef(1);
  const offsetXRef   = useRef(0);
  const offsetYRef   = useRef(0);

  function setCS(v: number) { cropScaleRef.current = v; setCropScale(v); }
  function setOX(v: number) { offsetXRef.current   = v; setOffsetX(v);  }
  function setOY(v: number) { offsetYRef.current   = v; setOffsetY(v);  }

  // Pointer tracking for drag + pinch
  const ptrMap    = useRef(new Map<number, { x: number; y: number }>());
  const dragStart = useRef<{ ptrX: number; ptrY: number; offX: number; offY: number } | null>(null);
  const pinchInit = useRef<{ dist: number; scale: number } | null>(null);

  function onLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    // Use cover fit: image fills the circle with no gaps
    const fit = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
    fitScaleRef.current = fit;
    setImgNW(img.naturalWidth);
    setImgNH(img.naturalHeight);
    const initOX = (CROP_SIZE - img.naturalWidth  * fit) / 2;
    const initOY = (CROP_SIZE - img.naturalHeight * fit) / 2;
    setOX(initOX); setOY(initOY);
    setReady(true);
  }

  function ptDist() {
    const pts = Array.from(ptrMap.current.values());
    return pts.length >= 2 ? Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) : 0;
  }

  function onPD(e: React.PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    ptrMap.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrMap.current.size === 1) {
      dragStart.current = { ptrX: e.clientX, ptrY: e.clientY, offX: offsetXRef.current, offY: offsetYRef.current };
    } else {
      dragStart.current = null;
      pinchInit.current = { dist: ptDist(), scale: cropScaleRef.current };
    }
  }

  function onPM(e: React.PointerEvent<HTMLDivElement>) {
    ptrMap.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrMap.current.size >= 2 && pinchInit.current) {
      const s = pinchInit.current.scale * (ptDist() / pinchInit.current.dist);
      setCS(Math.min(8, Math.max(0.5, s)));
    } else if (dragStart.current) {
      setOX(dragStart.current.offX + e.clientX - dragStart.current.ptrX);
      setOY(dragStart.current.offY + e.clientY - dragStart.current.ptrY);
    }
  }

  function onPU(e: React.PointerEvent<HTMLDivElement>) {
    ptrMap.current.delete(e.pointerId);
    pinchInit.current = null;
    if (ptrMap.current.size === 1) {
      const [pt] = ptrMap.current.values();
      dragStart.current = { ptrX: pt.x, ptrY: pt.y, offX: offsetXRef.current, offY: offsetYRef.current };
    } else if (ptrMap.current.size === 0) {
      dragStart.current = null;
    }
  }

  function onWh(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    setCS(Math.min(8, Math.max(0.5, cropScaleRef.current * (1 - e.deltaY * 0.001))));
  }

  function confirm() {
    const img = imgRef.current;
    if (!img || !ready) return;
    const canvas = document.createElement("canvas");
    canvas.width  = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 400, 400);
    const ratio = 400 / CROP_SIZE;
    ctx.drawImage(
      img,
      offsetXRef.current * ratio,
      offsetYRef.current * ratio,
      imgNW * fitScaleRef.current * cropScaleRef.current * ratio,
      imgNH * fitScaleRef.current * cropScaleRef.current * ratio,
    );
    canvas.toBlob(blob => { if (blob) onConfirm(blob); }, "image/jpeg", 0.9);
  }

  const dW = imgNW * fitScaleRef.current * cropScale;
  const dH = imgNH * fitScaleRef.current * cropScale;

  return (
    <>
      <style>{`@keyframes cm-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}>
        <div style={{
          background: "#13111F", borderRadius: 24, padding: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
          width: "min(90vw, 380px)",
        }}>
          <h3 style={{ color: "white", fontWeight: 700, fontSize: 17, margin: 0 }}>
            Recadrer la photo
          </h3>

          {/* Circular crop viewport */}
          <div
            style={{
              width: CROP_SIZE, height: CROP_SIZE, borderRadius: "50%",
              overflow: "hidden", position: "relative",
              cursor: "grab", background: "#000", flexShrink: 0,
              border: "3px solid #7C3AED",
              boxShadow: "0 0 0 4px rgba(124,58,237,0.2), 0 8px 32px rgba(0,0,0,0.6)",
              touchAction: "none",
            }}
            onPointerDown={onPD}
            onPointerMove={onPM}
            onPointerUp={onPU}
            onPointerCancel={onPU}
            onWheel={onWh}
          >
            {/* Hidden img gives us naturalWidth/Height and is the drawImage source */}
            <img ref={imgRef} src={objectUrl} alt="" onLoad={onLoad} style={{ display: "none" }} />
            {ready
              ? <img src={objectUrl} alt="" draggable={false} style={{
                  position: "absolute", left: offsetX, top: offsetY,
                  width: dW, height: dH, pointerEvents: "none", userSelect: "none",
                }} />
              : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED", animation: "cm-spin 0.8s linear infinite" }} />
                </div>
            }
          </div>

          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0, textAlign: "center" }}>
            Glissez pour repositionner · Molette ou pincement pour zoomer
          </p>

          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button type="button" onClick={onCancel}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}>
              Annuler
            </button>
            <button type="button" onClick={confirm} disabled={!ready}
              style={{
                flex: 2, padding: "13px 0", borderRadius: 14, border: "none",
                background: "#7C3AED", color: "white", fontSize: 14, fontWeight: 600,
                cursor: ready ? "pointer" : "default", opacity: ready ? 1 : 0.5,
              }}>
              Recadrer &amp; Enregistrer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();

  const [pageLoading, setPageLoading]   = useState(true);
  const [saving, setSaving]             = useState(false);
  const [editing, setEditing]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [toast, setToast]               = useState<"success" | "error" | null>(null);

  const [userId, setUserId]             = useState("");
  const [role, setRole]                 = useState<Role>(null);
  const [mentor, setMentor]             = useState<MentorProfile>(defaultMentor);
  const [mentee, setMentee]             = useState<MenteeProfile>(defaultMentee);

  // Photo upload / crop
  const photoInputRef                         = useRef<HTMLInputElement>(null);
  const [photoPreview,   setPhotoPreview]     = useState("");
  const [photoUploading, setPhotoUploading]   = useState(false);
  const [cropObjectUrl,  setCropObjectUrl]    = useState<string | null>(null);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = useCallback((type: "success" | "error") => {
    setToast(type);
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?next=/profile"); return; }
      setUserId(user.id);

      // Try mentor first
      const { data: mentorRow } = await supabase
        .from("mentors").select("*").eq("id", user.id).single();

      if (mentorRow) {
        setRole("mentor");
        setMentor({
          nom:               mentorRow.nom               ?? "",
          photo_url:         mentorRow.photo_url         ?? "",
          poste_actuel:      mentorRow.poste_actuel      ?? "",
          entreprise:        mentorRow.entreprise        ?? "",
          annees_experience: mentorRow.annees_experience != null ? String(mentorRow.annees_experience) : "",
          localisation:      mentorRow.localisation      ?? "",
          linkedin_url:      mentorRow.linkedin_url      ?? "",
          bio:               mentorRow.bio               ?? "",
          secteurs:          mentorRow.secteurs          ?? [],
          competences:       mentorRow.competences       ?? [],
          type_profils_aides:mentorRow.type_profils_aides?? [],
          style_mentorat:    mentorRow.style_mentorat    ?? "",
          disponibilite_heures: mentorRow.disponibilite_heures ?? 3,
          max_mentees:       mentorRow.max_mentees       ?? 3,
          format_prefere:    mentorRow.format_prefere    ?? "",
          langues:           mentorRow.langues           ?? [],
          motivation:        mentorRow.motivation        ?? "",
          cv_url:            mentorRow.cv_url            ?? "",
          survey_completed:  mentorRow.survey_completed  ?? false,
        });
        if (mentorRow.photo_url) setPhotoPreview(mentorRow.photo_url);
        setPageLoading(false);
        return;
      }

      // Fall back to mentee
      const { data: menteeRow } = await supabase
        .from("mentees").select("*").eq("id", user.id).single();

      if (menteeRow) {
        setRole("mentee");
        setMentee({
          nom:                menteeRow.nom                ?? "",
          photo_url:          menteeRow.photo_url          ?? "",
          niveau_etudes:      menteeRow.niveau_etudes      ?? "",
          ecole:              menteeRow.ecole              ?? "",
          localisation:       menteeRow.localisation       ?? "",
          linkedin_url:       menteeRow.linkedin_url       ?? "",
          bio:                menteeRow.bio                ?? "",
          objectif_principal: menteeRow.objectif_principal ?? "",
          secteurs_vises:     menteeRow.secteurs_vises     ?? [],
          poste_cible:        menteeRow.poste_cible        ?? "",
          horizon_temporel:   menteeRow.horizon_temporel   ?? "",
          experiences:        menteeRow.experiences        ?? "",
          competences:        menteeRow.competences        ?? [],
          style_apprentissage:menteeRow.style_apprentissage?? "",
          frequence_souhaitee:menteeRow.frequence_souhaitee?? "",
          format_prefere:     menteeRow.format_prefere     ?? "",
          langues:            menteeRow.langues            ?? [],
          motivation:         menteeRow.motivation         ?? "",
          cv_url:             menteeRow.cv_url             ?? "",
          survey_completed:   menteeRow.survey_completed   ?? false,
        });
        if (menteeRow.photo_url) setPhotoPreview(menteeRow.photo_url);
      }
      setPageLoading(false);
    }
    init();
  }, [router]);

  // ── Photo select → open crop UI ─────────────────────────────────────────
  function handlePhotoSelect(file: File) {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) { setError("Photo must be under 5 MB."); return; }
    setError(null);
    setCropObjectUrl(URL.createObjectURL(file));
  }

  // ── Crop confirmed → upload cropped blob ─────────────────────────────────
  async function handleCropConfirm(blob: Blob) {
    if (cropObjectUrl) URL.revokeObjectURL(cropObjectUrl);
    setCropObjectUrl(null);
    if (!userId) return;

    const prevUrl = role === "mentor" ? mentor.photo_url : mentee.photo_url;
    setPhotoPreview(URL.createObjectURL(blob));
    setPhotoUploading(true);
    setError(null);

    try {
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const url  = await uploadPhotoViaApi(userId, file);
      if (role === "mentor") setMentor(p => ({ ...p, photo_url: url }));
      else setMentee(p => ({ ...p, photo_url: url }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Photo upload failed, please try again.";
      setError(msg);
      setPhotoPreview(prevUrl);
    } finally {
      setPhotoUploading(false);
    }
  }

  function handleCropCancel() {
    if (cropObjectUrl) URL.revokeObjectURL(cropObjectUrl);
    setCropObjectUrl(null);
  }

  // ── Toggle array helpers ────────────────────────────────────────────────────
  function toggleMentorArr(field: keyof Pick<MentorProfile,"secteurs"|"type_profils_aides"|"langues">, val: string) {
    setMentor(p => {
      const arr = p[field] as string[];
      return { ...p, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  }
  function toggleMenteeArr(field: keyof Pick<MenteeProfile,"secteurs_vises"|"langues">, val: string) {
    setMentee(p => {
      const arr = p[field] as string[];
      return { ...p, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  }
  function toggleMentorComp(name: string) {
    setMentor(p => {
      const exists = p.competences.find(c => c.name === name);
      return { ...p, competences: exists ? p.competences.filter(c => c.name !== name) : [...p.competences, { name, rating: 3 }] };
    });
  }
  function toggleMenteeComp(name: string) {
    setMentee(p => {
      const exists = p.competences.find(c => c.name === name);
      return { ...p, competences: exists ? p.competences.filter(c => c.name !== name) : [...p.competences, { name, rating: 3 }] };
    });
  }
  function rateMentorComp(name: string, rating: number) {
    setMentor(p => ({ ...p, competences: p.competences.map(c => c.name === name ? { ...c, rating } : c) }));
  }
  function rateMenteeComp(name: string, rating: number) {
    setMentee(p => ({ ...p, competences: p.competences.map(c => c.name === name ? { ...c, rating } : c) }));
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      // Use UPDATE (not upsert) so we never touch NOT NULL columns like email
      // that are not part of the edit form.
      const ts = new Date().toISOString();
      if (role === "mentor") {
        await supabase.from("mentors").update({
          updated_at:        ts,
          nom:               mentor.nom.trim()           || null,
          photo_url:         mentor.photo_url            || null,
          poste_actuel:      mentor.poste_actuel.trim()  || null,
          entreprise:        mentor.entreprise.trim()    || null,
          annees_experience: mentor.annees_experience !== "" ? Number(mentor.annees_experience) : null,
          localisation:      mentor.localisation.trim()  || null,
          linkedin_url:      mentor.linkedin_url.trim()  || null,
          bio:               mentor.bio.trim()           || null,
          secteurs:          mentor.secteurs,
          competences:       mentor.competences,
          type_profils_aides:mentor.type_profils_aides,
          style_mentorat:    mentor.style_mentorat       || null,
          disponibilite_heures: mentor.disponibilite_heures,
          max_mentees:       mentor.max_mentees,
          format_prefere:    mentor.format_prefere       || null,
          langues:           mentor.langues,
          motivation:        mentor.motivation.trim()    || null,
          cv_url:            mentor.cv_url               || null,
        }).eq("id", userId).throwOnError();
      } else {
        await supabase.from("mentees").update({
          updated_at:         ts,
          nom:                mentee.nom.trim()              || null,
          photo_url:          mentee.photo_url               || null,
          niveau_etudes:      mentee.niveau_etudes           || null,
          ecole:              mentee.ecole.trim()            || null,
          localisation:       mentee.localisation.trim()     || null,
          linkedin_url:       mentee.linkedin_url.trim()     || null,
          bio:                mentee.bio.trim()              || null,
          objectif_principal: mentee.objectif_principal      || null,
          secteurs_vises:     mentee.secteurs_vises,
          poste_cible:        mentee.poste_cible.trim()      || null,
          horizon_temporel:   mentee.horizon_temporel        || null,
          experiences:        mentee.experiences.trim()      || null,
          competences:        mentee.competences,
          style_apprentissage:mentee.style_apprentissage     || null,
          frequence_souhaitee:mentee.frequence_souhaitee     || null,
          format_prefere:     mentee.format_prefere          || null,
          langues:            mentee.langues,
          motivation:         mentee.motivation.trim()       || null,
          cv_url:             mentee.cv_url                  || null,
        }).eq("id", userId).throwOnError();
      }
      setEditing(false);
      showToast("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save, please try again.");
      showToast("error");
    } finally {
      setSaving(false);
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const completion = role === "mentor" ? mentorCompletion(mentor) : role === "mentee" ? menteeCompletion(mentee) : 0;
  const badgeColor = completion >= 75 ? "#10B981" : completion >= 40 ? "#F59E0B" : "#A78BFA";
  const profileName   = role === "mentor" ? mentor.nom  : mentee.nom;
  const photoUrl      = role === "mentor" ? mentor.photo_url : mentee.photo_url;
  const surveyDone    = role === "mentor" ? mentor.survey_completed : mentee.survey_completed;
  const surveyLink    = role === "mentor" ? "/onboarding/mentor" : "/onboarding/mentee";
  const sliderPct     = role === "mentor" ? ((mentor.disponibilite_heures - 1) / 9) * 100 : 0;

  const initials = profileName
    ? profileName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center">
        <div className="w-full max-w-2xl px-4 py-16 space-y-4 animate-pulse">
          <div className="h-32 rounded-2xl bg-white/5" />
          <div className="h-64 rounded-2xl bg-white/5" />
          <div className="h-48 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0D0A1A] px-4 py-10">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium transition-all ${
          toast === "success"
            ? "bg-[#0D1F17] border border-[#10B981]/30 text-[#10B981]"
            : "bg-[#1F0D0D] border border-red-500/30 text-red-400"
        }`}>
          {toast === "success"
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />
          }
          {toast === "success" ? "Profile saved successfully!" : "Failed to save, please try again."}
          <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto">

        {/* Back nav */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditing(false); setError(null); }}
                className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white/70 px-4 py-2 rounded-xl border border-white/10 transition-all">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ background: "#7C3AED" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* ── Profile header card ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden mb-4"
          style={{ background: "#13111F" }}>
          {/* Gradient strip */}
          <div className="h-24 w-full" style={{ background: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A78BFA 100%)", opacity: 0.7 }} />

          <div className="px-8 pb-8 -mt-12">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 overflow-hidden flex items-center justify-center"
                style={{ borderColor: "#13111F", background: "rgba(124,58,237,0.2)" }}>
                {photoPreview
                  ? <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-white font-bold text-xl">{initials}</span>
                }
              </div>
              {editing && (
                <button
                  type="button"
                  disabled={photoUploading}
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors disabled:opacity-50"
                  style={{ background: "#7C3AED", borderColor: "#13111F" }}>
                  {photoUploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Upload className="w-3 h-3 text-white" />}
                </button>
              )}
              <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoSelect(f); e.target.value = ""; }} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-white mb-0.5">
                  {profileName || <span className="text-white/30">No name set</span>}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA" }}>
                    {role === "mentor" ? "Mentor" : "Mentee"}
                  </span>
                  {role === "mentor" && mentor.poste_actuel && (
                    <span className="text-sm text-white/40">
                      {mentor.poste_actuel}{mentor.entreprise ? ` · ${mentor.entreprise}` : ""}
                    </span>
                  )}
                  {role === "mentee" && mentee.niveau_etudes && (
                    <span className="text-sm text-white/40">{mentee.niveau_etudes}{mentee.ecole ? ` · ${mentee.ecole}` : ""}</span>
                  )}
                </div>
              </div>

              {/* Completion badge */}
              <div className="flex-shrink-0 text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.04)", color: badgeColor }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: badgeColor }} />
                  {completion}% complete
                </div>
                {/* Progress bar */}
                <div className="mt-2 w-32 h-1 rounded-full bg-white/10 ml-auto">
                  <div className="h-1 rounded-full transition-all duration-700"
                    style={{ width: `${completion}%`, background: badgeColor }} />
                </div>
              </div>
            </div>

            {/* Survey CTA */}
            {!surveyDone && (
              <Link href={surveyLink}
                className="mt-5 flex items-center justify-between px-4 py-3 rounded-xl border border-[#7C3AED]/30 hover:border-[#7C3AED]/60 transition-all group"
                style={{ background: "rgba(124,58,237,0.08)" }}>
                <div>
                  <p className="text-sm font-semibold text-white">Complete your profile survey</p>
                  <p className="text-xs text-white/40 mt-0.5">Fill in all fields to unlock better matches</p>
                </div>
                <span className="text-[#A78BFA] text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Start <span aria-hidden>→</span>
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* ── MENTOR SECTIONS ──────────────────────────────────────────────── */}
        {role === "mentor" && (
          <>
            {/* Basic Info */}
            <Section>
              <SectionTitle>Basic Profile</SectionTitle>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <FieldLabel>Full name</FieldLabel>
                    <input type="text" className={inputCls} value={mentor.nom}
                      onChange={e => setMentor(p => ({ ...p, nom: e.target.value }))}
                      placeholder="Marie Dupont" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Current job title</FieldLabel>
                      <input type="text" className={inputCls} value={mentor.poste_actuel}
                        onChange={e => setMentor(p => ({ ...p, poste_actuel: e.target.value }))}
                        placeholder="Senior PM" />
                    </div>
                    <div>
                      <FieldLabel optional>Company</FieldLabel>
                      <input type="text" className={inputCls} value={mentor.entreprise}
                        onChange={e => setMentor(p => ({ ...p, entreprise: e.target.value }))}
                        placeholder="Stripe" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Years of exp.</FieldLabel>
                      <input type="number" min={0} max={50} className={inputCls} value={mentor.annees_experience}
                        onChange={e => setMentor(p => ({ ...p, annees_experience: e.target.value }))}
                        placeholder="8" />
                    </div>
                    <div>
                      <FieldLabel>Location</FieldLabel>
                      <input type="text" className={inputCls} value={mentor.localisation}
                        onChange={e => setMentor(p => ({ ...p, localisation: e.target.value }))}
                        placeholder="Paris, France" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel optional>LinkedIn URL</FieldLabel>
                    <input type="url" className={inputCls} value={mentor.linkedin_url}
                      onChange={e => setMentor(p => ({ ...p, linkedin_url: e.target.value }))}
                      placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <FieldLabel>Bio <span className="ml-1 text-white/30 font-normal text-xs">{mentor.bio.length}/300</span></FieldLabel>
                    <textarea rows={3} maxLength={300} className={`${inputCls} resize-none`} value={mentor.bio}
                      onChange={e => setMentor(p => ({ ...p, bio: e.target.value }))}
                      placeholder="A few sentences about your background…" />
                  </div>
                </div>
              ) : (
                <>
                  {mentor.bio && <ViewRow label="Bio"><span className="leading-relaxed">{mentor.bio}</span></ViewRow>}
                  {mentor.localisation && <ViewRow label="Location">{mentor.localisation}</ViewRow>}
                  {mentor.annees_experience && <ViewRow label="Experience">{mentor.annees_experience} years</ViewRow>}
                  {mentor.linkedin_url && (
                    <ViewRow label="LinkedIn">
                      <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#A78BFA] hover:underline truncate block max-w-xs">
                        {mentor.linkedin_url}
                      </a>
                    </ViewRow>
                  )}
                </>
              )}
            </Section>

            {/* Expertise */}
            <Section>
              <SectionTitle>Expertise</SectionTitle>
              {editing ? (
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Sectors of expertise</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {SECTEURS_OPTIONS.map(s => (
                        <Chip key={s} label={s} selected={mentor.secteurs.includes(s)}
                          onClick={() => toggleMentorArr("secteurs", s)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Transferable skills <span className="ml-1 text-white/30 font-normal text-xs">rate each 1–5</span></FieldLabel>
                    <div className="space-y-2">
                      {COMPETENCES_OPTIONS.map(name => {
                        const entry = mentor.competences.find(c => c.name === name);
                        const active = !!entry;
                        return (
                          <div key={name}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${active ? "border-[#7C3AED]/40" : "border-white/[0.06] hover:border-white/10"}`}
                            style={{ background: active ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.02)" }}>
                            <button type="button" onClick={() => toggleMentorComp(name)} className="flex items-center gap-2.5 flex-1 text-left">
                              <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${active ? "border-[#7C3AED] bg-[#7C3AED]" : "border-white/20"}`}>
                                {active && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <span className={`text-sm ${active ? "text-white font-medium" : "text-white/50"}`}>{name}</span>
                            </button>
                            {active && <StarRating value={entry!.rating} onChange={r => rateMentorComp(name, r)} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Type of profiles I can help</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {TYPE_PROFILS_OPTIONS.map(s => (
                        <Chip key={s} label={s} selected={mentor.type_profils_aides.includes(s)}
                          onClick={() => toggleMentorArr("type_profils_aides", s)} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {mentor.secteurs.length > 0 && (
                    <ViewRow label="Sectors">
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {mentor.secteurs.map(s => <Chip key={s} label={s} selected disabled />)}
                      </div>
                    </ViewRow>
                  )}
                  {mentor.competences.length > 0 && (
                    <ViewRow label="Skills">
                      <div className="space-y-1.5 mt-1">
                        {mentor.competences.map(c => (
                          <div key={c.name} className="flex items-center justify-between">
                            <span className="text-white/70 text-sm">{c.name}</span>
                            <StarDisplay value={c.rating} />
                          </div>
                        ))}
                      </div>
                    </ViewRow>
                  )}
                  {mentor.type_profils_aides.length > 0 && (
                    <ViewRow label="Can help with">
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {mentor.type_profils_aides.map(s => <Chip key={s} label={s} selected disabled />)}
                      </div>
                    </ViewRow>
                  )}
                </>
              )}
            </Section>

            {/* Mentoring Style */}
            <Section>
              <SectionTitle>Mentoring Style</SectionTitle>
              {editing ? (
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Preferred approach</FieldLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {STYLE_MENTOR_OPTIONS.map(opt => (
                        <button key={opt.key} type="button"
                          onClick={() => setMentor(p => ({ ...p, style_mentorat: opt.key }))}
                          className={`p-3.5 rounded-xl border-2 text-left transition-all ${mentor.style_mentorat === opt.key ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-white/10 hover:border-white/20"}`}>
                          <p className={`text-sm font-semibold mb-0.5 ${mentor.style_mentorat === opt.key ? "text-white" : "text-white/60"}`}>{opt.label}</p>
                          <p className="text-xs text-white/35 leading-snug">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <FieldLabel>Weekly availability</FieldLabel>
                      <span className="text-sm font-semibold text-[#A78BFA]">{mentor.disponibilite_heures}h / week</span>
                    </div>
                    <input type="range" min={1} max={10} step={1} value={mentor.disponibilite_heures}
                      onChange={e => setMentor(p => ({ ...p, disponibilite_heures: Number(e.target.value) }))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #7C3AED ${sliderPct}%, rgba(255,255,255,0.1) ${sliderPct}%)`, accentColor: "#7C3AED" }} />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-white/25">1h</span>
                      <span className="text-xs text-white/25">10h</span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Max simultaneous mentees</FieldLabel>
                    <div className="flex gap-2 flex-wrap">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button key={n} type="button"
                          onClick={() => setMentor(p => ({ ...p, max_mentees: n }))}
                          className={`w-10 h-10 rounded-xl border-2 text-sm font-semibold transition-colors ${mentor.max_mentees === n ? "border-[#7C3AED] bg-[#7C3AED]/15 text-white" : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Preferred format</FieldLabel>
                    <div className="flex gap-2">
                      {FORMAT_OPTIONS.map(f => (
                        <button key={f} type="button"
                          onClick={() => setMentor(p => ({ ...p, format_prefere: f }))}
                          className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${mentor.format_prefere === f ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Languages</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {LANGUES_OPTIONS.map(l => (
                        <Chip key={l} label={l} selected={mentor.langues.includes(l)}
                          onClick={() => toggleMentorArr("langues", l)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Why do you mentor?</FieldLabel>
                    <textarea rows={3} className={`${inputCls} resize-none`} value={mentor.motivation}
                      onChange={e => setMentor(p => ({ ...p, motivation: e.target.value }))}
                      placeholder="Sharing what I learned the hard way…" />
                  </div>
                </div>
              ) : (
                <>
                  {mentor.style_mentorat && (
                    <ViewRow label="Approach">
                      {STYLE_MENTOR_OPTIONS.find(o => o.key === mentor.style_mentorat)?.label ?? mentor.style_mentorat}
                    </ViewRow>
                  )}
                  {mentor.disponibilite_heures > 0 && <ViewRow label="Availability">{mentor.disponibilite_heures}h / week</ViewRow>}
                  {mentor.max_mentees > 0 && <ViewRow label="Max mentees">{mentor.max_mentees}</ViewRow>}
                  {mentor.format_prefere && <ViewRow label="Format">{mentor.format_prefere}</ViewRow>}
                  {mentor.langues.length > 0 && (
                    <ViewRow label="Languages">
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {mentor.langues.map(l => <Chip key={l} label={l} selected disabled />)}
                      </div>
                    </ViewRow>
                  )}
                  {mentor.motivation && (
                    <ViewRow label="Motivation"><span className="leading-relaxed">{mentor.motivation}</span></ViewRow>
                  )}
                </>
              )}
            </Section>

            {/* Documents */}
            <Section>
              <SectionTitle>Documents</SectionTitle>
              {editing ? (
                <div>
                  <FieldLabel optional>CV (PDF)</FieldLabel>
                  {mentor.cv_url ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#7C3AED]/30"
                      style={{ background: "rgba(124,58,237,0.08)" }}>
                      <FileText className="w-4 h-4 text-[#A78BFA] flex-shrink-0" />
                      <span className="text-sm text-white/70 truncate flex-1">CV uploaded</span>
                      <a href={mentor.cv_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#A78BFA] hover:underline flex-shrink-0">View</a>
                    </div>
                  ) : (
                    <p className="text-sm text-white/30">No CV uploaded, complete the survey to add one.</p>
                  )}
                </div>
              ) : (
                mentor.cv_url
                  ? <ViewRow label="CV">
                      <a href={mentor.cv_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#A78BFA] hover:underline">
                        <FileText className="w-4 h-4" /> View CV
                      </a>
                    </ViewRow>
                  : <p className="text-sm text-white/25">No CV uploaded yet.</p>
              )}
            </Section>
          </>
        )}

        {/* ── MENTEE SECTIONS ──────────────────────────────────────────────── */}
        {role === "mentee" && (
          <>
            {/* Basic Info */}
            <Section>
              <SectionTitle>Basic Profile</SectionTitle>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <FieldLabel>Full name</FieldLabel>
                    <input type="text" className={inputCls} value={mentee.nom}
                      onChange={e => setMentee(p => ({ ...p, nom: e.target.value }))}
                      placeholder="Sophie Martin" />
                  </div>
                  <div>
                    <FieldLabel>Education level</FieldLabel>
                    <div className="relative">
                      <select className={selectCls} value={mentee.niveau_etudes}
                        onChange={e => setMentee(p => ({ ...p, niveau_etudes: e.target.value }))}>
                        <option value="" disabled>Select…</option>
                        {NIVEAU_ETUDES_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <SelectArrow />
                    </div>
                  </div>
                  <div>
                    <FieldLabel optional>School / University</FieldLabel>
                    <input type="text" className={inputCls} value={mentee.ecole}
                      onChange={e => setMentee(p => ({ ...p, ecole: e.target.value }))}
                      placeholder="HEC Paris, MIT…" />
                  </div>
                  <div>
                    <FieldLabel>Location</FieldLabel>
                    <input type="text" className={inputCls} value={mentee.localisation}
                      onChange={e => setMentee(p => ({ ...p, localisation: e.target.value }))}
                      placeholder="Paris, France" />
                  </div>
                  <div>
                    <FieldLabel optional>LinkedIn URL</FieldLabel>
                    <input type="url" className={inputCls} value={mentee.linkedin_url}
                      onChange={e => setMentee(p => ({ ...p, linkedin_url: e.target.value }))}
                      placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <FieldLabel>Bio <span className="ml-1 text-white/30 font-normal text-xs">{mentee.bio.length}/300</span></FieldLabel>
                    <textarea rows={3} maxLength={300} className={`${inputCls} resize-none`} value={mentee.bio}
                      onChange={e => setMentee(p => ({ ...p, bio: e.target.value }))}
                      placeholder="A few sentences about yourself…" />
                  </div>
                </div>
              ) : (
                <>
                  {mentee.bio && <ViewRow label="Bio"><span className="leading-relaxed">{mentee.bio}</span></ViewRow>}
                  {mentee.localisation && <ViewRow label="Location">{mentee.localisation}</ViewRow>}
                  {mentee.niveau_etudes && (
                    <ViewRow label="Education">
                      {mentee.niveau_etudes}{mentee.ecole ? ` · ${mentee.ecole}` : ""}
                    </ViewRow>
                  )}
                  {mentee.linkedin_url && (
                    <ViewRow label="LinkedIn">
                      <a href={mentee.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#A78BFA] hover:underline truncate block max-w-xs">
                        {mentee.linkedin_url}
                      </a>
                    </ViewRow>
                  )}
                </>
              )}
            </Section>

            {/* Goals & Career */}
            <Section>
              <SectionTitle>Goals &amp; Career</SectionTitle>
              {editing ? (
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Main objective</FieldLabel>
                    <div className="space-y-2">
                      {OBJECTIF_OPTIONS.map(opt => (
                        <button key={opt.key} type="button"
                          onClick={() => setMentee(p => ({ ...p, objectif_principal: opt.key }))}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${mentee.objectif_principal === opt.key ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-white/10 hover:border-white/20"}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${mentee.objectif_principal === opt.key ? "border-[#7C3AED] bg-[#7C3AED]" : "border-white/20"}`}>
                            {mentee.objectif_principal === opt.key && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className={`text-sm font-medium ${mentee.objectif_principal === opt.key ? "text-white" : "text-white/60"}`}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Target sectors</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {SECTEURS_OPTIONS.map(s => (
                        <Chip key={s} label={s} selected={mentee.secteurs_vises.includes(s)}
                          onClick={() => toggleMenteeArr("secteurs_vises", s)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel optional>Target role</FieldLabel>
                    <input type="text" className={inputCls} value={mentee.poste_cible}
                      onChange={e => setMentee(p => ({ ...p, poste_cible: e.target.value }))}
                      placeholder="Product Manager, Data Analyst…" />
                  </div>
                  <div>
                    <FieldLabel>Time horizon</FieldLabel>
                    <div className="relative">
                      <select className={selectCls} value={mentee.horizon_temporel}
                        onChange={e => setMentee(p => ({ ...p, horizon_temporel: e.target.value }))}>
                        <option value="" disabled>Select…</option>
                        {HORIZON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <SelectArrow />
                    </div>
                  </div>
                  <div>
                    <FieldLabel optional>Past experiences</FieldLabel>
                    <textarea rows={3} className={`${inputCls} resize-none`} value={mentee.experiences}
                      onChange={e => setMentee(p => ({ ...p, experiences: e.target.value }))}
                      placeholder="Internships, jobs, side projects…" />
                  </div>
                </div>
              ) : (
                <>
                  {mentee.objectif_principal && (
                    <ViewRow label="Main objective">
                      {OBJECTIF_OPTIONS.find(o => o.key === mentee.objectif_principal)?.label ?? mentee.objectif_principal}
                    </ViewRow>
                  )}
                  {mentee.secteurs_vises.length > 0 && (
                    <ViewRow label="Target sectors">
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {mentee.secteurs_vises.map(s => <Chip key={s} label={s} selected disabled />)}
                      </div>
                    </ViewRow>
                  )}
                  {mentee.poste_cible && <ViewRow label="Target role">{mentee.poste_cible}</ViewRow>}
                  {mentee.horizon_temporel && <ViewRow label="Time horizon">{mentee.horizon_temporel}</ViewRow>}
                  {mentee.experiences && <ViewRow label="Past experiences"><span className="leading-relaxed">{mentee.experiences}</span></ViewRow>}
                </>
              )}
            </Section>

            {/* Learning Style */}
            <Section>
              <SectionTitle>Learning Style</SectionTitle>
              {editing ? (
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Current skills <span className="ml-1 text-white/30 font-normal text-xs">rate each 1–5</span></FieldLabel>
                    <div className="space-y-2">
                      {COMPETENCES_MENTEE.map(name => {
                        const entry = mentee.competences.find(c => c.name === name);
                        const active = !!entry;
                        return (
                          <div key={name}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${active ? "border-[#7C3AED]/40" : "border-white/[0.06] hover:border-white/10"}`}
                            style={{ background: active ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.02)" }}>
                            <button type="button" onClick={() => toggleMenteeComp(name)} className="flex items-center gap-2.5 flex-1 text-left">
                              <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${active ? "border-[#7C3AED] bg-[#7C3AED]" : "border-white/20"}`}>
                                {active && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <span className={`text-sm ${active ? "text-white font-medium" : "text-white/50"}`}>{name}</span>
                            </button>
                            {active && <StarRating value={entry!.rating} onChange={r => rateMenteeComp(name, r)} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Preferred learning style</FieldLabel>
                    <div className="space-y-2">
                      {STYLE_MENTEE_OPTIONS.map(opt => (
                        <button key={opt.key} type="button"
                          onClick={() => setMentee(p => ({ ...p, style_apprentissage: opt.key }))}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${mentee.style_apprentissage === opt.key ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-white/10 hover:border-white/20"}`}>
                          <p className={`text-sm font-semibold mb-0.5 ${mentee.style_apprentissage === opt.key ? "text-white" : "text-white/60"}`}>{opt.label}</p>
                          <p className="text-xs text-white/35">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Desired frequency</FieldLabel>
                    <div className="flex gap-2 flex-wrap">
                      {FREQUENCE_OPTIONS.map(f => (
                        <button key={f} type="button"
                          onClick={() => setMentee(p => ({ ...p, frequence_souhaitee: f }))}
                          className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${mentee.frequence_souhaitee === f ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Preferred format</FieldLabel>
                    <div className="flex gap-2 flex-wrap">
                      {FORMAT_OPTIONS.map(f => (
                        <button key={f} type="button"
                          onClick={() => setMentee(p => ({ ...p, format_prefere: f }))}
                          className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${mentee.format_prefere === f ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Languages</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {LANGUES_OPTIONS.map(l => (
                        <Chip key={l} label={l} selected={mentee.langues.includes(l)}
                          onClick={() => toggleMenteeArr("langues", l)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Why do you want a mentor?</FieldLabel>
                    <textarea rows={3} className={`${inputCls} resize-none`} value={mentee.motivation}
                      onChange={e => setMentee(p => ({ ...p, motivation: e.target.value }))}
                      placeholder="I want to accelerate my growth…" />
                  </div>
                </div>
              ) : (
                <>
                  {mentee.competences.length > 0 && (
                    <ViewRow label="Current skills">
                      <div className="space-y-1.5 mt-1">
                        {mentee.competences.map(c => (
                          <div key={c.name} className="flex items-center justify-between">
                            <span className="text-white/70 text-sm">{c.name}</span>
                            <StarDisplay value={c.rating} />
                          </div>
                        ))}
                      </div>
                    </ViewRow>
                  )}
                  {mentee.style_apprentissage && (
                    <ViewRow label="Learning style">
                      {STYLE_MENTEE_OPTIONS.find(o => o.key === mentee.style_apprentissage)?.label ?? mentee.style_apprentissage}
                    </ViewRow>
                  )}
                  {mentee.frequence_souhaitee && <ViewRow label="Frequency">{mentee.frequence_souhaitee}</ViewRow>}
                  {mentee.format_prefere && <ViewRow label="Format">{mentee.format_prefere}</ViewRow>}
                  {mentee.langues.length > 0 && (
                    <ViewRow label="Languages">
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {mentee.langues.map(l => <Chip key={l} label={l} selected disabled />)}
                      </div>
                    </ViewRow>
                  )}
                  {mentee.motivation && (
                    <ViewRow label="Motivation"><span className="leading-relaxed">{mentee.motivation}</span></ViewRow>
                  )}
                </>
              )}
            </Section>

            {/* Documents */}
            <Section>
              <SectionTitle>Documents</SectionTitle>
              {editing ? (
                <div>
                  <FieldLabel optional>CV (PDF)</FieldLabel>
                  {mentee.cv_url ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#7C3AED]/30"
                      style={{ background: "rgba(124,58,237,0.08)" }}>
                      <FileText className="w-4 h-4 text-[#A78BFA] flex-shrink-0" />
                      <span className="text-sm text-white/70 truncate flex-1">CV uploaded</span>
                      <a href={mentee.cv_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#A78BFA] hover:underline flex-shrink-0">View</a>
                    </div>
                  ) : (
                    <p className="text-sm text-white/30">No CV uploaded, complete the survey to add one.</p>
                  )}
                </div>
              ) : (
                mentee.cv_url
                  ? <ViewRow label="CV">
                      <a href={mentee.cv_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#A78BFA] hover:underline">
                        <FileText className="w-4 h-4" /> View CV
                      </a>
                    </ViewRow>
                  : <p className="text-sm text-white/25">No CV uploaded yet.</p>
              )}
            </Section>
          </>
        )}

        {/* Save button (bottom), edit mode only */}
        {editing && (
          <div className="flex gap-3 mt-2 pb-10">
            <button onClick={() => { setEditing(false); setError(null); }}
              className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-medium text-white/50 hover:text-white/80 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "#7C3AED" }}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save changes</>}
            </button>
          </div>
        )}

      </div>

      {/* Crop modal — rendered outside the scroll container so it's always centered */}
      {cropObjectUrl && (
        <CropModal
          objectUrl={cropObjectUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

// ── Section wrapper ─────────────────────────────────────────────────────────────
function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] p-7 mb-4"
      style={{ background: "#13111F" }}>
      {children}
    </div>
  );
}

// ── User icon re-export (used in JSX above) ─────────────────────────────────────
// (already imported at top)
void User;
