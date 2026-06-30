"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Lock, ArrowRight, AlertCircle, LogOut, RefreshCw, Loader2,
  Users, UserCheck, Cpu, CalendarClock, CalendarCheck2, CalendarX2, ChevronRight, ChevronDown,
} from "lucide-react";
import { supabase, type Mentor, type Mentee } from "@/lib/supabase";

type AIMatchResponse = {
  id:              string;
  user_id:         string | null;
  full_name:       string | null;
  role:            string | null;
  industry:        string | null;
  attempt_number:  number | null;
  match_results:   unknown;
  created_at:      string;
};

type SessionRow = {
  id:                string;
  mentor_id:         string | null;
  mentee_id:         string | null;
  topic:             string | null;
  date:              string | null;          // YYYY-MM-DD
  time:              string | null;          // HH:MM:SS
  duration_minutes:  number | null;
  status:            string | null;
  meet_link:         string | null;
  mentee_email:      string | null;
  language:          string | null;
  price_cents:       number | null;
  stripe_session_id: string | null;
  payment_intent_id: string | null;
  created_at:        string | null;
  mentors?:          { nom: string; email: string } | null;
  mentees?:          { nom: string; email: string } | null;
};

type MenteeSubscription = {
  id:                     string;
  mentee_id:              string;
  plan:                   string;             // "basic" | "standard" | "premium" | ...
  status:                 string | null;      // "active" | "trialing" | "canceled" | ...
  stripe_customer_id:     string | null;
  stripe_subscription_id: string | null;
  current_period_end:     string | null;
  created_at:             string | null;
};
import { isAdminEmail, adminDisplayName } from "@/lib/admin-auth";

/* ── helpers ─────────────────────────────────────────────────────────────── */

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function statusLabel(s: string | null | undefined) {
  return (s ?? "—").replace(/_/g, " ");
}

/* ── Stat card ───────────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon, label, value, accent, newCount, onClick, expanded,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
  newCount?: number;
  onClick?: () => void;
  expanded?: boolean;
}) {
  const clickable = !!onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`relative w-full text-left rounded-2xl p-6 transition-all ${clickable ? "hover:bg-white/[0.04] hover:border-white/15 cursor-pointer" : "cursor-default"}`}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center gap-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}1f`, border: `1px solid ${accent}33` }}
        >
          <Icon className="w-7 h-7" style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-extrabold text-white">{value}</p>
            {!!newCount && newCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: "#EF4444" }}>
                +{newCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-white/50 mt-0.5">{label}</p>
        </div>
        {clickable && (
          <div className="text-white/30 flex-shrink-0">
            {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        )}
      </div>
    </button>
  );
}

/* ── Sub-stat (sessions) ─────────────────────────────────────────────────── */

function SubStat({
  icon: Icon, label, value, accent, active, onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 min-w-[140px] rounded-xl p-4 text-left transition-all hover:bg-white/[0.04]"
      style={{
        background: active ? "rgba(124,58,237,0.10)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? "rgba(124,58,237,0.40)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-4 h-4" style={{ color: accent }} />
        <span className="text-xs font-semibold uppercase tracking-wider text-white/45">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-white">{value}</p>
    </button>
  );
}

/* ── Data table ──────────────────────────────────────────────────────────── */

function DataTable({
  columns, rows, empty,
}: {
  columns: { key: string; label: string }[];
  rows: Record<string, React.ReactNode>[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-white/40 text-center py-10">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] text-white/40 uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.03)" }}>
            {columns.map(c => (
              <th key={c.key} className="px-5 py-3 font-semibold">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
              {columns.map(c => (
                <td key={c.key} className="px-5 py-3 text-white/75 whitespace-nowrap">{r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Plan helpers ────────────────────────────────────────────────────────── */

const PLAN_STYLES: Record<string, { bg: string; fg: string; border: string }> = {
  free:      { bg: "rgba(148,163,184,0.12)", fg: "#94A3B8", border: "rgba(148,163,184,0.30)" },
  basic:     { bg: "rgba(124,58,237,0.12)",  fg: "#A78BFA", border: "rgba(124,58,237,0.30)" },
  standard:  { bg: "rgba(167,139,250,0.16)", fg: "#C4B5FD", border: "rgba(167,139,250,0.40)" },
  premium:   { bg: "rgba(240,171,252,0.14)", fg: "#F0ABFC", border: "rgba(240,171,252,0.40)" },
};

function planKey(plan: string | null | undefined): keyof typeof PLAN_STYLES {
  const p = (plan ?? "").toLowerCase();
  if (p === "basic" || p === "standard" || p === "premium") return p;
  return "free";
}

function PlanBadge({ plan }: { plan: string | null | undefined }) {
  const key = planKey(plan);
  const s = PLAN_STYLES[key];
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 999,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      background: s.bg, color: s.fg, border: `1px solid ${s.border}`,
    }}>{label}</span>
  );
}

type Subscription = {
  mentee_id: string;
  plan: string;
  status: string | null;
  created_at: string | null;
  current_period_end: string | null;
};

/**
 * Returns the active plan for `menteeId` at a given moment.
 * If `atIso` is omitted, uses "now".
 * Falls back to "free" when no subscription matches.
 */
function planFor(
  menteeId: string | null | undefined,
  subs: Subscription[],
  atIso?: string | null,
): string {
  if (!menteeId) return "free";
  const at = atIso ? new Date(atIso).getTime() : Date.now();
  const candidates = subs
    .filter(s => s.mentee_id === menteeId)
    .filter(s => {
      const status = (s.status ?? "").toLowerCase();
      return status === "active" || status === "trialing" || status === "past_due";
    })
    .filter(s => {
      const startMs = s.created_at ? new Date(s.created_at).getTime() : 0;
      const endMs   = s.current_period_end ? new Date(s.current_period_end).getTime() : Number.POSITIVE_INFINITY;
      return startMs <= at && at <= endMs;
    })
    .sort((a, b) => (new Date(b.created_at ?? 0).getTime()) - (new Date(a.created_at ?? 0).getTime()));
  return candidates[0]?.plan ?? "free";
}

/** Classify session billing: Discovery (free, no plan), Included (free, in-plan), Paid (€X). */
function sessionBilling(s: { price_cents: number | null }, plan: string): { label: string; price: string; color: string } {
  const cents = s.price_cents ?? 0;
  if (cents > 0) {
    return { label: "Paid",      price: `€${(cents / 100).toFixed(2)}`, color: "#FBBF24" };
  }
  if (planKey(plan) !== "free") {
    return { label: "Included",  price: "€0.00",                         color: "#A78BFA" };
  }
  return   { label: "Discovery", price: "Free",                          color: "#34D399" };
}

function BillingBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 999,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      background: `${color}1f`, color, border: `1px solid ${color}55`,
    }}>{label}</span>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */

type DrillView = null | "mentors" | "mentees" | "matchings" |
                 "sessions_upcoming" | "sessions_pending" | "sessions_past";

export default function AdminPage() {
  // Auth state
  const [bootstrapped, setBootstrapped] = useState(false);
  const [authedEmail, setAuthedEmail]   = useState<string | null>(null);
  const [loginEmail, setLoginEmail]     = useState("");
  const [loginPwd, setLoginPwd]         = useState("");
  const [authErr, setAuthErr]           = useState("");
  const [authBusy, setAuthBusy]         = useState(false);

  // Forgot-password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [forgotBusy, setForgotBusy] = useState(false);

  // Dashboard data
  const [loading, setLoading]       = useState(false);
  const [fetchErr, setFetchErr]     = useState<string | null>(null);
  const [mentors, setMentors]       = useState<Mentor[]>([]);
  const [mentees, setMentees]       = useState<Mentee[]>([]);
  const [matchings, setMatchings]   = useState<AIMatchResponse[]>([]);
  const [sessions, setSessions]     = useState<SessionRow[]>([]);
  const [subs, setSubs]             = useState<MenteeSubscription[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);

  // UI state
  const [drill, setDrill] = useState<DrillView>(null);

  /* ── Restore Supabase session on mount ── */
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const email = session?.user?.email?.toLowerCase() ?? null;
      if (email && isAdminEmail(email)) {
        setAuthedEmail(email);
      } else if (session) {
        supabase.auth.signOut();
      }
      setBootstrapped(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email?.toLowerCase() ?? null;
      if (email && isAdminEmail(email)) {
        setAuthedEmail(email);
      } else {
        setAuthedEmail(null);
      }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  /* ── Fetch dashboard data + record visit ── */
  const fetchData = useCallback(async (email: string) => {
    setLoading(true); setFetchErr(null);
    try {
      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        supabase.from("mentors").select("*").order("created_at", { ascending: false }),
        supabase.from("mentees").select("*").order("created_at", { ascending: false }),
        supabase.from("ai_matching_responses").select("id, user_id, full_name, role, industry, attempt_number, match_results, created_at").order("created_at", { ascending: false }),
        supabase.from("sessions").select("*, mentors(nom,email), mentees(nom,email)").order("date", { ascending: false }),
        supabase.from("mentee_subscriptions").select("*").order("created_at", { ascending: false }),
        supabase.from("admin_visits").select("last_seen_at").eq("email", email).maybeSingle(),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      if (r3.error) throw r3.error;
      if (r4.error) throw r4.error;
      if (r5.error) throw r5.error;
      setMentors((r1.data as Mentor[]) ?? []);
      setMentees((r2.data as Mentee[]) ?? []);
      setMatchings((r3.data as AIMatchResponse[]) ?? []);
      setSessions((r4.data as SessionRow[]) ?? []);
      setSubs((r5.data as MenteeSubscription[]) ?? []);
      const prevLastSeen = (r6.data as { last_seen_at: string } | null)?.last_seen_at ?? null;
      setLastSeenAt(prevLastSeen);

      // Upsert current visit timestamp (best-effort; never blocks the page)
      const nowIso = new Date().toISOString();
      supabase
        .from("admin_visits")
        .upsert({ email, last_seen_at: nowIso }, { onConflict: "email" })
        .then(({ error }) => { if (error) console.error("[admin] visit upsert failed:", error); });
    } catch (err: unknown) {
      setFetchErr(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authedEmail) fetchData(authedEmail);
  }, [authedEmail, fetchData]);

  /* ── Derived counts ── */
  const counts = useMemo(() => {
    const sinceTs = lastSeenAt ? new Date(lastSeenAt).getTime() : null;
    const isNew = (createdAt: string | null | undefined) =>
      sinceTs && createdAt ? new Date(createdAt).getTime() > sinceTs : false;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const upcoming: SessionRow[] = [];
    const pending:  SessionRow[] = [];
    const past:     SessionRow[] = [];
    for (const s of sessions) {
      const st = (s.status ?? "").toLowerCase();
      const dt = s.date ? new Date(s.date).getTime() : NaN;
      if (st === "pending" || st === "pending_payment" || st === "rescheduled") {
        pending.push(s);
      } else if (st === "completed" || st === "cancelled" || st === "canceled" || st === "refunded") {
        past.push(s);
      } else if (!Number.isNaN(dt) && dt < todayMs) {
        past.push(s);
      } else {
        upcoming.push(s);
      }
    }

    return {
      mentorsTotal:    mentors.length,
      mentorsNew:      mentors.filter(m => isNew(m.created_at)).length,
      menteesTotal:    mentees.length,
      menteesNew:      mentees.filter(m => isNew(m.created_at)).length,
      matchingsTotal:  matchings.length,
      matchingsNew:    matchings.filter(m => isNew(m.created_at)).length,
      sessionsUpcoming: upcoming.length,
      sessionsPending:  pending.length,
      sessionsPast:     past.length,
      lists: { upcoming, pending, past },
    };
  }, [mentors, mentees, matchings, sessions, lastSeenAt]);

  /* ── Handlers ── */
  function toggleDrill(view: DrillView) {
    setDrill(prev => (prev === view ? null : view));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthErr(""); setAuthBusy(true);
    try {
      const email = loginEmail.trim().toLowerCase();
      if (!isAdminEmail(email)) {
        setAuthErr("Access denied. This account is not authorized.");
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: loginPwd });
      if (error || !data.session) {
        setAuthErr(error?.message ?? "Sign-in failed.");
        return;
      }
      const sessEmail = data.session.user.email?.toLowerCase() ?? "";
      if (!isAdminEmail(sessEmail)) {
        await supabase.auth.signOut();
        setAuthErr("Access denied. This account is not authorized.");
        return;
      }
      setAuthedEmail(sessEmail);
      setLoginPwd("");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAuthedEmail(null);
    setDrill(null);
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotMsg(null); setForgotBusy(true);
    try {
      const email = forgotEmail.trim().toLowerCase();
      if (!isAdminEmail(email)) {
        setForgotMsg({ ok: false, text: "This email isn't authorized for the admin dashboard." });
        return;
      }
      const redirectTo = `${window.location.origin}/admin/reset-password`;
      console.log("[admin/forgot] calling resetPasswordForEmail", { email, redirectTo });
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      console.log("[admin/forgot] response", { data, error });
      if (error) {
        setForgotMsg({ ok: false, text: `${error.message} (status ${error.status ?? "?"})` });
        return;
      }
      setForgotMsg({
        ok: true,
        text: `Request accepted by Supabase. Check ${email} (and the spam folder) within 1–2 minutes. Reset link will redirect to ${redirectTo}.`,
      });
    } catch (err: unknown) {
      console.error("[admin/forgot] threw:", err);
      setForgotMsg({ ok: false, text: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setForgotBusy(false);
    }
  }

  /* ── Loading bootstrap ── */
  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D0A1A" }}>
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  /* ── Login screen ── */
  if (!authedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0D0A1A" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                 style={{ background: "linear-gradient(135deg,#7C3AED,#A78BFA)" }}>
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Founders Dashboard</h1>
            <p className="text-white/40 text-sm">Authorized access only</p>
          </div>

          {showForgot ? (
            <form onSubmit={handleForgot} className="rounded-2xl p-7 space-y-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-sm text-white/60">Enter your email and we&apos;ll send you a reset link.</p>
              {forgotMsg && (
                <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs ${forgotMsg.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {forgotMsg.text}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
                <input type="email" required autoFocus value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <button type="submit" disabled={forgotBusy}
                className="w-full font-semibold py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "#7C3AED" }}>
                {forgotBusy && <Loader2 className="w-4 h-4 animate-spin" />} Send reset link
              </button>
              <button type="button" onClick={() => { setShowForgot(false); setForgotMsg(null); }}
                className="w-full text-xs text-white/50 hover:text-white/80 transition-colors">
                Back to sign-in
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="rounded-2xl p-7 space-y-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {authErr && (
                <div className="flex items-center gap-2 text-red-300 bg-red-500/10 px-3 py-2.5 rounded-lg text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {authErr}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
                <input type="email" required autoFocus value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
                <input type="password" required value={loginPwd}
                  onChange={e => setLoginPwd(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <button type="submit" disabled={authBusy}
                className="w-full font-semibold py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
                style={{ background: "#7C3AED" }}>
                {authBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign in <ArrowRight className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(loginEmail); }}
                className="w-full text-xs text-white/50 hover:text-white/80 transition-colors">
                Forgot password?
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  /* ── Dashboard ── */
  const displayName = adminDisplayName(authedEmail);

  /* Drill-down rows */
  function topScore(mr: unknown): string {
    if (!Array.isArray(mr) || mr.length === 0) return "—";
    const scores = mr
      .map(x => (typeof x === "object" && x !== null && "score" in x ? (x as { score: unknown }).score : null))
      .filter((s): s is number => typeof s === "number");
    if (scores.length === 0) return "—";
    return `${Math.round(Math.max(...scores))}%`;
  }
  function matchCount(mr: unknown): string {
    return Array.isArray(mr) ? String(mr.length) : "0";
  }
  const matchingRows = matchings.map(m => {
    // user_id on ai_matching_responses maps to auth.users.id; in this app that's also mentees.id.
    const planAtMatch = planFor(m.user_id, subs, m.created_at);
    return {
      user:     m.full_name ?? "—",
      plan:     <PlanBadge plan={planAtMatch} />,
      role:     m.role ?? "—",
      industry: m.industry ?? "—",
      attempt:  m.attempt_number ?? 1,
      matches:  matchCount(m.match_results),
      top:      topScore(m.match_results),
      created:  formatDate(m.created_at),
    };
  });

  function sessionDateTime(s: SessionRow): string {
    if (!s.date) return "—";
    const dateStr = new Date(s.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    return s.time ? `${dateStr} · ${s.time.slice(0, 5)}` : dateStr;
  }

  function sessionRows(list: SessionRow[]) {
    return list.map(s => {
      const plan = planFor(s.mentee_id, subs, s.created_at);
      const bill = sessionBilling(s, plan);
      return {
        mentor:   s.mentors?.nom ?? "—",
        mentee:   s.mentees?.nom ?? s.mentee_email ?? "—",
        plan:     <PlanBadge plan={plan} />,
        type:     <BillingBadge label={bill.label} color={bill.color} />,
        price:    bill.price,
        date:     sessionDateTime(s),
        duration: s.duration_minutes != null ? `${s.duration_minutes} min` : "—",
        status:   statusLabel(s.status),
      };
    });
  }

  const mentorRows = mentors.map(m => ({
    name:    m.nom,
    email:   m.email,
    status:  statusLabel(m.statut),
    joined:  formatDate(m.created_at),
  }));

  const menteeRows = mentees.map(m => {
    const plan = planFor(m.id, subs);
    const sub  = subs.find(s => s.mentee_id === m.id);
    return {
      name:        m.nom,
      email:       m.email,
      plan:        <PlanBadge plan={plan} />,
      sub_status:  sub?.status ?? (plan === "free" ? "—" : "—"),
      sub_since:   sub?.created_at ? formatDate(sub.created_at) : "—",
      status:      statusLabel(m.statut),
      joined:      formatDate(m.created_at),
    };
  });

  return (
    <div className="min-h-screen" style={{ background: "#0D0A1A" }}>
      {/* Top bar */}
      <div className="px-6 lg:px-8 py-5 flex items-center justify-between flex-wrap gap-3"
           style={{ background: "#13111F", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: "linear-gradient(135deg,#7C3AED,#A78BFA)" }}>
            <span className="text-white font-extrabold text-sm">G</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Founders Dashboard</h1>
            <p className="text-[11px] text-white/40 leading-tight">Signed in as {displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => authedEmail && fetchData(authedEmail)} disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50 hover:bg-white/15"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Refresh
          </button>
          <Link href="/" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-semibold hover:bg-white/15"
                style={{ background: "rgba(255,255,255,0.08)" }}>
            View site
          </Link>
          <button onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-semibold hover:bg-white/15"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        {fetchErr && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-2xl text-sm text-red-200"
               style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Data load error</p>
              <p>{fetchErr}</p>
            </div>
          </div>
        )}

        {/* Section heading */}
        <div className="pt-2">
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-[#A78BFA] mb-2">Overview</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Welcome back, {displayName.split(" ")[0]} 👋</h2>
          {lastSeenAt && (
            <p className="text-xs text-white/40 mt-2">Last visit: {formatDate(lastSeenAt)}</p>
          )}
        </div>

        {/* Top-level cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            icon={UserCheck}
            label="Mentors registered"
            value={counts.mentorsTotal}
            accent="#A78BFA"
            newCount={counts.mentorsNew}
            onClick={() => toggleDrill("mentors")}
            expanded={drill === "mentors"}
          />
          <StatCard
            icon={Users}
            label="Mentees registered"
            value={counts.menteesTotal}
            accent="#F0ABFC"
            newCount={counts.menteesNew}
            onClick={() => toggleDrill("mentees")}
            expanded={drill === "mentees"}
          />
        </div>

        {/* Drill-down for mentors/mentees */}
        {drill === "mentors" && (
          <div className="rounded-2xl p-4 md:p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <DataTable
              columns={[
                { key: "name",   label: "Name" },
                { key: "email",  label: "Email" },
                { key: "status", label: "Status" },
                { key: "joined", label: "Joined" },
              ]}
              rows={mentorRows}
              empty="No mentors yet."
            />
          </div>
        )}
        {drill === "mentees" && (
          <div className="rounded-2xl p-4 md:p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <DataTable
              columns={[
                { key: "name",       label: "Name" },
                { key: "email",      label: "Email" },
                { key: "plan",       label: "Plan" },
                { key: "sub_status", label: "Subscription" },
                { key: "sub_since",  label: "Since" },
                { key: "status",     label: "Account" },
                { key: "joined",     label: "Joined" },
              ]}
              rows={menteeRows}
              empty="No mentees yet."
            />
          </div>
        )}

        {/* Sessions card */}
        <div className="rounded-2xl p-5"
             style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-base font-bold text-white">Sessions</h3>
            <p className="text-xs text-white/40">Click a category to see details</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SubStat icon={CalendarClock}  label="Upcoming" value={counts.sessionsUpcoming} accent="#A78BFA"
                     active={drill === "sessions_upcoming"} onClick={() => toggleDrill("sessions_upcoming")} />
            <SubStat icon={CalendarCheck2} label="Pending"  value={counts.sessionsPending}  accent="#FBBF24"
                     active={drill === "sessions_pending"}  onClick={() => toggleDrill("sessions_pending")} />
            <SubStat icon={CalendarX2}     label="Past"     value={counts.sessionsPast}     accent="#94A3B8"
                     active={drill === "sessions_past"}     onClick={() => toggleDrill("sessions_past")} />
          </div>

          {drill === "sessions_upcoming" && (
            <div className="mt-5">
              <DataTable
                columns={[
                  { key: "mentor",   label: "Mentor" },
                  { key: "mentee",   label: "Mentee" },
                  { key: "plan",     label: "Plan" },
                  { key: "type",     label: "Type" },
                  { key: "price",    label: "Price" },
                  { key: "date",     label: "Date & time" },
                  { key: "duration", label: "Duration" },
                  { key: "status",   label: "Status" },
                ]}
                rows={sessionRows(counts.lists.upcoming)}
                empty="No upcoming sessions."
              />
            </div>
          )}
          {drill === "sessions_pending" && (
            <div className="mt-5">
              <DataTable
                columns={[
                  { key: "mentor",   label: "Mentor" },
                  { key: "mentee",   label: "Mentee" },
                  { key: "plan",     label: "Plan" },
                  { key: "type",     label: "Type" },
                  { key: "price",    label: "Price" },
                  { key: "date",     label: "Date & time" },
                  { key: "duration", label: "Duration" },
                  { key: "status",   label: "Status" },
                ]}
                rows={sessionRows(counts.lists.pending)}
                empty="No pending sessions."
              />
            </div>
          )}
          {drill === "sessions_past" && (
            <div className="mt-5">
              <DataTable
                columns={[
                  { key: "mentor",   label: "Mentor" },
                  { key: "mentee",   label: "Mentee" },
                  { key: "plan",     label: "Plan" },
                  { key: "type",     label: "Type" },
                  { key: "price",    label: "Price" },
                  { key: "date",     label: "Date & time" },
                  { key: "duration", label: "Duration" },
                  { key: "status",   label: "Status" },
                ]}
                rows={sessionRows(counts.lists.past)}
                empty="No past sessions."
              />
            </div>
          )}
        </div>

        {/* AI matchings card */}
        <StatCard
          icon={Cpu}
          label="AI matchings"
          value={counts.matchingsTotal}
          accent="#C4B5FD"
          newCount={counts.matchingsNew}
          onClick={() => toggleDrill("matchings")}
          expanded={drill === "matchings"}
        />
        {drill === "matchings" && (
          <div className="rounded-2xl p-4 md:p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <DataTable
              columns={[
                { key: "user",     label: "User" },
                { key: "plan",     label: "Plan (at match)" },
                { key: "role",     label: "Role" },
                { key: "industry", label: "Industry" },
                { key: "attempt",  label: "Attempt #" },
                { key: "matches",  label: "Matches" },
                { key: "top",      label: "Top score" },
                { key: "created",  label: "Created" },
              ]}
              rows={matchingRows}
              empty="No AI matchings yet."
            />
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-6 text-white/30">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        <div className="h-12" />
      </div>
    </div>
  );
}
