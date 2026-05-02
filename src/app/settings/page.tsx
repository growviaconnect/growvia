"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Lock, CreditCard, Camera, CheckCircle, AlertCircle,
  Loader2, Eye, EyeOff, LogOut, Crown, XCircle, CalendarRange,
  BellOff, ArrowLeft, Check,
} from "lucide-react";
import { getUserSession, setUserSession, clearUserSession, type UserSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import AvailabilitySelector from "@/components/AvailabilitySelector";

/* ─── Types ──────────────────────────────────────────────────────── */
type Tab = "profile" | "password" | "subscription" | "availability";

const specialites = [
  "Career & Leadership", "Entrepreneurship & Business", "Personal Development",
  "Student Guidance", "Tech & Product", "Finance & Investment", "Creative & Design", "Other",
];
const objectifs = [
  "Find my career direction", "Change industries or roles", "Start or grow a business",
  "Improve my skills & confidence", "Prepare for university", "Navigate a specific challenge", "Other",
];

/* ─── Design tokens (inline – match globals.css) ─────────────────── */
const T = {
  bg:         "#0D0A1A",
  card:       "rgba(255,255,255,0.03)",
  cardBorder: "rgba(124,58,237,0.12)",
  inputBg:    "rgba(255,255,255,0.04)",
  inputBdr:   "rgba(255,255,255,0.10)",
  purple:     "#7C3AED",
  purpleL:    "#A78BFA",
  muted:      "rgba(255,255,255,0.45)",
  sub:        "rgba(157,141,241,0.70)",
  faint:      "rgba(255,255,255,0.07)",
};

/* ─── Password strength ───────────────────────────────────────────── */
function pwdStrength(pw: string): { score: 0|1|2|3; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: 1, label: "Faible", color: "#ef4444" };
  if (s <= 2) return { score: 2, label: "Moyen",  color: "#f97316" };
  return { score: 3, label: "Fort",   color: "#4ade80" };
}

/* ─── Dark field component ──────────────────────────────────────── */
function DarkField({
  label, children, className = "",
}: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label
        className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
        style={{ color: T.sub }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200";
const inputStyle = {
  background: T.inputBg,
  border: `1px solid ${T.inputBdr}`,
  color: "#fff",
};
function useFocusStyle() {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = T.purpleL;
      e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(157,141,241,0.15)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = T.inputBdr;
      e.currentTarget.style.boxShadow  = "";
    },
  };
}

/* ─── Save button ───────────────────────────────────────────────── */
function SaveBtn({
  loading, success, label = "Sauvegarder les modifications",
}: { loading?: boolean; success?: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full relative overflow-hidden flex items-center justify-center gap-2 font-bold text-sm text-white py-3.5 rounded-xl transition-all disabled:opacity-60"
      style={{
        background: success ? "#16a34a" : T.purple,
        boxShadow: success ? "0 0 0 3px rgba(74,222,128,0.2)" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!loading && !success)
          (e.currentTarget as HTMLElement).style.background = "#6D28D9";
      }}
      onMouseLeave={(e) => {
        if (!loading && !success)
          (e.currentTarget as HTMLElement).style.background = T.purple;
      }}
    >
      {/* shimmer */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
          transform: "translateX(-100%)",
          animation: "shimmerBtn 2.4s infinite",
        }}
      />
      {loading && <Loader2 className="w-4 h-4 animate-spin relative" />}
      {success && <Check className="w-4 h-4 relative" />}
      <span className="relative">{success ? "Modifications sauvegardées ✓" : label}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const router = useRouter();

  /* ── Core state ─────────────────────────────────────────────── */
  const [session, setSession]     = useState<UserSession | null>(null);
  const [tab, setTab]             = useState<Tab>("profile");
  const [tabFading, setTabFading] = useState(false);
  const [flash, setFlash]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Profile form ───────────────────────────────────────────── */
  const [form, setForm]         = useState({ nom: "", email: "", bio: "", specialite: "", objectif: "" });
  const [photo, setPhoto]       = useState<string>("");
  const [profileSaving, setProfileSaving]   = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  /* ── Photo crop ─────────────────────────────────────────────── */
  const [cropSrc, setCropSrc]   = useState<string | null>(null);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale]   = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart]   = useState({ x: 0, y: 0 });
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropImgRef    = useRef<HTMLImageElement | null>(null);
  const cropSize = 200;

  /* ── Password form ──────────────────────────────────────────── */
  const [pwdForm, setPwdForm]   = useState({ current: "", next: "", confirm: "" });
  const [showPwds, setShowPwds] = useState({ current: false, next: false, confirm: false });
  const [pwdSaving, setPwdSaving]   = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  /* ── Mentor availability ────────────────────────────────────── */
  const [mentorDbId, setMentorDbId]         = useState<string | null>(null);
  const [mentorIdLoaded, setMentorIdLoaded] = useState(false);
  const [pauseBookings, setPauseBookings]   = useState(false);
  const [pauseSaving, setPauseSaving]       = useState(false);

  /* ── Init ───────────────────────────────────────────────────── */
  useEffect(() => {
    const s = getUserSession();
    if (s) {
      setSession(s);
      setForm({ nom: s.nom, email: s.email, bio: s.bio ?? "", specialite: s.specialite ?? "", objectif: s.objectif ?? "" });
      setPhoto(s.photo ?? "");
      if (s.role === "mentor") {
        (async () => {
          try {
            const { data } = await supabase.from("mentors").select("id").eq("email", s.email).single();
            if (data?.id) {
              setMentorDbId(data.id as string);
              const { data: pb } = await supabase.from("mentors").select("pause_bookings").eq("id", data.id).single();
              if (pb) setPauseBookings((pb as { pause_bookings?: boolean }).pause_bookings ?? false);
            }
          } catch { /* silent */ } finally { setMentorIdLoaded(true); }
        })();
      } else { setMentorIdLoaded(true); }
    }
  }, []);

  /* ── Tab switch ─────────────────────────────────────────────── */
  function switchTab(next: Tab) {
    if (next === tab) return;
    setTabFading(true);
    setTimeout(() => { setTab(next); setTabFading(false); }, 130);
  }

  /* ── Flash ──────────────────────────────────────────────────── */
  function showMsg(msg: string, ok = true) {
    setFlash({ msg, ok });
    setTimeout(() => setFlash(null), 3500);
  }

  /* ── Photo file pick ────────────────────────────────────────── */
  function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        cropImgRef.current = img;
        setCropSrc(src);
        setCropOffset({ x: 0, y: 0 });
        setCropScale(1);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  /* ── Crop canvas draw ───────────────────────────────────────── */
  const drawCrop = useCallback(() => {
    const canvas = cropCanvasRef.current;
    const img = cropImgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, cropSize, cropSize);

    /* circular clip */
    ctx.save();
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    ctx.clip();

    const drawW = img.naturalWidth  * cropScale;
    const drawH = img.naturalHeight * cropScale;
    const x = cropSize / 2 - drawW / 2 + cropOffset.x;
    const y = cropSize / 2 - drawH / 2 + cropOffset.y;
    ctx.drawImage(img, x, y, drawW, drawH);
    ctx.restore();

    /* border ring */
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(157,141,241,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [cropOffset, cropScale]);

  useEffect(() => { if (cropSrc) drawCrop(); }, [cropSrc, cropOffset, cropScale, drawCrop]);

  function cropMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  }
  function cropMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setCropOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function cropMouseUp() { setIsDragging(false); }
  function cropWheel(e: React.WheelEvent) {
    e.preventDefault();
    setCropScale((s) => Math.max(0.5, Math.min(4, s - e.deltaY * 0.001)));
  }

  function confirmCrop() {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const cropped = canvas.toDataURL("image/jpeg", 0.9);
    setPhoto(cropped);
    setCropSrc(null);
  }

  /* ── Save profile ───────────────────────────────────────────── */
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setProfileSaving(true);
    await new Promise(r => setTimeout(r, 400));
    const updated: UserSession = {
      ...session, nom: form.nom, email: form.email,
      bio: form.bio, specialite: form.specialite || null,
      objectif: form.objectif || null, photo: photo || undefined,
    };
    setUserSession(updated);
    setSession(updated);
    setProfileSaving(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  }

  /* ── Save password ──────────────────────────────────────────── */
  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwdForm.next !== pwdForm.confirm) { showMsg("Les mots de passe ne correspondent pas.", false); return; }
    if (pwdForm.next.length < 8) { showMsg("Mot de passe trop court (8 caractères minimum).", false); return; }
    setPwdSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setPwdSaving(false);
    setPwdForm({ current: "", next: "", confirm: "" });
    setPwdSuccess(true);
    setTimeout(() => setPwdSuccess(false), 2500);
  }

  /* ── Cancel subscription ────────────────────────────────────── */
  function cancelSubscription() {
    if (!session) return;
    const updated = { ...session, plan: "free" as const };
    setUserSession(updated);
    setSession(updated);
    setCancelConfirm(false);
    showMsg("Abonnement résilié. Vous êtes maintenant sur le plan Gratuit.");
  }

  /* ── Pause bookings ─────────────────────────────────────────── */
  async function togglePauseBookings() {
    if (!mentorDbId) return;
    const next = !pauseBookings;
    setPauseBookings(next);
    setPauseSaving(true);
    try {
      const res  = await fetch("/api/mentor/save-availability", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId: mentorDbId, pauseBookings: next }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      showMsg(next ? "Réservations suspendues." : "Réservations réactivées.");
    } catch (err) {
      setPauseBookings(!next);
      showMsg(err instanceof Error ? err.message : "Erreur.", false);
    } finally { setPauseSaving(false); }
  }

  function handleLogout() { clearUserSession(); router.push("/"); }

  /* ── Not logged in ──────────────────────────────────────────── */
  if (!session) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: T.bg }}>
      <div className="rounded-2xl p-10 text-center max-w-sm w-full"
        style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
        <User className="w-12 h-12 mx-auto mb-4" style={{ color: T.purpleL, opacity: 0.5 }} />
        <h2 className="text-lg font-bold text-white mb-2">Vous n&apos;êtes pas connecté</h2>
        <p className="text-sm mb-6" style={{ color: T.muted }}>
          Créez un compte ou connectez-vous pour accéder à vos paramètres.
        </p>
        <Link href="/auth/register"
          className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          style={{ background: T.purple }}>
          Créer un compte
        </Link>
      </div>
    </div>
  );

  const plan = (session.plan ?? "free") as "free" | "pro" | "school";
  const planLabels: Record<string, { label: string; proFeatures?: string[] }> = {
    free:   { label: "Plan Gratuit",
      proFeatures: ["1 session découverte incluse", "Matching AI (1 par inscription)", "Accès aux profils mentors"]
    },
    pro:    { label: "Plan Pro" },
    school: { label: "Plan École" },
  };
  const currentPlan = planLabels[plan] ?? planLabels.free;
  const initials = session.nom.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const strength = pwdStrength(pwdForm.next);
  const { onFocus, onBlur } = useFocusStyle();

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: "profile",      label: "Profil",         Icon: User },
    { id: "password",     label: "Mot de passe",   Icon: Lock },
    { id: "subscription", label: "Abonnement",      Icon: CreditCard },
    ...(session.role === "mentor" ? [{ id: "availability" as Tab, label: "Disponibilité", Icon: CalendarRange }] : []),
  ];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: "#fff" }}>

      {/* ── Global keyframes ───────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmerBtn { 0%{transform:translateX(-100%)} 60%,100%{transform:translateX(200%)} }
        @keyframes pulseGreen { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4)} 50%{box-shadow:0 0 0 8px rgba(74,222,128,0)} }
        .settings-card-in { animation: fadeUp 0.4s ease forwards; opacity:0; }
        .settings-tab-in  { animation: fadeUp 0.35s ease forwards; opacity:0; }
        .settings-content-in { animation: fadeUp 0.4s ease 0.15s forwards; opacity:0; }
      `}</style>

      {/* ── Flash toast ─────────────────────────────────────────── */}
      {flash && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white shadow-2xl"
          style={{
            background: flash.ok ? "#15803d" : "#dc2626",
            border: `1px solid ${flash.ok ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}`,
            animation: "fadeUp 0.3s ease",
          }}
        >
          {flash.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {flash.msg}
        </div>
      )}

      {/* ── Cancel subscription modal ───────────────────────────── */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="rounded-2xl p-8 w-full max-w-sm text-center"
            style={{ background: "#1A1226", border: `1px solid rgba(239,68,68,0.25)` }}>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Résilier l&apos;abonnement ?</h3>
            <p className="text-sm mb-6" style={{ color: T.muted }}>
              Votre accès au plan <strong className="text-white">{currentPlan.label}</strong> sera supprimé à la fin de la période en cours.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ border: `1px solid ${T.faint}`, color: T.muted }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                Annuler
              </button>
              <button onClick={cancelSubscription}
                className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 text-sm transition-colors">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo crop modal ────────────────────────────────────── */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="rounded-2xl p-8 w-full max-w-sm"
            style={{ background: "#130F23", border: `1px solid ${T.cardBorder}` }}>
            <h3 className="text-white font-bold text-base mb-2 text-center">Recadrer la photo</h3>
            <p className="text-xs text-center mb-5" style={{ color: T.muted }}>
              Faites glisser pour repositionner · Molette pour zoomer
            </p>
            <div className="flex justify-center mb-6">
              <canvas
                ref={cropCanvasRef}
                width={cropSize} height={cropSize}
                className="rounded-full cursor-move select-none"
                style={{ border: "2px solid rgba(157,141,241,0.4)", touchAction: "none" }}
                onMouseDown={cropMouseDown}
                onMouseMove={cropMouseMove}
                onMouseUp={cropMouseUp}
                onMouseLeave={cropMouseUp}
                onWheel={cropWheel}
              />
            </div>
            <input
              type="range" min={0.5} max={4} step={0.01}
              value={cropScale}
              onChange={e => setCropScale(Number(e.target.value))}
              className="w-full mb-5 accent-[#7C3AED]"
            />
            <div className="flex gap-3">
              <button onClick={() => setCropSrc(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ border: `1px solid ${T.faint}`, color: T.muted }}>
                Annuler
              </button>
              <button onClick={confirmCrop}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ background: T.purple }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#6D28D9"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.purple; }}>
                Recadrer &amp; Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="max-w-[740px] mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: T.muted }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.purpleL; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.muted; }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Tableau de bord
        </Link>

        {/* ── User card ─────────────────────────────────────────── */}
        <div
          className="settings-card-in flex items-center justify-between gap-5 rounded-2xl px-6 py-5 mb-5"
          style={{ background: T.card, border: `1px solid rgba(157,141,241,0.15)` }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative w-14 h-14 flex-shrink-0">
              {photo ? (
                <img src={photo} alt="profil" className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white"
                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)" }}>
                  {initials}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-white text-base">{session.nom}</p>
              <p className="text-sm" style={{ color: T.muted }}>{session.email}</p>
              {/* Plan badge with tooltip */}
              <div className="relative group inline-block mt-1.5">
                <span
                  className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full cursor-default"
                  style={{ background: "rgba(157,141,241,0.12)", color: T.purpleL }}
                >
                  {currentPlan.label}
                </span>
                {plan === "free" && (
                  <div
                    className="absolute left-0 top-full mt-1.5 z-10 text-xs font-medium text-white rounded-lg px-3 py-2 whitespace-nowrap
                      opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                    style={{ background: "#1E1533", border: `1px solid ${T.cardBorder}` }}
                  >
                    Passer au plan Pro →
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex-shrink-0 inline-flex items-center gap-2 text-xs font-semibold py-2 px-3.5 rounded-lg transition-colors"
            style={{ border: `1px solid ${T.faint}`, color: T.muted }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = T.faint; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.muted; }}
          >
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </button>
        </div>

        {/* ── Tab bar ───────────────────────────────────────────── */}
        <div
          className="settings-tab-in flex gap-1.5 rounded-xl p-1.5 mb-5"
          style={{
            background: T.card,
            border: `1px solid ${T.cardBorder}`,
            animationDelay: "0.08s",
          }}
        >
          {tabs.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200"
                style={{
                  background: active ? T.purple : "transparent",
                  color: active ? "#fff" : T.muted,
                  boxShadow: active ? "0 2px 12px rgba(124,58,237,0.3)" : undefined,
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = T.muted; }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Tab content ───────────────────────────────────────── */}
        <div
          className="settings-content-in transition-opacity duration-150"
          style={{
            opacity: tabFading ? 0 : 1,
            animationDelay: "0.16s",
          }}
        >

          {/* ══ PROFILE ══════════════════════════════════════════ */}
          {tab === "profile" && (
            <form onSubmit={saveProfile}
              className="rounded-2xl px-6 py-7 space-y-6"
              style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>

              {/* Section eyebrow */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] mb-1" style={{ color: T.sub }}>
                  Informations personnelles
                </p>
                <div className="h-px" style={{ background: "rgba(124,58,237,0.10)" }} />
              </div>

              {/* Photo upload */}
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  {photo ? (
                    <img src={photo} alt="profil" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl text-white"
                      style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)" }}>
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "#1A1226", border: `2px solid ${T.bg}` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.purple; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1A1226"; }}
                  >
                    <Camera className="w-3.5 h-3.5" style={{ color: T.purpleL }} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Photo de profil</p>
                  <p className="text-xs mt-0.5" style={{ color: T.muted }}>JPG, PNG, max 2 Mo</p>
                </div>
              </div>

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DarkField label="Nom complet">
                  <input
                    type="text" required value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    className={inputCls} style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </DarkField>

                <DarkField label="Email">
                  <div className="relative">
                    <input
                      type="email" readOnly value={form.email}
                      className={inputCls} style={{ ...inputStyle, paddingRight: "2.75rem", opacity: 0.7, cursor: "default" }}
                    />
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: T.sub }} />
                  </div>
                </DarkField>
              </div>

              {/* Bio */}
              <DarkField label="Bio">
                <textarea
                  rows={4} value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Décrivez-vous en quelques mots..."
                  className={inputCls} style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </DarkField>

              {/* Specialite (mentor) */}
              {session.role === "mentor" && (
                <DarkField label="Spécialité">
                  <select
                    value={form.specialite} onChange={e => setForm({ ...form, specialite: e.target.value })}
                    className={inputCls} style={{ ...inputStyle, appearance: "auto" }}
                    onFocus={onFocus} onBlur={onBlur}
                  >
                    <option value="" style={{ background: "#1A1226" }}>Sélectionner…</option>
                    {specialites.map(s => <option key={s} value={s} style={{ background: "#1A1226" }}>{s}</option>)}
                  </select>
                </DarkField>
              )}

              {/* Objectif (mentee) */}
              {session.role === "mentee" && (
                <DarkField label="Objectif principal">
                  <select
                    value={form.objectif} onChange={e => setForm({ ...form, objectif: e.target.value })}
                    className={inputCls} style={{ ...inputStyle, appearance: "auto" }}
                    onFocus={onFocus} onBlur={onBlur}
                  >
                    <option value="" style={{ background: "#1A1226" }}>Sélectionner…</option>
                    {objectifs.map(o => <option key={o} value={o} style={{ background: "#1A1226" }}>{o}</option>)}
                  </select>
                </DarkField>
              )}

              <SaveBtn loading={profileSaving} success={profileSuccess} />
            </form>
          )}

          {/* ══ PASSWORD ══════════════════════════════════════════ */}
          {tab === "password" && (
            <form onSubmit={savePassword}
              className="rounded-2xl px-6 py-7 space-y-5"
              style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] mb-1" style={{ color: T.sub }}>
                  Changer le mot de passe
                </p>
                <div className="h-px" style={{ background: "rgba(124,58,237,0.10)" }} />
              </div>

              {(["current", "next", "confirm"] as const).map(f => (
                <div key={f}>
                  <DarkField label={
                    f === "current" ? "Mot de passe actuel"
                    : f === "next"  ? "Nouveau mot de passe"
                    : "Confirmer le nouveau mot de passe"
                  }>
                    <div className="relative">
                      <input
                        type={showPwds[f] ? "text" : "password"}
                        required={f !== "current"}
                        value={pwdForm[f]}
                        onChange={e => setPwdForm({ ...pwdForm, [f]: e.target.value })}
                        placeholder="••••••••"
                        className={inputCls} style={{ ...inputStyle, paddingRight: "2.75rem" }}
                        onFocus={onFocus} onBlur={onBlur}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwds(s => ({ ...s, [f]: !s[f] }))}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: T.sub }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.purpleL; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.sub; }}
                      >
                        {showPwds[f] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </DarkField>

                  {/* Password strength (only on "next" field) */}
                  {f === "next" && pwdForm.next && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map(n => (
                          <div key={n} className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{
                              background: strength.score >= n ? strength.color : "rgba(255,255,255,0.1)",
                            }} />
                        ))}
                      </div>
                      <p className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</p>
                    </div>
                  )}
                </div>
              ))}

              <SaveBtn
                loading={pwdSaving}
                success={pwdSuccess}
                label="Mettre à jour le mot de passe"
              />
            </form>
          )}

          {/* ══ SUBSCRIPTION ══════════════════════════════════════ */}
          {tab === "subscription" && (
            <div className="space-y-4">
              {/* Current plan card */}
              <div className="rounded-2xl px-6 py-7"
                style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] mb-4" style={{ color: T.sub }}>
                  Mon abonnement
                </p>

                {/* Plan row */}
                <div className="flex items-center gap-4 rounded-xl px-5 py-4 mb-5"
                  style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.20)" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: T.purple }}>
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{currentPlan.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: T.muted }}>
                      {plan === "free" ? "0€ / mois" : plan === "pro" ? "39€ / mois" : "Sur devis"}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80" }}>
                    Actif
                  </span>
                </div>

                {/* Free plan features */}
                {plan === "free" && currentPlan.proFeatures && (
                  <div className="space-y-2 mb-5">
                    {currentPlan.proFeatures.map(f => (
                      <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: T.muted }}>
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: T.purpleL }} />
                        {f}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <Link href="/pricing"
                    className="flex items-center justify-center gap-2 w-full text-white font-bold py-3.5 rounded-xl text-sm transition-colors relative overflow-hidden"
                    style={{ background: T.purple }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#6D28D9"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.purple; }}>
                    <Crown className="w-4 h-4" />
                    {plan === "free" ? "Choisir un abonnement" : "Changer / Upgrader mon abonnement"}
                  </Link>
                  {plan !== "free" && (
                    <button onClick={() => setCancelConfirm(true)}
                      className="w-full font-semibold py-3.5 rounded-xl text-sm transition-colors"
                      style={{ border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                      Résilier mon abonnement
                    </button>
                  )}
                </div>
              </div>

              {/* Pro upgrade card (free users) */}
              {plan === "free" && (
                <div
                  className="rounded-2xl px-6 py-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(167,139,250,0.04) 100%)",
                    border: "1px solid rgba(124,58,237,0.35)",
                    boxShadow: "0 0 40px rgba(124,58,237,0.06)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-4 h-4" style={{ color: T.purpleL }} />
                    <p className="font-bold text-white">Plan Pro</p>
                  </div>
                  <p className="text-sm mb-4" style={{ color: T.muted }}>
                    3 sessions/mois · Matching AI illimité · Support prioritaire
                  </p>
                  {[
                    "Sessions de 30 à 60 min avec vos mentors",
                    "Matching AI avancé sans limite mensuelle",
                    "Accès à tous les mentors certifiés",
                    "Support prioritaire 7j/7",
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm mb-2" style={{ color: T.muted }}>
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: T.purpleL }} /> {f}
                    </div>
                  ))}
                  <Link href="/pricing"
                    className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl text-sm mt-4 transition-colors"
                    style={{ background: T.purple }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#6D28D9"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.purple; }}>
                    Passer au Pro → <span className="font-normal text-white/60">39€/mois</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ══ AVAILABILITY (mentor only) ════════════════════════ */}
          {tab === "availability" && session.role === "mentor" && (
            <div className="space-y-4">
              {!mentorIdLoaded ? (
                <div className="rounded-2xl p-10 flex items-center justify-center"
                  style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: T.purpleL }} />
                </div>
              ) : mentorDbId ? (
                <AvailabilitySelector mentorId={mentorDbId} variant="light" />
              ) : (
                <div className="rounded-2xl p-8 text-center"
                  style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
                  <p className="text-sm" style={{ color: T.muted }}>
                    Impossible de charger les disponibilités. Rechargez la page.
                  </p>
                </div>
              )}

              {/* Pause bookings */}
              <div className="rounded-2xl px-5 py-4"
                style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.12)" }}>
                    <BellOff className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">Suspendre les réservations</p>
                    <p className="text-xs mt-0.5" style={{ color: T.muted }}>
                      Les mentorés ne pourront pas réserver de nouvelles sessions.
                    </p>
                  </div>
                  <button
                    onClick={togglePauseBookings}
                    disabled={pauseSaving || !mentorDbId}
                    className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-50"
                    style={{ background: pauseBookings ? "#ef4444" : "rgba(255,255,255,0.15)" }}
                    aria-label="Suspendre les réservations"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${pauseBookings ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                {pauseBookings && (
                  <p className="mt-3 text-xs rounded-xl px-4 py-2.5"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", color: "#f87171" }}>
                    Votre profil est actuellement suspendu. Les mentorés vous voient comme indisponible.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>{/* end tab content */}
      </div>
    </div>
  );
}
