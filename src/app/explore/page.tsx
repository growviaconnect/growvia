"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

// ── Resting positions (slot 0 = active/front) ─────────────────────────────
// Updated to the natural scattered-pile feel from the design spec
const DECK = [
  { x: 0,   y: 0,  rotate: -3,   scale: 1,    z: 40 },
  { x: 18,  y: 12, rotate: 4,    scale: 0.97, z: 30 },
  { x: -12, y: 22, rotate: -1.5, scale: 0.94, z: 20 },
  { x: 8,   y: 30, rotate: 6,    scale: 0.91, z: 10 },
];

// ── Per-card flight start positions (card index 0-3) ─────────────────────
const START_TRANSFORM = [
  "translateX(-120%) translateY(-40%) rotate(-25deg) scale(0.85)", // Plateforme — top-left
  "translateX(130%)  translateY(-60%) rotate(30deg)  scale(0.8)",  // Mentorés   — top-right
  "translateX(-80%)  translateY(100%) rotate(20deg)  scale(0.85)", // Mentors    — bottom-left
  "translateX(60%)   translateY(80%)  rotate(-35deg) scale(0.8)",  // Support    — bottom-right
];

const DELAYS    = [0, 180, 320, 460];          // ms, staggered deal
const DURATIONS = [700, 720, 680, 740];        // ms per card flight
const EASE_DEAL = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_NAV  = "cubic-bezier(0.16, 1, 0.3, 1)";

// ── Component ─────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const { t } = useLang();

  const [current,       setCurrent]       = useState(0);
  const [dealtIn,       setDealtIn]       = useState(false);
  const [dealComplete,  setDealComplete]  = useState(false);
  const [allowHover,    setAllowHover]    = useState(false);
  const [hoveredCard,   setHoveredCard]   = useState<number | null>(null);
  const [thuddingCards, setThuddingCards] = useState<Set<number>>(new Set());
  const [isMobile,      setIsMobile]      = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const timers     = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Mobile detection ──────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── IntersectionObserver — deal on enter, reset on leave ─────────────
  useEffect(() => {
    if (isMobile) return;
    const el = sectionRef.current;
    if (!el) return;

    function clearTimers() {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    }

    function startDeal() {
      clearTimers();
      setDealtIn(true);
      setDealComplete(false);
      setAllowHover(false);
      setHoveredCard(null);
      setThuddingCards(new Set());

      // Thud micro-animation for each card after it lands
      DELAYS.forEach((delay, i) => {
        const land = delay + DURATIONS[i];
        const t1 = setTimeout(() => {
          setThuddingCards(prev => new Set([...prev, i]));
          const t2 = setTimeout(() => {
            setThuddingCards(prev => { const s = new Set(prev); s.delete(i); return s; });
          }, 120);
          timers.current.push(t2);
        }, land);
        timers.current.push(t1);
      });

      // Enable hover + mark deal complete after last card lands (card 3: 1200ms)
      const t3 = setTimeout(() => {
        setDealComplete(true);
        setAllowHover(true);
      }, DELAYS[3] + DURATIONS[3] + 130);
      timers.current.push(t3);
    }

    function resetDeal() {
      clearTimers();
      setDealtIn(false);
      setDealComplete(false);
      setAllowHover(false);
      setHoveredCard(null);
      setThuddingCards(new Set());
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) startDeal();
        else resetDeal();
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimers(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // ── Card data ─────────────────────────────────────────────────────────
  const CARDS = [
    {
      id: "platform",
      badge: t("explore_badge_platform"),
      title: t("explore_title_platform"),
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      links: [
        { label: t("explore_link_testimonials"), href: "/testimonials" },
        { label: t("explore_link_how"),          href: "/how-it-works" },
        { label: t("explore_link_pricing"),      href: "/pricing" },
        { label: t("explore_link_profile"),      href: "/dashboard" },
        { label: t("explore_link_founders"),     href: "/founders" },
      ],
    },
    {
      id: "mentees",
      badge: t("explore_badge_mentees"),
      title: t("explore_title_mentees"),
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
      links: [
        { label: t("explore_link_find_mentors"), href: "/explore/find-a-mentor" },
        { label: t("explore_link_ai"),           href: "/ai-smart-matching" },
      ],
    },
    {
      id: "mentors",
      badge: t("explore_badge_mentors"),
      title: t("explore_title_mentors"),
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
      links: [
        { label: t("explore_link_become_mentor"), href: "/auth/register?role=mentor" },
        { label: t("explore_link_certification"), href: "/mentor-certification" },
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

  const total  = CARDS.length;
  const goNext = () => setCurrent((c) => (c + 1) % total);
  const goPrev = () => setCurrent((c) => (c - 1 + total) % total);

  // ── Deck position for card at index i ─────────────────────────────────
  function deckTransform(i: number) {
    const diff = (i - current + total) % total;
    const p = DECK[diff];
    return {
      transform: `translateX(${p.x}px) translateY(${p.y}px) rotate(${p.rotate}deg) scale(${p.scale})`,
      zIndex:    p.z,
    };
  }

  // ── Outer flight wrapper style ────────────────────────────────────────
  function flightStyle(i: number): React.CSSProperties {
    // Mobile: skip deal animation, use plain deck positions
    if (isMobile) {
      const { transform, zIndex } = deckTransform(i);
      return { transform, zIndex, transition: `transform 0.55s ${EASE_NAV}` };
    }

    // Pre-deal: cards sit at their off-screen start position, invisible
    if (!dealtIn) {
      return {
        opacity:    0,
        transform:  START_TRANSFORM[i],
        zIndex:     (i + 1) * 10,
        transition: "none",
      };
    }

    const { transform: deckTf, zIndex: deckZ } = deckTransform(i);
    const isHovered  = allowHover && hoveredCard === i;
    const anyHovered = allowHover && hoveredCard !== null;

    let tf     = deckTf;
    let zIdx   = deckZ;
    let opacity = 1;

    if (anyHovered) {
      if (isHovered) {
        tf   = `${deckTf} translateY(-12px) scale(1.03)`;
        zIdx = 50;
      } else {
        tf      = `${deckTf} scale(0.97)`;
        opacity = 0.65;
      }
    }

    // Transition: deal stagger → nav smooth → hover fast
    const transition = anyHovered
      ? `transform 0.3s ${EASE_NAV}, opacity 0.3s ease`
      : dealComplete
        ? `transform 0.55s ${EASE_NAV}`
        : `transform ${DURATIONS[i]}ms ${EASE_DEAL} ${DELAYS[i]}ms,` +
          `opacity   ${DURATIONS[i]}ms ${EASE_DEAL} ${DELAYS[i]}ms`;

    return {
      opacity,
      transform:  tf,
      zIndex:     zIdx,
      transition,
      borderRadius: 16,                                                      // rounded shadow
      boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)", // physical table feel
    };
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      {/* Thud keyframe — lives here, not in globals */}
      <style>{`
        @keyframes card-thud {
          0%, 100% { transform: scale(1);    }
          50%      { transform: scale(1.03); }
        }
      `}</style>

      <div
        ref={sectionRef}
        className="min-h-[calc(100vh-4rem)] bg-[#0D0A1A] flex flex-col items-center justify-center overflow-hidden py-16 px-8"
      >
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-4">
            {t("explore_nav")}
          </p>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-none">
            {t("explore_title")}
          </h1>
        </div>

        {/* Card deck */}
        <div
          className="relative"
          style={{ width: "clamp(280px, 85vw, 340px)", height: "clamp(430px, 60vh, 520px)" }}
        >
          {CARDS.map((card, i) => {
            const isActive = i === current;
            return (
              // ── Outer wrapper: handles flight transform, opacity, shadow ──
              <div
                key={card.id}
                className="absolute inset-0"
                style={flightStyle(i)}
                onMouseEnter={() => allowHover && setHoveredCard(i)}
                onMouseLeave={() => allowHover && setHoveredCard(null)}
                onClick={() => !isActive && setCurrent(i)}
              >
                {/* ── Inner card: rounded clip + thud scale animation ──── */}
                <div
                  className={`absolute inset-0 rounded-2xl overflow-hidden select-none${!isActive ? " cursor-pointer" : ""}`}
                  style={{
                    animation: thuddingCards.has(i) ? "card-thud 120ms ease-out" : undefined,
                  }}
                >
                  {/* Photo background */}
                  <img
                    src={card.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "brightness(0.4) saturate(0.6)" }}
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent 20%, rgba(13,10,26,0.8) 60%, rgba(13,10,26,0.97) 100%)",
                    }}
                  />
                  {/* Subtle border ring */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/8 pointer-events-none" />

                  {/* Content */}
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
              </div>
            );
          })}
        </div>

        {/* Navigation — unchanged */}
        <div className="flex flex-col items-center gap-5 mt-14">
          <div className="flex items-center gap-6">
            <button
              onClick={goPrev}
              aria-label={t("explore_prev_card")}
              className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {CARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-6 bg-white" : "w-1.5 bg-white/20 hover:bg-white/35"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              aria-label={t("explore_next_card")}
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
    </>
  );
}
