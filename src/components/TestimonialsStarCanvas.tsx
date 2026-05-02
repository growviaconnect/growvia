"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  baseOpacity: number;
  opacity: number;
  radius: number;
  color: string;
  phase: number;
  period: number; // seconds
}
interface ConnLine { a: number; b: number; }

export default function TestimonialsStarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let stars: Star[]    = [];
    let conns: ConnLine[] = [];
    let t      = 0;
    let rafId  = 0;

    // ── Canvas size ─────────────────────────────────────────────────────────
    function resize() {
      const dpr = devicePixelRatio || 1;
      W = canvas!.offsetWidth;
      H = canvas!.offsetHeight;
      canvas!.width  = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      generate();
    }

    // ── Generate stars + constellation connections ──────────────────────────
    function generate() {
      stars = [];

      // 110 small — radius 0.8, white, opacity 0.4–0.7
      for (let i = 0; i < 110; i++) {
        const base = 0.4 + Math.random() * 0.3;
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          baseOpacity: base, opacity: base,
          radius: 0.8, color: "255,255,255",
          phase: Math.random() * Math.PI * 2,
          period: 2 + Math.random() * 3,
        });
      }
      // 50 medium — radius 1.5, white, opacity 0.6–0.9
      for (let i = 0; i < 50; i++) {
        const base = 0.6 + Math.random() * 0.3;
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          baseOpacity: base, opacity: base,
          radius: 1.5, color: "255,255,255",
          phase: Math.random() * Math.PI * 2,
          period: 2 + Math.random() * 3,
        });
      }
      // 20 accent — radius 2.5, purple-white, opacity 0.8–1.0
      for (let i = 0; i < 20; i++) {
        const base = 0.8 + Math.random() * 0.2;
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          baseOpacity: base, opacity: base,
          radius: 2.5, color: "167,139,250",
          phase: Math.random() * Math.PI * 2,
          period: 2 + Math.random() * 3,
        });
      }

      // Constellation — connect ~25% of stars with organic, close-range lines
      conns = [];
      // Use every 4th star as a "node" (≈ 25% of 180 = 45 nodes)
      const nodes = stars.filter((_, i) => i % 4 === 0);
      const maxDist = Math.min(W, H) * 0.20;
      const seen = new Set<string>();

      for (let a = 0; a < nodes.length; a++) {
        let added = 0;
        for (let b = a + 1; b < nodes.length && added < 2; b++) {
          const key = `${a}:${b}`;
          if (seen.has(key)) continue;
          const dx = nodes[a].x - nodes[b].x;
          const dy = nodes[a].y - nodes[b].y;
          if (Math.hypot(dx, dy) < maxDist) {
            conns.push({
              a: stars.indexOf(nodes[a]),
              b: stars.indexOf(nodes[b]),
            });
            seen.add(key);
            added++;
          }
        }
      }
    }

    // ── Render loop ─────────────────────────────────────────────────────────
    function draw() {
      if (document.hidden) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      t += 1 / 60;
      ctx!.clearRect(0, 0, W, H);

      // Constellation lines (static colour, drawn every frame is cheap at ~40 lines)
      ctx!.save();
      ctx!.strokeStyle = "rgba(124,58,237,0.12)";
      ctx!.lineWidth   = 0.8;
      for (const c of conns) {
        const sa = stars[c.a], sb = stars[c.b];
        ctx!.beginPath();
        ctx!.moveTo(sa.x, sa.y);
        ctx!.lineTo(sb.x, sb.y);
        ctx!.stroke();
      }
      ctx!.restore();

      // Stars with independent twinkle
      for (const s of stars) {
        s.opacity = s.baseOpacity + Math.sin((t / s.period) * Math.PI * 2 + s.phase) * 0.3;
        s.opacity = Math.max(0.05, Math.min(1, s.opacity));

        ctx!.save();
        ctx!.globalAlpha = s.opacity;
        if (s.radius > 1) {
          ctx!.shadowBlur  = s.radius * 5;
          ctx!.shadowColor = `rgba(${s.color},0.8)`;
        }
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgb(${s.color})`;
        ctx!.fill();
        ctx!.restore();
      }

      rafId = requestAnimationFrame(draw);
    }

    // ── IntersectionObserver — pause off-screen ─────────────────────────────
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!rafId) rafId = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }, { threshold: 0 });
    observer.observe(canvas);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    resize();
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        display:       "block",
        pointerEvents: "none",
        zIndex:        0,
      }}
    />
  );
}
