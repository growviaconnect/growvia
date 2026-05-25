"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIME_BLOCKS = [
  { key: "morning",   label: "Morning",   sub: "8h – 12h"  },
  { key: "afternoon", label: "Afternoon", sub: "12h – 18h" },
  { key: "evening",   label: "Evening",   sub: "18h – 22h" },
] as const;

type Block = "morning" | "afternoon" | "evening";


interface Props {
  mentorId: string;
  variant?: "dark" | "light";
}

export default function AvailabilitySelector({ mentorId, variant = "dark" }: Props) {
  const [selected, setSelected]   = useState<Record<number, Set<Block>>>({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    if (!mentorId) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("mentor_availability")
          .select("day_of_week, period")
          .eq("mentor_id", mentorId);

        const loaded: Record<number, Set<Block>> = {};
        for (const row of (data ?? [])) {
          const block = row.period as Block;
          if (block && ["morning", "afternoon", "evening"].includes(block)) {
            if (!loaded[row.day_of_week]) loaded[row.day_of_week] = new Set();
            loaded[row.day_of_week].add(block);
          }
        }
        setSelected(loaded);
      } finally {
        setLoading(false);
      }
    })();
  }, [mentorId]);

  function toggle(day: number, block: Block) {
    setSelected(prev => {
      const daySet = new Set<Block>(prev[day] ?? []);
      if (daySet.has(block)) daySet.delete(block); else daySet.add(block);
      return { ...prev, [day]: daySet };
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const slots: { day_of_week: number; period: string }[] = [];
    for (const [day, blocks] of Object.entries(selected)) {
      for (const block of blocks) {
        slots.push({ day_of_week: Number(day), period: block });
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

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-10 rounded-2xl"
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
            Click a cell to mark yourself available
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

      {/* Grid */}
      <div className="overflow-x-auto -mx-1">
        <div className="min-w-[480px] px-1">
          {/* Day header row */}
          <div className="grid grid-cols-8 gap-1.5 mb-1.5">
            <div />
            {DAYS.map(d => (
              <div key={d} className={`text-center text-xs font-semibold py-1.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Time block rows */}
          {TIME_BLOCKS.map(({ key, label, sub }) => (
            <div key={key} className="grid grid-cols-8 gap-1.5 mb-1.5">
              <div className="flex flex-col justify-center pr-1">
                <span className={`text-xs font-semibold leading-tight ${isDark ? "text-white/60" : "text-gray-700"}`}>{label}</span>
                <span className={`text-[10px] leading-tight mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>{sub}</span>
              </div>
              {DAYS.map((_, dayIdx) => {
                const isSel = selected[dayIdx]?.has(key as Block) ?? false;
                return (
                  <button
                    key={dayIdx}
                    type="button"
                    onClick={() => toggle(dayIdx, key as Block)}
                    aria-label={`${label} ${DAYS[dayIdx]}`}
                    aria-pressed={isSel}
                    className={`h-12 rounded-xl border-2 transition-all ${
                      isSel
                        ? "border-[#7C3AED] bg-[#7C3AED]"
                        : isDark
                          ? "border-white/[0.06] hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/10"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                    style={!isSel && isDark ? { background: "rgba(255,255,255,0.05)" } : undefined}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#7C3AED]" />
          <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded"
            style={isDark
              ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }
              : { background: "white", border: "1px solid #e5e7eb" }}
          />
          <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
