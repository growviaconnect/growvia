"use client";

import React, { useEffect, useRef, useState } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const serif: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic",
  fontWeight: 400,
};
const ACCENT       = "#7C3AED";
const ACCENT_LIGHT = "#A78BFA";
const CARD_W  = 340;
const CARD_H  = 520;
const GAP     = 80;
const PHOTO_H = Math.round(CARD_H * 0.55); // 286px
const HEADLINE = ["Des", "voix", "qui", "comptent."];

const TESTIMONIALS = [
  { type: "MENTORÉE", quote: "GrowVia ne m'a pas seulement connectée à un mentor. Ça a changé ma façon de voir mon potentiel.", name: "Sarah Chen",     role: "Product Manager · Stripe",       gender: "women", portrait: 44 },
  { type: "MENTOR",   quote: "Voir mon mentoré décrocher le poste de ses rêves m'a rappelé pourquoi l'expérience est faite pour être partagée.", name: "Marcus Johnson", role: "VP Engineering · Mentor",         gender: "men",   portrait: 32 },
  { type: "MENTORÉE", quote: "Le matching IA était étonnant. Mon mentor avait fait face exactement au même carrefour.", name: "Aisha Patel",    role: "Founder · EduScale",             gender: "women", portrait: 68 },
  { type: "MENTORÉ",  quote: "J'avais la direction, pas la confiance. GrowVia m'a donné les deux dès ma première session.", name: "Thomas Dubois",  role: "Strategy Consultant · Paris",     gender: "men",   portrait: 56 },
  { type: "MENTOR",   quote: "Mon emploi du temps est chargé, mais GrowVia rend le fait de donner en retour sans friction.", name: "Elena Rossi",    role: "Partner · McKinsey",             gender: "women", portrait: 22 },
  { type: "MENTOR",   quote: "J'ai rejoint GrowVia pour donner en retour. J'ai fini par apprendre autant que j'ai enseigné.", name: "James Okonkwo",  role: "Design Lead · Meta",             gender: "men",   portrait: 75 },
] as const;

type T = typeof TESTIMONIALS[number];

// ── Card component ─────────────────────────────────────────────────────────
function GalleryCard({ item, isActive, mobile = false }: { item: T; isActive: boolean; mobile?: boolean }) {
  return (
    <div
      style={{
        width:       mobile ? "85vw" : CARD_W,
        flexShrink:  0,
        position:    "relative",
        borderRadius: 2,
        border: `3px solid ${isActive ? "rgba(167,139,250,0.7)" : "rgba(167,139,250,0.4)"}`,
        boxShadow:
          "0 0 0 1px rgba(124,58,237,0.2)," +
          "0 0 0 8px rgba(13,10,26,0.8)," +
          "0 0 0 10px rgba(124,58,237,0.15)," +
          "0 8px 40px rgba(0,0,0,0.6)",
        transform:  mobile ? "none" : isActive ? "scale(1.04)" : "scale(0.96)",
        opacity:    mobile ? 1 : isActive ? 1 : 0.7,
        transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.4s cubic-bezier(0.16,1,0.3,1)",
        background: "#0D0A1A",
      }}
    >
      {/* Corner brackets */}
      <span className="tc-tl" aria-hidden="true" />
      <span className="tc-tr" aria-hidden="true" />
      <span className="tc-bl" aria-hidden="true" />
      <span className="tc-br" aria-hidden="true" />

      {/* Photo */}
      <div style={{ height: mobile ? 200 : PHOTO_H, overflow: "hidden", position: "relative" }}>
        <img
          src={`https://randomuser.me/api/portraits/${item.gender}/${item.portrait}.jpg`}
          alt={item.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
          loading="lazy"
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #0D0A1A 100%)" }} />
      </div>

      {/* Text */}
      <div style={{ padding: "16px 20px 20px", background: "#0D0A1A" }}>
        <p style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
          {item.type}
        </p>
        <p style={{ ...serif, fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.85)", margin: 0 }}>
          &ldquo;{item.quote}&rdquo;
        </p>
        <div style={{ width: 32, height: 1, background: "rgba(124,58,237,0.2)", margin: "12px 0" }} />
        <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>{item.name}</p>
        <p style={{ fontSize: 11, color: ACCENT_LIGHT, marginTop: 2 }}>{item.role}</p>
      </div>

      {/* Spotlight */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse at 50% -20%, ${isActive ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.12)"} 0%, transparent 60%)`,
          transition: "background 0.4s ease",
        }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function TestimonialsSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const fillRef      = useRef<HTMLDivElement>(null);
  const headerRef    = useRef<HTMLDivElement>(null);
  const currentX     = useRef(0);
  const targetX      = useRef(0);
  const rafId        = useRef(0);
  const inView       = useRef(false);
  const lastActive   = useRef(0);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isMobile, setIsMobile]   = useState(false);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Header reveal
  useEffect(() => {
    const hdr = headerRef.current;
    if (!hdr) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { hdr.classList.add("path-header-visible"); obs.unobserve(hdr); }
    }, { threshold: 0.4 });
    obs.observe(hdr);
    return () => obs.disconnect();
  }, []);

  // Horizontal scroll-driven gallery
  useEffect(() => {
    if (isMobile) return;

    const section = sectionRef.current;
    const track   = trackRef.current;
    const fill    = fillRef.current;
    if (!section || !track || !fill) return;

    const N    = TESTIMONIALS.length;
    const STEP = CARD_W + GAP;
    const maxX = (N - 1) * STEP;

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function tick() {
      // Lerp toward target (inertia)
      currentX.current = lerp(currentX.current, targetX.current, 0.08);

      // Apply transform
      track.style.transform = `translateX(${-currentX.current}px)`;

      // Active card
      const ai = Math.max(0, Math.min(N - 1, Math.round(currentX.current / STEP)));
      if (ai !== lastActive.current) {
        lastActive.current = ai;
        setActiveIdx(ai);
      }

      // Progress fill
      fill.style.width = `${(currentX.current / maxX) * 100}%`;

      if (inView.current) rafId.current = requestAnimationFrame(tick);
    }

    function onScroll() {
      const sectionTop  = section.offsetTop;
      const scrollRange = section.offsetHeight - window.innerHeight;
      const progress    = Math.max(0, Math.min(1, (window.scrollY - sectionTop) / scrollRange));
      targetX.current   = progress * maxX;

      // Restart RAF if settled and now scrolling again
      if (!rafId.current && inView.current) rafId.current = requestAnimationFrame(tick);
    }

    // IntersectionObserver: only run RAF while section is on screen
    const obs = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    }, { threshold: 0 });
    obs.observe(section);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
      obs.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const N            = TESTIMONIALS.length;
  const trackPadding = `calc((100vw - ${CARD_W}px) / 2)`;

  return (
    <div className="relative border-t border-white/5">

      {/* ── Section header ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-20">
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
                <span className="path-headline-word block" style={{ transitionDelay: `${i * 0.09}s` }}>
                  {i === HEADLINE.length - 1
                    ? <span style={serif}>{word}</span>
                    : word}
                </span>
              </span>
            ))}
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontStyle: "italic", marginTop: 16 }}>
            Faites défiler pour découvrir leurs histoires →
          </p>
        </div>
      </div>

      {/* ── Desktop: horizontal sticky gallery ────────────────── */}
      {!isMobile ? (
        <section
          ref={sectionRef}
          style={{ height: `${N * 120}vh` }}
          aria-label="Galerie de témoignages"
        >
          <div
            style={{
              position:  "sticky",
              top:        0,
              height:    "100vh",
              overflow:  "hidden",
              background: "#0D0A1A",
              display:   "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Horizontal track */}
            <div
              ref={trackRef}
              style={{
                display:       "flex",
                flexDirection: "row",
                gap:           GAP,
                paddingLeft:   trackPadding,
                paddingRight:  trackPadding,
                alignItems:    "center",
                willChange:    "transform",
              }}
            >
              {TESTIMONIALS.map((item, i) => (
                <GalleryCard key={item.name} item={item} isActive={i === activeIdx} />
              ))}
            </div>

            {/* Progress bar */}
            <div
              style={{
                position:   "absolute",
                bottom:      0,
                left:        0,
                right:       0,
                height:      1,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <div
                ref={fillRef}
                style={{ height: "100%", background: ACCENT, width: "0%", transition: "none" }}
              />
            </div>

            {/* Counter */}
            <div
              style={{
                position:   "absolute",
                bottom:      12,
                right:       28,
                fontFamily: "monospace",
                fontSize:    10,
                color:      "rgba(255,255,255,0.2)",
                userSelect: "none",
              }}
            >
              {String(activeIdx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
            </div>
          </div>
        </section>
      ) : (
        /* ── Mobile: vertical stack ─────────────────────────── */
        <div
          style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:             48,
            padding:        "0 0 80px",
          }}
        >
          {TESTIMONIALS.map((item) => (
            <GalleryCard key={item.name} item={item} isActive={false} mobile />
          ))}
        </div>
      )}

      {/* Corner bracket CSS */}
      <style>{`
        .tc-tl, .tc-tr, .tc-bl, .tc-br {
          position: absolute;
          width: 14px;
          height: 14px;
          border-color: #7C3AED;
          border-style: solid;
          pointer-events: none;
          z-index: 2;
        }
        .tc-tl { top: -3px; left: -3px; border-width: 2px 0 0 2px; }
        .tc-tr { top: -3px; right: -3px; border-width: 2px 2px 0 0; }
        .tc-bl { bottom: -3px; left: -3px; border-width: 0 0 2px 2px; }
        .tc-br { bottom: -3px; right: -3px; border-width: 0 2px 2px 0; }
      `}</style>
    </div>
  );
}
