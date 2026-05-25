"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserSession } from "@/lib/session";
import SaveMentorButton from "@/components/SaveMentorButton";

type SavedMentor = {
  id: string;
  nom: string;
  poste_actuel: string | null;
  entreprise: string | null;
  photo_url: string | null;
  session_price: number | null;
  job_title: string | null;
  specialite: string | null;
  industry: string | null;
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function SavedMentorCard({ mentor, onUnsave }: { mentor: SavedMentor; onUnsave: (id: string) => void }) {
  return (
    <div
      className="rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-4 hover:border-[#7C3AED]/40 transition-colors duration-300 relative"
      style={{ background: "#13111F" }}
    >
      {/* Heart — clicking unsaves and removes card from list */}
      <SaveMentorButton
        mentorId={mentor.id}
        size="w-4 h-4"
        className="absolute top-4 right-4 w-8 h-8"
        onToggle={(saved) => { if (!saved) onUnsave(mentor.id); }}
      />

      {/* Identity */}
      <div className="flex items-center gap-4 pr-10">
        {mentor.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mentor.photo_url} alt={mentor.nom} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
          >
            {initials(mentor.nom)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-white truncate">{mentor.nom}</h3>
          <p className="text-sm text-white/50 truncate">
            {mentor.poste_actuel ?? mentor.job_title ?? mentor.specialite ?? ""}
            {mentor.entreprise && <span className="text-white/30"> · {mentor.entreprise}</span>}
          </p>
          {mentor.industry && (
            <p className="text-xs text-white/30 mt-0.5 truncate">{mentor.industry}</p>
          )}
        </div>
      </div>

      {/* Price */}
      {mentor.session_price != null && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] self-start"
          style={{ background: "#0D0A1A" }}
        >
          <span className="text-sm font-bold text-white">{mentor.session_price}€</span>
          <span className="text-xs text-white/30">/ session</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex gap-2">
        <Link
          href={`/mentors/${mentor.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/10 hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/5 transition-colors"
        >
          View profile
        </Link>
        <Link
          href={`/mentors/${mentor.id}#book`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] transition-colors"
        >
          Book session <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function SavedMentorsPage() {
  const router  = useRouter();
  const session = getUserSession();

  const [mentors, setMentors] = useState<SavedMentor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    const { data: { session: auth } } = await supabase.auth.getSession();
    const token = auth?.access_token ?? "";
    const res = await fetch("/api/saved-mentors", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { saved?: SavedMentor[] };
    setMentors((data.saved ?? []) as SavedMentor[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!session) { router.push("/auth/login?next=/dashboard/saved-mentors"); return; }
    if (session.role !== "mentee") { router.push("/dashboard"); return; }
    fetchSaved();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleUnsave(mentorId: string) {
    setMentors(prev => prev.filter(m => m.id !== mentorId));
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <Heart className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Saved Mentors</h1>
            <p className="text-white/35 text-sm mt-0.5">
              {loading ? "Loading…" : `${mentors.length} mentor${mentors.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
            >
              <Heart className="w-8 h-8 text-[#A78BFA]" />
            </div>
            <p className="text-white/50 text-base mb-1">No saved mentors yet</p>
            <p className="text-white/25 text-sm mb-6">
              Click the ♡ on any mentor card to save them here.
            </p>
            <Link
              href="/explore/find-a-mentor"
              className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Browse mentors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.map(m => (
              <SavedMentorCard key={m.id} mentor={m} onUnsave={handleUnsave} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
