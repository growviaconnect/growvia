"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase, type Mentor, type Mentee, type Connexion } from "@/lib/supabase";
import { Users, UserCheck, Link2, Lock, ArrowRight, RefreshCw, Loader2, AlertCircle } from "lucide-react";

const ADMIN_PASSWORD = "growvia2026";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 card-shadow flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: color + "15" }}>
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
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword]           = useState("");
  const [authError, setAuthError]         = useState("");

  const [mentors,    setMentors]    = useState<Mentor[]>([]);
  const [mentees,    setMentees]    = useState<Mentee[]>([]);
  const [connexions, setConnexions] = useState<Connexion[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password.");
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [{ data: m, error: e1 }, { data: mt, error: e2 }, { data: cx, error: e3 }] =
        await Promise.all([
          supabase.from("mentors").select("*").order("created_at", { ascending: false }),
          supabase.from("mentees").select("*").order("created_at", { ascending: false }),
          supabase
            .from("connexions")
            .select("*, mentors(nom, email), mentees(nom, email)")
            .order("date", { ascending: false })
            .limit(10),
        ]);

      if (e1 || e2 || e3) throw e1 ?? e2 ?? e3;
      setMentors(m ?? []);
      setMentees(mt ?? []);
      setConnexions(cx ?? []);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Failed to load data. Make sure the database tables are created.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, fetchData]);

  /* ── Login screen ── */
  if (!authenticated) {
    return (
      <div className="min-h-screen gradient-bg-soft flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Access</h1>
            <p className="text-gray-500 text-sm">GrowVia internal dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 card-shadow space-y-4">
            {authError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {authError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Access Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Dashboard ── */
  return (
    <div className="min-h-screen bg-purple-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="text-purple-600 text-sm hover:text-purple-800 mb-2 inline-block">← Back to site</Link>
            <h1 className="text-3xl font-extrabold text-gray-900">GrowVia Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time overview of registrations and activity</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 gradient-bg text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl mb-8 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Database error</p>
              <p>{fetchError}</p>
              <p className="mt-2 text-red-500">
                Make sure you have run <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-xs">supabase/001_initial.sql</code> in the{" "}
                <a href="https://supabase.com/dashboard/project/txpibvjktfltowjmvvmg/sql" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase SQL Editor</a>.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {loading && !fetchError ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              <StatCard icon={UserCheck} label="Mentors registered" value={mentors.length} color="#5B3DF5" />
              <StatCard icon={Users}     label="Mentees registered"  value={mentees.length}  color="#7C5CFF" />
              <StatCard icon={Link2}     label="Connection requests" value={connexions.length} color="#1B1F3B" />
            </div>

            {/* Latest mentors */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h2 className="text-base font-bold text-gray-900 mb-4">Latest Mentors</h2>
                {mentors.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No mentors yet.</p>
                ) : (
                  <div className="space-y-3">
                    {mentors.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{m.nom}</p>
                          <p className="text-xs text-gray-400">{m.email} · {m.specialite ?? "—"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            m.statut === "active"   ? "bg-green-50 text-green-700" :
                            m.statut === "rejected" ? "bg-red-50 text-red-700"    :
                            "bg-purple-50 text-purple-700"
                          }`}>
                            {m.statut}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(m.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Latest mentees */}
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h2 className="text-base font-bold text-gray-900 mb-4">Latest Mentees</h2>
                {mentees.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No mentees yet.</p>
                ) : (
                  <div className="space-y-3">
                    {mentees.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{m.nom}</p>
                          <p className="text-xs text-gray-400">{m.email} · {m.objectif ?? "—"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            m.statut === "active"   ? "bg-green-50 text-green-700" :
                            m.statut === "rejected" ? "bg-red-50 text-red-700"    :
                            "bg-purple-50 text-purple-700"
                          }`}>
                            {m.statut}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(m.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Connection requests */}
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h2 className="text-base font-bold text-gray-900 mb-4">Latest Connection Requests</h2>
              {connexions.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No connection requests yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                        <th className="pb-3 font-semibold">Mentor</th>
                        <th className="pb-3 font-semibold">Mentee</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {connexions.map((cx) => (
                        <tr key={cx.id}>
                          <td className="py-3 text-gray-700">{cx.mentors?.nom ?? "—"}</td>
                          <td className="py-3 text-gray-700">{cx.mentees?.nom ?? "—"}</td>
                          <td className="py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              cx.statut === "active"    ? "bg-green-50 text-green-700"  :
                              cx.statut === "completed" ? "bg-blue-50 text-blue-700"    :
                              cx.statut === "cancelled" ? "bg-red-50 text-red-700"      :
                              "bg-purple-50 text-purple-700"
                            }`}>
                              {cx.statut}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">{formatDate(cx.date)}</td>
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
