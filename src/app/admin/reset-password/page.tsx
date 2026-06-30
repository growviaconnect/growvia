"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, ArrowRight, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin-auth";

export default function AdminResetPasswordPage() {
  const [ready, setReady]       = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [err, setErr]           = useState("");
  const [done, setDone]         = useState(false);
  const [busy, setBusy]         = useState(false);

  useEffect(() => {
    // When a user clicks the magic link, Supabase signs them in with a
    // recovery session. We just need to verify there's a session and the
    // email is on the admin whitelist.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email?.toLowerCase() ?? null;
      setAuthorized(!!email && isAdminEmail(email));
      setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setDone(true);
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D0A1A" }}>
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0D0A1A" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style={{ background: "linear-gradient(135deg,#7C3AED,#A78BFA)" }}>
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Reset your password</h1>
          <p className="text-white/40 text-sm">Choose a new password for your admin account</p>
        </div>

        {!authorized ? (
          <div className="rounded-2xl p-7 text-center space-y-4"
               style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-white/70">
              This reset link is invalid or has expired. Please request a new one from the sign-in page.
            </p>
            <Link href="/admin"
              className="inline-flex items-center justify-center gap-2 w-full font-semibold py-3 rounded-xl text-white text-sm hover:opacity-90"
              style={{ background: "#7C3AED" }}>
              Back to sign-in
            </Link>
          </div>
        ) : done ? (
          <div className="rounded-2xl p-7 text-center space-y-4"
               style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm text-white/70">Password updated. You can now access the dashboard.</p>
            <Link href="/admin"
              className="inline-flex items-center justify-center gap-2 w-full font-semibold py-3 rounded-xl text-white text-sm hover:opacity-90"
              style={{ background: "#7C3AED" }}>
              Open dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl p-7 space-y-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {err && (
              <div className="flex items-center gap-2 text-red-300 bg-red-500/10 px-3 py-2.5 rounded-lg text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {err}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">New password</label>
              <input type="password" required value={password} autoFocus
                onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Confirm password</label>
              <input type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <button type="submit" disabled={busy}
              className="w-full font-semibold py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
              style={{ background: "#7C3AED" }}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
