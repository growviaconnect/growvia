"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

// ── Resting positions — straight, tilt only during drag ───────────────────────
const DECK = [
  { x: 0,   y: 0,  rotate: 0, scale: 1,    z: 40 },
  { x: 16,  y: 10, rotate: 0, scale: 0.97, z: 30 },
  { x: -10, y: 20, rotate: 0, scale: 0.94, z: 20 },
  { x: 6,   y: 28, rotate: 0, scale: 0.91, z: 10 },
];
const NUM_CARDS = 4;

// Per-card off-screen start positions for the deal animation
const START_TRANSFORM = [
  "translateX(-120%) translateY(-40%) rotate(-20deg) scale(0.85)",
  "translateX(130%)  translateY(-60%) rotate(20deg)  scale(0.8)",
  "translateX(-80%)  translateY(100%) rotate(15deg)  scale(0.85)",
  "translateX(60%)   translateY(80%)  rotate(-25deg) scale(0.8)",
];

const DELAYS    = [0, 180, 320, 460];
const DURATIONS = [700, 720, 680, 740];
const EASE_DEAL = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_NAV  = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_SNAP = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const SWIPE_THRESHOLD = 80;    // px
const VELOCITY_THRESH = 0.4;   // px/ms

// ── Component ─────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const { t } = useLang();

  // Card state
  const [current,       setCurrent]       = useState(0);
  const [dealtIn,       setDealtIn]       = useState(false);
  const [dealComplete,  setDealComplete]  = useState(false);
  const [allowHover,    setAllowHover]    = useState(false);
  const [hoveredCard,   setHoveredCard]   = useState<number | null>(null);
  const [thuddingCards, setThuddingCards] = useState<Set<number>>(new Set());
  const [isMobile,      setIsMobile]      = useState(false);

  // Swipe / fly-off state
  const [flyOff,     setFlyOff]     = useState<{ dir: -1 | 1 } | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);

  // Drag display state — triggers re-renders for visual feedback
  const [isDragging, setIsDragging] = useState(false);
  const [dragDeltaX, setDragDeltaX] = useState(0);

  // ── Drag refs — always current, never stale in closures ──────────────────
  const dragActive    = useRef(false);
  const dragStartX    = useRef(0);
  const dragDeltaRef  = useRef(0);          // source of truth for delta
  const dragPtrId     = useRef<number | null>(null);
  const velocityBuf   = useRef<{ x: number; t: number }[]>([]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const timers     = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Fly-off commit ────────────────────────────────────────────────────────
  const goDir = useCallback((dir: -1 | 1) => {
    setFlyOff({ dir });
    setAllowHover(false);
    setHoveredCard(null);
    dragDeltaRef.current = 0;
    setDragDeltaX(0);
    const id = setTimeout(() => {
      setCurrent(c => (c - dir + NUM_CARDS) % NUM_CARDS);
      setFlyOff(null);
    }, 380);
    timers.current.push(id);
  }, []);

  const goPrev = useCallback(() => { if (!flyOff && !isSnapping) goDir(-1); }, [flyOff, isSnapping, goDir]);
  const goNext = useCallback(() => { if (!flyOff && !isSnapping) goDir(1);  }, [flyOff, isSnapping, goDir]);

  // ── Mobile detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // ── IntersectionObserver — deal on enter, reset on leave ─────────────────
  useEffect(() => {
    if (isMobile) return;
    const el = sectionRef.current;
    if (!el) return;

    function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }

    function startDeal() {
      clearTimers();
      setDealtIn(true); setDealComplete(false);
      setAllowHover(false); setHoveredCard(null);
      setThuddingCards(new Set());

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

      const t3 = setTimeout(() => {
        setDealComplete(true); setAllowHover(true);
      }, DELAYS[3] + DURATIONS[3] + 130);
      timers.current.push(t3);
    }

    function resetDeal() {
      clearTimers();
      setDealtIn(false); setDealComplete(false);
      setAllowHover(false); setHoveredCard(null);
      setThuddingCards(new Set());
      setFlyOff(null); setDragDeltaX(0);
      setIsSnapping(false); setIsDragging(false);
      dragActive.current = false;
      dragDeltaRef.current = 0;
    }

    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) startDeal(); else resetDeal(); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimers(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // ── Document-level pointer listeners — attached while dragging ───────────
  // Using document-level handlers (not card-level) guarantees events are received
  // even when the pointer moves outside the card element. This is the key fix for
  // both desktop mouse drag AND mobile touch (via Pointer Events + touch-action:none).
  useEffect(() => {
    if (!isDragging) return;

    function handleMove(e: PointerEvent) {
      if (!dragActive.current || e.pointerId !== dragPtrId.current) return;
      const dx = e.clientX - dragStartX.current;
      dragDeltaRef.current = dx;                  // always up to date
      setDragDeltaX(dx);                           // triggers render
      const buf = velocityBuf.current;
      buf.push({ x: e.clientX, t: performance.now() });
      if (buf.length > 6) buf.shift();
    }

    function handleUp(e: PointerEvent) {
      if (!dragActive.current || e.pointerId !== dragPtrId.current) return;
      dragActive.current   = false;
      dragPtrId.current    = null;
      setIsDragging(false);

      // Read from ref — never stale
      const dx = dragDeltaRef.current;
      const buf = velocityBuf.current;
      let velocity = 0;
      if (buf.length >= 2) {
        const first = buf[0], last = buf[buf.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) velocity = Math.abs((last.x - first.x) / dt);
      }

      if (Math.abs(dx) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESH) {
        goDir(dx < 0 ? 1 : -1);
      } else {
        // Spring snap-back
        setIsSnapping(true);
        setDragDeltaX(0);
        dragDeltaRef.current = 0;
        const id = setTimeout(() => {
          setIsSnapping(false);
          setAllowHover(true);
        }, 420);
        timers.current.push(id);
      }
    }

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup",   handleUp);
    document.addEventListener("pointercancel", handleUp);
    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup",   handleUp);
      document.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging, goDir]);

  // ── Pointer-down on active card ───────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!dealComplete || flyOff || isSnapping) return;
    dragActive.current   = true;
    dragPtrId.current    = e.pointerId;
    dragStartX.current   = e.clientX;
    dragDeltaRef.current = 0;
    velocityBuf.current  = [{ x: e.clientX, t: performance.now() }];
    setIsDragging(true);
    setAllowHover(false);
    setHoveredCard(null);
    // Capture pointer — ensures pointermove/pointerup delivered even outside element
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [dealComplete, flyOff, isSnapping]);

  // ── Card data ─────────────────────────────────────────────────────────────
  // Order: 1. Plateforme  2. Mentorés  3. Mentors  4. Support
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

  // ── Deck resting transform for card i ─────────────────────────────────────
  function deckTransform(i: number) {
    const diff = (i - current + NUM_CARDS) % NUM_CARDS;
    const p = DECK[diff];
    return {
      transform: `translateX(${p.x}px) translateY(${p.y}px) rotate(${p.rotate}deg) scale(${p.scale})`,
      zIndex: p.z,
    };
  }

  // ── Outer wrapper style for each card ─────────────────────────────────────
  function cardStyle(i: number): React.CSSProperties {
    const isActive = i === current;
    const diff     = (i - current + NUM_CARDS) % NUM_CARDS;

    // Mobile: plain deck, no deal
    if (isMobile) {
      const { transform, zIndex } = deckTransform(i);
      return { transform, zIndex, transition: `transform 0.55s ${EASE_NAV}` };
    }

    // Pre-deal
    if (!dealtIn) {
      return { opacity: 0, transform: START_TRANSFORM[i], zIndex: (i + 1) * 10, transition: "none" };
    }

    // Active card being dragged
    if (isActive && isDragging) {
      const tilt   = dragDeltaX * 0.06;
      // Edge glow when dragged past 40px
      const glow   = Math.abs(dragDeltaX) > 40
        ? (dragDeltaX > 0
          ? "inset -4px 0 20px rgba(167,139,250,0.2), 0 12px 48px rgba(0,0,0,0.55)"
          : "inset  4px 0 20px rgba(124,58,237,0.2),  0 12px 48px rgba(0,0,0,0.55)")
        : "0 12px 48px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.35)";
      return {
        opacity:    1,
        transform:  `translateX(${dragDeltaX}px) rotate(${tilt}deg) scale(1.04)`,
        zIndex:     50,
        transition: "none",
        cursor:     "grabbing",
        borderRadius: 16,
        boxShadow:  glow,
      };
    }

    // Active card flying off
    if (isActive && flyOff) {
      const offX   = flyOff.dir < 0 ? "-160%" : "160%";
      const offRot = flyOff.dir < 0 ? "-20deg" : "20deg";
      return {
        opacity:    0,
        transform:  `translateX(${offX}) rotate(${offRot}) scale(0.85)`,
        zIndex:     50,
        transition: `transform 400ms ${EASE_DEAL}, opacity 320ms ease`,
        borderRadius: 16,
      };
    }

    // Active card snapping back
    if (isActive && isSnapping) {
      return {
        opacity:    1,
        transform:  "translateX(0px) rotate(0deg) scale(1)",
        zIndex:     40,
        transition: `transform 420ms ${EASE_SNAP}`,
        borderRadius: 16,
        boxShadow:  "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
      };
    }

    const { transform: deckTf, zIndex: deckZ } = deckTransform(i);
    let tf      = deckTf;
    let zIdx    = deckZ;
    let opacity = 1;

    // Card-behind peek while dragging active card
    if (isDragging && diff === 1) {
      const pct       = Math.min(Math.abs(dragDeltaX) / SWIPE_THRESHOLD, 1);
      const baseP     = DECK[1];
      const peekScale = baseP.scale + (DECK[0].scale - baseP.scale) * pct * 0.6;
      tf      = `translateX(${baseP.x}px) translateY(${baseP.y * (1 - pct * 0.3)}px) rotate(0deg) scale(${peekScale})`;
      opacity = 0.7 + 0.3 * pct;
      zIdx    = 35;
    }

    // Hover (idle only)
    const isHovered  = !isDragging && allowHover && hoveredCard === i;
    const anyHovered = !isDragging && allowHover && hoveredCard !== null;
    if (anyHovered) {
      if (isHovered) {
        tf   = `${deckTf} translateY(-12px) scale(1.03)`;
        zIdx = 50;
      } else {
        tf      = `${deckTf} scale(0.97)`;
        opacity = 0.65;
      }
    }

    const transition = anyHovered
      ? `transform 0.3s ${EASE_NAV}, opacity 0.3s ease`
      : dealComplete
        ? `transform 0.55s ${EASE_NAV}`
        : `transform ${DURATIONS[i]}ms ${EASE_DEAL} ${DELAYS[i]}ms,` +
          `opacity   ${DURATIONS[i]}ms ${EASE_DEAL} ${DELAYS[i]}ms`;

    return {
      opacity,
      transform:    tf,
      zIndex:       zIdx,
      transition,
      borderRadius: 16,
      boxShadow:    "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
    };
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
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
          className="relative select-none"
          style={{ width: "clamp(280px, 85vw, 340px)", height: "clamp(430px, 60vh, 520px)" }}
        >
          {CARDS.map((card, i) => {
            const isActive = i === current;
            return (
              <div
                key={card.id}
                className="absolute inset-0"
                style={{
                  ...cardStyle(i),
                  // Only active card shows grab cursor; others show pointer when clickable
                  cursor:      isActive && dealComplete && !isDragging && !flyOff
                    ? "grab"
                    : (!isActive ? "pointer" : undefined),
                  touchAction: "none",   // required for Pointer Events on touch devices
                }}
                onPointerDown={isActive ? onPointerDown : undefined}
                onMouseEnter={() => !isDragging && allowHover && setHoveredCard(i)}
                onMouseLeave={() => !isDragging && allowHover && setHoveredCard(null)}
                onClick={() => !isActive && !isDragging && setCurrent(i)}
              >
                {/* Inner card: clip + thud animation */}
                <div
                  className={`absolute inset-0 rounded-2xl overflow-hidden${!isActive ? " cursor-pointer" : ""}`}
                  style={{
                    animation: thuddingCards.has(i) ? "card-thud 120ms ease-out" : undefined,
                  }}
                >
                  <img
                    src={card.image}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
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
                            onClick={(e) => {
                              // Prevent nav if this was a drag (moved > 5px)
                              if (Math.abs(dragDeltaRef.current) > 5) e.preventDefault();
                              e.stopPropagation();
                            }}
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

        {/* Navigation */}
        <div className="flex flex-col items-center gap-5 mt-14">
          <div className="flex items-center gap-6">
            <button
              onClick={goPrev}
              disabled={!!flyOff || isSnapping}
              aria-label={t("explore_prev_card")}
              className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-all duration-200 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {CARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => !flyOff && !isSnapping && setCurrent(i)}
                  aria-label={`${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-6 bg-white" : "w-1.5 bg-white/20 hover:bg-white/35"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={!!flyOff || isSnapping}
              aria-label={t("explore_next_card")}
              className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-all duration-200 disabled:opacity-30"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-white/20 tracking-widest font-mono">
            {String(current + 1).padStart(2, "0")} / {String(CARDS.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </>
  );
}
