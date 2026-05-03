"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Lock, CreditCard, CheckCircle, AlertCircle,
  Loader2, Eye, EyeOff, LogOut, Crown, XCircle, CalendarRange,
  BellOff, ArrowLeft, Check,
} from "lucide-react";
import { getUserSession, setUserSession, clearUserSession, type UserSession } from "@/lib/session";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AvailabilitySelector from "@/components/AvailabilitySelector";
import UserAvatar from "@/components/UserAvatar";

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
  loading, success, disabled: extraDisabled, label = "Sauvegarder les modifications",
}: { loading?: boolean; success?: boolean; disabled?: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading || extraDisabled}
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
  const { setSession: setGlobalSession } = useAuth();

  /* ── Core state ─────────────────────────────────────────────── */
  const [session, setSession]     = useState<UserSession | null>(null);
  const [tab, setTab]             = useState<Tab>("profile");
  const [tabFading, setTabFading] = useState(false);
  const [flash, setFlash]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  /* ── Profile form ───────────────────────────────────────────── */
  const [form, setForm]         = useState({ nom: "", email: "", bio: "", specialite: "", objectif: "" });
  const [photo, setPhoto]       = useState<string>("");
  const [profileSaving, setProfileSaving]   = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  /* ── Password form ──────────────────────────────────────────── */
  const [pwdForm, setPwdForm]   = useState({ current: "", next: "", confirm: "" });
  const [showPwds, setShowPwds] = useState({ current: false, next: false, confirm: false });
  const [pwdSaving, setPwdSaving]   = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [currentPwdVerified,  setCurrentPwdVerified]  = useState(false);
  const [currentPwdVerifying, setCurrentPwdVerifying] = useState(false);
  const [currentPwdError,     setCurrentPwdError]     = useState<string | null>(null);
  const [isResetMode,         setIsResetMode]         = useState(false);
  const [forgotExpanded,      setForgotExpanded]      = useState(false);
  const [forgotSending,       setForgotSending]       = useState(false);
  const [forgotSent,          setForgotSent]          = useState(false);

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

  /* ── Detect ?tab=password&reset=true (email recovery link) ─── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "true" && params.get("tab") === "password") {
      setTab("password");
      setIsResetMode(true);
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
    setGlobalSession(updated);
    setProfileSaving(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  }

  /* ── Verify current password via Supabase re-auth ──────────── */
  async function verifyCurrentPassword() {
    if (!pwdForm.current || !session) return;
    setCurrentPwdVerifying(true);
    setCurrentPwdError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: session.email,
        password: pwdForm.current,
      });
      if (error) {
        setCurrentPwdVerified(false);
        setCurrentPwdError("Mot de passe incorrect. Réessayez ou utilisez la récupération par email.");
      } else {
        setCurrentPwdVerified(true);
        setCurrentPwdError(null);
      }
    } catch {
      setCurrentPwdError("Erreur de vérification. Réessayez.");
    } finally {
      setCurrentPwdVerifying(false);
    }
  }

  /* ── Send password reset email ───────────────────────────── */
  async function sendResetEmail() {
    if (!session) return;
    setForgotSending(true);
    try {
      const redirectTo = `${window.location.origin}/settings?tab=password&reset=true`;
      const { error } = await supabase.auth.resetPasswordForEmail(session.email, { redirectTo });
      if (error) throw error;
      setForgotSent(true);
      setForgotExpanded(false);
    } catch {
      showMsg("Impossible d'envoyer l'email. Réessayez.", false);
    } finally {
      setForgotSending(false);
    }
  }

  /* ── Save password ──────────────────────────────────────────── */
  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwdForm.next !== pwdForm.confirm || pwdForm.next.length < 8) return;
    if (!currentPwdVerified && !isResetMode) return;
    setPwdSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwdForm.next });
      if (error) throw error;
      setPwdForm({ current: "", next: "", confirm: "" });
      setCurrentPwdVerified(false);
      setIsResetMode(false);
      setPwdSuccess(true);
      setTimeout(() => setPwdSuccess(false), 2500);
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Erreur lors de la mise à jour.", false);
    } finally {
      setPwdSaving(false);
    }
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
              <UserAvatar photo={photo} name={session.nom} size={56} />
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
                <UserAvatar
                  editable
                  photo={photo}
                  name={session.nom}
                  size={80}
                  onPhotoUploaded={(url) => setPhoto(url)}
                />
                <div>
                  <p className="text-sm font-semibold text-white">Photo de profil</p>
                  <p className="text-xs mt-0.5" style={{ color: T.muted }}>JPG, PNG · cliquez pour changer</p>
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

              {/* Reset mode banner */}
              {isResetMode && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.20)" }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#4ade80" }} />
                  <p className="text-sm" style={{ color: "#4ade80" }}>
                    Vous pouvez maintenant définir un nouveau mot de passe
                  </p>
                </div>
              )}

              {/* Current password — hidden in reset mode */}
              {!isResetMode && (
                <div>
                  <DarkField label="Mot de passe actuel">
                    <div className="flex gap-2">
                      {/* Input */}
                      <div className="relative flex-1">
                        <input
                          type={showPwds.current ? "text" : "password"}
                          value={pwdForm.current}
                          onChange={e => {
                            setPwdForm(p => ({ ...p, current: e.target.value }));
                            setCurrentPwdVerified(false);
                            setCurrentPwdError(null);
                          }}
                          onBlur={() => { if (pwdForm.current.length >= 6 && !currentPwdVerified) verifyCurrentPassword(); }}
                          placeholder="••••••••"
                          className={inputCls}
                          style={{
                            ...inputStyle,
                            paddingRight: "2.75rem",
                            borderColor: currentPwdError
                              ? "#ef4444"
                              : currentPwdVerified
                              ? "#4ade80"
                              : T.inputBdr,
                          }}
                          onFocus={onFocus}
                        />
                        {/* Checkmark when verified */}
                        {currentPwdVerified && (
                          <CheckCircle
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: "#4ade80" }}
                          />
                        )}
                        {/* Eye toggle (only when not verified — avoids icon overlap) */}
                        {!currentPwdVerified && (
                          <button
                            type="button"
                            onClick={() => setShowPwds(s => ({ ...s, current: !s.current }))}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: T.sub }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.purpleL; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.sub; }}
                          >
                            {showPwds.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                      {/* Verify button (disappears once verified) */}
                      {!currentPwdVerified && (
                        <button
                          type="button"
                          onClick={verifyCurrentPassword}
                          disabled={!pwdForm.current || currentPwdVerifying}
                          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                          style={{ background: "rgba(124,58,237,0.20)", color: T.purpleL, border: "1px solid rgba(124,58,237,0.30)" }}
                          onMouseEnter={e => { if (pwdForm.current && !currentPwdVerifying) (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.35)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.20)"; }}
                        >
                          {currentPwdVerifying
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : "Vérifier"}
                        </button>
                      )}
                    </div>
                  </DarkField>

                  {/* Error */}
                  {currentPwdError && (
                    <p className="mt-1.5 text-xs" style={{ color: "#f87171" }}>{currentPwdError}</p>
                  )}

                  {/* Forgot password link */}
                  {!forgotSent && !forgotExpanded && (
                    <button
                      type="button"
                      onClick={() => setForgotExpanded(true)}
                      className="mt-2 text-xs transition-colors hover:underline block"
                      style={{ color: T.sub }}
                    >
                      Mot de passe oublié ? Recevoir un email de récupération
                    </button>
                  )}

                  {/* Forgot password confirmation block */}
                  {forgotExpanded && !forgotSent && (
                    <div className="mt-3 px-4 py-3 rounded-xl"
                      style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.20)" }}>
                      <p className="text-xs mb-3" style={{ color: T.muted }}>
                        Un email de récupération va être envoyé à{" "}
                        <span className="text-white font-medium">{session.email}</span>
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={sendResetEmail}
                          disabled={forgotSending}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                          style={{ background: T.purple, color: "#fff" }}
                        >
                          {forgotSending && <Loader2 className="w-3 h-3 animate-spin" />}
                          Envoyer
                        </button>
                        <button
                          type="button"
                          onClick={() => setForgotExpanded(false)}
                          className="text-xs transition-colors hover:underline"
                          style={{ color: T.muted }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sent confirmation */}
                  {forgotSent && (
                    <p className="mt-2 text-xs font-medium" style={{ color: "#4ade80" }}>
                      Email envoyé ✓ Vérifiez votre boîte mail
                    </p>
                  )}
                </div>
              )}

              {/* New password */}
              <div style={{
                opacity: currentPwdVerified || isResetMode ? 1 : 0.4,
                transition: "opacity 0.3s ease",
                pointerEvents: currentPwdVerified || isResetMode ? "auto" : "none",
              }}>
                <DarkField label="Nouveau mot de passe">
                  <div className="relative">
                    <input
                      type={showPwds.next ? "text" : "password"}
                      value={pwdForm.next}
                      onChange={e => setPwdForm(p => ({ ...p, next: e.target.value }))}
                      placeholder="••••••••"
                      disabled={!currentPwdVerified && !isResetMode}
                      className={inputCls}
                      style={{
                        ...inputStyle,
                        paddingRight: "2.75rem",
                        cursor: currentPwdVerified || isResetMode ? undefined : "not-allowed",
                      }}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwds(s => ({ ...s, next: !s.next }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: T.sub }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.purpleL; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.sub; }}
                    >
                      {showPwds.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </DarkField>
                {/* Strength bar */}
                {pwdForm.next && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map(n => (
                        <div key={n} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: strength.score >= n ? strength.color : "rgba(255,255,255,0.1)" }} />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div style={{
                opacity: currentPwdVerified || isResetMode ? 1 : 0.4,
                transition: "opacity 0.3s ease",
                pointerEvents: currentPwdVerified || isResetMode ? "auto" : "none",
              }}>
                <DarkField label="Confirmer le nouveau mot de passe">
                  <div className="relative">
                    <input
                      type={showPwds.confirm ? "text" : "password"}
                      value={pwdForm.confirm}
                      onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="••••••••"
                      disabled={!currentPwdVerified && !isResetMode}
                      className={inputCls}
                      style={{
                        ...inputStyle,
                        paddingRight: "2.75rem",
                        cursor: currentPwdVerified || isResetMode ? undefined : "not-allowed",
                        borderColor: pwdForm.confirm
                          ? pwdForm.confirm === pwdForm.next ? "#4ade80" : "#ef4444"
                          : T.inputBdr,
                      }}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwds(s => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: T.sub }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.purpleL; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.sub; }}
                    >
                      {showPwds.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </DarkField>
                {pwdForm.confirm && pwdForm.confirm !== pwdForm.next && (
                  <p className="mt-1.5 text-xs" style={{ color: "#f87171" }}>
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              <SaveBtn
                loading={pwdSaving}
                success={pwdSuccess}
                label={pwdSuccess ? "Mot de passe mis à jour ✓" : "Mettre à jour le mot de passe"}
                disabled={
                  !(
                    (currentPwdVerified || isResetMode) &&
                    pwdForm.next.length >= 8 &&
                    strength.score >= 2 &&
                    pwdForm.next === pwdForm.confirm
                  )
                }
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
