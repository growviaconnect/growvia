"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  /** Array of phrases to cycle through in a loop */
  texts: string[];
  /** ms per character when typing */
  speed?: number;
  /** ms per character when deleting */
  deleteSpeed?: number;
  /** ms to pause after fully typing a phrase */
  pauseMs?: number;
  /** ms gap between deleting one phrase and starting the next */
  gapMs?: number;
  /** ms before the very first phrase starts typing */
  delay?: number;
  className?: string;
}

type Phase = "idle" | "typing" | "pausing" | "deleting";

export default function TypewriterText({
  texts,
  speed      = 55,
  deleteSpeed = 28,
  pauseMs    = 1800,
  gapMs      = 400,
  delay      = 900,
  className,
}: Props) {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase]         = useState<Phase>("idle");

  const phraseIdx = useRef(0);
  const charIdx   = useRef(0);
  const timer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive     = useRef(true);

  useEffect(() => {
    alive.current   = true;
    phraseIdx.current = 0;
    charIdx.current   = 0;
    setDisplayed("");
    setPhase("idle");

    function schedule(fn: () => void, ms: number) {
      timer.current = setTimeout(() => { if (alive.current) fn(); }, ms);
    }

    function typeChar() {
      const phrase = texts[phraseIdx.current % texts.length];
      charIdx.current++;
      setDisplayed(phrase.slice(0, charIdx.current));

      if (charIdx.current < phrase.length) {
        schedule(typeChar, speed);
      } else {
        setPhase("pausing");
        schedule(deleteChar, pauseMs);
      }
    }

    function deleteChar() {
      setPhase("deleting");
      const phrase = texts[phraseIdx.current % texts.length];

      if (charIdx.current > 0) {
        charIdx.current--;
        setDisplayed(phrase.slice(0, charIdx.current));
        schedule(deleteChar, deleteSpeed);
      } else {
        phraseIdx.current = (phraseIdx.current + 1) % texts.length;
        setPhase("idle");
        schedule(startTyping, gapMs);
      }
    }

    function startTyping() {
      setPhase("typing");
      schedule(typeChar, 0);
    }

    // Initial delay before the very first phrase
    schedule(startTyping, delay);

    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  // texts identity changes only when the language switches, restart the loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texts.join("|"), speed, deleteSpeed, pauseMs, gapMs, delay]);

  return (
    <span className={className}>
      {displayed}
      {/* Cursor, always visible while cycling */}
      <span
        aria-hidden="true"
        className="inline-block w-[2px] h-[1em] ml-[1px] bg-[#A78BFA] animate-blink"
        style={{ verticalAlign: "middle" }}
      />
    </span>
  );
}
