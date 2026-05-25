"use client";

import { useRef, useEffect } from "react";
import { Play } from "lucide-react";
import type { VideoItem } from "@/lib/video-data";
import { DOMAIN_COLORS } from "@/lib/video-data";

export default function VideoCard({ item, onPlay }: { item: VideoItem; onPlay: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play when this card scrolls into view
  useEffect(() => {
    if (!item.autoplay) return;
    const card = cardRef.current;
    if (!card) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) videoRef.current?.play().catch(() => {}); },
      { threshold: 0.4 }
    );
    obs.observe(card);
    return () => obs.disconnect();
  }, [item.autoplay]);

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={onPlay}
      onKeyDown={e => e.key === "Enter" && onPlay()}
      onMouseEnter={() => videoRef.current?.play().catch(() => {})}
      onMouseLeave={() => { const v = videoRef.current; if (v) { v.pause(); v.currentTime = 0; } }}
      className="relative overflow-hidden rounded-2xl cursor-pointer group w-full select-none"
      style={{ aspectRatio: item.tall ? "9/16" : "3/4", background: "#13111F" }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={item.src}
        poster={item.poster}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {/* Domain badge */}
      <div className="absolute top-3 left-3 z-10">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-white px-2.5 py-1 rounded-full"
          style={{ background: DOMAIN_COLORS[item.domain] ?? "#7C3AED" }}
        >
          {item.domain}
        </span>
      </div>

      {/* Play button (appears on hover) */}
      <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <p className="text-[11px] text-white/50 mb-0.5">{item.name} · {item.role}</p>
        <p className="text-[13px] font-semibold text-white leading-snug">&ldquo;{item.quote}&rdquo;</p>
      </div>
    </div>
  );
}
