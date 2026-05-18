"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import VideoModal from "@/components/VideoModal";
import type { VideoItem } from "@/lib/video-data";
import { VIDEOS, GALLERY_COLS, COL_OFFSETS } from "@/lib/video-data";

export default function ForYouSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [modal, setModal] = useState<VideoItem | null>(null);
  const [opacity, setOpacity] = useState(0);

  // Scroll-based fade in (entering) and fade out (leaving)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    function update() {
      const { top, bottom } = section!.getBoundingClientRect();
      const vh = window.innerHeight;
      let o = 1;

      // Fade in as section scrolls up into view from the bottom
      if (top > vh * 0.65) {
        o = 0;
      } else if (top > 0) {
        o = 1 - top / (vh * 0.65);
      }

      // Fade out as section exits at the top
      if (bottom < vh * 0.2) {
        o = Math.max(0, bottom / (vh * 0.2));
      }

      setOpacity(o);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="py-20 border-t border-white/5"
        style={{ opacity, transition: "opacity 0.35s ease" }}
      >
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#7C3AED] mb-4">
            Who is it for?
          </p>
          <div className="flex items-end justify-between gap-6">
            <h2
              className="font-extrabold text-white tracking-tight leading-tight"
              style={{ fontSize: "clamp(32px, 4.5vw, 60px)" }}
            >
              Whatever your path,<br />
              <span className="text-white/30">we have a mentor for you.</span>
            </h2>
            <Link
              href="/who-is-it-for"
              className="hidden lg:inline-flex items-center gap-2 text-sm text-white/35 hover:text-white transition-colors flex-shrink-0 mb-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Gallery — desktop: 4 staggered columns, mobile: 2 columns */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8">

          {/* Mobile: flat 2-column grid */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {VIDEOS.slice(0, 6).map(v => (
              <VideoCard key={v.id} item={v} onPlay={() => setModal(v)} />
            ))}
          </div>

          {/* Desktop: 4 staggered columns */}
          <div className="hidden lg:grid grid-cols-4 gap-3 items-start">
            {GALLERY_COLS.map((col, ci) => (
              <div
                key={ci}
                className="flex flex-col gap-3"
                style={{ paddingTop: COL_OFFSETS[ci] }}
              >
                {col.map(v => (
                  <VideoCard key={v.id} item={v} onPlay={() => setModal(v)} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view-all link */}
        <div className="lg:hidden mt-8 text-center">
          <Link
            href="/who-is-it-for"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            View all stories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Modal */}
      {modal && (
        <VideoModal
          item={modal}
          onClose={() => setModal(null)}
          cta={{ label: "View all who it's for", href: "/who-is-it-for" }}
        />
      )}
    </>
  );
}
