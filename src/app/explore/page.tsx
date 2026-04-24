"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

// Deck positions: slot 0 = front/active
const DECK = [
  { x: 0,  y: 0,  rotate: 0,   scale: 1,    z: 40 },
  { x: 18, y: 8,  rotate: 2.5, scale: 0.97, z: 30 },
  { x: 32, y: 14, rotate: 5,   scale: 0.94, z: 20 },
  { x: 42, y: 19, rotate: 7.5, scale: 0.91, z: 10 },
];

export default function ExplorePage() {
  const { t } = useLang();
  const [current, setCurrent] = useState(0);

  const CARDS = [
    {
      id: "platform",
      badge: t("explore_badge_platform"),
      title: t("explore_title_platform"),
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      links: [
        { label: t("explore_link_founders"),     href: "/founders" },
        { label: t("explore_link_how"),          href: "/how-it-works" },
        { label: t("explore_link_pricing"),      href: "/pricing" },
        { label: t("explore_link_partnerships"), href: "/for-schools" },
        { label: t("explore_link_profile"),      href: "/dashboard" },
      ],
    },
    {
      id: "mentees",
      badge: t("explore_badge_mentees"),
      title: t("explore_title_mentees"),
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
      links: [
        { label: t("explore_link_find_mentors"), href: "/auth/register" },
        { label: t("explore_link_ai"),           href: "/ai-smart-matching" },
      ],
    },
    {
      id: "mentors",
      badge: t("explore_badge_mentors"),
      title: t("explore_title_mentors"),
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
      links: [
        { label: t("explore_link_become_mentor"),  href: "/auth/register?role=mentor" },
        { label: t("explore_link_certification"),  href: "/mentor-certification" },
      ],
    },
    {
      id: "support",
      badge: t("explore_badge_support"),
      title: t("explore_title_support"),
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
      links: [
        { label: t("explore_link_safety"),  href: "/safety-trust" },
        { label: t("explore_link_faq"),     href: "/faq" },
        { label: t("explore_link_contact"), href: "/contact" },
      ],
    },
  ];

  const total = CARDS.length;
  const goNext = () => setCurrent((c) => (c + 1) % total);
  const goPrev = () => setCurrent((c) => (c - 1 + total) % total);

  const getStyle = (index: number) => {
    const diff = (index - current + total) % total;
    const p = DECK[diff];
    return {
      transform: `translateX(${p.x}px) translateY(${p.y}px) rotate(${p.rotate}deg) scale(${p.scale})`,
      zIndex: p.z,
      transition: "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
    } as React.CSSProperties;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0D0A1A] flex flex-col items-center justify-center overflow-hidden py-16 px-8">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-4">
          {t("explore_nav")}
        </p>
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-none">
          {t("explore_title")}
        </h1>
      </div>

      {/* Deck */}
      <div
        className="relative"
        style={{ width: "clamp(280px, 85vw, 340px)", height: "clamp(430px, 60vh, 520px)" }}
      >
        {CARDS.map((card, i) => {
          const isActive = i === current;
          return (
            <div
              key={card.id}
              className={`absolute inset-0 rounded-2xl overflow-hidden select-none ${
                !isActive ? "cursor-pointer" : ""
              }`}
              style={getStyle(i)}
              onClick={() => !isActive && setCurrent(i)}
            >
              <img
                src={card.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "brightness(0.4) saturate(0.6)" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 20%, rgba(13,10,26,0.8) 60%, rgba(13,10,26,0.97) 100%)",
                }}
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/8 pointer-events-none" />

              <div className="absolute inset-0 flex flex-col justify-between p-7">
                <div>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-white uppercase tracking-[0.15em] backdrop-blur-sm">
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white mb-5 leading-tight">
                    {card.title}
                  </h2>
                  <div className="divide-y divide-white/5">
                    {card.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-between py-2.5 text-sm text-white/55 hover:text-white transition-colors duration-200 group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{link.label}</span>
                        <span className="text-[#7C3AED] text-xs group-hover:translate-x-0.5 transition-transform duration-200">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex flex-col items-center gap-5 mt-14">
        <div className="flex items-center gap-6">
          <button
            onClick={goPrev}
            aria-label="Previous card"
            className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to card ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-white" : "w-1.5 bg-white/20 hover:bg-white/35"
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            aria-label="Next card"
            className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-all duration-200"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-white/20 tracking-widest font-mono">
          {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
