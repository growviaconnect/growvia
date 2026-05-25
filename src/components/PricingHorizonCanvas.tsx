"use client";

import { useEffect, useRef } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Dot {
  x: number;
  baseY: number;
  y: number;
  depth: number;        // 0 = near / bright / bottom — 1 = far / dim / top
  phase: number;        // float oscillation phase
  pulsePhase: number;   // breathe scale phase
  pulsePeriod: number;  // breathe period (2–4 s)
  opacity: number;      // animated current
  targetOpacity: number;
}
interface Conn  { a: number; b: number; drawP: number; }
interface Ptcl  { connIdx: number; prog: number; spd: number; }

// ── Per-plan parameters (index 0 = Basique, 1 = Standard, 2 = Premium) ──────
const DEPTH_CUTOFF = [0.25, 0.55, 1.0];   // max visible dot depth per plan
const FOG_TARGET   = [0.75, 0.45, 0.05];  // fog bottom edge (fraction from top)

function lrp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Near → #7C3AED, mid → #A78BFA, far → rgba(167,139,250, very low alpha)
function dotRgba(depth: number, opacity: number): string {
  const r = Math.round(lrp(124, 167, depth));
  const g = Math.round(lrp(58,  139, depth));
  const b = Math.round(lrp(237, 250, depth));
  const a = (opacity * lrp(1.0, 0.15, depth)).toFixed(3);
  return `rgba(${r},${g},${b},${a})`;
}

export default function PricingHorizonCanvas({ plan }: { plan: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planRef   = useRef(plan);
  useEffect(() => { planRef.current = plan; }, [plan]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let dots: Dot[]  = [];
    let conns: Conn[] = [];
    let ptcls: Ptcl[] = [];

    // Animated scalar values (lerped each frame)
    let fogLine   = FOG_TARGET[0];  // fraction from top where fog clears
    let horizGlow = 0;              // alpha of horizon radial glow
    let connAlpha = 0;              // alpha multiplier for lines + particles
    let t = 0, rafId = 0;

    // ── Canvas resize ────────────────────────────────────────────────────────
    function resize() {
      const dpr = devicePixelRatio || 1;
      W = canvas!.offsetWidth;
      H = canvas!.offsetHeight;
      canvas!.width  = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ── Generate perspective dot grid ─────────────────────────────────────
    //  Vanishing point: slightly right of centre, near top
    //  Near rows (bottom) = few wide dots;  far rows (top) = many tight dots
    function generateDots() {
      dots = [];
      const vpX = W * 0.58;   // vanishing-point x

      // Each level: { count, depthMid, yFrac }
      // Total dots = 3+5+7+9+12+10+9 = 55
      const levels = [
        { count: 3,  depthMid: 0.05, yFrac: 0.88 },
        { count: 5,  depthMid: 0.18, yFrac: 0.72 },
        { count: 7,  depthMid: 0.35, yFrac: 0.57 },
        { count: 9,  depthMid: 0.52, yFrac: 0.42 },
        { count: 12, depthMid: 0.70, yFrac: 0.27 },
        { count: 10, depthMid: 0.85, yFrac: 0.14 },
        { count: 9,  depthMid: 0.96, yFrac: 0.05 },
      ];

      for (const lvl of levels) {
        // Horizontal spread narrows toward horizon (perspective)
        const spread = W * lrp(0.44, 0.07, lvl.depthMid);

        for (let j = 0; j < lvl.count; j++) {
          const frac  = lvl.count === 1 ? 0.5 : j / (lvl.count - 1);
          const xOff  = (frac - 0.5) * spread * 2;
          const noise = (Math.random() - 0.5);
          const baseY = H * lvl.yFrac + noise * H * 0.04;
          const depth = Math.max(0, Math.min(1, lvl.depthMid + noise * 0.08));

          dots.push({
            x: vpX + xOff + noise * W * 0.03,
            baseY,
            y: baseY,
            depth,
            phase:       Math.random() * Math.PI * 2,
            pulsePhase:  Math.random() * Math.PI * 2,
            pulsePeriod: 2 + Math.random() * 2,
            opacity:      0,
            targetOpacity: 0,
          });
        }
      }
    }

    // ── Build constellation connections (mid-depth dots only) ─────────────
    function buildConns() {
      conns = [];
      const eligible = dots
        .map((d, i) => ({ d, i }))
        .filter(({ d }) => d.depth >= 0.2 && d.depth <= 0.65);

      const maxDist = W * 0.22;
      const seen    = new Set<string>();

      for (let a = 0; a < eligible.length; a++) {
        let added = 0;
        for (let b = a + 1; b < eligible.length && added < 2; b++) {
          const key = `${eligible[a].i}:${eligible[b].i}`;
          if (seen.has(key)) continue;
          const dx = eligible[a].d.x      - eligible[b].d.x;
          const dy = eligible[a].d.baseY  - eligible[b].d.baseY;
          if (Math.hypot(dx, dy) < maxDist) {
            conns.push({ a: eligible[a].i, b: eligible[b].i, drawP: 0 });
            seen.add(key);
            added++;
          }
        }
      }
      conns = conns.slice(0, 12);
    }

    // ── Build travelling particles ────────────────────────────────────────
    function buildPtcls() {
      ptcls = conns.slice(0, 4).map((_, i) => ({
        connIdx: i,
        prog: i * 0.25,
        spd:  0.003 + Math.random() * 0.002,
      }));
    }

    // ── Update (called every frame) ───────────────────────────────────────
    function update() {
      t += 1 / 60;
      const p = planRef.current;

      // Lerp scene scalars
      fogLine   = lrp(fogLine,   FOG_TARGET[p],    0.04);
      horizGlow = lrp(horizGlow, p === 2 ? 1 : 0,  0.03);
      connAlpha = lrp(connAlpha, p === 2 ? 1 : 0,  0.03);

      // Dot opacities + float
      const cutoff = DEPTH_CUTOFF[p];
      for (const d of dots) {
        d.targetOpacity = d.depth <= cutoff ? 1 : 0;
        d.opacity = lrp(d.opacity, d.targetOpacity, 0.04);
        // Near dots float more; far dots barely move
        const amp = lrp(3.5, 0.5, d.depth);
        d.y = d.baseY + Math.sin(t * 0.5 + d.phase) * amp;
      }

      // Connection draw progress
      for (const c of conns) {
        c.drawP = lrp(c.drawP, p === 2 ? 1 : 0, 0.03);
      }

      // Particles loop
      for (const p of ptcls) {
        p.prog += p.spd;
        if (p.prog > 1) p.prog = 0;
      }
    }

    // ── Draw (called every frame) ─────────────────────────────────────────
    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#0D0A1A";
      ctx!.fillRect(0, 0, W, H);

      // 1. Horizon radial glow (Plan 3 only) — drawn behind dots
      if (horizGlow > 0.01) {
        const hy  = H * fogLine + H * 0.03;
        const grd = ctx!.createRadialGradient(W * 0.55, hy, 0, W * 0.55, hy, W * 0.65);
        grd.addColorStop(0, `rgba(124,58,237,${(horizGlow * 0.30).toFixed(3)})`);
        grd.addColorStop(1, "transparent");
        ctx!.save();
        ctx!.fillStyle = grd;
        ctx!.fillRect(0, hy - 50, W, 100);
        ctx!.restore();
      }

      // 2. Connection lines (far→near so near lines render on top)
      if (connAlpha > 0.01) {
        for (const c of conns) {
          if (c.drawP < 0.01) continue;
          const da = dots[c.a], db = dots[c.b];
          if (da.opacity < 0.05 || db.opacity < 0.05) continue;
          const len = Math.hypot(db.x - da.x, db.y - da.y);
          ctx!.save();
          ctx!.globalAlpha = connAlpha * c.drawP * 0.5;
          ctx!.strokeStyle = "rgba(124,58,237,0.9)";
          ctx!.lineWidth   = 1;
          if (c.drawP < 0.99) ctx!.setLineDash([len * c.drawP, len]);
          ctx!.beginPath();
          ctx!.moveTo(da.x, da.y);
          ctx!.lineTo(db.x, db.y);
          ctx!.stroke();
          ctx!.setLineDash([]);
          ctx!.restore();
        }
      }

      // 3. Dots — draw far first (painter's algorithm)
      const sorted = [...dots].sort((a, b) => b.depth - a.depth);
      for (const d of sorted) {
        if (d.opacity < 0.01) continue;
        const pulse = 1 + Math.sin(t / d.pulsePeriod + d.pulsePhase) * 0.15;
        const r     = Math.max((3 - d.depth * 2) * pulse, 0.3);
        const col   = dotRgba(d.depth, d.opacity);

        ctx!.save();
        ctx!.shadowBlur  = lrp(18, 5, d.depth);
        ctx!.shadowColor = dotRgba(d.depth, d.opacity * 0.7);
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = col;
        ctx!.fill();
        ctx!.restore();
      }

      // 4. Travelling particles
      if (connAlpha > 0.01) {
        for (const p of ptcls) {
          if (p.connIdx >= conns.length) continue;
          const c  = conns[p.connIdx];
          const da = dots[c.a], db = dots[c.b];
          if (da.opacity < 0.3 || db.opacity < 0.3) continue;
          const px = da.x + (db.x - da.x) * p.prog;
          const py = da.y + (db.y - da.y) * p.prog;
          ctx!.save();
          ctx!.globalAlpha = connAlpha * 0.65;
          ctx!.shadowBlur  = 7;
          ctx!.shadowColor = "rgba(255,255,255,0.9)";
          ctx!.beginPath();
          ctx!.arc(px, py, 2, 0, Math.PI * 2);
          ctx!.fillStyle = "#ffffff";
          ctx!.fill();
          ctx!.restore();
        }
      }

      // 5. Fog overlay — drawn LAST so it hides far dots cleanly
      const fogPx   = H * fogLine;
      const fadePx  = H * 0.14;
      const fogGrd  = ctx!.createLinearGradient(0, 0, 0, H);
      const solid   = Math.max(0, (fogPx - fadePx) / H);
      const clear   = Math.min(1, fogPx / H);
      fogGrd.addColorStop(0,      "rgba(13,10,26,1)");
      fogGrd.addColorStop(solid,  "rgba(13,10,26,1)");
      fogGrd.addColorStop(clear,  "rgba(13,10,26,0)");
      if (clear < 1) fogGrd.addColorStop(1, "rgba(13,10,26,0)");
      ctx!.save();
      ctx!.fillStyle = fogGrd;
      ctx!.fillRect(0, 0, W, H);
      ctx!.restore();
    }

    function loop() { update(); draw(); rafId = requestAnimationFrame(loop); }

    // ── IntersectionObserver — pause when off-screen ──────────────────────
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!rafId) rafId = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(rafId); rafId = 0;
      }
    }, { threshold: 0 });
    observer.observe(canvas);

    const onResize = () => {
      resize();
      generateDots();
      buildConns();
      buildPtcls();
    };
    window.addEventListener("resize", onResize);

    resize();
    generateDots();
    buildConns();
    buildPtcls();
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}
