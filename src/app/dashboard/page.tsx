"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUserSession, type UserSession } from "@/lib/session";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import {
  CalendarCheck, Heart, Sparkles, User, Clock, Video, Star,
  ChevronRight, TrendingUp, BookOpen, Settings, LogOut, Loader2, RefreshCw,
  Users, CheckCircle, XCircle, CalendarRange,
} from "lucide-react";
import AvailabilitySelector from "@/components/AvailabilitySelector";

type Tab = "overview" | "sessions" | "saved" | "matching" | "mentees" | "calendar";

type Connexion = {
  id: string;
  date: string;
  statut: "pending" | "active" | "completed" | "cancelled" | "rescheduled";
  meet_link?: string | null;
  mentors: { nom: string; email: string; specialite: string | null } | null;
  mentees: { id: string; nom: string; email: string; objectif: string | null; photo_url: string | null } | null;
};

type MatchResult = {
  id: string;
  nom: string;
  job_title: string | null;
  specialite: string | null;
  industry: string | null;
  expertise: string[] | null;
  languages: string[] | null;
  location: string | null;
  bio: string | null;
  mentor_score: number | null;
  match_score_override: number | null;
  score: number;
  matchReason: string;
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

function fmtDate(iso: string, t: (k: string) => string, lang: string) {
  const d = new Date(iso);
  const now = new Date();
  const tom = new Date(now);
  tom.setDate(tom.getDate() + 1);
  if (d.toDateString() === now.toDateString()) return t("dash_today");
  if (d.toDateString() === tom.toDateString()) return t("dash_tomorrow");
  const locale = lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-GB";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function fmtTime(iso: string, lang: string) {
  const locale = lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-GB";
  return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

function generateMatchReason(
  mentor: Pick<MatchResult, "nom" | "job_title" | "industry" | "expertise">,
  profile: MenteeMatchProfile | null
): string {
  const first = mentor.nom.split(" ")[0];
  const skills = mentor.expertise?.slice(0, 2).join(" and ") ?? "their domain";
  const goal = profile?.main_goal?.toLowerCase() ?? "";
  if (goal.includes("startup") || goal.includes("entrepreneur"))
    return `${first} has a proven track record guiding founders, expertise in ${skills} maps directly onto your goals.`;
  if (goal.includes("career change") || goal.includes("transition"))
    return `${first}'s deep roots in ${mentor.industry ?? "their field"} make them an ideal guide for your career transition.`;
  if (goal.includes("job search") || goal.includes("interview"))
    return `With experience in ${mentor.industry ?? "their field"}, ${first} can help you stand out and land the right role.`;
  if (goal.includes("growth"))
    return `${first}'s expertise in ${skills} closely matches your growth ambitions, they've helped professionals at similar stages advance fast.`;
  if (goal.includes("skill"))
    return `${first} specialises in ${skills}, precisely the skills you're aiming to develop.`;
  return `${first}'s background in ${skills} aligns strongly with your profile and career objectives.`;
}

function computeMatchScore(
  profile: MenteeMatchProfile | null,
  mentor: Omit<MatchResult, "score" | "matchReason">
): number {
  // Fixed demo scores take priority, ensures showcase mentors always display as intended
  if (mentor.match_score_override != null) return mentor.match_score_override;

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
  if (profile?.languages?.length && mentor.languages?.length) {
    const pref = new Set(profile.languages.map((l) => l.toLowerCase()));
    const hit = mentor.languages.some((l) => pref.has(l.toLowerCase()));
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
  const { t, lang } = useLang();
  const other = userRole === "mentor" ? conn.mentees : conn.mentors;
  const otherNom = other?.nom ?? ", ";
  const otherInfo =
    userRole === "mentor"
      ? (conn.mentees?.objectif ?? t("dash_role_mentee"))
      : (conn.mentors?.specialite ?? t("dash_role_mentor"));
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
            {fmtDate(conn.date, t, lang)} {t("dash_at")} {fmtTime(conn.date, lang)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isPast && (
          <button className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            <Video className="w-3.5 h-3.5" /> {t("dash_join")}
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
  const { t } = useLang();
  const rankLabel = ["🥇", "🥈", "🥉"][rank] ?? `#${rank + 1}`;
  const subtitle = match.job_title ?? match.specialite ?? match.industry ?? t("dash_role_mentor");
  const color = scoreColor(match.score);

  return (
    <Card className="p-5">
      {/* Header row */}
      <div className="flex items-start gap-4">
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
          {match.location && (
            <div className="text-[10px] text-white/25 mt-0.5">{match.location}</div>
          )}
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
          <div className="text-[10px] text-white/30 mt-0.5 uppercase tracking-wide">{t("dash_ai_match_pct")}</div>
        </div>
      </div>

      {/* AI-generated reason */}
      {match.matchReason && (
        <p
          className="mt-3 text-xs leading-relaxed rounded-xl px-3 py-2.5"
          style={{ background: "rgba(124,58,237,0.07)", color: "rgba(196,181,253,0.8)" }}
        >
          ✦ {match.matchReason}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/mentors/${match.id}`}
          className="flex-1 text-center text-xs font-semibold py-2.5 rounded-xl border border-white/10 hover:border-[#7C3AED]/50 text-white/55 hover:text-white transition-colors"
        >
          {t("dash_ai_view_profile")}
        </Link>
        <Link
          href={`/mentors/${match.id}`}
          className="flex-1 text-center text-xs font-semibold py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors"
        >
          {t("dash_ai_request")}
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
  const { session: authSession, setSession: setAuthSession, clearSession } = useAuth();
  const { t, lang } = useLang();

  const [tab, setTab]                       = useState<Tab>("overview");
  const [user, setUser]                     = useState<UserSession | null>(null);
  const [connexions, setConnexions]         = useState<Connexion[]>([]);
  const [loading, setLoading]               = useState(true);
  const [planUpgraded, setPlanUpgraded]     = useState<string | null>(null);
  const [welcomeBack, setWelcomeBack]       = useState(false);
  const [hasUsedFreeMatch, setHasUsedFreeMatch] = useState(false);
  const [freeSessionUsed, setFreeSessionUsed]   = useState(false);
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

  // Mentor-specific state
  const [mentorSessionTab, setMentorSessionTab] = useState<"pending" | "upcoming" | "past">("pending");
  const [actionLoading, setActionLoading]       = useState<string | null>(null);
  const [mentorDbId, setMentorDbId]             = useState<string | null>(null);

  // Propose new time modal state
  const [proposeModal, setProposeModal]   = useState<string | null>(null); // connexionId
  const [proposeDate, setProposeDate]     = useState("");
  const [proposeTime, setProposeTime]     = useState("");
  const [proposeLoading, setProposeLoading] = useState(false);

  // Nav items, defined inside component so they react to lang changes
  const navItems: { id: Tab; label: string; icon: React.ElementType }[] =
    user?.role === "mentor"
      ? [
          { id: "overview", label: t("dash_nav_overview"), icon: TrendingUp    },
          { id: "sessions", label: "My Sessions",           icon: CalendarCheck },
          { id: "mentees",  label: "My Mentees",            icon: Users         },
          { id: "calendar", label: "Calendar",              icon: CalendarRange },
        ]
      : [
          { id: "overview", label: t("dash_nav_overview"), icon: TrendingUp    },
          { id: "sessions", label: t("dash_nav_sessions"), icon: CalendarCheck },
          { id: "saved",    label: t("dash_nav_saved"),    icon: Heart         },
          { id: "matching", label: t("dash_nav_matching"), icon: Sparkles      },
        ];
  const secondaryNav = [
    { href: "/profile",  label: t("dash_nav_profile"),  icon: User     },
    ...(user?.role !== "mentor" ? [{ href: "/calendar", label: t("dash_nav_calendar"), icon: CalendarRange }] : []),
    { href: "/settings", label: t("dash_nav_settings"), icon: Settings },
  ];

  const roleLabel =
    user?.role === "mentor"       ? t("dash_role_mentor") :
    user?.role === "school_admin" ? t("dash_role_school") :
                                    t("dash_role_mentee");

  // Questionnaire options, English values stored to DB; labels are translated
  const goalOptions = [
    { value: "Career growth",                label: t("dash_q_goal1") },
    { value: "Job search & interviews",       label: t("dash_q_goal2") },
    { value: "Startup & entrepreneurship",    label: t("dash_q_goal3") },
    { value: "Skill development",             label: t("dash_q_goal4") },
    { value: "Academic guidance",             label: t("dash_q_goal5") },
    { value: "Career change",                 label: t("dash_q_goal6") },
  ];
  const levelOptions = [
    { value: "Student",        label: t("dash_q_lvl1") },
    { value: "Junior",         label: t("dash_q_lvl2") },
    { value: "Mid-level",      label: t("dash_q_lvl3") },
    { value: "Senior",         label: t("dash_q_lvl4") },
    { value: "Career changer", label: t("dash_q_lvl5") },
  ];
  const langOptions = [
    { value: "English", label: t("dash_q_lang_en") },
    { value: "French",  label: t("dash_q_lang_fr") },
    { value: "Spanish", label: t("dash_q_lang_es") },
    { value: "Other",   label: t("dash_q_lang_other") },
  ];
  const freqOptions = [
    { value: "Once a month",   label: t("dash_q_freq1") },
    { value: "Twice a month",  label: t("dash_q_freq2") },
    { value: "Weekly",         label: t("dash_q_freq3") },
  ];
  const priorityOptions = [
    { value: "Deep domain expertise",             label: t("dash_q_pri1") },
    { value: "Practical advice & accountability", label: t("dash_q_pri2") },
    { value: "Network & opportunities",           label: t("dash_q_pri3") },
  ];

  // Re-verify free-trial flag from DB each time the user opens the matching tab
  useEffect(() => {
    if (tab !== "matching" || !menteeDbId) return;
    (async () => {
      try {
        const { data } = await supabase
          .from("mentees")
          .select("has_used_free_ai_match")
          .eq("id", menteeDbId)
          .single();
        if (data?.has_used_free_ai_match) {
          setHasUsedFreeMatch(true);
          setShowQuestionnaire(false);
        }
      } catch {
        // non-critical, ignore
      }
    })();
  }, [tab, menteeDbId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Prefer session already in context (populated on prior page load); fall back to localStorage
    const us = authSession ?? getUserSession();
    if (!us) {
      router.push("/auth/login?next=/dashboard");
      return;
    }
    setUser(us);

    // Handle return from Stripe
    const plan = searchParams.get("plan");
    if (plan) {
      const updated = { ...us, plan: plan as "free" | "pro" | "school" };
      setAuthSession(updated); // updates context + localStorage in one call
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
          .select("id, statut, onboarding_completed, has_used_free_ai_match, free_session_used, field, interests, main_goal")
          .eq("email", us.email)
          .single();

        // Mentors who haven't completed onboarding always go back to the questionnaire
        if (us.role === "mentor" && !justOnboarded && !profile?.onboarding_completed) {
          router.push("/onboarding/mentor");
          return;
        }

        // Other roles: redirect pending profiles (first-time onboarding)
        if (us.role !== "mentor" && !justOnboarded && profile?.statut === "pending") {
          router.push(`/onboarding/${us.role}`);
          return;
        }

        // Track freemium AI match state for mentees
        if (us.role === "mentee" && profile) {
          setMenteeDbId(profile.id);
          setHasUsedFreeMatch(profile.has_used_free_ai_match ?? false);
          setFreeSessionUsed(profile.free_session_used ?? false);
          setMenteeProfile({
            field: profile.field ?? null,
            interests: profile.interests ?? null,
            main_goal: profile.main_goal ?? null,
            languages: null,
          });

          // Restore saved match results so returning users always see their top 3
          if (profile.has_used_free_ai_match) {
            const { data: authSession } = await supabase.auth.getUser();
            if (authSession.user?.id) {
              const { data: latestResponse } = await supabase
                .from("ai_matching_responses")
                .select("match_results")
                .eq("user_id", authSession.user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
              if (latestResponse?.match_results) {
                setMatches(latestResponse.match_results as MatchResult[]);
              }
            }
          }
        }

        if (us.role === "mentor" && profile?.id) {
          setMentorDbId(profile.id);
        }

        // Load their sessions using the DB row id
        if (profile?.id) {
          const idField = us.role === "mentor" ? "mentor_id" : "mentee_id";
          const { data: rows } = await supabase
            .from("connexions")
            .select("id, date, statut, meet_link, mentors(nom, email, specialite), mentees(id, nom, email, objectif, photo_url)")
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
    await supabase.auth.signOut(); // triggers onAuthStateChange(SIGNED_OUT) in AuthProvider
    clearSession();
    router.push("/");
  }

  async function runMatching(profileOverride?: MenteeMatchProfile) {
    setMatchLoading(true);
    const profile = profileOverride ?? menteeProfile;
    try {
      const { data: mentors } = await supabase
        .from("mentors")
        .select("id, nom, job_title, specialite, industry, expertise, languages, location, bio, mentor_score, match_score_override")
        .eq("statut", "active")
        .limit(50);

      const ranked: MatchResult[] = (mentors ?? [])
        .map((m) => {
          const base = m as Omit<MatchResult, "score" | "matchReason">;
          return {
            ...base,
            score: computeMatchScore(profile, base),
            matchReason: generateMatchReason(base, profile),
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      setMatches(ranked);
    } finally {
      setMatchLoading(false);
    }
  }

  function handleStartMatching() {
    // Guard: free trial already used, never re-open questionnaire
    if (hasUsedFreeMatch) {
      setTab("matching");
      return;
    }
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

  async function saveMatchingResponse(params: {
    goals: string[];
    industry: string;
    priorities: string[];
    level: string;
    language: string;
    frequency: string;
    bio: string;
    matchResults: MatchResult[];
  }) {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.id) return;

      const { count } = await supabase
        .from("ai_matching_responses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", authUser.id);

      await supabase.from("ai_matching_responses").insert({
        user_id: authUser.id,
        full_name: user?.nom ?? null,
        role: user?.role ?? null,
        main_goals: params.goals,
        industry: params.industry.trim() || null,
        mentor_priorities: params.priorities,
        experience_level: params.level || null,
        preferred_language: params.language || null,
        meeting_frequency: params.frequency || null,
        free_text: params.bio.trim() || null,
        attempt_number: (count ?? 0) + 1,
        match_results: params.matchResults,
      });
    } catch {
      // Never let analytics failures block the UX
    }
  }

  async function handleFindMatches() {
    const updatedProfile: MenteeMatchProfile = {
      field: qField.trim() || menteeProfile?.field || null,
      interests: menteeProfile?.interests ?? null,
      main_goal: qGoals.length ? qGoals.join(", ") : (menteeProfile?.main_goal ?? null),
      languages: qLanguage ? [qLanguage] : (menteeProfile?.languages ?? null),
    };

    // Snapshot questionnaire values now, state will be cleared during async work
    const snapshot = {
      goals: qGoals,
      industry: qField,
      priorities: qPriorities,
      level: qLevel,
      language: qLanguage,
      frequency: qFrequency,
      bio: qBio,
    };

    setShowQuestionnaire(false);
    setMatchLoading(true);

    try {
      // Persist the free-trial flag server-side (service role key bypasses RLS)
      if (menteeDbId) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token ?? "";
        await fetch("/api/mentee/mark-match-used", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ menteeId: menteeDbId }),
        });
      }
      setHasUsedFreeMatch(true);
      setMenteeProfile(updatedProfile);

      const { data: mentors } = await supabase
        .from("mentors")
        .select("id, nom, job_title, specialite, industry, expertise, languages, location, bio, mentor_score, match_score_override")
        .eq("statut", "active")
        .limit(50);

      const ranked: MatchResult[] = (mentors ?? [])
        .map((m) => {
          const base = m as Omit<MatchResult, "score" | "matchReason">;
          return {
            ...base,
            score: computeMatchScore(updatedProfile, base),
            matchReason: generateMatchReason(base, updatedProfile),
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      setMatches(ranked);

      // Save questionnaire response + match results, fire-and-forget
      saveMatchingResponse({ ...snapshot, matchResults: ranked }).catch(() => {});
    } finally {
      setMatchLoading(false);
    }
  }

  // Derived data
  const upcoming = connexions.filter(
    (c) => ["pending", "active", "rescheduled"].includes(c.statut) && new Date(c.date) >= new Date()
  );
  const past = connexions.filter(
    (c) => c.statut === "completed" || (c.statut !== "cancelled" && new Date(c.date) < new Date())
  );

  // Mentor-derived data
  const mentorPending     = connexions.filter(c => c.statut === "pending");
  const mentorRescheduled = connexions.filter(c => c.statut === "rescheduled");
  const mentorUpcoming = connexions.filter(
    c => c.statut === "active" && new Date(c.date) >= new Date()
  );
  const mentorPast = connexions.filter(
    c => c.statut === "completed" || (["active", "pending"].includes(c.statut) && new Date(c.date) < new Date())
  );
  const myMentees = Array.from(
    new Map(
      connexions
        .filter(c => ["active", "completed"].includes(c.statut) && c.mentees?.id)
        .map(c => [c.mentees!.id, c.mentees!])
    ).values()
  );

  async function handleAcceptSession(connId: string) {
    setActionLoading(connId);
    try {
      const res = await fetch("/api/sessions/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connexionId: connId }),
      });
      const json = (await res.json()) as { success?: boolean; meetLink?: string | null; error?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setConnexions(prev => prev.map(c =>
        c.id === connId ? { ...c, statut: "active" as const, meet_link: json.meetLink ?? null } : c
      ));
    } catch (err) {
      console.error("[accept]", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeclineSession(connId: string) {
    setActionLoading(connId);
    try {
      const res = await fetch("/api/sessions/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connexionId: connId }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setConnexions(prev => prev.filter(c => c.id !== connId));
    } catch (err) {
      console.error("[decline]", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleProposeTime() {
    if (!proposeModal || !proposeDate || !proposeTime) return;
    setProposeLoading(true);
    try {
      const res = await fetch("/api/sessions/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connexionId: proposeModal, newDate: proposeDate, newTime: proposeTime }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setConnexions(prev => prev.map(c =>
        c.id === proposeModal ? { ...c, statut: "rescheduled" as const } : c
      ));
      setProposeModal(null);
    } catch (err) {
      console.error("[propose-time]", err);
    } finally {
      setProposeLoading(false);
    }
  }

  async function handleAcceptRetime(connId: string) {
    setActionLoading(connId);
    try {
      const res = await fetch("/api/sessions/accept-retime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connexionId: connId }),
      });
      const json = (await res.json()) as { success?: boolean; meetLink?: string | null; error?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setConnexions(prev => prev.map(c =>
        c.id === connId ? { ...c, statut: "active" as const, meet_link: json.meetLink ?? null } : c
      ));
    } catch (err) {
      console.error("[accept-retime]", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeclineRetime(connId: string) {
    setActionLoading(connId);
    try {
      const res = await fetch("/api/sessions/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connexionId: connId }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setConnexions(prev => prev.filter(c => c.id !== connId));
    } catch (err) {
      console.error("[decline-retime]", err);
    } finally {
      setActionLoading(null);
    }
  }

  const firstName = (user?.nom ?? "").split(" ")[0] || "there";
  const userInitials = initials(user?.nom ?? "?");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A]">

      {/* ── Propose new time modal ─────────────────────────────────────── */}
      {proposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] p-6"
            style={{ background: "#1a1530" }}>
            <h2 className="font-bold text-white text-lg mb-1">Propose a new time</h2>
            <p className="text-white/40 text-sm mb-5">The mentee will receive an email to accept or decline.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Date</label>
                <input
                  type="date"
                  value={proposeDate}
                  onChange={e => setProposeDate(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Time</label>
                <input
                  type="time"
                  value={proposeTime}
                  onChange={e => setProposeTime(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setProposeModal(null)}
                className="flex-1 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                Cancel
              </button>
              <button
                onClick={handleProposeTime}
                disabled={!proposeDate || !proposeTime || proposeLoading}
                className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {proposeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Send proposal
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {user?.nom ?? ", "}
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
                  {t("dash_nav_signout")}
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
                    {welcomeBack
                      ? `${t("dash_welcome_new")}${firstName}! 🎉`
                      : `${t("dash_welcome_return")}${firstName}`}
                  </h1>
                  <p className="text-white/35 text-sm mt-1">
                    {welcomeBack ? t("dash_welcome_sub") : t("dash_overview_sub")}
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
                      {user?.role === "mentor"
                        ? "Profile complete! Mentees can now find and book sessions with you."
                        : t("dash_profile_complete")}
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
                      {t("dash_plan_upgraded")} <span className="capitalize font-bold">{planUpgraded}</span>. {t("dash_welcome_next")}
                    </span>
                  </div>
                )}

                {/* Stats — mentor vs mentee */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(user?.role === "mentor"
                    ? [
                        { label: t("dash_stat_booked"),    value: connexions.length,    icon: CalendarCheck, accent: "rgba(124,58,237,0.15)", iconColor: "text-[#A78BFA]" },
                        { label: t("dash_stat_done"),       value: mentorPast.length,    icon: Video,         accent: "rgba(16,185,129,0.12)", iconColor: "text-emerald-400" },
                        { label: t("dash_stat_upcoming"),   value: mentorUpcoming.length, icon: Clock,        accent: "rgba(236,72,153,0.12)", iconColor: "text-pink-400" },
                        { label: "My Mentees",              value: myMentees.length,     icon: Users,         accent: "rgba(245,158,11,0.12)", iconColor: "text-amber-400" },
                      ]
                    : [
                        { label: t("dash_stat_booked"),    value: connexions.length,    icon: CalendarCheck, accent: "rgba(124,58,237,0.15)", iconColor: "text-[#A78BFA]" },
                        { label: t("dash_stat_done"),       value: past.length,          icon: Video,         accent: "rgba(16,185,129,0.12)", iconColor: "text-emerald-400" },
                        { label: t("dash_stat_upcoming"),   value: upcoming.length,      icon: Clock,         accent: "rgba(236,72,153,0.12)", iconColor: "text-pink-400" },
                        { label: t("dash_stat_ai"),         value: user?.plan !== "free" ? "∞" : hasUsedFreeMatch ? "1" : "0", icon: Sparkles, accent: "rgba(245,158,11,0.12)", iconColor: "text-amber-400" },
                      ]
                  ).map((stat) => (
                    <Card key={stat.label} className="p-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.accent }}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                      <div className="text-xs text-white/35 mt-0.5">{stat.label}</div>
                    </Card>
                  ))}
                </div>

                {/* ── Mentor overview: pending requests + next session ─────── */}
                {user?.role === "mentor" && (
                  <>
                    {/* Pending requests */}
                    {mentorPending.length > 0 && (
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-bold text-white text-sm uppercase tracking-[0.12em]">Pending Requests</h2>
                          <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
                            {mentorPending.length} new
                          </span>
                        </div>
                        <div className="divide-y divide-white/[0.06]">
                          {mentorPending.map(c => (
                            <div key={c.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                                {initials(c.mentees?.nom ?? "?")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white text-sm">{c.mentees?.nom ?? "Mentee"}</div>
                                <div className="text-xs text-white/40 mt-0.5">
                                  {c.mentees?.objectif ?? "Mentoring session"} · {fmtDate(c.date, t, lang)} {fmtTime(c.date, lang)}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => handleAcceptSession(c.id)} disabled={actionLoading === c.id}
                                  className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                                  {actionLoading === c.id
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <CheckCircle className="w-3.5 h-3.5" />
                                  } Accept
                                </button>
                                <button onClick={() => handleDeclineSession(c.id)} disabled={actionLoading === c.id}
                                  className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                                  {actionLoading === c.id
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <XCircle className="w-3.5 h-3.5" />
                                  } Decline
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Next upcoming session */}
                    {mentorUpcoming.length > 0 ? (
                      <Card className="p-6">
                        <div className="flex justify-between items-center mb-5">
                          <h2 className="font-bold text-white text-sm uppercase tracking-[0.12em]">{t("dash_next_session")}</h2>
                          <button onClick={() => setTab("sessions")}
                            className="text-xs text-[#7C3AED] hover:text-[#A78BFA] flex items-center gap-1 transition-colors">
                            {t("dash_view_all")} <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        {(() => {
                          const c = mentorUpcoming[0];
                          return (
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                                {initials(c.mentees?.nom ?? "?")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white text-sm">{c.mentees?.nom ?? "Mentee"}</div>
                                <div className="text-xs text-white/35 mt-0.5">{c.mentees?.objectif ?? "Mentoring session"}</div>
                              </div>
                              <div className="text-right flex-shrink-0 hidden sm:block">
                                <div className="text-sm font-semibold text-white">{fmtDate(c.date, t, lang)}</div>
                                <div className="text-xs text-white/35 mt-0.5">{fmtTime(c.date, lang)}</div>
                              </div>
                              <button className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0">
                                <Video className="w-3.5 h-3.5" /> {t("dash_join")}
                              </button>
                            </div>
                          );
                        })()}
                      </Card>
                    ) : mentorPending.length === 0 && (
                      <EmptyState
                        icon={CalendarCheck}
                        title="No upcoming sessions"
                        desc="Your schedule is clear. Once a mentee books a session it will appear here."
                      />
                    )}
                  </>
                )}

                {/* ── Mentee overview: next session + freemium banner ──────── */}
                {user?.role !== "mentor" && (
                  <>
                    {upcoming.length > 0 ? (
                      <Card className="p-6">
                        <div className="flex justify-between items-center mb-5">
                          <h2 className="font-bold text-white text-sm uppercase tracking-[0.12em]">{t("dash_next_session")}</h2>
                          <button onClick={() => setTab("sessions")}
                            className="text-xs text-[#7C3AED] hover:text-[#A78BFA] flex items-center gap-1 transition-colors">
                            {t("dash_view_all")} <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        {(() => {
                          const c = upcoming[0];
                          const other = c.mentors;
                          const otherNom = other?.nom ?? ", ";
                          return (
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                                {initials(otherNom)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white text-sm">{otherNom}</div>
                                <div className="text-xs text-white/35 mt-0.5">{c.mentors?.specialite ?? t("dash_role_mentor")}</div>
                              </div>
                              <div className="text-right flex-shrink-0 hidden sm:block">
                                <div className="text-sm font-semibold text-white">{fmtDate(c.date, t, lang)}</div>
                                <div className="text-xs text-white/35 mt-0.5">{fmtTime(c.date, lang)}</div>
                              </div>
                              <button className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0">
                                <Video className="w-3.5 h-3.5" /> {t("dash_join")}
                              </button>
                            </div>
                          );
                        })()}
                      </Card>
                    ) : (
                      <EmptyState
                        icon={CalendarCheck}
                        title={t("dash_no_upcoming")}
                        desc={t("dash_no_upcoming_desc")}
                        action={
                          <Link href="/explore"
                            className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                            {t("dash_explore_mentors")}
                          </Link>
                        }
                      />
                    )}

                    {/* Trial-over banner */}
                    {hasUsedFreeMatch && freeSessionUsed && user?.plan === "free" && (
                      <div
                        className="rounded-2xl p-5 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        style={{ background: "rgba(245,158,11,0.06)" }}
                      >
                        <div>
                          <p className="text-white font-semibold mb-0.5">Your free trial is over.</p>
                          <p className="text-white/45 text-sm">
                            Subscribe to continue booking sessions and using AI matching.
                          </p>
                        </div>
                        <Link
                          href="/subscribe"
                          className="flex-shrink-0 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                        >
                          Subscribe →
                        </Link>
                      </div>
                    )}

                    {/* Free discovery session banner */}
                    {!freeSessionUsed && (
                      <div
                        className="rounded-2xl p-5 border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        style={{ background: "rgba(16,185,129,0.06)" }}
                      >
                        <div>
                          <p className="text-white font-semibold mb-0.5">🎁 You have 1 free discovery session!</p>
                          <p className="text-white/45 text-sm">
                            Book your first session with any mentor — completely free, no subscription needed.
                          </p>
                        </div>
                        <Link
                          href="/explore"
                          className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                        >
                          Find a mentor →
                        </Link>
                      </div>
                    )}

                    {user?.plan === "free" && !hasUsedFreeMatch && (
                      <div className="rounded-2xl p-6 border border-[#7C3AED]/30"
                        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(76,29,149,0.18) 100%)" }}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="font-bold text-white mb-1">{t("dash_free_ai_title")}</div>
                            <div className="text-white/45 text-sm">{t("dash_free_ai_desc")}</div>
                          </div>
                          <button onClick={handleStartMatching}
                            className="flex-shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                            {t("dash_try_now")}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* MY SESSIONS */}
            {tab === "sessions" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {user?.role === "mentor" ? "My Sessions" : t("dash_sessions_title")}
                </h1>

                {/* ── Mentor 3-tab sessions view ──────────────────────────── */}
                {user?.role === "mentor" ? (
                  <>
                    {/* Tab bar */}
                    <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit">
                      {(["pending", "upcoming", "past"] as const).map((st) => (
                        <button key={st} onClick={() => setMentorSessionTab(st)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            mentorSessionTab === st
                              ? "bg-[#7C3AED] text-white"
                              : "text-white/45 hover:text-white"
                          }`}>
                          {st === "pending"
                            ? `Pending requests${mentorPending.length > 0 ? ` (${mentorPending.length})` : ""}`
                            : st === "upcoming" ? "Upcoming" : "Past sessions"}
                        </button>
                      ))}
                    </div>

                    {/* Pending requests + rescheduled awaiting mentee */}
                    {mentorSessionTab === "pending" && (
                      mentorPending.length > 0 || mentorRescheduled.length > 0 ? (
                        <div className="space-y-6">
                          {/* Awaiting mentee acceptance (rescheduled) */}
                          {mentorRescheduled.length > 0 && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-3">Awaiting mentee response</p>
                              <div className="space-y-3">
                                {mentorRescheduled.map(c => (
                                  <Card key={c.id} className="p-5">
                                    <div className="flex items-center gap-4">
                                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                        style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                                        {initials(c.mentees?.nom ?? "?")}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-white text-sm">{c.mentees?.nom ?? "Mentee"}</span>
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                                            New time proposed
                                          </span>
                                        </div>
                                        <div className="text-xs text-white/40 mt-0.5">
                                          {c.mentees?.objectif ?? "Mentoring session"} · {fmtDate(c.date, t, lang)} at {fmtTime(c.date, lang)}
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* New requests awaiting mentor action */}
                          {mentorPending.length > 0 && (
                            <div>
                              {mentorRescheduled.length > 0 && <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-3">New requests</p>}
                              <div className="space-y-3">
                          {mentorPending.map(c => (
                            <Card key={c.id} className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                                  {initials(c.mentees?.nom ?? "?")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-white">{c.mentees?.nom ?? "Mentee"}</div>
                                  <div className="text-xs text-white/40 mt-0.5 mb-3">
                                    {c.mentees?.objectif ?? "Mentoring session"} · {fmtDate(c.date, t, lang)} at {fmtTime(c.date, lang)}
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    <button onClick={() => handleAcceptSession(c.id)} disabled={actionLoading === c.id}
                                      className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                                      {actionLoading === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                      Accept
                                    </button>
                                    <button onClick={() => handleDeclineSession(c.id)} disabled={actionLoading === c.id}
                                      className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                                      {actionLoading === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                      Decline
                                    </button>
                                    <button
                                      onClick={() => { setProposeDate(""); setProposeTime(""); setProposeModal(c.id); }}
                                      className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                                      <CalendarRange className="w-3.5 h-3.5" /> Propose new time
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <EmptyState icon={CalendarCheck} title="No pending requests" desc="New session requests from mentees will appear here." />
                      )
                    )}

                    {/* Upcoming confirmed */}
                    {mentorSessionTab === "upcoming" && (
                      mentorUpcoming.length > 0 ? (
                        <div className="space-y-3">
                          {mentorUpcoming.map(c => (
                            <Card key={c.id} className="p-5">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                                  {initials(c.mentees?.nom ?? "?")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-white">{c.mentees?.nom ?? "Mentee"}</div>
                                  <div className="text-xs text-white/40 mt-0.5">{c.mentees?.objectif ?? "Mentoring session"}</div>
                                </div>
                                <div className="text-right flex-shrink-0 hidden sm:block mr-4">
                                  <div className="text-sm font-semibold text-white">{fmtDate(c.date, t, lang)}</div>
                                  <div className="text-xs text-white/35 mt-0.5">{fmtTime(c.date, lang)}</div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  {c.meet_link ? (
                                    <a
                                      href={c.meet_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                                    >
                                      <Video className="w-3.5 h-3.5" /> Join session
                                    </a>
                                  ) : (
                                    <button className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                                      <Video className="w-3.5 h-3.5" /> Join
                                    </button>
                                  )}
                                  <button className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors">
                                    Reschedule
                                  </button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <EmptyState icon={Clock} title="No upcoming sessions" desc="Confirmed sessions will appear here once a request is accepted." />
                      )
                    )}

                    {/* Past sessions */}
                    {mentorSessionTab === "past" && (
                      mentorPast.length > 0 ? (
                        <div className="space-y-3">
                          {mentorPast.map(c => (
                            <Card key={c.id} className="p-5">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                  style={{ background: "rgba(255,255,255,0.06)" }}>
                                  {initials(c.mentees?.nom ?? "?")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-white/70">{c.mentees?.nom ?? "Mentee"}</div>
                                  <div className="text-xs text-white/30 mt-0.5">{c.mentees?.objectif ?? "Mentoring session"}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-sm font-medium text-white/50">{fmtDate(c.date, t, lang)}</div>
                                  <div className="text-xs text-white/25 mt-0.5">{fmtTime(c.date, lang)}</div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <EmptyState icon={Video} title="No past sessions yet" desc="Completed sessions will show here." />
                      )
                    )}
                  </>
                ) : (
                  /* ── Mentee sessions view ───────────────────────────────── */
                  <>
                    {/* Rescheduled — awaiting mentee response */}
                    {upcoming.filter(c => c.statut === "rescheduled").length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-3">New time proposed</p>
                        <div className="space-y-3">
                          {upcoming.filter(c => c.statut === "rescheduled").map(c => (
                            <Card key={c.id} className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                                  {initials(c.mentors?.nom ?? "?")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-semibold text-white text-sm">{c.mentors?.nom ?? "Mentor"}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                      style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                                      New time proposed
                                    </span>
                                  </div>
                                  <div className="text-xs text-white/40 mt-0.5 mb-3">
                                    {c.mentors?.specialite ?? "Mentoring session"} · {fmtDate(c.date, t, lang)} at {fmtTime(c.date, lang)}
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => handleAcceptRetime(c.id)} disabled={actionLoading === c.id}
                                      className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                                      {actionLoading === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                      Accept new time
                                    </button>
                                    <button onClick={() => handleDeclineRetime(c.id)} disabled={actionLoading === c.id}
                                      className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                                      {actionLoading === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                      Decline
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-3">{t("dash_upcoming_label")}</p>
                      {upcoming.filter(c => c.statut !== "rescheduled").length > 0 ? (
                        <div className="space-y-3">
                          {upcoming.filter(c => c.statut !== "rescheduled").map((c) => <SessionCard key={c.id} conn={c} userRole={user?.role ?? "mentee"} />)}
                        </div>
                      ) : (
                        <EmptyState icon={CalendarCheck} title={t("dash_no_sessions")} desc={t("dash_no_sessions_desc")}
                          action={
                            <Link href="/explore"
                              className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                              <BookOpen className="w-4 h-4" /> {t("dash_find_mentor")}
                            </Link>
                          }
                        />
                      )}
                    </div>
                    {past.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-3">{t("dash_past_label")}</p>
                        <div className="space-y-3">
                          {past.map((c) => <SessionCard key={c.id} conn={c} userRole={user?.role ?? "mentee"} />)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* SAVED MENTORS */}
            {tab === "saved" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{t("dash_saved_title")}</h1>
                <EmptyState
                  icon={Heart}
                  title={t("dash_no_saved")}
                  desc={t("dash_no_saved_desc")}
                  action={
                    <Link
                      href="/explore"
                      className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                    >
                      <BookOpen className="w-4 h-4" /> {t("dash_browse_mentors")}
                    </Link>
                  }
                />
              </div>
            )}

            {/* AI MATCHING */}
            {tab === "matching" && (
              <div className="space-y-5">
                {/* Header, Premium badge only for subscribed users */}
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-extrabold text-white tracking-tight">{t("dash_ai_title")}</h1>
                      {user?.plan !== "free" && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                          style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}
                        >
                          {t("dash_ai_premium_badge")}
                        </span>
                      )}
                    </div>
                    <p className="text-white/35 text-sm mt-1">{t("dash_ai_engine_desc")}</p>
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
                    <p className="text-white/50 text-sm">{t("dash_ai_analysing")}</p>
                  </Card>
                )}

                {/* ── Free trial available, entry CTA ── */}
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
                      {t("dash_ai_free_badge")}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{t("dash_ai_free_title")}</h2>
                    <p className="text-white/40 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                      {t("dash_ai_free_desc")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleStartMatching}
                        className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
                      >
                        <Sparkles className="w-4 h-4" /> {t("dash_ai_use_free")}
                      </button>
                      <Link
                        href="/explore"
                        className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-[#7C3AED]/40 text-white/50 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-colors text-sm"
                      >
                        <BookOpen className="w-4 h-4" /> {t("dash_ai_browse")}
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
                          <div className="font-bold text-white text-sm">{t("dash_q_title")}</div>
                          <div className="text-white/35 text-xs mt-0.5">{t("dash_q_subtitle")}</div>
                        </div>
                      </div>

                      {/* Q1, goals (multi-select) */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          {t("dash_q_goal_label")} <span className="text-[#7C3AED]">*</span>
                          <span className="normal-case font-normal ml-1 text-white/25">{t("dash_q_select_all")}</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {goalOptions.map(({ value, label }) =>
                            pill(label, qGoals.includes(value), () =>
                              setQGoals((prev) => prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value])
                            )
                          )}
                        </div>
                      </div>

                      {/* Q2, field */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          {t("dash_q_field_label")}
                        </label>
                        <input
                          type="text"
                          value={qField}
                          onChange={(e) => setQField(e.target.value)}
                          placeholder={t("dash_q_field_ph")}
                          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 border border-white/10 focus:border-[#7C3AED] focus:outline-none transition-colors"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        />
                      </div>

                      {/* Q3, experience level */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          {t("dash_q_level_label")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {levelOptions.map(({ value, label }) =>
                            pill(label, qLevel === value, () => setQLevel((prev) => prev === value ? "" : value))
                          )}
                        </div>
                      </div>

                      {/* Q4, preferred language */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          {t("dash_q_lang_label")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {langOptions.map(({ value, label }) =>
                            pill(label, qLanguage === value, () => setQLanguage((prev) => prev === value ? "" : value))
                          )}
                        </div>
                      </div>

                      {/* Q5, meeting frequency */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          {t("dash_q_freq_label")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {freqOptions.map(({ value, label }) =>
                            pill(label, qFrequency === value, () => setQFrequency((prev) => prev === value ? "" : value))
                          )}
                        </div>
                      </div>

                      {/* Q6, priorities (multi-select) */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          {t("dash_q_pri_label")}
                          <span className="normal-case font-normal ml-1 text-white/25">{t("dash_q_select_all")}</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {priorityOptions.map(({ value, label }) =>
                            pill(label, qPriorities.includes(value), () =>
                              setQPriorities((prev) => prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value])
                            )
                          )}
                        </div>
                      </div>

                      {/* Q7, free text */}
                      <div className="mb-8">
                        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
                          {t("dash_q_bio_label")}
                          <span className="normal-case font-normal ml-1 text-white/25">{t("dash_q_optional")}</span>
                        </label>
                        <textarea
                          value={qBio}
                          onChange={(e) => setQBio(e.target.value)}
                          rows={3}
                          placeholder={t("dash_q_bio_ph")}
                          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 border border-white/10 focus:border-[#7C3AED] focus:outline-none transition-colors resize-none"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowQuestionnaire(false)}
                          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors"
                        >
                          {t("dash_q_cancel")}
                        </button>
                        <button
                          onClick={handleFindMatches}
                          disabled={qGoals.length === 0}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                        >
                          <Sparkles className="w-4 h-4" /> {t("dash_q_find")}
                        </button>
                      </div>
                    </Card>
                  );
                })()}

                {/* ── Paid plan, no results yet ── */}
                {!matchLoading && user?.plan !== "free" && matches.length === 0 && (
                  <Card className="p-10 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                      style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}
                    >
                      <Sparkles className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{t("dash_ai_ready_title")}</h2>
                    <p className="text-white/40 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                      {t("dash_ai_ready_desc")}
                    </p>
                    <button
                      onClick={() => runMatching()}
                      className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
                    >
                      <Sparkles className="w-4 h-4" /> {t("dash_ai_run")}
                    </button>
                  </Card>
                )}

                {/* ── Results (both free-after-trial and paid) ── */}
                {!matchLoading && matches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30">
                        {t("dash_ai_top_matches")}
                      </p>
                      {/* Refresh only for subscribed users */}
                      {user?.plan !== "free" && (
                        <button
                          onClick={() => runMatching()}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#A78BFA] hover:text-white transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> {t("dash_ai_refresh")}
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

                {/* ── Upgrade banner, shown to free users after trial is consumed ── */}
                {!matchLoading && user?.plan === "free" && hasUsedFreeMatch && (
                  <div
                    className="rounded-2xl p-6 border border-[#7C3AED]/30"
                    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(76,29,149,0.18) 100%)" }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-white mb-1">{t("dash_ai_want_new")}</div>
                        <div className="text-white/45 text-sm">{t("dash_ai_upgrade_desc")}</div>
                      </div>
                      <Link
                        href="/pricing"
                        className="flex-shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                      >
                        {t("dash_upgrade")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MY MENTEES */}
            {tab === "mentees" && user?.role === "mentor" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">My Mentees</h1>
                {myMentees.length > 0 ? (
                  <div className="space-y-3">
                    {myMentees.map(mentee => {
                      const sessionsDone = connexions.filter(
                        c => c.mentees?.id === mentee.id && c.statut === "completed"
                      ).length;
                      return (
                        <Card key={mentee.id} className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                              {initials(mentee.nom)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white">{mentee.nom}</div>
                              <div className="text-xs text-white/40 mt-0.5">{mentee.objectif ?? "Mentoring"}</div>
                            </div>
                            <div className="text-center flex-shrink-0 mr-4 hidden sm:block">
                              <div className="text-xl font-extrabold text-white">{sessionsDone}</div>
                              <div className="text-xs text-white/35">sessions done</div>
                            </div>
                            <button className="flex items-center gap-1.5 border border-white/10 hover:border-[#7C3AED]/50 text-white/60 hover:text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors flex-shrink-0">
                              View profile
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No mentees yet"
                    desc="Mentees who have active or completed sessions with you will appear here."
                  />
                )}
              </div>
            )}

            {/* CALENDAR */}
            {tab === "calendar" && user?.role === "mentor" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Calendar</h1>
                {mentorDbId && <AvailabilitySelector mentorId={mentorDbId} variant="dark" />}
                <MentorCalendar connexions={connexions} userEmail={user?.email ?? null} fmtDate={fmtDate} fmtTime={fmtTime} t={t} lang={lang} />
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

// ── Mentor Calendar ───────────────────────────────────────────────────────────

// Convert JS getDay() (0=Sun) to our day_of_week (0=Mon)
function jsDayToAvailDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function sessionDotColor(c: Connexion): string {
  const now = new Date();
  if (c.statut === "pending") return "#F472B6";
  if (c.statut === "active" && new Date(c.date) >= now) return "#4ADE80";
  if (c.statut === "completed" || c.statut === "cancelled") return "#60A5FA";
  if (c.statut === "active" && new Date(c.date) < now) return "#60A5FA"; // past active
  return "#A78BFA";
}

function MentorCalendar({
  connexions,
  userEmail,
  fmtDate,
  fmtTime,
  t,
  lang,
}: {
  connexions: Connexion[];
  userEmail: string | null;
  fmtDate: (iso: string, t: (k: string) => string, lang: string) => string;
  fmtTime: (iso: string, lang: string) => string;
  t: (k: string) => string;
  lang: string;
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [availableDays, setAvailableDays] = useState<Set<number>>(new Set());

  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Fetch which day_of_week values have availability slots (resolve mentor id from email)
  useEffect(() => {
    if (!userEmail) return;
    (async () => {
      try {
        const { data: mentorRow } = await supabase
          .from("mentors")
          .select("id")
          .eq("email", userEmail)
          .single();
        if (!mentorRow?.id) return;
        const { data: slots } = await supabase
          .from("mentor_availability")
          .select("day_of_week")
          .eq("mentor_id", mentorRow.id);
        setAvailableDays(new Set((slots ?? []).map(s => s.day_of_week as number)));
      } catch {
        // show calendar without availability tint if fetch fails
      }
    })();
  }, [userEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay  = new Date(viewYear, viewMonth + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun

  const sessionsByDay = new Map<string, Connexion[]>();
  connexions.forEach(c => {
    const d = new Date(c.date);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const key = d.toDateString();
      sessionsByDay.set(key, [...(sessionsByDay.get(key) ?? []), c]);
    }
  });

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString(
    lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-US",
    { month: "long", year: "numeric" }
  );

  const dayNames = lang === "fr"
    ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => i + 1),
  ];

  const selectedSessions = selectedDay
    ? (sessionsByDay.get(new Date(viewYear, viewMonth, Number(selectedDay)).toDateString()) ?? [])
    : [];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => {
            const d = new Date(viewYear, viewMonth - 1);
            setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); setSelectedDay(null);
          }} className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors">
            ‹
          </button>
          <span className="font-bold text-white capitalize">{monthLabel}</span>
          <button onClick={() => {
            const d = new Date(viewYear, viewMonth + 1);
            setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); setSelectedDay(null);
          }} className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors">
            ›
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-white/25 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (day === null) return <div key={`pad-${idx}`} />;
            const dateObj = new Date(viewYear, viewMonth, day);
            const key = dateObj.toDateString();
            const sessions = sessionsByDay.get(key) ?? [];
            const ourDay = jsDayToAvailDay(dateObj.getDay());
            const hasAvail = availableDays.has(ourDay);
            const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
            const isSelected = selectedDay === String(day);

            // Background: selected > availability tint (+ session colour overlay)
            let bgStyle: React.CSSProperties | undefined;
            if (!isSelected) {
              if (hasAvail && sessions.length > 0) {
                bgStyle = { background: "rgba(196,181,253,0.18)" };
              } else if (hasAvail) {
                bgStyle = { background: "rgba(196,181,253,0.12)" };
              } else if (sessions.length > 0) {
                bgStyle = { background: "rgba(124,58,237,0.12)" };
              }
            }

            // Session dots: up to 3, colored by status
            const dots = sessions.slice(0, 3).map(c => sessionDotColor(c));

            return (
              <button key={day} onClick={() => setSelectedDay(isSelected ? null : String(day))}
                style={bgStyle}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-[#7C3AED] text-white"
                    : isToday
                      ? "border border-[#7C3AED]/50 text-[#A78BFA]"
                      : sessions.length > 0 || hasAvail
                        ? "text-white hover:opacity-80"
                        : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                }`}>
                {day}
                {dots.length > 0 && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dots.map((color, i) => (
                      <span key={i} className="w-1 h-1 rounded-full" style={{ background: color }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-5 pt-4 border-t border-white/[0.06]">
          {[
            { color: "#C4B5FD", label: "Available slots" },
            { color: "#4ADE80", label: "Confirmed" },
            { color: "#F472B6", label: "Pending" },
            { color: "#60A5FA", label: "Completed" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span className="text-xs text-white/35">{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Session details for selected day */}
      {selectedDay && (
        <Card className="p-6">
          <h3 className="font-bold text-white text-sm uppercase tracking-[0.12em] mb-4">
            {fmtDate(new Date(viewYear, viewMonth, Number(selectedDay)).toISOString(), t, lang)}
          </h3>
          {selectedSessions.length > 0 ? (
            <div className="divide-y divide-white/[0.06]">
              {selectedSessions.map(c => {
                const dotColor = sessionDotColor(c);
                return (
                  <div key={c.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                      {c.mentees?.nom?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm">{c.mentees?.nom ?? "Mentee"}</div>
                      <div className="text-xs text-white/40 mt-0.5">{fmtTime(c.date, lang)}</div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1.5"
                      style={{ background: `${dotColor}20`, color: dotColor }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                      {c.statut}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/30 text-sm">No sessions on this day.</p>
          )}
        </Card>
      )}
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
