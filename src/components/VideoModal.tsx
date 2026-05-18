"use client";

import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import type { VideoItem } from "@/lib/video-data";
import { DOMAIN_COLORS } from "@/lib/video-data";

type Props = {
  item: VideoItem;
  onClose: () => void;
  cta?: { label: string; href: string };
};

export default function VideoModal({ item, onClose, cta }: Props) {
  const defaultCta = { label: "View all who it's for", href: "/who-is-it-for" };
  const ctaLink = cta ?? defaultCta;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#13111F" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Video */}
        <div className="relative overflow-hidden" style={{ height: "min(62vh, 520px)" }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={item.src}
            poster={item.poster}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="p-5">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white px-2.5 py-1 rounded-full inline-block"
            style={{ background: DOMAIN_COLORS[item.domain] ?? "#7C3AED" }}
          >
            {item.domain}
          </span>
          <p className="font-bold text-white mt-3">{item.name}</p>
          <p className="text-white/50 text-sm">{item.role}</p>
          <p className="text-white/60 text-sm mt-2 italic">&ldquo;{item.quote}&rdquo;</p>
          <Link
            href={ctaLink.href}
            onClick={onClose}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white border border-[#7C3AED]/40 hover:bg-[#7C3AED]/10 transition-colors"
          >
            {ctaLink.label} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
