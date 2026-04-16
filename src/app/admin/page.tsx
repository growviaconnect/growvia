"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, ArrowRight, AlertCircle, LogOut, RefreshCw, Loader2, Users, UserCheck, Cpu, Link2, Activity } from "lucide-react";
import { supabase, type Mentor, type Mentee, type AIMatching, type Connexion } from "@/lib/supabase";

const ADMIN_EMAIL    = "growviaconnect@gmail.com";
const ADMIN_PASSWORD = "growvia2026";

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
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

export default function AdminPage() {
  const [authed, setAuthed]     = useState(false);
  const [email, setEmail]       = useState("");
  const [pwd, setPwd]           = useState("");
  const [authErr, setAuthErr]   = useState("");

  const [mentors,    setMentors]    = useState<Mentor[]>([]);
  const [mentees,    setMentees]    = useState<Mentee[]>([]);
  const [matchings,  setMatchings]  = useState<AIMatching[]>([]);
  const [connexions, setConnexions] = useState<Connexion[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [fetchErr,   setFetchErr]   = useState<string | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL && pwd === ADMIN_PASSWORD) {
      setAuthed(true);
      setAuthErr("");
    } else {
      setAuthErr("Email ou mot de passe incorrect.");
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchData();
  }, [authed, fetchData]);

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
              <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="growviaconnect@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input type="password" required value={pwd} onChange={(e) => setPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
            </div>
            <button type="submit"
              className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              Accéder au dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Dashboard ── */
  const activeMembers = [
    ...mentors.filter(m => m.actif !== false),
    ...mentees.filter(m => m.actif !== false),
  ].length;

  return (
    <div className="min-h-screen bg-[#F3F1FF]">
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Actualiser
          </button>
          <button onClick={() => { setAuthed(false); setEmail(""); setPwd(""); }}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Error */}
        {fetchErr && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl mb-8 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Erreur base de données</p>
              <p>{fetchErr}</p>
              <p className="mt-2 text-xs text-red-500">
                Vérifiez que les fichiers SQL ont été exécutés dans{" "}
                <a href="https://supabase.com/dashboard/project/txpibvjktfltowjmvvmg/sql" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase SQL Editor</a>.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {loading && !fetchErr ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard icon={UserCheck} label="Mentors inscrits"             value={mentors.length}                                      color="#5B3DF5" />
            <StatCard icon={Users}     label="Mentées inscrites"             value={mentees.length}                                      color="#7C5CFF" />
            <StatCard icon={Cpu}       label="Matchings AI réalisés"         value={matchings.length}                                    color="#5B3DF5" />
            <StatCard icon={Link2}     label="Connexions en attente"         value={connexions.filter(c => c.statut === "pending").length} color="#7C5CFF" />
            <StatCard icon={Activity}  label="Membres actifs (mentors + mentées)" value={activeMembers}                                  color="#5B3DF5" />
            <StatCard icon={UserCheck} label="Mentors certifiés"
              value={mentors.filter(m => m.certification_statut === "certified").length}
              color="#7C5CFF" />
          </div>
        )}
      </div>
    </div>
  );
}
