"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save } from "lucide-react";

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function generateSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots; // 28 slots: 08:00 – 21:30
}

const ALL_SLOTS = generateSlots();

function addHalfHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

interface Props {
  mentorId: string;
  variant?: "dark" | "light";
}

export default function AvailabilitySelector({ mentorId, variant = "dark" }: Props) {
  const [selectedDay, setSelectedDay]     = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<Record<number, Set<string>>>({});
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [saved, setSaved]                 = useState(false);

  useEffect(() => {
    if (!mentorId) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("mentor_availability")
          .select("day_of_week, start_time")
          .eq("mentor_id", mentorId);

        const loaded: Record<number, Set<string>> = {};
        for (const row of (data ?? [])) {
          if (!loaded[row.day_of_week]) loaded[row.day_of_week] = new Set();
          loaded[row.day_of_week].add((row.start_time as string).slice(0, 5));
        }
        setSelectedSlots(loaded);
      } finally {
        setLoading(false);
      }
    })();
  }, [mentorId]);

  function toggleSlot(time: string) {
    setSelectedSlots(prev => {
      const daySet = new Set(prev[selectedDay] ?? []);
      if (daySet.has(time)) daySet.delete(time); else daySet.add(time);
      return { ...prev, [selectedDay]: daySet };
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const slots: { day_of_week: number; start_time: string; end_time: string }[] = [];
    for (const [day, times] of Object.entries(selectedSlots)) {
      for (const startTime of times) {
        slots.push({ day_of_week: Number(day), start_time: startTime, end_time: addHalfHour(startTime) });
      }
    }

    try {
      const res = await fetch("/api/mentor/save-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, slots }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const isDark = variant === "dark";
  const activeCount = Object.values(selectedSlots).reduce((sum, s) => sum + s.size, 0);
  const currentDaySlots = selectedSlots[selectedDay] ?? new Set<string>();

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-12 rounded-2xl"
        style={{
          background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
          border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb",
        }}
      >
        <Loader2 className="w-5 h-5 animate-spin text-[#A78BFA]" />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{
        background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Weekly Availability</h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
            {activeCount} slot{activeCount !== 1 ? "s" : ""} selected across the week
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Day tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {DAYS_SHORT.map((d, i) => {
          const count = selectedSlots[i]?.size ?? 0;
          const active = selectedDay === i;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(i)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                active
                  ? "bg-[#7C3AED] text-white"
                  : isDark
                    ? "text-white/50 hover:text-white hover:bg-white/10"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {d}
              {count > 0 && (
                <span
                  className={`text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                    active ? "bg-white/25 text-white" : "bg-[#7C3AED]/20 text-[#A78BFA]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Slot chips */}
      <div>
        <p className={`text-xs font-medium mb-3 ${isDark ? "text-white/50" : "text-gray-500"}`}>
          {DAYS_FULL[selectedDay]} — select your available time slots
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {ALL_SLOTS.map(time => {
            const sel = currentDaySlots.has(time);
            return (
              <button
                key={time}
                onClick={() => toggleSlot(time)}
                className={`py-2 rounded-xl text-xs font-semibold transition-colors ${
                  sel
                    ? "bg-[#7C3AED] text-white"
                    : isDark
                      ? "text-white/60 hover:text-white hover:bg-white/15"
                      : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
                style={!sel && isDark ? { background: "rgba(255,255,255,0.08)" } : undefined}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
