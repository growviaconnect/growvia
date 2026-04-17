"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, User, Lock, CreditCard, Camera, CheckCircle, AlertCircle,
  Loader2, Eye, EyeOff, LogOut, Crown, XCircle,
} from "lucide-react";
import { getUserSession, setUserSession, clearUserSession, type UserSession } from "@/lib/session";

type Tab = "profile" | "password" | "subscription";

const specialites = ["Career & Leadership", "Entrepreneurship & Business", "Personal Development", "Student Guidance", "Tech & Product", "Finance & Investment", "Creative & Design", "Other"];
const objectifs   = ["Find my career direction", "Change industries or roles", "Start or grow a business", "Improve my skills & confidence", "Prepare for university", "Navigate a specific challenge", "Other"];

const PLANS: Record<string, { label: string; price: string; color: string }> = {
  free:   { label: "Plan Gratuit",   price: "0€/mois",    color: "bg-gray-100 text-gray-700" },
  pro:    { label: "Plan Pro",       price: "39€/mois",   color: "bg-purple-100 text-purple-700" },
  school: { label: "Plan École",     price: "Sur devis",  color: "bg-blue-100 text-blue-700" },
};

export default function SettingsPage() {
  const router = useRouter();
  const [session, setSession]     = useState<UserSession | null>(null);
  const [tab, setTab]             = useState<Tab>("profile");
  const [flash, setFlash]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile form
  const [form, setForm] = useState({ nom: "", email: "", bio: "", specialite: "", objectif: "" });
  const [photo, setPhoto] = useState<string>("");

  // Password form
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    const s = getUserSession();
    if (s) {
      setSession(s);
      setForm({ nom: s.nom, email: s.email, bio: s.bio ?? "", specialite: s.specialite ?? "", objectif: s.objectif ?? "" });
      setPhoto(s.photo ?? "");
    }
  }, []);

  function showMsg(msg: string, ok = true) {
    setFlash({ msg, ok }); setTimeout(() => setFlash(null), 3500);
  }

  /* Photo upload */
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setPhoto(url);
    };
    reader.readAsDataURL(file);
  }

  /* Save profile */
  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    const updated: UserSession = {
      ...session,
      nom:       form.nom,
      email:     form.email,
      bio:       form.bio,
      specialite: form.specialite || null,
      objectif:  form.objectif || null,
      photo:     photo || undefined,
    };
    setUserSession(updated);
    setSession(updated);
    showMsg("Profil mis à jour ✓");
  }

  /* Save password (client-side only — no backend auth) */
  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwdForm.next !== pwdForm.confirm) { showMsg("Les mots de passe ne correspondent pas.", false); return; }
    if (pwdForm.next.length < 8) { showMsg("Mot de passe trop court (8 caractères minimum).", false); return; }
    setPwdSaving(true);
    await new Promise(r => setTimeout(r, 600)); // simulate async
    setPwdSaving(false);
    setPwdForm({ current: "", next: "", confirm: "" });
    showMsg("Mot de passe mis à jour ✓");
  }

  /* Cancel subscription */
  function cancelSubscription() {
    if (!session) return;
    const updated = { ...session, plan: "free" as const };
    setUserSession(updated);
    setSession(updated);
    setCancelConfirm(false);
    showMsg("Abonnement résilié. Vous êtes maintenant sur le plan Gratuit.");
  }

  function handleLogout() {
    clearUserSession();
    router.push("/");
  }

  if (!session) {
    return (
      <div className="min-h-screen gradient-bg-soft flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 card-shadow text-center max-w-sm w-full">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Vous n&apos;êtes pas connecté</h2>
          <p className="text-gray-500 text-sm mb-6">Créez un compte ou connectez-vous pour accéder à vos paramètres.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 gradient-bg text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm">
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  const currentPlan = PLANS[session.plan ?? "free"];
  const initials = session.nom.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F3F1FF]">
      {/* Flash */}
      {flash && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${flash.ok ? "bg-green-600" : "bg-red-600"}`}>
          {flash.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {flash.msg}
        </div>
      )}

      {/* Cancel subscription confirm modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm card-shadow text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Résilier l&apos;abonnement ?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Votre accès au plan <strong>{currentPlan.label}</strong> sera supprimé à la fin de la période en cours. Vous passerez automatiquement sur le plan Gratuit.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(false)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={cancelSubscription} className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 text-sm">
                Confirmer la résiliation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1B1F3B] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <h1 className="text-lg font-bold text-white">Paramètres</h1>
          </div>
        </div>
        <button onClick={handleLogout}
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Profile card */}
        <div className="bg-white rounded-2xl p-6 card-shadow flex items-center gap-5 mb-8">
          <div className="relative flex-shrink-0">
            {photo ? (
              <img src={photo} alt="profil" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-xl">{initials}</div>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{session.nom}</p>
            <p className="text-sm text-gray-500">{session.email}</p>
            <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${currentPlan.color}`}>{currentPlan.label}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 card-shadow">
          {([
            { id: "profile",      label: "Profil",        icon: User },
            { id: "password",     label: "Mot de passe",  icon: Lock },
            { id: "subscription", label: "Abonnement",    icon: CreditCard },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === id ? "gradient-bg text-white" : "text-gray-500 hover:text-gray-700"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ── Profile tab ── */}
        {tab === "profile" && (
          <form onSubmit={saveProfile} className="bg-white rounded-2xl p-8 card-shadow space-y-5">
            <h2 className="text-base font-bold text-gray-900 mb-2">Informations personnelles</h2>

            {/* Photo */}
            <div className="flex items-center gap-5">
              <div className="relative">
                {photo ? (
                  <img src={photo} alt="profil" className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-2xl">{initials}</div>
                )}
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center card-shadow text-purple-600 hover:text-purple-800">
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Photo de profil</p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG — max 2 Mo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                <input type="text" required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="Décrivez-vous en quelques mots..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm resize-none" />
            </div>

            {session.role === "mentor" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Spécialité</label>
                <select value={form.specialite} onChange={e => setForm({ ...form, specialite: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {specialites.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {session.role === "mentee" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Objectif principal</label>
                <select value={form.objectif} onChange={e => setForm({ ...form, objectif: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm bg-white">
                  <option value="">Sélectionner...</option>
                  {objectifs.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}

            <button type="submit" className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity">
              Enregistrer les modifications
            </button>
          </form>
        )}

        {/* ── Password tab ── */}
        {tab === "password" && (
          <form onSubmit={savePassword} className="bg-white rounded-2xl p-8 card-shadow space-y-5">
            <h2 className="text-base font-bold text-gray-900 mb-2">Changer le mot de passe</h2>

            {(["current", "next", "confirm"] as const).map(f => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {f === "current" ? "Mot de passe actuel" : f === "next" ? "Nouveau mot de passe" : "Confirmer le nouveau mot de passe"}
                </label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} required={f !== "current"}
                    value={pwdForm[f]} onChange={e => setPwdForm({ ...pwdForm, [f]: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
                  {f === "next" && (
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={pwdSaving} className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {pwdSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Mettre à jour le mot de passe
            </button>
          </form>
        )}

        {/* ── Subscription tab ── */}
        {tab === "subscription" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-8 card-shadow">
              <h2 className="text-base font-bold text-gray-900 mb-5">Mon abonnement</h2>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F3F1FF] mb-6">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{currentPlan.label}</p>
                  <p className="text-sm text-gray-500">{currentPlan.price}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${currentPlan.color}`}>Actif</span>
              </div>

              <div className="space-y-3">
                <Link href="/pricing"
                  className="flex items-center justify-center gap-2 w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm">
                  <Crown className="w-4 h-4" />
                  {session.plan === "free" ? "Choisir un abonnement" : "Changer / Upgrader mon abonnement"}
                </Link>

                {session.plan && session.plan !== "free" && (
                  <button onClick={() => setCancelConfirm(true)}
                    className="w-full border-2 border-red-200 text-red-600 font-semibold py-3.5 rounded-xl hover:bg-red-50 transition-colors text-sm">
                    Résilier mon abonnement
                  </button>
                )}
              </div>
            </div>

            {session.plan === "free" && (
              <div className="bg-[#1B1F3B] rounded-2xl p-6 text-white">
                <p className="font-semibold mb-1">Passez au Plan Pro</p>
                <p className="text-gray-400 text-sm mb-4">3 sessions/mois + matching AI illimité + support prioritaire — 39€/mois.</p>
                <Link href="/pricing" className="inline-flex items-center gap-2 bg-white text-[#1B1F3B] font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                  Voir les plans
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
