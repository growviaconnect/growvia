"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase, type Mentor } from "@/lib/supabase";

type MentorRow = Pick<Mentor,
  "id" | "nom" | "job_title" | "company" | "expertise" |
  "mentor_score" | "session_price" | "seniority"
>;

const PLACEHOLDERS: MentorRow[] = [
  {
    id: "p1", nom: "Sofia Moretti", job_title: "Product Manager", company: "Google",
    expertise: ["Strategy", "Tech", "Design"], mentor_score: 82, session_price: 75, seniority: "Senior",
  },
  {
    id: "p2", nom: "Lucas Bernard", job_title: "Senior Software Engineer", company: "Stripe",
    expertise: ["Tech", "Entrepreneurship", "Finance"], mentor_score: 74, session_price: 60, seniority: "Lead / Manager",
  },
  {
    id: "p3", nom: "Amira Khalil", job_title: "Marketing Director", company: "LVMH",
    expertise: ["Marketing", "Sales", "Strategy"], mentor_score: 68, session_price: 55, seniority: "Director",
  },
];

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function MentorCard({ mentor, placeholder = false }: { mentor: MentorRow; placeholder?: boolean }) {
  const tags = (mentor.expertise ?? []).slice(0, 3);
  const extra = (mentor.expertise ?? []).length - 3;

  return (
    <div
      className="rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-4 hover:border-[#7C3AED]/40 transition-colors duration-300"
      style={{ background: "#13111F" }}
    >
      {/* Identity */}
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
        >
          {initials(mentor.nom)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white truncate">{mentor.nom}</h3>
            {placeholder && (
              <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wide text-white/20 border border-white/[0.08] rounded px-1.5 py-0.5">
                Sample
              </span>
            )}
          </div>
          <p className="text-sm text-white/50 truncate">
            {mentor.job_title}
            {mentor.company && <span className="text-white/30"> @ {mentor.company}</span>}
          </p>
        </div>
      </div>

      {/* Expertise tags */}
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

      {/* CTA */}
      <div className="mt-auto">
        {placeholder ? (
          <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-white/20 border border-white/[0.06] text-center cursor-default">
            View Profile
          </div>
        ) : (
          <Link
            href={`/mentors/${mentor.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white border border-[#7C3AED]/40 hover:bg-[#7C3AED]/10 hover:border-[#7C3AED]/70 transition-colors"
          >
            View Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
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
        <div className="h-6 bg-white/5 rounded-lg w-18" />
      </div>
      <div className="flex gap-3">
        <div className="h-7 bg-white/5 rounded-lg w-20" />
        <div className="h-7 bg-white/5 rounded-lg w-24" />
      </div>
      <div className="h-10 bg-white/5 rounded-xl w-full" />
    </div>
  );
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchMentors();

    const channel = supabase
      .channel("mentors-list")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "mentors" }, fetchMentors)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const showPlaceholders = !loading && mentors.length === 0;
  const displayed = showPlaceholders ? PLACEHOLDERS : mentors;

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
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-[0.15em]">
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            Mentor network
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Find your{" "}
            <span style={{ color: "#A78BFA" }}>mentor</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Experienced professionals ready to guide you, matched in minutes.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <>
            {showPlaceholders && (
              <p className="text-center text-white/25 text-sm mb-8">
                No mentors yet, here's a preview of what your network will look like.
              </p>
            )}
            {!showPlaceholders && (
              <p className="text-white/30 text-sm mb-8">
                {mentors.length} mentor{mentors.length !== 1 ? "s" : ""} available
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayed.map(m => (
                <MentorCard key={m.id} mentor={m} placeholder={showPlaceholders} />
              ))}
            </div>
          </>
        )}
      </section>

    </div>
  );
}
