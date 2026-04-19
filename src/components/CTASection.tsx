"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&q=80",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1600&q=80",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1600&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80",
];

export default function CTASection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">

      {/* Slideshow images — all stacked, only active one visible */}
      {IMAGES.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === active ? 1 : 0,
            transition: "opacity 1.2s ease",
            filter: "brightness(0.5) saturate(0.75)",
          }}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-40">
        <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-10">
          Get Started
        </p>
        <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-[0.95] tracking-tight">
          Build the future,<br />starting today.
        </h2>
        <p className="text-xl text-white/35 mb-14 max-w-xl mx-auto leading-relaxed">
          Early access is open. Join GrowVia and shape what mentorship becomes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
          >
            Find my mentor <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/register?role=mentor"
            className="inline-flex items-center justify-center gap-2.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
          >
            Apply as a mentor
          </Link>
        </div>
        <p className="text-sm text-white/20 mt-10">
          No commitment required · Discovery Session from 9.99€
        </p>
      </div>

    </section>
  );
}
