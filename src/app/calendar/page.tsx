import Link from "next/link";
import { ArrowLeft, Clock, Video, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

const allSessions = [
  {
    id: 1,
    mentor: "Sophie Chen",
    role: "Product Manager at Spotify",
    date: "April 10, 2026",
    time: "10:00",
    duration: "60 min",
    status: "upcoming",
    initials: "SC",
    meetLink: "#",
  },
  {
    id: 2,
    mentor: "Marcus Dubois",
    role: "Founder at TechStart Paris",
    date: "April 14, 2026",
    time: "14:30",
    duration: "30 min",
    status: "upcoming",
    initials: "MD",
    meetLink: "#",
  },
  {
    id: 3,
    mentor: "Aisha Patel",
    role: "HR Director at L'Oréal",
    date: "April 5, 2026",
    time: "11:00",
    duration: "60 min",
    status: "completed",
    initials: "AP",
    meetLink: null,
  },
  {
    id: 4,
    mentor: "Julien Martin",
    role: "Senior Designer at Adobe",
    date: "March 28, 2026",
    time: "15:00",
    duration: "30 min",
    status: "cancelled",
    initials: "JM",
    meetLink: null,
  },
];

const statusConfig = {
  upcoming: { label: "Upcoming", color: "bg-purple-50 text-purple-600", icon: Clock },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500", icon: XCircle },
};

const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
const sessionDays = [10, 14];

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Calendar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mini calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">April 2026</h2>
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* offset for April starting on Wednesday */}
                {[1, 2].map((i) => (
                  <div key={`empty-${i}`} />
                ))}
                {daysInMonth.map((day) => (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center text-xs rounded-lg font-medium cursor-pointer transition-colors relative ${
                      day === 10 || day === 14
                        ? "gradient-bg text-white"
                        : day === 9
                        ? "bg-purple-100 text-purple-700 ring-2 ring-purple-400"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {day}
                    {sessionDays.includes(day) && (
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-300" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 rounded gradient-bg flex-shrink-0" />
                  Session scheduled
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 rounded bg-purple-100 ring-1 ring-purple-400 flex-shrink-0" />
                  Today
                </div>
              </div>
            </div>
          </div>

          {/* Session list */}
          <div className="lg:col-span-2 space-y-4">
            {["upcoming", "completed", "cancelled"].map((statusKey) => {
              const filtered = allSessions.filter((s) => s.status === statusKey);
              if (filtered.length === 0) return null;
              const config = statusConfig[statusKey as keyof typeof statusConfig];

              return (
                <div key={statusKey}>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {config.label}
                  </h2>
                  <div className="space-y-3">
                    {filtered.map((session) => (
                      <div
                        key={session.id}
                        className={`bg-white rounded-2xl p-5 card-shadow flex items-center gap-4 ${
                          session.status === "cancelled" ? "opacity-60" : ""
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 ${
                            session.status === "cancelled"
                              ? "bg-gray-200 text-gray-500"
                              : "gradient-bg"
                          }`}
                        >
                          {session.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">{session.mentor}</div>
                          <div className="text-xs text-gray-500 truncate">{session.role}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {session.date} at {session.time} · {session.duration}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                            {config.label}
                          </span>
                          {session.meetLink && (
                            <a
                              href={session.meetLink}
                              className="flex items-center gap-1.5 gradient-bg text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                            >
                              <Video className="w-3 h-3" /> Join
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
