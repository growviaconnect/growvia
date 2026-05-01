"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Star, Sparkles, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

type MentorRow = {
  id: string;
  nom: string;
  job_title: string | null;
  company: string | null;
  expertise: string[] | null;
  mentor_score: number | null;
  session_price: number | null;
  seniority: string | null;
};

function scoreColor(s: number | null | undefined) {
  if (!s) return "#6B7280";
  return s >= 70 ? "#10B981" : s >= 40 ? "#F59E0B" : "#EF4444";
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function MentorCard({ mentor }: { mentor: MentorRow }) {
  const color = scoreColor(mentor.mentor_score);
  const tags = (mentor.expertise ?? []).slice(0, 3);
  const extra = (mentor.expertise ?? []).length - 3;

  return (
    <div
      className="rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-4 hover:border-[#7C3AED]/40 transition-colors duration-300"
      style={{ background: "#13111F" }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
        >
          {initials(mentor.nom)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-white truncate">{mentor.nom}</h3>
          <p className="text-sm text-white/50 truncate">
            {mentor.job_title}
            {mentor.company && <span className="text-white/30"> @ {mentor.company}</span>}
          </p>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#A78BFA] border border-[#7C3AED]/20"
              style={{ background: "rgba(124,58,237,0.06)" }}
            >
              {tag}
            </span>
          ))}
          {extra > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium text-white/30 border border-white/10">
              +{extra}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        {mentor.mentor_score != null && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06]"
            style={{ background: "#0D0A1A" }}
          >
            <Star className="w-3 h-3 flex-shrink-0" style={{ color }} />
            <span className="text-sm font-bold" style={{ color }}>{mentor.mentor_score}</span>
            <span className="text-xs text-white/30">/100</span>
          </div>
        )}
        {mentor.session_price != null && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06]"
            style={{ background: "#0D0A1A" }}
          >
            <span className="text-sm font-bold text-white">{mentor.session_price}€</span>
            <span className="text-xs text-white/30">/ session</span>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <Link
          href={`/mentors/${mentor.id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white border border-[#7C3AED]/40 hover:bg-[#7C3AED]/10 hover:border-[#7C3AED]/70 transition-colors"
        >
          View Profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-6 border border-white/[0.06] animate-pulse space-y-4"
      style={{ background: "#13111F" }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/5 rounded w-32" />
          <div className="h-3 bg-white/5 rounded w-48" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-white/5 rounded-lg w-16" />
        <div className="h-6 bg-white/5 rounded-lg w-14" />
      </div>
      <div className="flex gap-3">
        <div className="h-7 bg-white/5 rounded-lg w-20" />
        <div className="h-7 bg-white/5 rounded-lg w-24" />
      </div>
      <div className="h-10 bg-white/5 rounded-xl w-full" />
    </div>
  );
}

export default function FindAMentorPage() {
  const [mentors, setMentors]   = useState<MentorRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    async function fetchMentors() {
      const { data } = await supabase
        .from("mentors")
        .select("id, nom, job_title, company, expertise, mentor_score, session_price, seniority")
        .eq("onboarding_completed", true)
        .eq("statut", "active")
        .order("mentor_score", { ascending: false });

      setMentors((data as MentorRow[]) ?? []);
      setLoading(false);
    }

    fetchMentors();

    const channel = supabase
      .channel("find-mentor-list")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "mentors" }, fetchMentors)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = search.trim()
    ? mentors.filter(m => {
        const q = search.toLowerCase();
        return (
          m.nom.toLowerCase().includes(q) ||
          (m.job_title ?? "").toLowerCase().includes(q) ||
          (m.expertise ?? []).some(e => e.toLowerCase().includes(q))
        );
      })
    : mentors;

  return (
    <div className="min-h-screen bg-[#0D0A1A]">

      {/* Header */}
      <section
        className="pt-28 pb-16 text-center px-4"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%), #0D0A1A",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-[0.15em]">
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            Mentor network
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Find your{" "}
            <span style={{ color: "#A78BFA" }}>mentor</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed mb-8">
            Experienced professionals ready to guide you, matched in minutes.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role, or expertise…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg mb-2">
              {search ? "No mentors match your search." : "No mentors yet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-[#A78BFA] hover:text-white transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-white/30 text-sm mb-8">
              {filtered.length} mentor{filtered.length !== 1 ? "s" : ""} available
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(m => (
                <MentorCard key={m.id} mentor={m} />
              ))}
            </div>
          </>
        )}
      </section>

    </div>
  );
}
