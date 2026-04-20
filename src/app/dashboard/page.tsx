"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { clearUserSession, getUserSession, setUserSession } from "@/lib/session";
import { clearAuthCookie } from "@/lib/auth";
import {
  CalendarCheck,
  Heart,
  Sparkles,
  User,
  Clock,
  Video,
  Star,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";

const upcomingSessions = [
  {
    mentor: "Sophie Chen",
    role: "Product Manager at Spotify",
    date: "Tomorrow",
    time: "10:00",
    duration: "60 min",
    status: "upcoming",
    initials: "SC",
  },
  {
    mentor: "Marcus Dubois",
    role: "Founder at TechStart Paris",
    date: "April 14",
    time: "14:30",
    duration: "30 min",
    status: "upcoming",
    initials: "MD",
  },
];

const pastSessions = [
  {
    mentor: "Aisha Patel",
    role: "HR Director at L'Oréal",
    date: "April 5",
    time: "11:00",
    duration: "60 min",
    status: "completed",
    initials: "AP",
    rating: 5,
  },
];

const savedMentors = [
  { name: "Sophie Chen", role: "Product Manager at Spotify", match: "98%", initials: "SC" },
  { name: "Marcus Dubois", role: "Founder at TechStart Paris", match: "95%", initials: "MD" },
];

type Tab = "overview" | "sessions" | "saved" | "matching";

/* ── Reusable dark card wrapper ──────────────────────────────── */
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl border border-white/[0.07] ${className}`}
    style={{ background: "rgba(255,255,255,0.04)" }}
  >
    {children}
  </div>
);

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("overview");
  const [planUpgraded, setPlanUpgraded] = useState<string | null>(null);

  // Handle return from Stripe Checkout
  useEffect(() => {
    const plan = searchParams.get("plan");
    if (!plan) return;
    const session = getUserSession();
    if (session) {
      const updated = { ...session, plan: plan as "free" | "pro" | "school" };
      setUserSession(updated);
      supabase.auth.updateUser({ data: { plan } }).catch(() => {});
      setPlanUpgraded(plan);
    }
    // Remove query params from URL without re-render
    router.replace("/dashboard");
  }, [searchParams, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    clearAuthCookie();
    clearUserSession();
    router.push("/");
  }

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview",  label: "Overview",       icon: TrendingUp },
    { id: "sessions",  label: "My Sessions",    icon: CalendarCheck },
    { id: "saved",     label: "Saved Mentors",  icon: Heart },
    { id: "matching",  label: "AI Matching",    icon: Sparkles },
  ];

  const secondaryNav = [
    { href: "/profile",  label: "Profile",    icon: User },
    { href: "/calendar", label: "Calendar",   icon: CalendarCheck },
    { href: "/settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="lg:w-60 flex-shrink-0 space-y-3">

            {/* Avatar + name */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
                >
                  LK
                </div>
                <div>
                  <div className="font-semibold text-white text-sm leading-tight">Luna K.</div>
                  <div className="text-xs text-white/35 mt-0.5">Mentee</div>
                </div>
              </div>

              {/* Primary nav */}
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

            {/* Secondary nav */}
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
                  Déconnexion
                </button>
              </nav>
            </Card>
          </aside>

          {/* ── Main content ────────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* OVERVIEW */}
            {tab === "overview" && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">Good morning, Luna</h1>
                  <p className="text-white/35 text-sm mt-1">Here is your mentoring overview.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Sessions Booked", value: "3",  icon: CalendarCheck, accent: "rgba(124,58,237,0.15)", iconColor: "text-[#A78BFA]" },
                    { label: "Sessions Done",   value: "1",  icon: Video,         accent: "rgba(16,185,129,0.12)", iconColor: "text-emerald-400" },
                    { label: "Saved Mentors",   value: "2",  icon: Heart,         accent: "rgba(236,72,153,0.12)", iconColor: "text-pink-400" },
                    { label: "AI Matches Left", value: "0",  icon: Sparkles,      accent: "rgba(245,158,11,0.12)", iconColor: "text-amber-400" },
                  ].map((stat) => (
                    <Card key={stat.label} className="p-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: stat.accent, border: `1px solid ${stat.accent.replace("0.15", "0.3").replace("0.12", "0.25")}` }}
                      >
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                      <div className="text-xs text-white/35 mt-0.5">{stat.label}</div>
                    </Card>
                  ))}
                </div>

                {/* Next session */}
                {upcomingSessions.length > 0 && (
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
                      const s = upcomingSessions[0];
                      return (
                        <div className="flex items-center gap-4">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
                          >
                            {s.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm">{s.mentor}</div>
                            <div className="text-xs text-white/35 mt-0.5">{s.role}</div>
                          </div>
                          <div className="text-right flex-shrink-0 hidden sm:block">
                            <div className="text-sm font-semibold text-white">{s.date}</div>
                            <div className="text-xs text-white/35 mt-0.5">{s.time} · {s.duration}</div>
                          </div>
                          <button
                            className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0"
                          >
                            <Video className="w-3.5 h-3.5" /> Join
                          </button>
                        </div>
                      );
                    })()}
                  </Card>
                )}

                {/* Plan upgraded toast */}
                {planUpgraded && (
                  <div className="rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-3"
                    style={{ background: "rgba(16,185,129,0.1)" }}>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-300 text-sm font-medium">
                      Your plan was upgraded to <span className="capitalize font-bold">{planUpgraded}</span>. Welcome to the next level!
                    </span>
                  </div>
                )}

                {/* Upgrade banner */}
                <div
                  className="rounded-2xl p-6 border border-[#7C3AED]/30"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(76,29,149,0.18) 100%)" }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-white mb-1">Unlock unlimited AI matching</div>
                      <div className="text-white/45 text-sm">Subscribe for 14.99€/month and get full access + unlimited AI matches.</div>
                    </div>
                    <Link
                      href="/pricing"
                      className="flex-shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                    >
                      Upgrade
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* MY SESSIONS */}
            {tab === "sessions" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">My Sessions</h1>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-3">Upcoming</p>
                  <div className="space-y-3">
                    {upcomingSessions.map((s) => (
                      <Card key={s.mentor} className="p-5 flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
                        >
                          {s.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm">{s.mentor}</div>
                          <div className="text-xs text-white/35 mt-0.5">{s.role}</div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="inline-flex items-center gap-1 text-xs text-white/35">
                              <Clock className="w-3 h-3" /> {s.date} at {s.time}
                            </span>
                            <span className="text-xs text-white/25">{s.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: "rgba(124,58,237,0.18)", color: "#A78BFA" }}
                          >
                            {s.status}
                          </span>
                          <button className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                            <Video className="w-3.5 h-3.5" /> Join
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-3">Past Sessions</p>
                  <div className="space-y-3">
                    {pastSessions.map((s) => (
                      <Card key={s.mentor} className="p-5 flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white/60 font-bold text-sm flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          {s.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm">{s.mentor}</div>
                          <div className="text-xs text-white/35 mt-0.5">{s.role}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 text-xs text-white/35">
                              <Clock className="w-3 h-3" /> {s.date}
                            </span>
                            {s.rating && (
                              <span className="flex items-center gap-0.5">
                                {Array.from({ length: s.rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{ background: "rgba(16,185,129,0.12)", color: "#34d399" }}
                        >
                          {s.status}
                        </span>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SAVED MENTORS */}
            {tab === "saved" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Saved Mentors</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedMentors.map((m) => (
                    <Card key={m.name} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
                        >
                          {m.initials}
                        </div>
                        <button className="text-pink-400/60 hover:text-pink-400 transition-colors">
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                      <h3 className="font-bold text-white text-sm mb-0.5">{m.name}</h3>
                      <p className="text-sm text-white/35 mb-5">{m.role}</p>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(16,185,129,0.12)", color: "#34d399" }}
                        >
                          {m.match} match
                        </span>
                        <button className="text-sm font-semibold text-[#7C3AED] hover:text-[#A78BFA] transition-colors">
                          Book session
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* AI MATCHING */}
            {tab === "matching" && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Smart Matching</h1>
                  <p className="text-white/35 text-sm mt-1">Find your perfect mentor using our intelligent matching engine.</p>
                </div>
                <Card className="p-10 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
                  >
                    <Sparkles className="w-8 h-8 text-[#A78BFA]" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">You have used your free AI match</h2>
                  <p className="text-white/40 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                    Upgrade to a subscription to get unlimited AI Smart Matching and find the best mentor for every stage of your journey.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
                    >
                      Upgrade for Unlimited Matching
                    </Link>
                    <Link
                      href="/explore"
                      className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-[#7C3AED]/40 text-white/50 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-colors text-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      Browse Mentors Manually
                    </Link>
                  </div>
                </Card>
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
    <Suspense fallback={<div className="min-h-screen bg-[#0D0A1A]" />}>
      <DashboardContent />
    </Suspense>
  );
}
