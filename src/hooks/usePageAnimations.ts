"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STAGGER_MS = 100;
const hasExplicitDelay = /\breveal-delay-\d\b/;

/**
 * Reinitializes all global scroll animations on every client-side route change.
 *
 * Covers:
 *   - .reveal elements (IntersectionObserver, CSS class in-view)
 *   - Auto-stagger for .reveal children inside CSS grid containers
 *
 * Component-level animations (StatsSection counters, HeroParticles canvas,
 * ticker, etc.) are handled by their own useEffect hooks which re-run
 * automatically when those components unmount/remount on navigation.
 *
 * Root cause of the SPA bug: the layout stays mounted across navigations,
 * so a one-shot useEffect(fn, []) never re-runs. Keying on pathname fixes it.
 */
export function usePageAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let raf1 = 0;
    let raf2 = 0;

    // Double rAF: first tick lets React commit the new page tree,
    // second tick ensures layout + paint so getBoundingClientRect is reliable.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {

        // ── 1. Reset any stale in-view state on layout-persistent elements ──
        // Page elements unmount on navigation so they start fresh, but layout
        // elements (navbar, footer) can carry a stale .in-view class.
        document.querySelectorAll<HTMLElement>(".reveal.in-view").forEach((el) => {
          const { top, bottom } = el.getBoundingClientRect();
          // Only strip in-view if the element is actually off-screen now
          if (top >= window.innerHeight || bottom <= 0) {
            el.classList.remove("in-view");
          }
        });

        // ── 2. Ensure all .reveal elements start hidden ──────────────────────
        // CSS sets opacity:0 / translateY(30px) on .reveal, but inline styles
        // from a previous observer run (if the component didn't fully unmount)
        // could override it. Wipe them so the CSS baseline takes over.
        document.querySelectorAll<HTMLElement>(".reveal:not(.in-view)").forEach((el) => {
          el.style.opacity = "";
          el.style.transform = "";
        });

        // ── 3. Auto-stagger .reveal children inside CSS grid containers ──────
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

        // ── 4. Create fresh IntersectionObserver for all .reveal elements ────
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                (entry.target as HTMLElement).style.opacity = "";
                (entry.target as HTMLElement).style.transform = "";
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
    });

    // Cleanup: cancel pending frames + disconnect observer before next run
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      observer?.disconnect();
    };
  }, [pathname]);
}
