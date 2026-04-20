"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const CARDS = [
  {
    id: "platform",
    badge: "Platform",
    title: "Our platform",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    links: [
      { label: "Founders", href: "/founders" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Partnerships", href: "/for-schools" },
      { label: "Profile", href: "/dashboard" },
    ],
  },
  {
    id: "mentees",
    badge: "Mentees",
    title: "Find your mentor",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    links: [
      { label: "Find Mentors", href: "/auth/register" },
      { label: "AI Smart Matching", href: "/ai-smart-matching" },
    ],
  },
  {
    id: "mentors",
    badge: "Mentors",
    title: "Share your expertise",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
    links: [
      { label: "Become a Mentor", href: "/auth/register?role=mentor" },
      { label: "Mentor Certification", href: "/mentor-certification" },
    ],
  },
  {
    id: "support",
    badge: "Support",
    title: "We're here for you",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    links: [
      { label: "Safety & Trust", href: "/safety-trust" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

// Stacked deck positions: slot 0 = front/active, 1 = first behind, etc.
const DECK = [
  { x: 0,  y: 0,  rotate: 0,   scale: 1,    z: 40 },
  { x: 18, y: 8,  rotate: 2.5, scale: 0.97, z: 30 },
  { x: 32, y: 14, rotate: 5,   scale: 0.94, z: 20 },
  { x: 42, y: 19, rotate: 7.5, scale: 0.91, z: 10 },
];

export default function ExplorePage() {
  const [current, setCurrent] = useState(0);
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
        <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-4">Navigate</p>
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-none">
          Explore.
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
              {/* Image */}
              <img
                src={card.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "brightness(0.4) saturate(0.6)" }}
              />

              {/* Gradient overlay — stronger at bottom */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 20%, rgba(13,10,26,0.8) 60%, rgba(13,10,26,0.97) 100%)",
                }}
              />

              {/* Subtle border */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/8 pointer-events-none" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-7">
                {/* Badge — top left */}
                <div>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-white uppercase tracking-[0.15em] backdrop-blur-sm">
                    {card.badge}
                  </span>
                </div>

                {/* Bottom content */}
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

      {/* Navigation controls */}
      <div className="flex flex-col items-center gap-5 mt-14">
        <div className="flex items-center gap-6">
          {/* Prev */}
          <button
            onClick={goPrev}
            aria-label="Previous card"
            className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Dot indicators */}
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

          {/* Next */}
          <button
            onClick={goNext}
            aria-label="Next card"
            className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-all duration-200"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Counter */}
        <p className="text-xs text-white/20 tracking-widest font-mono">
          {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
