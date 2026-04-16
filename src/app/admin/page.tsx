"use client";

import { useState } from "react";
import { Lock, ArrowRight, AlertCircle, LogOut } from "lucide-react";

const ADMIN_EMAIL    = "growviaconnect@gmail.com";
const ADMIN_PASSWORD = "growvia2026";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail]   = useState("");
  const [pwd, setPwd]       = useState("");
  const [authErr, setAuthErr] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL && pwd === ADMIN_PASSWORD) {
      setAuthed(true);
      setAuthErr("");
    } else {
      setAuthErr("Email ou mot de passe incorrect.");
    }
  }

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
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {authErr}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="growviaconnect@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input
                type="password"
                required
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Accéder au dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F1FF] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Dashboard Admin</h1>
      <button
        onClick={() => { setAuthed(false); setEmail(""); setPwd(""); }}
        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </button>
    </div>
  );
}
