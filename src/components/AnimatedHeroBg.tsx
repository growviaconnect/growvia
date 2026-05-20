"use client";

import { useEffect, useRef } from "react";

type Orb = {
  cx: number;                    // normalized [0,1] x center
  cy: number;                    // normalized [0,1] y center
  r: number;                     // radius as fraction of max(w,h)
  color: [number, number, number];
  alpha: number;
  tx: number;                    // time speed x
  ty: number;                    // time speed y
  phase: number;                 // initial phase offset
  amp: number;                   // oscillation amplitude (normalized)
};

const ORBS: Orb[] = [
  { cx: 0.30, cy: 0.40, r: 0.60, color: [124,  58, 237], alpha: 0.42, tx: 1.0,  ty: 0.65, phase: 0.0, amp: 0.13 },
  { cx: 0.72, cy: 0.28, r: 0.52, color: [ 76,  29, 149], alpha: 0.38, tx: 0.55, ty: 1.05, phase: 1.9, amp: 0.11 },
  { cx: 0.52, cy: 0.72, r: 0.45, color: [167, 139, 250], alpha: 0.22, tx: 1.25, ty: 0.80, phase: 3.3, amp: 0.09 },
  { cx: 0.18, cy: 0.60, r: 0.40, color: [ 99, 102, 241], alpha: 0.28, tx: 0.75, ty: 1.15, phase: 4.7, amp: 0.10 },
  { cx: 0.82, cy: 0.78, r: 0.38, color: [ 49,  10, 120], alpha: 0.35, tx: 1.10, ty: 0.90, phase: 2.5, amp: 0.08 },
];

export default function AnimatedHeroBg({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0, t = 0;

    function resize() {
      w = canvas!.offsetWidth;
      h = canvas!.offsetHeight;
      canvas!.width  = w;
      canvas!.height = h;
    }

    function frame() {
      t += 0.004;

      ctx!.fillStyle = "#0D0A1A";
      ctx!.fillRect(0, 0, w, h);

      for (const orb of ORBS) {
        const cx = (orb.cx + Math.sin(t * orb.tx + orb.phase)           * orb.amp) * w;
        const cy = (orb.cy + Math.cos(t * orb.ty + orb.phase + Math.PI) * orb.amp) * h;
        const r  = orb.r * Math.max(w, h);
        const [R, G, B] = orb.color;
        const a  = orb.alpha;

        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0.00, `rgba(${R},${G},${B},${a})`);
        grad.addColorStop(0.35, `rgba(${R},${G},${B},${(a * 0.5).toFixed(3)})`);
        grad.addColorStop(0.70, `rgba(${R},${G},${B},${(a * 0.15).toFixed(3)})`);
        grad.addColorStop(1.00, `rgba(${R},${G},${B},0)`);

        ctx!.fillStyle = grad;
        ctx!.beginPath();
        // Slightly oval for organic feel
        ctx!.ellipse(cx, cy, r, r * 0.78, t * 0.03 + orb.phase, 0, Math.PI * 2);
        ctx!.fill();
      }

      animId = requestAnimationFrame(frame);
    }

    resize();
    frame();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
