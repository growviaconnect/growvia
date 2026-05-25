"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import VideoModal from "@/components/VideoModal";
import AnimatedHeroBg from "@/components/AnimatedHeroBg";
import type { VideoItem } from "@/lib/video-data";
import { VIDEOS, DOMAIN_COLORS } from "@/lib/video-data";

const ALL_DOMAINS = ["All", ...Array.from(new Set(VIDEOS.map(v => v.domain)))];

export default function WhoIsItForPage() {
  const [active, setActive] = useState("All");
  const [modal, setModal] = useState<VideoItem | null>(null);

  const filtered = active === "All" ? VIDEOS : VIDEOS.filter(v => v.domain === active);

  // Build 4 columns for filtered results
  const cols: VideoItem[][] = [[], [], [], []];
  filtered.forEach((v, i) => cols[i % 4].push(v));

  return (
    <>
      <div className="relative min-h-screen bg-[#0D0A1A] overflow-x-hidden">

        {/* Animated background — covers entire page */}
        <AnimatedHeroBg className="fixed" />

        {/* Subtle top vignette */}
        <div
          className="fixed inset-x-0 top-0 h-32 pointer-events-none z-[1]"
          style={{ background: "linear-gradient(to bottom, #0D0A1A 0%, transparent 100%)" }}
          aria-hidden="true"
        />

        {/* Header */}
        <section className="relative z-10 pt-32 pb-16 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-[0.15em]">
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              Who is it for?
            </div>

            <h1
              className="font-extrabold text-white tracking-tight mb-4"
              style={{ fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1.05 }}
            >
              Stories from{" "}
              <span style={{ color: "#A78BFA" }}>every path</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-xl mx-auto">
              Mentors and mentees from every field, sharing what changed for them.
            </p>
          </div>
        </section>

        {/* Domain filter */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 mb-10">
          <div className="flex flex-wrap gap-2 justify-center">
            {ALL_DOMAINS.map(domain => (
              <button
                key={domain}
                onClick={() => setActive(domain)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: active === domain
                    ? (DOMAIN_COLORS[domain] ?? "#7C3AED")
                    : "rgba(255,255,255,0.06)",
                  color: active === domain ? "#fff" : "rgba(255,255,255,0.5)",
                  border: active === domain
                    ? "1px solid transparent"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pb-24">
          {filtered.length === 0 ? (
            <p className="text-white/30 text-center py-20">No videos for this domain yet.</p>
          ) : (
            <>
              {/* Mobile: 2 columns */}
              <div className="grid grid-cols-2 gap-3 lg:hidden">
                {filtered.map(v => (
                  <VideoCard key={v.id} item={v} onPlay={() => setModal(v)} />
                ))}
              </div>

              {/* Desktop: 4 staggered columns */}
              <div className="hidden lg:grid grid-cols-4 gap-3 items-start">
                {cols.map((col, ci) => (
                  <div
                    key={ci}
                    className="flex flex-col gap-3"
                    style={{ paddingTop: [0, 48, 24, 64][ci] }}
                  >
                    {col.map(v => (
                      <VideoCard key={v.id} item={v} onPlay={() => setModal(v)} />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {modal && (
        <VideoModal
          item={modal}
          onClose={() => setModal(null)}
          cta={{ label: "Find a mentor", href: "/explore/find-a-mentor" }}
        />
      )}
    </>
  );
}
