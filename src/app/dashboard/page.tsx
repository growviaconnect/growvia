"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  clearUserSession,
  getUserSession,
  setUserSession,
  type UserSession,
} from "@/lib/session";
import { clearAuthCookie } from "@/lib/auth";
import {
  CalendarCheck, Heart, Sparkles, User, Clock, Video, Star,
  ChevronRight, TrendingUp, BookOpen, Settings, LogOut, Loader2, RefreshCw,
} from "lucide-react";

type Tab = "overview" | "sessions" | "saved" | "matching";

type Connexion = {
  id: string;
  date: string;
  statut: "pending" | "active" | "completed" | "cancelled";
  mentors: { nom: string; email: string; specialite: string | null } | null;
  mentees: { nom: string; email: string; objectif: string | null } | null;
};

type MatchResult = {
  id: string;
  nom: string;
  job_title: string | null;
  specialite: string | null;
  industry: string | null;
  expertise: string[] | null;
  languages: string[] | null;
  mentor_score: number | null;
  score: number;
};

type MenteeMatchProfile = {
  field: string | null;
  interests: string[] | null;
  main_goal: string | null;
  languages: string[] | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function initials(nom: string) {
  return nom.split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2);
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const tom = new Date(now);
  tom.setDate(tom.getDate() + 1);
  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === tom.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function computeMatchScore(
  profile: MenteeMatchProfile | null,
  mentor: Omit<MatchResult, "score">
): number {
  let raw = 0;

  // Field / industry alignment (0–40)
  if (profile?.field && mentor.industry) {
    const a = profile.field.toLowerCase();
    const b = mentor.industry.toLowerCase();
    if (a === b) raw += 40;
    else if (a.includes(b) || b.includes(a)) raw += 22;
  }

  // Expertise × interests overlap (0–30)
  if (profile?.interests?.length && mentor.expertise?.length) {
    const set = new Set(profile.interests.map((i) => i.toLowerCase()));
    const overlap = mentor.expertise.filter((e) => set.has(e.toLowerCase())).length;
    raw += Math.min(30, overlap * 12);
  }

  // Goal keywords vs specialty + job title (0–20)
  if (profile?.main_goal) {
    const words = profile.main_goal.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 3);
    const haystack = `${mentor.specialite ?? ""} ${mentor.job_title ?? ""}`.toLowerCase();
    const hits = words.filter((w) => haystack.includes(w)).length;
    raw += Math.min(20, hits * 8);
  }

  // Mentor quality bonus (0–10)
  if (mentor.mentor_score != null) raw += (mentor.mentor_score / 100) * 10;

  // Deterministic per-mentor jitter (0–2) so ties don't look uniform
  const jitter = parseInt(mentor.id.replace(/-/g, "").slice(0, 6), 16) % 3;

  // Map raw (0–100) → display range 62–98
  let display = Math.round(62 + (raw / 100) * 36) + jitter;

  // Language match bonus: +3 if mentor speaks a preferred language
  if (profile?.languages?.length && (mentor as MatchResult).languages?.length) {
    const pref = new Set(profile.languages.map((l) => l.toLowerCase()));
    const hit = (mentor as MatchResult).languages!.some((l) => pref.has(l.toLowerCase()));
    if (hit) display += 3;
  }

  return Math.min(98, display);
}

function scoreColor(s: number) {
  if (s >= 85) return "#10B981";
  if (s >= 72) return "#A78BFA";
  return "#F59E0B";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl border border-white/[0.07] ${className}`}
    style={{ background: "rgba(255,255,255,0.04)" }}
  >
    {children}
  </div>
);

function EmptyState({ icon: Icon, title, desc, action }: {
  icon: React.ElementType;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="p-10 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
      >
        <Icon className="w-7 h-7 text-[#A78BFA]" />
      </div>
      <h3 className="font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-white/35 text-sm mb-6 max-w-xs mx-auto leading-relaxed">{desc}</p>
      {action}
    </Card>
  );
}

function SessionCard({ conn, userRole }: { conn: Connexion; userRole: string }) {
  const other = userRole === "mentor" ? conn.mentees : conn.mentors;
  const otherNom = other?.nom ?? "—";
  const otherInfo =
    userRole === "mentor"
      ? (conn.mentees?.objectif ?? "Mentee")
      : (conn.mentors?.specialite ?? "Mentor");
  const isPast = conn.statut === "completed" || new Date(conn.date) < new Date();

  return (
    <Card className="p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{
          background: isPast
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
        }}
      >
        {initials(otherNom)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm">{otherNom}</div>
        <div className="text-xs text-white/35 mt-0.5 truncate">{otherInfo}</div>
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center gap-1 text-xs text-white/35">
            <Clock className="w-3 h-3" />
            {fmtDate(conn.date)} at {fmtTime(conn.date)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isPast && (
          <button className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            <Video className="w-3.5 h-3.5" /> Join
          </button>
        )}
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={
            isPast
              ? { background: "rgba(16,185,129,0.12)", color: "#34d399" }
              : { background: "rgba(124,58,237,0.18)", color: "#A78BFA" }
          }
        >
          {conn.statut}
        </span>
      </div>
    </Card>
  );
}

function MatchCard({ match, rank }: { match: MatchResult; rank: number }) {
  const rankLabel = ["🥇", "🥈", "🥉"][rank] ?? `#${rank + 1}`;
  const subtitle = match.job_title ?? match.specialite ?? match.industry ?? "Mentor";
  const color = scoreColor(match.score);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
          >
            {initials(match.nom)}
          </div>
          <span className="absolute -top-2 -left-2 text-base leading-none">{rankLabel}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm">{match.nom}</div>
          <div className="text-xs text-white/40 mt-0.5 truncate">{subtitle}</div>
          {match.expertise?.length ? (
            <div className="flex flex-wrap gap-1 mt-2">
              {match.expertise.slice(0, 3).map((e) => (
                <span
                  key={e}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(124,58,237,0.12)", color: "#C4B5FD" }}
                >
                  {e}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex-shrink-0 text-right ml-2">
          <div className="text-2xl font-extrabold tabular-nums" style={{ color }}>
            {match.score}%
          </div>
          <div className="text-[10px] text-white/30 mt-0.5 uppercase tracking-wide">match</div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href="/explore"
          className="flex-1 text-center text-xs font-semibold py-2 rounded-lg border border-white/10 hover:border-[#7C3AED]/50 text-white/55 hover:text-white transition-colors"
        >
          View profile
        </Link>
        <Link
          href="/explore"
          className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors"
        >
          Book session
        </Link>
      </div>
    </Card>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  const [tab, setTab]                       = useState<Tab>("overview");
  const [user, setUser]                     = useState<UserSession | null>(null);
  const [connexions, setConnexions]         = useState<Connexion[]>([]);
  const [loading, setLoading]               = useState(true);
  const [planUpgraded, setPlanUpgraded]     = useState<string | null>(null);
  const [welcomeBack, setWelcomeBack]       = useState(false);
  const [hasUsedFreeMatch, setHasUsedFreeMatch] = useState(false);
  const [menteeDbId, setMenteeDbId]         = useState<string | null>(null);
  const [menteeProfile, setMenteeProfile]   = useState<MenteeMatchProfile | null>(null);
  const [matches, setMatches]               = useState<MatchResult[]>([]);
  const [matchLoading, setMatchLoading]     = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [qGoals, setQGoals]                 = useState<string[]>([]);
  const [qField, setQField]                 = useState("");
  const [qLevel, setQLevel]                 = useState("");
  const [qLanguage, setQLanguage]           = useState("");
  const [qFrequency, setQFrequency]         = useState("");
  const [qPriorities, setQPriorities]       = useState<string[]>([]);
  const [qBio, setQBio]                     = useState("");

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const us = getUserSession();
    if (!us) {
      router.push("/auth/login?next=/dashboard");
      return;
    }
    setUser(us);

    // Handle return from Stripe
    const plan = searchParams.get("plan");
    if (plan) {
      const updated = { ...us, plan: plan as "free" | "pro" | "school" };
      setUserSession(updated);
      supabase.auth.updateUser({ data: { plan } }).catch(() => {});
      setPlanUpgraded(plan);
      router.replace("/dashboard");
    }

    // Flag if just finished onboarding
    const justOnboarded = searchParams.get("onboarded") === "1";
    if (justOnboarded) {
      setWelcomeBack(true);
      router.replace("/dashboard");
    }

    loadData(us, justOnboarded);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData(us: UserSession, justOnboarded: boolean) {
    setLoading(true);
    try {
      // Only check onboarding for mentees and mentors, not school_admin
      if (us.role !== "school_admin") {
        const table = us.role === "mentor" ? "mentors" : "mentees";
        const { data: profile } = await supabase
          .from(table)
          .select("id, statut, has_used_free_ai_match, field, interests, main_goal")
          .eq("email", us.email)
          .single();

        // New user who hasn't filled out their profile yet
        if (!justOnboarded && profile?.statut === "pending") {
          router.push(`/onboarding/${us.role}`);
          return;
        }

        // Track freemium AI match state for mentees
        if (us.role === "mentee" && profile) {
          setMenteeDbId(profile.id);
          setHasUsedFreeMatch(profile.has_used_free_ai_match ?? false);
          setMenteeProfile({
            field: profile.field ?? null,
            interests: profile.interests ?? null,
            main_goal: profile.main_goal ?? null,
            languages: null,
          });
        }

        // Load their sessions using the DB row id
        if (profile?.id) {
          const idField = us.role === "mentor" ? "mentor_id" : "mentee_id";
          const { data: rows } = await supabase
            .from("connexions")
            .select("id, date, statut, mentors(nom, email, specialite), mentees(nom, email, objectif)")
            .eq(idField, profile.id)
            .order("date", { ascending: true });

          setConnexions((rows ?? []) as unknown as Connexion[]);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    clearAuthCookie();
    clearUserSession();
    router.push("/");
  }

  async function runMatching(profileOverride?: MenteeMatchProfile) {
    setMatchLoading(true);
    const profile = profileOverride ?? menteeProfile;
    try {
      const { data: mentors } = await supabase
        .from("mentors")
        .select("id, nom, job_title, specialite, industry, expertise, languages, mentor_score")
        .eq("statut", "active")
        .limit(50);

      const ranked = (mentors ?? [])
        .map((m) => ({ ...m, score: computeMatchScore(profile, m as Omit<MatchResult, "score">) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      setMatches(ranked as MatchResult[]);
    } finally {
      setMatchLoading(false);
    }
  }

  function handleStartMatching() {
    setQField(menteeProfile?.field ?? "");
    setQGoals([]);
    setQLevel("");
    setQLanguage("");
    setQFrequency("");
    setQPriorities([]);
    setQBio("");
    setShowQuestionnaire(true);
    setTab("matching");
  }

  async function handleFindMatches() {
    const updatedProfile: MenteeMatchProfile = {
      field: qField.trim() || menteeProfile?.field || null,
      interests: menteeProfile?.interests ?? null,
      main_goal: qGoals.length ? qGoals.join(", ") : (menteeProfile?.main_goal ?? null),
      languages: qLanguage ? [qLanguage] : (menteeProfile?.languages ?? null),
    };

    setShowQuestionnaire(false);
    setMatchLoading(true);

    try {
      if (menteeDbId) {
        await supabase
          .from("mentees")
          .update({ has_used_free_ai_match: true })
          .eq("id", menteeDbId);
      }
      setHasUsedFreeMatch(true);
      setMenteeProfile(updatedProfile);

      const { data: mentors } = await supabase
        .from("mentors")
        .select("id, nom, job_title, specialite, industry, expertise, languages, mentor_score")
        .eq("statut", "active")
        .limit(50);

      const ranked = (mentors ?? [])
        .map((m) => ({ ...m, score: computeMatchScore(updatedProfile, m as Omit<MatchResult, "score">) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      setMatches(ranked as MatchResult[]);
    } finally {
      setMatchLoading(false);
    }
  }

  // Derived data
  const upcoming = connexions.filter(
    (c) => ["pending", "active"].includes(c.statut) && new Date(c.date) >= new Date()
  );
  const past = connexions.filter(
    (c) => c.statut === "completed" || (c.statut !== "cancelled" && new Date(c.date) < new Date())
  );

  const firstName = (user?.nom ?? "").split(" ")[0] || "there";
  const userInitials = initials(user?.nom ?? "?");
  const roleLabel = user?.role === "mentor" ? "Mentor" : user?.role === "school_admin" ? "School Admin" : "Mentee";

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview",      icon: TrendingUp    },
    { id: "sessions", label: "My Sessions",   icon: CalendarCheck },
    { id: "saved",    label: "Saved Mentors", icon: Heart         },
    { id: "matching", label: "AI Matching",   icon: Sparkles      },
  ];
  const secondaryNav = [
    { href: "/profile",  label: "Profile",   icon: User         },
    { href: "/calendar", label: "Calendar",  icon: CalendarCheck },
    { href: "/settings", label: "Settings",  icon: Settings      },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <aside className="lg:w-60 flex-shrink-0 space-y-3">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
                >
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white text-sm leading-tight truncate">
                    {user?.nom ?? "—"}
                  </div>
                  <div className="text-xs text-white/35 mt-0.5">{roleLabel}</div>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      tab === item.id
                        ? "bg-[#7C3AED] text-white"
                        : "text-white/45 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </Card>

            <Card className="p-5">
              <nav className="space-y-1">
                {secondaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/45 hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.07] transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  Sign out
                </button>
              </nav>
            </Card>
          </aside>

          {/* ── Main content ──────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* OVERVIEW */}
            {tab === "overview" && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">
                    {welcomeBack ? `Welcome to GrowVia, ${firstName}! 🎉` : `Welcome back, ${firstName}`}
                  </h1>
                  <p className="text-white/35 text-sm mt-1">
                    {welcomeBack
                      ? "Your profile is set up. Explore mentors and book your first session."
                      : "Here is your mentoring overview."}
                  </p>
                </div>

                {/* Onboarding complete toast */}
                {welcomeBack && (
                  <div
                    className="rounded-2xl p-4 border border-[#7C3AED]/25 flex items-center gap-3"
                    style={{ background: "rgba(124,58,237,0.1)" }}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#A78BFA] flex-shrink-0" />
                    <span className="text-[#C4B5FD] text-sm font-medium">
                      Profile complete! Start by exploring mentors or let AI find your best match.
                    </span>
                  </div>
                )}

                {/* Plan upgraded toast */}
                {planUpgraded && (
                  <div
                    className="rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-3"
                    style={{ background: "rgba(16,185,129,0.1)" }}
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-300 text-sm font-medium">
                      Plan upgraded to <span className="capitalize font-bold">{planUpgraded}</span>. Welcome to the next level!
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Sessions Booked", value: connexions.length,  icon: CalendarCheck, accent: "rgba(124,58,237,0.15)", iconColor: "text-[#A78BFA]" },
                    { label: "Sessions Done",   value: past.length,         icon: Video,         accent: "rgba(16,185,129,0.12)", iconColor: "text-emerald-400" },
                    { label: "Upcoming",        value: upcoming.length,     icon: Clock,         accent: "rgba(236,72,153,0.12)", iconColor: "text-pink-400" },
                    { label: "AI Matches",      value: user?.plan !== "free" ? "∞" : hasUsedFreeMatch ? "0" : "1", icon: Sparkles, accent: "rgba(245,158,11,0.12)", iconColor: "text-amber-400" },
                  ].map((stat) => (
                    <Card key={stat.label} className="p-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: stat.accent }}
                      >
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                      <div className="text-xs text-white/35 mt-0.5">{stat.label}</div>
                    </Card>
                  ))}
                </div>

                {/* Next session or empty state */}
                {upcoming.length > 0 ? (
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-5">
                      <h2 className="font-bold text-white text-sm uppercase tracking-[0.12em]">Next Session</h2>
                      <button
                        onClick={() => setTab("sessions")}
                        className="text-xs text-[#7C3AED] hover:text-[#A78BFA] flex items-center gap-1 transition-colors"
                      >
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    {(() => {
                      const c = upcoming[0];
                      const other = user?.role === "mentor" ? c.mentees : c.mentors;
                      const otherNom = other?.nom ?? "—";
                      return (
                        <div className="flex items-center gap-4">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
                          >
                            {initials(otherNom)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm">{otherNom}</div>
                            <div className="text-xs text-white/35 mt-0.5">
                              {user?.role === "mentor"
                                ? c.mentees?.objectif ?? "Mentee"
                                : c.mentors?.specialite ?? "Mentor"}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 hidden sm:block">
                            <div className="text-sm font-semibold text-white">{fmtDate(c.date)}</div>
                            <div className="text-xs text-white/35 mt-0.5">{fmtTime(c.date)}</div>
                          </div>
                          <button className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0">
                            <Video className="w-3.5 h-3.5" /> Join
                          </button>
                        </div>
                      );
                    })()}
                  </Card>
                ) : (
                  <EmptyState
                    icon={CalendarCheck}
                    title="No upcoming sessions"
                    desc="Book a session with a mentor to get started on your journey."
                    action={
                      <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                      >
                        Explore mentors
                      </Link>
                    }
                  />
                )}

                {/* Bottom banner — freemium AI match or upgrade */}
                {user?.role === "mentee" && user?.plan === "free" && (
                  <div
                    className="rounded-2xl p-6 border border-[#7C3AED]/30"
                    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(76,29,149,0.18) 100%)" }}
                  >
                    {!hasUsedFreeMatch ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-white mb-1">Try AI Matching for free</div>
                          <div className="text-white/45 text-sm">
                            You have 1 free AI match — let our engine find your perfect mentor.
                          </div>
                        </div>
                        <button
                          onClick={handleStartMatching}
                          className="flex-shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                        >
                          Try now
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-white mb-1">Unlock unlimited AI matching</div>
                          <div className="text-white/45 text-sm">
                            Subscribe from 4.99€/month and get full access + unlimited AI matches.
                          </div>
                        </div>
                        <Link
                          href="/pricing"
                          className="flex-shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                        >
                          Upgrade
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MY SESSIONS */}
            {tab === "sessions" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">My Sessions</h1>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-3">Upcoming</p>
                  {upcoming.length > 0 ? (
                    <div className="space-y-3">
                      {upcoming.map((c) => (
                        <SessionCard key={c.id} conn={c} userRole={user?.role ?? "mentee"} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={CalendarCheck}
                      title="No upcoming sessions"
                      desc="Find a mentor and book your first session."
                      action={
                        <Link
                          href="/explore"
                          className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                        >
                          <BookOpen className="w-4 h-4" /> Find a mentor
                        </Link>
                      }
                    />
                  )}
                </div>

                {past.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-3">Past Sessions</p>
                    <div className="space-y-3">
                      {past.map((c) => (
                        <SessionCard key={c.id} conn={c} userRole={user?.role ?? "mentee"} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SAVED MENTORS */}
            {tab === "saved" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Saved Mentors</h1>
                <EmptyState
                  icon={Heart}
                  title="No saved mentors yet"
                  desc="Browse mentors and save the ones you'd like to work with."
                  action={
                    <Link
                      href="/explore"
                      className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                    >
                      <BookOpen className="w-4 h-4" /> Browse mentors
                    </Link>
                  }
                />
              </div>
            )}

            {/* AI MATCHING */}
            {tab === "matching" && (
              <div className="space-y-5">
                {/* Header — Premium badge only for subscribed users */}
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Smart Matching</h1>
                      {user?.plan !== "free" && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                          style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}
                        >
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-white/35 text-sm mt-1">
                      Our engine scores every mentor against your profile to surface the best fits.
                    </p>
                  </div>
                </div>

                {/* ── Computing / loading ── */}
                {matchLoading && (
                  <Card className="p-14 flex flex-col items-center gap-4 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
                    >
                      <Sparkles className="w-8 h-8 text-[#A78BFA] animate-pulse" />
                    </div>
                    <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
                    <p className="text-white/50 text-sm">Analysing your profile and ranking mentors…</p>
                  </Card>
                )}

                {/* ── Free trial available — entry CTA ── */}
                {!matchLoading && !showQuestionnaire && user?.plan === "free" && !hasUsedFreeMatch && (
                  <Card className="p-10 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                      style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
                    >
                      <Sparkles className="w-8 h-8 text-[#A78BFA]" />
                    </div>
                    <div
                      className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                      style={{ background: "rgba(124,58,237,0.15)", color: "#C4B5FD" }}
                    >
                      1 free match available
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">You have 1 free AI match</h2>
                    <p className="text-white/40 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                      Answer 3 quick questions so our engine can surface the top mentors who fit you best.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleStartMatching}
                        className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
                      >
                        <Sparkles className="w-4 h-4" /> Use my free match
                      </button>
                      <Link
                        href="/explore"
                        className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-[#7C3AED]/40 text-white/50 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-colors text-sm"
                      >
                        <BookOpen className="w-4 h-4" /> Browse manually
                      </Link>
                    </div>
                  </Card>
                )}

                {/* ── Questionnaire (shown after clicking "Use my free match") ── */}
                {!matchLoading && showQuestionnaire && !hasUsedFreeMatch && (() => {
                  function pill(
                    label: string,
                    active: boolean,
                    onClick: () => void
                  ) {
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={onClick}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150"
                        style={
                          active
                            ? { background: "#7C3AED", borderColor: "#7C3AED", color: "#fff" }
                            : { background: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }
                        }
                      >
                        {label}
                      </button>
                    );
                  }

                  return (
                    <Card className="p-7">
                      <div className="flex items-center gap-3 mb-7">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.25)" }}
                        >
                          <Sparkles className="w-5 h-5 text-[#A78BFA]" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Tell us what you need</div>
                          <div className="text-white/35 text-xs mt-0.5">A few quick questions — your match runs when you click Find My Matches</div>
                        </div>
                      </div>

                      {/* Q1 — goals (multi-select) */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          What&apos;s your main goal? <span className="text-[#7C3AED]">*</span>
                          <span className="normal-case font-normal ml-1 text-white/25">(select all that apply)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["Career growth", "Job search & interviews", "Startup & entrepreneurship", "Skill development", "Academic guidance", "Career change"].map((g) =>
                            pill(g, qGoals.includes(g), () =>
                              setQGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])
                            )
                          )}
                        </div>
                      </div>

                      {/* Q2 — field */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          Your field or industry
                        </label>
                        <input
                          type="text"
                          value={qField}
                          onChange={(e) => setQField(e.target.value)}
                          placeholder="e.g. Software engineering, Marketing, Finance…"
                          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 border border-white/10 focus:border-[#7C3AED] focus:outline-none transition-colors"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        />
                      </div>

                      {/* Q3 — experience level */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          Your current experience level
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["Student", "Junior", "Mid-level", "Senior", "Career changer"].map((l) =>
                            pill(l, qLevel === l, () => setQLevel((prev) => prev === l ? "" : l))
                          )}
                        </div>
                      </div>

                      {/* Q4 — preferred language */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          Preferred language for sessions
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["English", "French", "Spanish", "Other"].map((l) =>
                            pill(l, qLanguage === l, () => setQLanguage((prev) => prev === l ? "" : l))
                          )}
                        </div>
                      </div>

                      {/* Q5 — meeting frequency */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          How often do you want to meet?
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["Once a month", "Twice a month", "Weekly"].map((f) =>
                            pill(f, qFrequency === f, () => setQFrequency((prev) => prev === f ? "" : f))
                          )}
                        </div>
                      </div>

                      {/* Q6 — priorities (multi-select) */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          What matters most in a mentor?
                          <span className="normal-case font-normal ml-1 text-white/25">(select all that apply)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["Deep domain expertise", "Practical advice & accountability", "Network & opportunities"].map((p) =>
                            pill(p, qPriorities.includes(p), () =>
                              setQPriorities((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
                            )
                          )}
                        </div>
                      </div>

                      {/* Q7 — free text */}
                      <div className="mb-8">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          Tell us more about yourself
                          <span className="normal-case font-normal ml-1 text-white/25">(optional)</span>
                        </label>
                        <textarea
                          value={qBio}
                          onChange={(e) => setQBio(e.target.value)}
                          rows={3}
                          placeholder="Your background, what you're looking for, and any details that could help us find the best mentor for you…"
                          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 border border-white/10 focus:border-[#7C3AED] focus:outline-none transition-colors resize-none"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowQuestionnaire(false)}
                          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleFindMatches}
                          disabled={qGoals.length === 0}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                        >
                          <Sparkles className="w-4 h-4" /> Find My Matches
                        </button>
                      </div>
                    </Card>
                  );
                })()}

                {/* ── Paid plan — no results yet ── */}
                {!matchLoading && user?.plan !== "free" && matches.length === 0 && (
                  <Card className="p-10 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                      style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}
                    >
                      <Sparkles className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">AI Matching is ready</h2>
                    <p className="text-white/40 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                      Your plan includes unlimited AI matches. Run it anytime to see updated suggestions.
                    </p>
                    <button
                      onClick={() => runMatching()}
                      className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
                    >
                      <Sparkles className="w-4 h-4" /> Run AI Matching
                    </button>
                  </Card>
                )}

                {/* ── Results (both free-after-trial and paid) ── */}
                {!matchLoading && matches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30">
                        Top matches for you
                      </p>
                      {/* Refresh only for subscribed users */}
                      {user?.plan !== "free" && (
                        <button
                          onClick={() => runMatching()}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#A78BFA] hover:text-white transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {matches.map((m, i) => (
                        <MatchCard key={m.id} match={m} rank={i} />
                      ))}
                    </div>
                  </>
                )}

                {/* ── Free trial used, no in-session results (returning visit) ── */}
                {!matchLoading && user?.plan === "free" && hasUsedFreeMatch && matches.length === 0 && (
                  <Card className="p-10 text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
                    >
                      <Sparkles className="w-7 h-7 text-amber-400" />
                    </div>
                    <div
                      className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                      style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24" }}
                    >
                      0 free matches remaining
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Free trial used</h2>
                    <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed">
                      Upgrade to run unlimited AI matches and always see your top mentor suggestions.
                    </p>
                  </Card>
                )}

                {/* ── Upgrade banner — shown to free users after trial is consumed ── */}
                {!matchLoading && user?.plan === "free" && hasUsedFreeMatch && (
                  <div
                    className="rounded-2xl p-6 border border-[#7C3AED]/30"
                    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(76,29,149,0.18) 100%)" }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-white mb-1">
                          Want to refresh or run new matches?
                        </div>
                        <div className="text-white/45 text-sm">
                          Upgrade to a plan from 4.99€/month and get unlimited AI matches.
                        </div>
                      </div>
                      <Link
                        href="/pricing"
                        className="flex-shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                      >
                        Upgrade
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
