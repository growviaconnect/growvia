"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserSession } from "@/lib/session";

interface Props {
  mentorId: string;
  /** Size class applied to the icon, e.g. "w-4 h-4". Default: "w-4 h-4" */
  size?: string;
  /** Extra classes on the outer <button> */
  className?: string;
  /** Called after a successful toggle with the new saved state */
  onToggle?: (saved: boolean) => void;
}

export default function SaveMentorButton({ mentorId, size = "w-4 h-4", className = "", onToggle }: Props) {
  const router  = useRouter();
  const session = getUserSession();

  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    if (!session || session.role !== "mentee") { setReady(true); return; }

    supabase.auth.getSession().then(({ data: { session: auth } }) => {
      const token = auth?.access_token ?? "";
      fetch(`/api/saved-mentors?mentorId=${mentorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then((d: { saved?: boolean }) => { setSaved(d.saved ?? false); setReady(true); })
        .catch(() => setReady(true));
    });
  }, [mentorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push(`/auth/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (session.role !== "mentee") return;

    setLoading(true);
    try {
      const { data: { session: auth } } = await supabase.auth.getSession();
      const token = auth?.access_token ?? "";
      const res = await fetch("/api/saved-mentors", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ mentorId }),
      });
      const data = await res.json() as { saved: boolean };
      setSaved(data.saved);
      onToggle?.(data.saved);
    } finally {
      setLoading(false);
    }
  }, [mentorId, session, router]);

  // Only hide before first check; after that always show the button
  if (!ready && !session) return null;

  const isSaved = ready && saved;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={isSaved ? "Remove from saved" : "Save mentor"}
      title={isSaved ? "Remove from saved" : "Save mentor"}
      className={`flex items-center justify-center rounded-xl border transition-all duration-200 disabled:opacity-50 ${
        isSaved
          ? "bg-[#7C3AED]/15 border-[#7C3AED]/40 hover:bg-red-500/10 hover:border-red-500/30"
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
      } ${className}`}
    >
      <Heart
        className={`${size} transition-colors duration-200 ${
          isSaved ? "fill-[#7C3AED] text-[#7C3AED]" : "fill-none text-white/40 hover:text-white/70"
        }`}
      />
    </button>
  );
}
