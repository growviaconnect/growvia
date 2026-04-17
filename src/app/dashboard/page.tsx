"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  function handleLogout() {
    if (typeof window !== "undefined") localStorage.removeItem("gv_user");
    router.push("/");
  }

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "sessions", label: "My Sessions", icon: CalendarCheck },
    { id: "saved", label: "Saved Mentors", icon: Heart },
    { id: "matching", label: "AI Matching", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 card-shadow mb-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold">
                  LK
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Luna K.</div>
                  <div className="text-xs text-gray-400">Mentee</div>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      tab === item.id
                        ? "gradient-bg text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="bg-white rounded-2xl p-5 card-shadow">
              <nav className="space-y-1">
                {[
                  { href: "/profile",   label: "Profile",    icon: User },
                  { href: "/calendar",  label: "Calendar",   icon: CalendarCheck },
                  { href: "/settings",  label: "Paramètres", icon: Settings },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {tab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Good morning, Luna</h1>
                  <p className="text-gray-500 text-sm">Here is your mentoring overview.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Sessions Booked", value: "3", icon: CalendarCheck, color: "text-purple-600 bg-purple-50" },
                    { label: "Sessions Done", value: "1", icon: Video, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Saved Mentors", value: "2", icon: Heart, color: "text-pink-600 bg-pink-50" },
                    { label: "AI Matches Left", value: "0", icon: Sparkles, color: "text-amber-600 bg-amber-50" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl p-5 card-shadow">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Upcoming session */}
                {upcomingSessions.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 card-shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold text-gray-900">Next Session</h2>
                      <button onClick={() => setTab("sessions")} className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1">
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    {(() => {
                      const s = upcomingSessions[0];
                      return (
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                            {s.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm">{s.mentor}</div>
                            <div className="text-xs text-gray-500">{s.role}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-semibold text-gray-900">{s.date}</div>
                            <div className="text-xs text-gray-500">{s.time} · {s.duration}</div>
                          </div>
                          <button className="flex items-center gap-1.5 gradient-bg text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0">
                            <Video className="w-3.5 h-3.5" /> Join
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Subscription upgrade */}
                <div className="gradient-bg rounded-2xl p-6 text-white">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold mb-1">Unlock unlimited AI matching</div>
                      <div className="text-purple-100 text-sm">Subscribe for 39€/month and get 3 sessions + unlimited AI matches.</div>
                    </div>
                    <Link
                      href="/pricing"
                      className="flex-shrink-0 bg-white text-purple-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-colors"
                    >
                      Upgrade
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {tab === "sessions" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>

                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming</h2>
                  <div className="space-y-3">
                    {upcomingSessions.map((s) => (
                      <div key={s.mentor} className="bg-white rounded-2xl p-5 card-shadow flex items-center gap-4">
                        <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                          {s.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">{s.mentor}</div>
                          <div className="text-xs text-gray-500">{s.role}</div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" /> {s.date} at {s.time}
                            </span>
                            <span className="text-xs text-gray-400">{s.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs bg-purple-50 text-purple-600 font-medium px-2.5 py-1 rounded-full">
                            {s.status}
                          </span>
                          <button className="flex items-center gap-1.5 gradient-bg text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
                            <Video className="w-3.5 h-3.5" /> Join
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Past Sessions</h2>
                  <div className="space-y-3">
                    {pastSessions.map((s) => (
                      <div key={s.mentor} className="bg-white rounded-2xl p-5 card-shadow flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                          {s.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">{s.mentor}</div>
                          <div className="text-xs text-gray-500">{s.role}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
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
                        <span className="text-xs bg-emerald-50 text-emerald-600 font-medium px-2.5 py-1 rounded-full flex-shrink-0">
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "saved" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Saved Mentors</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedMentors.map((m) => (
                    <div key={m.name} className="bg-white rounded-2xl p-6 card-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {m.initials}
                        </div>
                        <button className="text-pink-500 hover:text-pink-700 transition-colors">
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-0.5">{m.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{m.role}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          {m.match} match
                        </span>
                        <button className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                          Book session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "matching" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Smart Matching</h1>
                  <p className="text-gray-500 text-sm">Find your perfect mentor using our intelligent matching engine.</p>
                </div>
                <div className="bg-white rounded-2xl p-8 card-shadow text-center">
                  <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">You have used your free AI match</h2>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                    Upgrade to a subscription to get unlimited AI Smart Matching and find the best mentor for every stage of your journey.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 gradient-bg text-white font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Upgrade for Unlimited Matching
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-7 py-3.5 rounded-xl hover:border-purple-300 hover:text-purple-700 transition-colors text-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      Browse Mentors Manually
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
