"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Segment = { text: string; serif?: boolean };

const PHRASES: Segment[][] = [
  [
    { text: "Growing fast and learning every " },
    { text: "day.", serif: true },
  ],
  [
    { text: "Real, honest human " },
    { text: "connections.", serif: true },
  ],
  [
    { text: "Staying adaptable and always moving " },
    { text: "forward.", serif: true },
  ],
  [
    { text: "Creating real and meaningful " },
    { text: "impact.", serif: true },
  ],
];

function totalChars(segments: Segment[]): number {
  return segments.reduce((sum, s) => sum + s.text.length, 0);
}

function renderTyped(segments: Segment[], count: number) {
  const result: React.ReactNode[] = [];
  let remaining = count;
  for (let i = 0; i < segments.length; i++) {
    if (remaining <= 0) break;
    const seg = segments[i];
    const chars = seg.text.slice(0, remaining);
    remaining -= seg.text.length;
    if (seg.serif) {
      result.push(
        <span
          key={i}
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          {chars}
        </span>
      );
    } else {
      result.push(<span key={i}>{chars}</span>);
    }
  }
  return result;
}

export default function ManifestoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [activeStep, setActiveStep] = useState(-1);
  const [typingPhrase, setTypingPhrase] = useState(-1);
  const [typedChars, setTypedChars] = useState(0);
  const [showButton, setShowButton] = useState(false);

  function startTyping(phraseIdx: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setTypingPhrase(phraseIdx);
    setTypedChars(0);
    const total = totalChars(PHRASES[phraseIdx]);
    let count = 0;
    timerRef.current = setInterval(() => {
      count += 1;
      setTypedChars(count);
      if (count >= total) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        completedRef.current = [...completedRef.current, phraseIdx];
        if (phraseIdx === PHRASES.length - 1) {
          setTimeout(() => setShowButton(true), 400);
        }
      }
    }, 28);
  }

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrolledIn = -rect.top;
      if (scrolledIn < 0) return;

      const step = Math.min(PHRASES.length - 1, Math.floor(scrolledIn / window.innerHeight));
      setActiveStep(step);

      if (!completedRef.current.includes(step) && typingPhrase !== step) {
        startTyping(step);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typingPhrase]);

  return (
    <div ref={containerRef} style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.45) saturate(0.6)" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-12">
            We Believe In
          </p>

          <div className="max-w-4xl">
            {PHRASES.map((phrase, i) => {
              const isActive = i === activeStep;
              const isDone = completedRef.current.includes(i);
              const isTyping = i === typingPhrase;

              const visible = isActive || isDone;
              const chars = isTyping ? typedChars : isDone ? totalChars(phrase) : 0;
              const showCursor = isTyping && chars < totalChars(phrase);

              return (
                <p
                  key={i}
                  className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-4 min-h-[1.2em] transition-opacity duration-500"
                  style={{ opacity: visible ? 1 : 0 }}
                >
                  {visible ? renderTyped(phrase, chars) : null}
                  {showCursor && (
                    <span className="animate-blink ml-0.5 inline-block w-0.5 h-[0.85em] bg-white align-middle" />
                  )}
                </p>
              );
            })}
          </div>

          {/* CTA button */}
          <div
            className="mt-12 transition-all duration-700"
            style={{ opacity: showButton ? 1 : 0, transform: showButton ? "translateY(0)" : "translateY(16px)" }}
          >
            <Link
              href="/#manifesto"
              className="inline-flex items-center gap-2 bg-white text-[#0D0A1A] font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              Read our manifesto →
            </Link>
          </div>
        </div>

        {/* Dot indicators — right side */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          {PHRASES.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: 6,
                height: 6,
                background: i === activeStep ? "#7C3AED" : "rgba(255,255,255,0.2)",
                transform: i === activeStep ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
