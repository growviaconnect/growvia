"use client";

import { useEffect } from "react";

const STAGGER_MS = 100;
const hasExplicitDelay = /\breveal-delay-\d\b/;

export default function ScrollRevealEnhanced() {
  useEffect(() => {
    // Auto-stagger .reveal children inside CSS grid containers
    // that don't already have an explicit reveal-delay-N class.
    // Runs after mount so inline transitionDelay is set before the
    // IntersectionObserver (ScrollReveal) fires its first callbacks.
    document.querySelectorAll<HTMLElement>(".grid").forEach((grid) => {
      const kids = Array.from(grid.children).filter(
        (el): el is HTMLElement =>
          el instanceof HTMLElement &&
          el.classList.contains("reveal") &&
          !hasExplicitDelay.test(el.className),
      );
      if (kids.length < 2) return;
      kids.forEach((el, i) => {
        el.style.transitionDelay = `${i * STAGGER_MS}ms`;
      });
    });
  }, []);

  return null;
}
