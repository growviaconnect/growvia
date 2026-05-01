"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const PHOTOS = [
  { src: "/images/session1.jpg", alt: "Session de mentorat sur écran violet" },
  { src: "/images/session2.jpg", alt: "Session de mentorat en soirée" },
  { src: "/images/session3.jpg", alt: "Mentor en visioconférence" },
  { src: "/images/session4.jpg", alt: "Mentorée prenant des notes" },
];

function PhotoCard({ src, alt, cardRef }: { src: string; alt: string; cardRef: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={cardRef}
      className="relative rounded-2xl overflow-hidden w-full h-full group"
      style={{ opacity: 0, transform: "translateY(28px)" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
        priority={false}
      />
      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] ease-out pointer-events-none"
        style={{ background: "rgba(124,58,237,0.15)" }}
      />
    </div>
  );
}

export default function SessionsGallery() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        cards.forEach((card, i) => {
          card.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`;
          card.style.opacity   = "1";
          card.style.transform = "translateY(0)";
        });
        observer.disconnect();
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const [main, ...stack] = PHOTOS;

  return (
    <section className="py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.28em] mb-4"
            style={{ color: "#A78BFA" }}
          >
            Nos sessions
          </p>
          <h2 className="text-4xl md:text-[52px] font-extrabold text-white tracking-tight leading-tight mb-4">
            Le mentorat, en vrai.
          </h2>
          <p className="text-white/40 text-lg">
            Des vraies sessions. Des vraies connexions.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={sectionRef}
          className="flex flex-col lg:flex-row gap-4 lg:h-[620px]"
        >
          {/* Left — large photo (60%) */}
          <div className="aspect-video lg:aspect-auto lg:w-[60%]">
            <PhotoCard
              src={main.src}
              alt={main.alt}
              cardRef={(el) => { cardRefs.current[0] = el; }}
            />
          </div>

          {/* Right — 3 stacked photos (40%) */}
          <div className="flex flex-col gap-4 lg:w-[40%]">
            {stack.map((photo, i) => (
              <div key={photo.src} className="aspect-video lg:aspect-auto lg:flex-1">
                <PhotoCard
                  src={photo.src}
                  alt={photo.alt}
                  cardRef={(el) => { cardRefs.current[i + 1] = el; }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
