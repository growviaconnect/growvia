"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STAGGER_MS = 100;
const hasExplicitDelay = /\breveal-delay-\d\b/;

/**
 * Reinitializes all .reveal IntersectionObservers and stagger delays
 * on every client-side route change, fixing the SPA navigation bug
 * where elements stay invisible until a hard reload.
 */
export function usePageAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let rafId: number;

    // rAF ensures the new page DOM is painted before we query it
    rafId = requestAnimationFrame(() => {
      // Auto-stagger .reveal children inside CSS grid containers
      // that don't already carry an explicit reveal-delay-N class
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

      // Observe all .reveal elements and toggle in-view on intersection
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
            } else {
              entry.target.classList.remove("in-view");
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
      );

      document
        .querySelectorAll(".reveal")
        .forEach((el) => observer!.observe(el));
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [pathname]);
}
