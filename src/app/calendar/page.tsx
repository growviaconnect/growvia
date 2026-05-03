"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Video, Clock, Calendar } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

/* ── Session data ──────────────────────────────────────────────── */
const TODAY = new Date();

interface Session {
  id: number;
  mentor: string;
  role: string;
  initials: string;
  date: Date;
  duration: number;
  status: "upcoming" | "completed" | "cancelled";
  meetLink?: string;
}

// Real sessions will be loaded from the database — empty until connected
const sessions: Session[] = [];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ── Component ─────────────────────────────────────────────────── */
export default function CalendarPage() {
  const { t } = useLang();

  const months = t("cal_months").split(",");
  const weekdays = t("cal_days").split(",");

  const [viewDate, setViewDate] = useState(
    new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [gridFading, setGridFading] = useState(false);
  const [listVisible, setListVisible] = useState(true);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  const sessionDates = new Set(
    sessions.map((s) => `${s.date.getFullYear()}-${s.date.getMonth()}-${s.date.getDate()}`)
  );

  /* stagger cards on mount / filter change */
  const triggerCardStagger = useCallback((list: Session[]) => {
    setVisibleCards([]);
    list.forEach((s, i) => {
      setTimeout(() => setVisibleCards((prev) => [...prev, s.id]), i * 60 + 80);
    });
  }, []);

  const filteredSessions = selectedDate
    ? sessions.filter((s) => sameDay(s.date, selectedDate))
    : sessions;

  useEffect(() => {
    triggerCardStagger(filteredSessions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  /* initial stagger */
  useEffect(() => {
    triggerCardStagger(sessions);
  }, [triggerCardStagger]);

  function navigateMonth(dir: -1 | 1) {
    setGridFading(true);
    setTimeout(() => {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
      setGridFading(false);
    }, 160);
  }

  function selectDay(date: Date) {
    const next = selectedDate && sameDay(selectedDate, date) ? null : date;
    setListVisible(false);
    setTimeout(() => {
      setSelectedDate(next);
      setListVisible(true);
    }, 160);
  }

  function goToToday() {
    const isCurrentMonth =
      viewDate.getFullYear() === TODAY.getFullYear() &&
      viewDate.getMonth() === TODAY.getMonth();

    if (!isCurrentMonth) {
      setGridFading(true);
      setTimeout(() => {
        setViewDate(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
        setGridFading(false);
      }, 160);
    }

    if (selectedDate && sameDay(selectedDate, TODAY)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setListVisible(false);
    setTimeout(() => {
      setSelectedDate(TODAY);
      setListVisible(true);
    }, 160);
  }

  /* alert banner */
  const alertSession = sessions.find((s) => {
    if (s.status !== "upcoming") return false;
    const diff = s.date.getTime() - Date.now();
    return diff > 0 && diff < 24 * 3600 * 1000;
  });
  const alertHrs = alertSession
    ? Math.floor((alertSession.date.getTime() - Date.now()) / 3600000)
    : 0;

  /* calendar grid */
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const totalCells = offset + daysInMonth;
  const remainder = (7 - (totalCells % 7)) % 7;

  /* group sessions */
  const groups: Record<string, Session[]> = { upcoming: [], completed: [], cancelled: [] };
  filteredSessions.forEach((s) => groups[s.status].push(s));
  groups.upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
  groups.completed.sort((a, b) => b.date.getTime() - a.date.getTime());
  groups.cancelled.sort((a, b) => b.date.getTime() - a.date.getTime());

  function formatDate(date: Date) {
    const dayNames: Record<string, string[]> = {
      en: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      fr: ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],
      es: ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],
    };
    const lang = (typeof window !== "undefined" ? document.documentElement.lang : "fr") as "en" | "fr" | "es";
    const names = dayNames[lang] ?? dayNames.fr;
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${names[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} · ${h}:${m}`;
  }

  const sectionKeys: Array<{ key: "upcoming" | "completed" | "cancelled"; labelKey: string; accentColor: string }> = [
    { key: "upcoming",  labelKey: "cal_section_upcoming",  accentColor: "#f59e0b" },
    { key: "completed", labelKey: "cal_section_completed", accentColor: "#4ade80" },
    { key: "cancelled", labelKey: "cal_section_cancelled", accentColor: "rgba(255,255,255,0.12)" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background, #0D0A1A)", color: "#fff" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* ── Page header ──────────────────────────────────────── */}
        <div
          className="mb-10"
          style={{ animation: "calFadeUp 0.4s ease forwards", opacity: 0 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm mb-3 transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#A78BFA"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
          >
            {t("cal_back")}
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.8px" }}>
            {t("cal_title").split(" ").map((w, i) =>
              i === 1 ? <span key={i} style={{ color: "#A78BFA" }}> {w}</span> : <span key={i}>{i > 0 ? " " : ""}{w}</span>
            )}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t("cal_sub")}
          </p>
        </div>

        {/* ── Alert banner ─────────────────────────────────────── */}
        {alertSession && (
          <div
            className="flex items-center justify-between gap-4 rounded-xl px-5 py-3.5 mb-7 flex-wrap"
            style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.30)",
              animation: "calFadeUp 0.4s ease 0.1s forwards",
              opacity: 0,
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex-shrink-0">
                <span
                  className="block w-2 h-2 rounded-full"
                  style={{ background: "#4ade80" }}
                />
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "#4ade80",
                    opacity: 0.3,
                    animation: "calPulse 2s infinite",
                    scale: "1.8",
                  }}
                />
              </span>
              <span className="text-sm font-medium">
                {t("cal_alert_text")}{" "}
                <strong style={{ color: "#4ade80" }}>
                  {alertHrs < 1
                    ? t("cal_alert_less1h")
                    : `${alertHrs} ${alertHrs > 1 ? t("cal_alert_hours") : t("cal_alert_hour")}`}
                </strong>{" "}
                — {alertSession.mentor}
              </span>
            </div>
            <a
              href={alertSession.meetLink}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-full flex-shrink-0 transition-all"
              style={{ background: "#7C3AED" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#6D28D9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#7C3AED"; }}
            >
              <Video className="w-3.5 h-3.5" />
              {t("cal_alert_join")}
            </a>
          </div>
        )}

        {/* ── Two-column layout ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[35%_1fr] gap-6 items-start">

          {/* ── Calendar panel ─────────────────────────────────── */}
          <div style={{ animation: "calSlideLeft 0.45s ease 0.1s forwards", opacity: 0, transform: "translateX(-20px)" }}>
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(124,58,237,0.12)",
              }}
            >
              {/* Month header */}
              <div className="flex items-center justify-between mb-5">
                <span className="font-semibold text-white text-base">
                  {months[month]} {year}
                </span>
                <div className="flex gap-1">
                  {([-1, 1] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => navigateMonth(dir)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-base"
                      style={{ color: "#A78BFA" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.15)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      {dir === -1 ? "←" : "→"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {weekdays.map((d, i) => (
                  <div
                    key={i}
                    className="text-center text-[10px] font-bold uppercase py-1"
                    style={{ letterSpacing: "0.5px", color: "rgba(157,141,241,0.7)" }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div
                className="grid grid-cols-7 gap-0.5 transition-opacity duration-150"
                style={{ opacity: gridFading ? 0 : 1 }}
              >
                {/* Prev month overflow */}
                {Array.from({ length: offset }, (_, i) => (
                  <div key={`prev-${i}`} className="flex items-center justify-center min-h-[34px] text-xs"
                    style={{ color: "rgba(255,255,255,0.15)" }}>
                    {daysInPrev - offset + 1 + i}
                  </div>
                ))}

                {/* Current month */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const date = new Date(year, month, day);
                  const isToday = sameDay(date, TODAY);
                  const isSel = selectedDate ? sameDay(date, selectedDate) : false;
                  const hasSession = sessionDates.has(`${year}-${month}-${day}`);

                  return (
                    <button
                      key={day}
                      onClick={() => selectDay(date)}
                      className="relative flex flex-col items-center justify-center min-h-[34px] text-xs font-medium rounded-lg transition-all"
                      style={{
                        color: isSel ? "#fff" : "rgba(255,255,255,0.9)",
                        background: isSel ? "#7C3AED" : undefined,
                        fontWeight: isSel ? 700 : 500,
                        paddingBottom: hasSession || isToday ? "8px" : undefined,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSel) (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel) (e.currentTarget as HTMLElement).style.background = "";
                      }}
                    >
                      {day}
                      {(hasSession || isToday) && (
                        <span
                          className="absolute bottom-1 w-1 h-1 rounded-full"
                          style={{
                            background: isSel
                              ? "rgba(255,255,255,0.6)"
                              : isToday && !hasSession
                              ? "transparent"
                              : "#A78BFA",
                            border: isToday && !hasSession ? "1.5px solid #A78BFA" : undefined,
                          }}
                        />
                      )}
                    </button>
                  );
                })}

                {/* Next month overflow */}
                {Array.from({ length: remainder }, (_, i) => (
                  <div key={`next-${i}`} className="flex items-center justify-center min-h-[34px] text-xs"
                    style={{ color: "rgba(255,255,255,0.15)" }}>
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div
                className="mt-5 pt-4 flex flex-col gap-2.5"
                style={{ borderTop: "1px solid rgba(124,58,237,0.08)" }}
              >
                <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#A78BFA" }} />
                  {t("cal_legend_session")}
                </div>
                <button
                  onClick={goToToday}
                  className="inline-flex items-center gap-2 text-xs rounded-full px-3 py-1 transition-all duration-200"
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    border: "1px solid rgba(157,141,241,0.2)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#A78BFA";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(157,141,241,0.2)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ border: "1.5px solid #A78BFA" }}
                  />
                  {t("cal_legend_today")}
                </button>
              </div>
            </div>
          </div>

          {/* ── Sessions panel ─────────────────────────────────── */}
          <div
            style={{
              animation: "calSlideRight 0.45s ease 0.2s forwards",
              opacity: 0,
              transform: "translateX(20px)",
            }}
          >
            <div
              className="transition-opacity duration-150"
              style={{ opacity: listVisible ? 1 : 0 }}
            >
              {sectionKeys.every(({ key }) => groups[key].length === 0) ? (
                selectedDate ? (
                  /* A day was selected but has no sessions */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {sameDay(selectedDate, TODAY)
                        ? "Aucune session aujourd'hui"
                        : "Aucune session ce jour-là"}
                    </p>
                  </div>
                ) : (
                  /* No sessions at all */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.10)" }}
                    >
                      <Calendar className="w-7 h-7" style={{ color: "#A78BFA", opacity: 0.55 }} />
                    </div>
                    <p className="font-semibold text-white text-base mb-2">Aucune session à venir</p>
                    <p className="text-sm mb-7" style={{ color: "rgba(157,141,241,0.60)" }}>
                      Réservez une session avec un mentor pour commencer
                    </p>
                    <Link
                      href="/explore/find-a-mentor"
                      className="inline-flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-full transition-colors"
                      style={{ background: "#7C3AED" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#6D28D9"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#7C3AED"; }}
                    >
                      Trouver un mentor →
                    </Link>
                  </div>
                )
              ) : (
                sectionKeys.map(({ key, labelKey, accentColor }) => {
                  const list = groups[key];
                  if (!list.length) return null;
                  return (
                    <div key={key} className="mb-7">
                      {/* Section label */}
                      <div className="flex items-center gap-3 mb-3.5">
                        <span
                          className="text-[10px] font-bold whitespace-nowrap flex-shrink-0"
                          style={{
                            letterSpacing: "1.4px",
                            textTransform: "uppercase",
                            color: "rgba(157,141,241,0.70)",
                          }}
                        >
                          {t(labelKey)}
                        </span>
                        <span className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.10)" }} />
                      </div>

                      {/* Cards */}
                      {list.map((session) => {
                        const isVisible = visibleCards.includes(session.id);
                        const isCancelled = session.status === "cancelled";
                        return (
                          <div
                            key={session.id}
                            className="flex items-center gap-4 rounded-2xl px-5 py-4 mb-3 relative overflow-hidden transition-all duration-[250ms]"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(124,58,237,0.12)",
                              opacity: isVisible ? (isCancelled ? 0.6 : 1) : 0,
                              transform: isVisible ? "translateY(0)" : "translateY(12px)",
                              cursor: isCancelled ? "default" : undefined,
                            }}
                            onMouseEnter={(e) => {
                              if (isCancelled) return;
                              const el = e.currentTarget as HTMLElement;
                              el.style.borderColor = "rgba(124,58,237,0.40)";
                              el.style.transform = "translateY(-2px)";
                              el.style.boxShadow = "0 8px 24px rgba(124,58,237,0.08)";
                            }}
                            onMouseLeave={(e) => {
                              if (isCancelled) return;
                              const el = e.currentTarget as HTMLElement;
                              el.style.borderColor = "rgba(124,58,237,0.12)";
                              el.style.transform = isVisible ? "translateY(0)" : "translateY(12px)";
                              el.style.boxShadow = "";
                            }}
                          >
                            {/* Left accent bar */}
                            <span
                              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                              style={{ background: accentColor }}
                            />

                            {/* Avatar */}
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                              style={{
                                background: isCancelled
                                  ? "rgba(255,255,255,0.08)"
                                  : "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
                                color: isCancelled ? "rgba(255,255,255,0.45)" : "#fff",
                              }}
                            >
                              {session.initials}
                            </div>

                            {/* Body */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm text-white truncate">
                                    {session.mentor}
                                  </p>
                                  <p className="text-xs truncate mt-0.5" style={{ color: "rgba(157,141,241,0.7)" }}>
                                    {session.role}
                                  </p>
                                </div>
                                {/* Badge */}
                                <span
                                  className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                                  style={
                                    session.status === "upcoming"
                                      ? { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }
                                      : session.status === "completed"
                                      ? { background: "rgba(74,222,128,0.10)", color: "#4ade80" }
                                      : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }
                                  }
                                >
                                  {t(`cal_badge_${session.status}`)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                {formatDate(session.date)} · {session.duration} min
                              </div>
                            </div>

                            {/* Join button */}
                            {session.status === "upcoming" && session.meetLink && (
                              <a
                                href={session.meetLink}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-full flex-shrink-0 transition-all relative overflow-hidden"
                                style={{ background: "#7C3AED" }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLElement).style.background = "#6D28D9";
                                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(124,58,237,0.4)";
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLElement).style.background = "#7C3AED";
                                  (e.currentTarget as HTMLElement).style.transform = "";
                                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                                }}
                              >
                                <Video className="w-3 h-3" />
                                {t("cal_btn_join")}
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Keyframes ────────────────────────────────────────────── */}
      <style>{`
        @keyframes calFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes calSlideLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes calSlideRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes calPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50%       { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
