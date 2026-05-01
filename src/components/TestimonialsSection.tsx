"use client";

import { useEffect, useRef } from "react";

const serifStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
};

type Testimonial = {
  type: "MENTORÉ" | "MENTOR";
  quote: string;
  name: string;
  role: string;
  photoUrl: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    type: "MENTORÉ",
    quote:
      "En vingt minutes avec mon mentor, j'avais plus de clarté qu'en deux ans de cours. Une conversation qui a changé ma trajectoire.",
    name: "Sarah Chen",
    role: "Étudiante en Master, Sciences Po Paris",
    photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    type: "MENTOR",
    quote:
      "Je donne deux heures par mois. Ce que je reçois en retour — la progression des mentoré·es, les questions qui m'obligent à me dépasser — est inestimable.",
    name: "Marcus Johnson",
    role: "Senior Engineer, Scale-up technologique",
    photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    type: "MENTORÉ",
    quote:
      "Le matching était bluffant. Mon mentor avait exactement le même parcours atypique que moi. Pour la première fois, je me sentais véritablement compris.",
    name: "Aisha Patel",
    role: "Doctorante en reconversion, HEC",
    photoUrl: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    type: "MENTOR",
    quote:
      "J'aurais voulu avoir cet outil à vingt-cinq ans. Mentorer sur GrowVia, c'est transmettre ce que personne ne m'a jamais transmis.",
    name: "Thomas Dubois",
    role: "Directeur Général, Fintech",
    photoUrl: "https://randomuser.me/api/portraits/men/54.jpg",
  },
  {
    type: "MENTORÉ",
    quote:
      "Une heure avec ma mentore m'a ouvert des portes que je cherchais depuis des mois. Pas des conseils génériques — une carte de mon chemin exact.",
    name: "Elena Rossi",
    role: "Ingénieure logiciel, Milan",
    photoUrl: "https://randomuser.me/api/portraits/women/23.jpg",
  },
  {
    type: "MENTOR",
    quote:
      "Ce qui me touche, c'est de voir les mentoré·es prendre confiance en eux — pas seulement dans leur carrière, mais dans leur façon d'occuper l'espace.",
    name: "James Okonkwo",
    role: "Product Lead, Startup IA",
    photoUrl: "https://randomuser.me/api/portraits/men/78.jpg",
  },
  {
    type: "MENTORÉ",
    quote:
      "J'avais peur que ce soit trop formel. C'est exactement le contraire : une conversation entre quelqu'un qui sait et quelqu'un qui veut apprendre.",
    name: "Léa Fontaine",
    role: "Designer UX, Bordeaux",
    photoUrl: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    type: "MENTOR",
    quote:
      "Après quinze ans de carrière, mentorer me reconnecte à l'essentiel : pourquoi j'ai choisi ce métier. C'est un ancrage que je n'attendais pas.",
    name: "David Nakamura",
    role: "Chirurgien, CHU Lyon",
    photoUrl: "https://randomuser.me/api/portraits/men/91.jpg",
  },
];

const HEADLINE = ["Des", "voix", "qui", "comptent."];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Scroll-driven progress spine
    const onScroll = () => {
      const section = sectionRef.current;
      const fill = fillRef.current;
      const dot = dotRef.current;
      if (!section || !fill || !dot) return;

      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY;
      const sectionH = section.offsetHeight;
      const vh = window.innerHeight;

      const scrolledIn = Math.max(0, window.scrollY - sectionTop);
      // Dot tracks current viewport center within the section
      const dotPos = Math.min(scrolledIn + vh * 0.5, sectionH);

      fill.style.height = `${dotPos}px`;
      dot.style.top = `${dotPos - 6}px`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Animate header headline on scroll into view
    const hdrObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("path-header-visible");
            hdrObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    if (headerRef.current) hdrObs.observe(headerRef.current);

    // Animate each testimonial panel on scroll into view
    const panelObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("path-panel-visible");
            panelObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    panelRefs.current.forEach((el) => el && panelObs.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      hdrObs.disconnect();
      panelObs.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative border-t border-white/5">

      {/* ── Section header ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div ref={headerRef} className="path-header">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#7C3AED] mb-5">
            CE QU&apos;ILS EN DISENT
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white tracking-tight leading-[1.05]"
            aria-label="Des voix qui comptent."
          >
            {HEADLINE.map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden align-bottom"
                style={{ marginRight: i < HEADLINE.length - 1 ? "0.28em" : 0 }}
              >
                <span
                  className="path-headline-word block"
                  style={{ transitionDelay: `${i * 0.09}s` }}
                >
                  {i === HEADLINE.length - 1 ? (
                    <span style={serifStyle}>{word}</span>
                  ) : (
                    word
                  )}
                </span>
              </span>
            ))}
          </h2>
        </div>
      </div>

      {/* ── Vertical progress spine (center, desktop only) ──────── */}
      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        aria-hidden="true"
        style={{ zIndex: 20 }}
      >
        <div
          className="absolute top-0 bottom-0"
          style={{ left: "50%", transform: "translateX(-50%)", width: 1 }}
        >
          {/* Track */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(124,58,237,0.15)" }}
          />
          {/* Fill — grows as user scrolls */}
          <div
            ref={fillRef}
            className="absolute top-0 left-0 right-0"
            style={{
              height: 0,
              background:
                "linear-gradient(to bottom, #4C1D95 0%, #7C3AED 50%, #A78BFA 100%)",
            }}
          />
          {/* Floating dot */}
          <div
            ref={dotRef}
            className="absolute"
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#7C3AED",
              boxShadow:
                "0 0 0 3px rgba(124,58,237,0.2), 0 0 20px rgba(124,58,237,0.85)",
              left: "50%",
              transform: "translateX(-50%)",
              top: 0,
            }}
          />
        </div>
      </div>

      {/* ── Testimonial panels ──────────────────────────────────── */}
      {TESTIMONIALS.map((item, i) => {
        const photoLeft = i % 2 === 0;
        return (
          <div
            key={item.name}
            ref={(el) => { panelRefs.current[i] = el; }}
            className="path-panel relative flex items-center"
            style={{
              height: "100vh",
              flexDirection: photoLeft ? "row" : "row-reverse",
            }}
          >
            {/* ── Photo half ───────────────────────── */}
            <div
              className={`path-photo ${
                photoLeft ? "path-photo-from-left" : "path-photo-from-right"
              } relative overflow-hidden h-full hidden md:block`}
              style={{ width: "50%" }}
            >
              <img
                src={item.photoUrl}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover object-top"
                loading="lazy"
              />
              {/* Bottom dark gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(13,10,26,0.9) 0%, rgba(13,10,26,0.15) 55%, transparent 100%)",
                }}
              />
              {/* Side fade toward the center spine */}
              <div
                className="absolute inset-0"
                style={{
                  background: photoLeft
                    ? "linear-gradient(to right, transparent 60%, rgba(13,10,26,0.85) 100%)"
                    : "linear-gradient(to left, transparent 60%, rgba(13,10,26,0.85) 100%)",
                }}
              />
            </div>

            {/* ── Text half ────────────────────────── */}
            <div
              className="relative flex items-center justify-center h-full w-full md:w-1/2"
              style={{ zIndex: 2 }}
            >
              <div className="w-full px-8 md:px-12 lg:px-20" style={{ maxWidth: 520 }}>

                {/* Type badge */}
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.28em] mb-7"
                  style={{ color: "#7C3AED" }}
                >
                  {item.type}
                </p>

                {/* Quote — word-by-word staggered animation */}
                <p
                  className="path-quote leading-relaxed"
                  style={{
                    ...serifStyle,
                    fontSize: "clamp(1.4rem, 2.5vw, 2.25rem)",
                    color: "rgba(255,255,255,0.92)",
                  }}
                >
                  &ldquo;
                  {item.quote.split(" ").map((word, wi) => (
                    <span
                      key={wi}
                      className="path-word"
                      style={{ animationDelay: `${0.15 + wi * 0.04}s` }}
                    >
                      {word}{" "}
                    </span>
                  ))}
                  &rdquo;
                </p>

                {/* Author */}
                <div
                  className="path-author mt-8 pt-6"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <p className="font-bold text-white" style={{ fontSize: "1.0625rem" }}>
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "#A78BFA" }}>
                    {item.role}
                  </p>
                </div>

              </div>
            </div>
          </div>
        );
      })}

    </section>
  );
}
