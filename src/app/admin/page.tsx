"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lock, ArrowRight, AlertCircle, LogOut, RefreshCw, Loader2,
  Users, UserCheck, Cpu, Link2, Activity, CheckCircle, X, Edit2, Download,
} from "lucide-react";
import { supabase, type Mentor, type Mentee, type AIMatching, type Connexion } from "@/lib/supabase";

const ADMIN_EMAIL    = "growviaconnect@gmail.com";
const ADMIN_PASSWORD = "growvia2026";

/* ── helpers ── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function exportCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
}

function Badge({ s }: { s: string }) {
  const cls: Record<string, string> = {
    active:    "bg-green-50 text-green-700",
    certified: "bg-green-50 text-green-700",
    pending:   "bg-purple-50 text-purple-700",
    rejected:  "bg-red-50 text-red-700",
    cancelled: "bg-red-50 text-red-700",
    completed: "bg-blue-50 text-blue-700",
    none:      "bg-gray-100 text-gray-500",
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls[s] ?? "bg-gray-100 text-gray-500"}`}>{s}</span>;
}

function ActionBtn({ onClick, color, children, disabled }: {
  onClick: () => void; color: "green" | "red" | "purple"; children: React.ReactNode; disabled?: boolean;
}) {
  const cls = { green: "bg-green-50 text-green-700 hover:bg-green-100", red: "bg-red-50 text-red-700 hover:bg-red-100", purple: "bg-purple-50 text-purple-700 hover:bg-purple-100" };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${cls[color]} disabled:opacity-50`}>
      {children}
    </button>
  );
}

function Flash({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${ok ? "bg-green-600" : "bg-red-600"}`}>
      {ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 card-shadow flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: color + "18" }}>
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ── Edit mentor modal ── */
function EditMentorModal({ mentor, onClose, onSave }: {
  mentor: Mentor; onClose: () => void; onSave: (d: Partial<Mentor>) => Promise<void>;
}) {
  const [form, setForm] = useState({ nom: mentor.nom, email: mentor.email, specialite: mentor.specialite ?? "" });
  const [saving, setSaving] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await onSave({ nom: form.nom, email: form.email, specialite: form.specialite || null });
    setSaving(false);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md card-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Modifier le mentor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {(["nom", "email", "specialite"] as const).map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">{field === "specialite" ? "Spécialité" : field === "nom" ? "Nom complet" : "Email"}</label>
              <input type={field === "email" ? "email" : "text"} required={field !== "specialite"} value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [email, setEmail]     = useState("");
  const [pwd, setPwd]         = useState("");
  const [authErr, setAuthErr] = useState("");

  const [mentors,    setMentors]    = useState<Mentor[]>([]);
  const [mentees,    setMentees]    = useState<Mentee[]>([]);
  const [matchings,  setMatchings]  = useState<AIMatching[]>([]);
  const [connexions, setConnexions] = useState<Connexion[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [fetchErr,   setFetchErr]   = useState<string | null>(null);

  const [flash,       setFlash]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [mentorFilter, setMentorFilter] = useState("all");
  const [editMentor,   setEditMentor]   = useState<Mentor | null>(null);

  function showFlash(msg: string, ok = true) {
    setFlash({ msg, ok });
    setTimeout(() => setFlash(null), 3500);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL && pwd === ADMIN_PASSWORD) { setAuthed(true); setAuthErr(""); }
    else setAuthErr("Email ou mot de passe incorrect.");
  }

  const fetchData = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        supabase.from("mentors").select("*").order("created_at", { ascending: false }),
        supabase.from("mentees").select("*").order("created_at", { ascending: false }),
        supabase.from("ai_matchings").select("*").order("created_at", { ascending: false }),
        supabase.from("connexions").select("*, mentors(nom,email), mentees(nom,email)").order("created_at", { ascending: false }),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      if (r4.error) throw r4.error;
      setMentors((r1.data as Mentor[]) ?? []);
      setMentees((r2.data as Mentee[]) ?? []);
      setMatchings(r3.error ? [] : ((r3.data as AIMatching[]) ?? []));
      setConnexions((r4.data as Connexion[]) ?? []);
    } catch (err: unknown) {
      setFetchErr(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  async function act(call: Promise<{ error: unknown }>, msg: string) {
    const { error } = await call;
    if (error) showFlash("Erreur : " + String(error), false);
    else { showFlash(msg); fetchData(); }
  }

  /* ── Login ── */
  if (!authed) {
    return (
      <div className="min-h-screen gradient-bg-soft flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin GrowVia</h1>
            <p className="text-gray-500 text-sm">Accès réservé à l&apos;équipe interne</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 card-shadow space-y-4">
            {authErr && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {authErr}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)}
                placeholder="growviaconnect@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input type="password" required value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
            </div>
            <button type="submit" className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              Accéder au dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Dashboard ── */
  const activeMembers = [...mentors, ...mentees].filter(m => m.actif !== false).length;
  const filteredMentors = mentorFilter === "all" ? mentors : mentors.filter(m => m.statut === mentorFilter);

  return (
    <div className="min-h-screen bg-[#F3F1FF]">
      {flash && <Flash msg={flash.msg} ok={flash.ok} />}
      {editMentor && (
        <EditMentorModal mentor={editMentor} onClose={() => setEditMentor(null)}
          onSave={async data => {
            await act(supabase.from("mentors").update(data).eq("id", editMentor.id), "Mentor mis à jour ✓");
            setEditMentor(null);
          }} />
      )}

      {/* Header */}
      <div className="bg-[#1B1F3B] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <h1 className="text-xl font-bold text-white">Dashboard Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} disabled={loading}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Actualiser
          </button>
          <button onClick={() => { setAuthed(false); setEmail(""); setPwd(""); }}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">

        {/* Error */}
        {fetchErr && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Erreur base de données</p>
              <p>{fetchErr}</p>
            </div>
          </div>
        )}

        {loading && !fetchErr ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <StatCard icon={UserCheck} label="Mentors inscrits"             value={mentors.length}                                       color="#5B3DF5" />
              <StatCard icon={Users}     label="Mentées inscrites"             value={mentees.length}                                       color="#7C5CFF" />
              <StatCard icon={Cpu}       label="Matchings AI réalisés"         value={matchings.length}                                     color="#5B3DF5" />
              <StatCard icon={Link2}     label="Connexions en attente"         value={connexions.filter(c => c.statut === "pending").length}  color="#7C5CFF" />
              <StatCard icon={Activity}  label="Membres actifs"                value={activeMembers}                                        color="#5B3DF5" />
              <StatCard icon={UserCheck} label="Mentors certifiés"             value={mentors.filter(m => m.certification_statut === "certified").length} color="#7C5CFF" />
            </div>

            {/* ── Section Mentors ── */}
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              <div className="px-6 py-5 flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-base font-bold text-gray-900">Gestion des mentors</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Filters */}
                  <div className="flex gap-1.5">
                    {["all", "pending", "active", "rejected"].map(f => (
                      <button key={f} onClick={() => setMentorFilter(f)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${mentorFilter === f ? "gradient-bg text-white" : "bg-gray-100 text-gray-600 hover:bg-purple-50"}`}>
                        {f === "all" ? "Tous" : f}
                      </button>
                    ))}
                  </div>
                  {/* Export */}
                  <button
                    onClick={() => exportCSV(filteredMentors.map(m => ({ nom: m.nom, email: m.email, specialite: m.specialite ?? "", statut: m.statut, certification: m.certification_statut ?? "", inscrit_le: m.created_at })), "mentors.csv")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-100 hover:bg-purple-50 text-gray-600 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" /> Exporter CSV
                  </button>
                </div>
              </div>

              {filteredMentors.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">Aucun mentor trouvé.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                        <th className="px-6 py-3 font-semibold">Nom</th>
                        <th className="px-6 py-3 font-semibold">Email</th>
                        <th className="px-6 py-3 font-semibold">Spécialité</th>
                        <th className="px-6 py-3 font-semibold">Statut</th>
                        <th className="px-6 py-3 font-semibold">Inscrit le</th>
                        <th className="px-6 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredMentors.map(m => (
                        <tr key={m.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap">{m.nom}</td>
                          <td className="px-6 py-3 text-gray-500 text-xs">{m.email}</td>
                          <td className="px-6 py-3 text-gray-500 text-xs">{m.specialite ?? "—"}</td>
                          <td className="px-6 py-3"><Badge s={m.statut} /></td>
                          <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(m.created_at)}</td>
                          <td className="px-6 py-3">
                            <div className="flex gap-1.5 flex-wrap">
                              {m.statut === "pending" && (
                                <>
                                  <ActionBtn color="green" onClick={() => act(supabase.from("mentors").update({ statut: "active" }).eq("id", m.id), "Mentor accepté ✓")}>Accepter</ActionBtn>
                                  <ActionBtn color="red"   onClick={() => act(supabase.from("mentors").update({ statut: "rejected" }).eq("id", m.id), "Mentor rejeté")}>Rejeter</ActionBtn>
                                </>
                              )}
                              {m.statut === "active" && (
                                <ActionBtn color="red" onClick={() => act(supabase.from("mentors").update({ statut: "rejected" }).eq("id", m.id), "Mentor rejeté")}>Rejeter</ActionBtn>
                              )}
                              {m.statut === "rejected" && (
                                <ActionBtn color="green" onClick={() => act(supabase.from("mentors").update({ statut: "active" }).eq("id", m.id), "Mentor réactivé ✓")}>Réactiver</ActionBtn>
                              )}
                              <ActionBtn color="purple" onClick={() => setEditMentor(m)}>
                                <span className="inline-flex items-center gap-1"><Edit2 className="w-3 h-3" /> Modifier</span>
                              </ActionBtn>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
