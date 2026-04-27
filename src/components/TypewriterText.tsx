"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  text: string;
  /** ms between each character */
  speed?: number;
  /** ms before starting (after mount) */
  delay?: number;
  className?: string;
}

export default function TypewriterText({
  text,
  speed = 55,
  delay = 900,
  className,
}: Props) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    setDone(false);

    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
        if (indexRef.current >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <span
          aria-hidden="true"
          className="inline-block w-[2px] h-[1em] ml-[1px] align-middle bg-[#A78BFA] animate-blink"
          style={{ verticalAlign: "middle" }}
        />
      )}
    </span>
  );
}
