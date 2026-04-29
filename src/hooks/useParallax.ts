"use client";

import { RefObject, useEffect } from "react";

/**
 * Subtle scroll-driven parallax for full-bleed background images.
 *
 * The element (imgRef) is scaled up slightly so translateY shifts stay
 * within the overflow, preventing any gaps around the edges.
 *
 * @param imgRef    Ref to the image (or wrapper div) to animate
 * @param sectionRef Ref to the section whose scroll progress drives the effect
 * @param factor    Parallax strength: fraction of viewport height used as max offset (default 0.12)
 */
export function useParallax(
  imgRef: RefObject<HTMLElement | null>,
  sectionRef: RefObject<HTMLElement | null>,
  factor = 0.12,
) {
  useEffect(() => {
    const el      = imgRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;

    // Scale gives ~6% overflow on each side — enough headroom for translateY ±(factor/2*vH)
    const SCALE = 1 + factor * 1.1;
    el.style.willChange = "transform";

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vH   = window.innerHeight;
      // progress: 0 = section entering from bottom, 0.5 = centered, 1 = exiting top
      const raw     = (vH - rect.top) / (vH + rect.height);
      const clamped = Math.max(0, Math.min(1, raw));
      // Image lags behind: as section scrolls up, image shifts down relative to section
      const offset  = Math.round((clamped - 0.5) * factor * vH);
      el.style.transform = `translateY(${offset}px) scale(${SCALE})`;
    };

    let raf: number | null = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; update(); });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // sync to current scroll position on mount

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      el.style.willChange = "";
      el.style.transform  = "";
    };
  }, [factor]); // refs are stable; only re-run if factor changes
}
