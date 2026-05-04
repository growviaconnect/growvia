"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Lock, CreditCard, CheckCircle, AlertCircle,
  Loader2, Eye, EyeOff, LogOut, Crown, XCircle, CalendarRange,
  BellOff, ArrowLeft, Check, AlertTriangle,
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

/* ─── Plan definitions (source of truth) ─────────────────────────── */
type PlanKey = "free" | "basic" | "standard" | "premium";

const PLANS: {
  key: PlanKey;
  label: string;
  price: number;
  priceLabel: string;
  features: string[];
  recommended?: boolean;
}[] = [
  {
    key: "free",
    label: "Gratuit",
    price: 0,
    priceLabel: "0€/mois",
    features: [
      "1 session découverte incluse",
      "Matching IA (1 par inscription)",
      "Accès aux profils mentors",
    ],
  },
  {
    key: "basic",
    label: "Basique",
    price: 4.99,
    priceLabel: "4.99€/mois",
    features: [
      "Accès à plus de mentors",
      "2–3 matchings IA par mois",
      "Sessions standard",
      "Filtres de base",
    ],
  },
  {
    key: "standard",
    label: "Standard",
    price: 9.99,
    priceLabel: "9.99€/mois",
    features: [
      "Accès à la majorité des mentors",
      "Matching IA étendu",
      "Mentors certifiés",
      "Filtres avancés",
      "Recommandations personnalisées",
    ],
    recommended: true,
  },
  {
    key: "premium",
    label: "Premium",
    price: 14.99,
    priceLabel: "14.99€/mois",
    features: [
      "Accès à TOUS les mentors",
      "Matching IA illimité",
      "Réservation prioritaire",
      "Meilleurs mentors en exclusivité",
      "Contenu exclusif",
    ],
  },
];

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
  const [mentorBalance, setMentorBalance]   = useState(0);

  /* ── Subscription (mentee) ─────────────────────────────────── */
  type SubRow = { plan: string; status: string; current_period_end: string | null; stripe_customer_id: string | null };
  const [subData,     setSubData]     = useState<SubRow | null>(null);
  const [subLoading,  setSubLoading]  = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  /* ── Account deletion ───────────────────────────────────────── */
  const [deleteStep,      setDeleteStep]      = useState<0|1|2>(0);
  const [deleteEmail,     setDeleteEmail]     = useState("");
  const [deleteLockUntil, setDeleteLockUntil] = useState<number | null>(null);
  const [deleting,        setDeleting]        = useState(false);

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
              const { data: pb } = await supabase.from("mentors").select("pause_bookings,pending_balance").eq("id", data.id).single();
              if (pb) {
                setPauseBookings((pb as { pause_bookings?: boolean }).pause_bookings ?? false);
                setMentorBalance((pb as { pending_balance?: number }).pending_balance ?? 0);
              }
            }
          } catch { /* silent */ } finally { setMentorIdLoaded(true); }
        })();
      } else {
        setMentorIdLoaded(true);
        // Load subscription data for mentees
        if (s.role === "mentee") {
          setSubLoading(true);
          (async () => {
            try {
              const { data: menteeRow } = await supabase.from("mentees").select("id").eq("email", s.email).single();
              if (menteeRow?.id) {
                const { data: sub } = await supabase
                  .from("mentee_subscriptions")
                  .select("plan, status, current_period_end, stripe_customer_id")
                  .eq("mentee_id", (menteeRow as { id: string }).id)
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .single();
                if (sub) setSubData(sub as SubRow);
              }
            } catch { /* no sub */ } finally { setSubLoading(false); }
          })();
        }
      }
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

  /* ── Open Stripe customer portal ───────────────────────────── */
  async function openPortal() {
    if (!session?.email) return;
    setPortalLoading(true);
    try {
      const res  = await fetch("/api/subscriptions/portal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.email }),
      });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      if (json.url) window.location.href = json.url;
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Could not open portal.", false);
    } finally { setPortalLoading(false); }
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

  /* ── Delete account ─────────────────────────────────────────── */
  async function handleDeleteAccount() {
    if (deleteLockUntil && Date.now() < deleteLockUntil) return;
    setDeleting(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) throw new Error("Non authentifié.");
      const res  = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authSession.access_token}` },
      });
      const json = await res.json() as { error?: string; message?: string };
      if (res.status === 429) {
        setDeleteLockUntil(Date.now() + 15 * 60 * 1000);
        throw new Error(json.message ?? "Trop de tentatives. Réessayez dans 15 minutes.");
      }
      if (!res.ok) throw new Error(json.error ?? "Erreur lors de la suppression.");
      clearUserSession();
      router.push("/?account_deleted=1");
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Erreur lors de la suppression.", false);
      setDeleteStep(0);
    } finally {
      setDeleting(false);
    }
  }

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

  const rawPlan  = session.plan ?? "free";
  // Map legacy keys to new plan system
  const planKey  = (rawPlan === "pro" ? "premium" : rawPlan === "school" ? "premium" : rawPlan) as PlanKey;
  const currentPlanData = PLANS.find(p => p.key === planKey) ?? PLANS[0];
  const otherPlans      = PLANS.filter(p => p.key !== planKey);
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
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.6)} }
        .settings-card-in { animation: fadeUp 0.4s ease forwards; opacity:0; }
        .settings-tab-in  { animation: fadeUp 0.35s ease forwards; opacity:0; }
        .settings-content-in { animation: fadeUp 0.4s ease 0.15s forwards; opacity:0; }
        .plan-card-hover { transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease; }
        .plan-card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(124,58,237,0.15); border-color: rgba(157,141,241,0.35) !important; }
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
            <h3 className="text-lg font-bold text-white mb-2">Cancel subscription?</h3>
            <p className="text-sm mb-6" style={{ color: T.muted }}>
              To cancel, we&apos;ll open the Stripe portal where you can manage or cancel your subscription.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ border: `1px solid ${T.faint}`, color: T.muted }}>
                Go back
              </button>
              <button onClick={() => { setCancelConfirm(false); openPortal(); }}
                disabled={portalLoading}
                className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 text-sm transition-colors disabled:opacity-60">
                Open portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete modal step 1: warning ───────────────────────── */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="rounded-2xl p-8 w-full max-w-md"
            style={{ background: "#1A1226", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(239,68,68,0.12)" }}>
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-4">Attention — Action irréversible</h3>

            {/* Mentor: pending balance warning */}
            {session.role === "mentor" && mentorBalance > 0 && (
              <div className="rounded-xl px-4 py-3 mb-4"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <p className="text-sm font-medium mb-2" style={{ color: "#fbbf24" }}>
                  ⚠️ Vous avez un solde en attente de {mentorBalance.toFixed(2)}€. Avant de supprimer votre compte, vous devez transférer votre solde sur votre compte bancaire.
                </p>
                <Link href="/dashboard?tab=revenus"
                  className="text-xs font-semibold transition-colors"
                  style={{ color: "#f59e0b" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fbbf24"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#f59e0b"; }}>
                  Accéder à mes paiements →
                </Link>
              </div>
            )}

            <p className="text-sm mb-3" style={{ color: T.muted }}>
              En supprimant votre compte, vous perdrez définitivement :
            </p>
            <ul className="text-sm space-y-2 mb-4" style={{ color: T.muted }}>
              {[
                "Votre profil et toutes vos informations",
                "Votre historique de sessions",
                "Vos matchings IA et favoris",
                "Tout accès à la plateforme GrowVia",
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm font-semibold mb-6" style={{ color: "#f87171" }}>
              Cette action est irréversible et immédiate.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setDeleteStep(0)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ border: `1px solid ${T.faint}`, color: T.muted }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                Annuler
              </button>
              <button
                onClick={() => { setDeleteEmail(""); setDeleteStep(2); }}
                disabled={session.role === "mentor" && mentorBalance > 0}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#dc2626" }}
                onMouseEnter={e => { if (!(session.role === "mentor" && mentorBalance > 0)) (e.currentTarget as HTMLElement).style.background = "#b91c1c"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#dc2626"; }}>
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete modal step 2: email confirm ─────────────────── */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="rounded-2xl p-8 w-full max-w-md"
            style={{ background: "#1A1226", border: "1px solid rgba(239,68,68,0.3)" }}>
            <h3 className="text-xl font-bold text-white text-center mb-4">Êtes-vous absolument certain ?</h3>

            {deleteLockUntil && Date.now() < deleteLockUntil && (
              <div className="rounded-xl px-4 py-3 mb-4"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <p className="text-sm" style={{ color: "#f87171" }}>
                  Trop de tentatives. Réessayez dans {Math.ceil((deleteLockUntil - Date.now()) / 60000)} minute(s).
                </p>
              </div>
            )}

            <p className="text-sm mb-3" style={{ color: T.muted }}>
              Pour confirmer la suppression, tapez votre adresse email ci-dessous :
            </p>
            <input
              type="email"
              value={deleteEmail}
              onChange={e => setDeleteEmail(e.target.value)}
              placeholder={session.email}
              className={inputCls + " mb-6"}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={deleting || !!(deleteLockUntil && Date.now() < deleteLockUntil)}
              autoComplete="off"
            />

            <div className="flex gap-3">
              <button onClick={() => setDeleteStep(1)} disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ border: `1px solid ${T.faint}`, color: T.muted }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                Retour
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={
                  deleteEmail.trim().toLowerCase() !== session.email.toLowerCase() ||
                  deleting ||
                  !!(deleteLockUntil && Date.now() < deleteLockUntil)
                }
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "#dc2626" }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  if (!el.disabled) el.style.background = "#b91c1c";
                }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#dc2626"; }}>
                {deleting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Suppression…</>
                  : "Supprimer définitivement mon compte"
                }
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
                  Plan {currentPlanData.label}
                </span>
                {planKey === "free" && (
                  <div
                    className="absolute left-0 top-full mt-1.5 z-10 text-xs font-medium text-white rounded-lg px-3 py-2 whitespace-nowrap
                      opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                    style={{ background: "#1E1533", border: `1px solid ${T.cardBorder}` }}
                  >
                    Choisir un abonnement →
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
              {subLoading ? (
                <div className="rounded-2xl p-10 flex items-center justify-center"
                  style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: T.purpleL }} />
                </div>
              ) : subData && subData.status === "active" ? (
                <>
                  {/* ── Active subscription card ─────────────────── */}
                  <div className="rounded-2xl px-6 py-6"
                    style={{ background: "rgba(157,141,241,0.06)", border: "1px solid rgba(157,141,241,0.30)" }}>

                    <p className="text-[10px] font-bold uppercase tracking-[1.4px] mb-5" style={{ color: T.sub }}>
                      My subscription
                    </p>

                    {/* Plan row */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.35)" }}>
                          <Crown className="w-5 h-5" style={{ color: T.purpleL }} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-base capitalize">
                            {subData.plan} plan
                          </p>
                          {subData.current_period_end && (
                            <p className="text-xs mt-0.5" style={{ color: T.muted }}>
                              Renews {new Date(subData.current_period_end).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
                        style={{ background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.25)" }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: "#4ade80", animation: "pulseDot 2s ease-in-out infinite" }} />
                        <span className="text-xs font-semibold" style={{ color: "#4ade80" }}>Active</span>
                      </div>
                    </div>

                    {/* Portal buttons */}
                    <div className="space-y-2.5">
                      <button
                        onClick={openPortal}
                        disabled={portalLoading}
                        className="flex items-center justify-center gap-2 w-full font-semibold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                        style={{ background: T.purple, color: "#fff" }}
                      >
                        {portalLoading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
                          : <><CreditCard className="w-4 h-4" /> Manage subscription</>
                        }
                      </button>
                      <button
                        onClick={openPortal}
                        disabled={portalLoading}
                        className="flex items-center justify-center gap-2 w-full font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
                        style={{ border: "1px solid rgba(157,141,241,0.25)", color: T.muted }}
                      >
                        Update payment method
                      </button>
                    </div>

                    <p className="text-xs mt-3 text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
                      Cancel anytime via the Stripe portal
                    </p>
                  </div>
                </>
              ) : (
                /* ── No active subscription ──────────────────────── */
                <div className="rounded-2xl px-6 py-6 text-center"
                  style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
                  <Crown className="w-8 h-8 mx-auto mb-3" style={{ color: T.purpleL }} />
                  <p className="font-bold text-white mb-1">No active subscription</p>
                  <p className="text-sm mb-5" style={{ color: T.muted }}>
                    Subscribe to book sessions with mentors. From 4.99€/month.
                  </p>
                  <Link
                    href="/subscribe"
                    className="inline-flex items-center gap-2 font-bold text-sm text-white px-6 py-3 rounded-xl"
                    style={{ background: T.purple }}
                  >
                    <Crown className="w-4 h-4" /> Choose a plan
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

        {/* ── Danger zone ───────────────────────────────────────── */}
        <div className="mt-10 pt-6" style={{ borderTop: "1px solid rgba(239,68,68,0.2)" }}>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#ef4444" }}
          >
            Zone de danger
          </p>
          <div
            className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ background: T.card, border: "1px solid rgba(239,68,68,0.12)" }}
          >
            <div>
              <p className="font-semibold text-white text-sm mb-1">Supprimer mon compte</p>
              <p className="text-xs" style={{ color: T.muted }}>
                Une fois votre compte supprimé, toutes vos données seront définitivement effacées et irrécupérables.
              </p>
            </div>
            <button
              onClick={() => setDeleteStep(1)}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background    = "rgba(239,68,68,0.08)";
                (e.currentTarget as HTMLElement).style.borderColor   = "#ef4444";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background    = "";
                (e.currentTarget as HTMLElement).style.borderColor   = "rgba(239,68,68,0.4)";
              }}
            >
              Supprimer mon compte
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
