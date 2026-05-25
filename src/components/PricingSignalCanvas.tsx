"use client";

import { useEffect, useRef } from "react";

interface Dot   { x: number; y: number; opacity: number; targetOpacity: number; accent: boolean; }
interface Conn  { a: number; b: number; drawP: number; }   // a === -1 → center
interface Ptcl  { conn: Conn; prog: number; spd: number; dying: boolean; alpha: number; }

// Ring parameters per plan index
const RING_CFG = [
  [{ baseR: 0.12, period: 3.0, delay: 0.0 }],
  [{ baseR: 0.12, period: 3.0, delay: 0.0 },
   { baseR: 0.12, period: 3.0, delay: 1.0 }],
  [{ baseR: 0.10, period: 2.5, delay: 0.0 },
   { baseR: 0.14, period: 3.5, delay: 0.8 },
   { baseR: 0.18, period: 4.5, delay: 1.6 }],
];

const DOT_COUNT      = [8, 20, 45];
const PARTICLE_COUNT = [0, 3, 8];
const MAX_CROSS      = [0, 6, 18];

function lrp(a: number, b: number, t: number) { return a + (b - a) * t; }

export default function PricingSignalCanvas({ plan }: { plan: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planRef   = useRef(plan);
  useEffect(() => { planRef.current = plan; }, [plan]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let dots: Dot[]   = [];
    let conns: Conn[]  = [];
    let ptcls: Ptcl[]  = [];
    let t = 0, rafId = 0;
    let currentPlan = -1;
    let connTimer   = 0;
    let pulseCountdown = 4, pulsing = false, pulseP = 0;

    // ── Resize ─────────────────────────────────────────────────────────────
    function resize() {
      const dpr = devicePixelRatio || 1;
      W = canvas!.offsetWidth;
      H = canvas!.offsetHeight;
      canvas!.width  = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ── Generate all 45 dots in three tiers ────────────────────────────────
    function generateDots() {
      dots = [];
      const cx = W / 2, cy = H / 2;
      const R  = Math.min(W, H) * 0.46;
      const tiers = [
        { count: 8,  rMin: 0.12, rMax: 0.28, accent: false },
        { count: 12, rMin: 0.28, rMax: 0.44, accent: false },
        { count: 25, rMin: 0.44, rMax: 0.88, accent: true  },
      ];
      for (const tier of tiers) {
        for (let i = 0; i < tier.count; i++) {
          const angle = (i / tier.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.55;
          const r     = R * (tier.rMin + Math.random() * (tier.rMax - tier.rMin));
          dots.push({
            x: Math.max(6, Math.min(W - 6, cx + Math.cos(angle) * r)),
            y: Math.max(6, Math.min(H - 6, cy + Math.sin(angle) * r)),
            opacity: 0, targetOpacity: 0,
            accent: tier.accent,
          });
        }
      }
    }

    // ── Build connections ──────────────────────────────────────────────────
    function buildConns(p: number) {
      conns = [];
      if (p < 0) return;
      const count   = DOT_COUNT[p];
      const R       = Math.min(W, H) * 0.46;
      // Center → first 8 dots always
      for (let i = 0; i < Math.min(8, count); i++) {
        conns.push({ a: -1, b: i, drawP: 0 });
      }
      // Cross-connections
      const maxCross = MAX_CROSS[p];
      const maxDist  = R * (p === 1 ? 0.52 : 0.64);
      let added = 0;
      for (let a = 0; a < count && added < maxCross; a++) {
        for (let b = a + 1; b < count && added < maxCross; b++) {
          if (Math.hypot(dots[a].x - dots[b].x, dots[a].y - dots[b].y) < maxDist) {
            conns.push({ a, b, drawP: 0 });
            added++;
          }
        }
      }
    }

    // ── Build particles ────────────────────────────────────────────────────
    function buildPtcls(p: number) {
      const cross  = conns.filter(c => c.a >= 0);
      const pCount = PARTICLE_COUNT[p];
      ptcls = ptcls.filter(pt => pt.dying); // keep fading-out ones
      if (cross.length === 0 || pCount === 0) return;
      for (let i = 0; i < pCount; i++) {
        ptcls.push({
          conn:  cross[i % cross.length],
          prog:  i / pCount,
          spd:   0.003 + Math.random() * 0.002,
          dying: false, alpha: 0,
        });
      }
    }

    // ── Plan transition ────────────────────────────────────────────────────
    function applyPlan(p: number) {
      if (p === currentPlan) return;
      currentPlan    = p;
      pulsing        = false;
      pulseP         = 0;
      pulseCountdown = 4;
      const count = DOT_COUNT[p];
      dots.forEach((d, i) => { d.targetOpacity = i < count ? 1 : 0; });
      ptcls.forEach(pt => { pt.dying = true; });
      clearTimeout(connTimer);
      connTimer = window.setTimeout(() => { buildConns(p); buildPtcls(p); }, 280);
    }

    // ── Update ─────────────────────────────────────────────────────────────
    function update() {
      t += 1 / 60;
      applyPlan(planRef.current);
      dots.forEach(d  => { d.opacity = lrp(d.opacity, d.targetOpacity, 0.05); });
      conns.forEach(c => { c.drawP   = Math.min(c.drawP + 0.018, 1); });
      ptcls = ptcls.filter(pt => !pt.dying || pt.alpha > 0.02);
      ptcls.forEach(pt => {
        if (pt.dying) { pt.alpha -= 0.05; }
        else { pt.alpha = Math.min(pt.alpha + 0.04, 0.8); pt.prog += pt.spd; if (pt.prog > 1) pt.prog = 0; }
      });
      // Pulse wave (plan 2)
      if (currentPlan === 2) {
        pulseCountdown -= 1 / 60;
        if (!pulsing && pulseCountdown <= 0) { pulsing = true; pulseP = 0; pulseCountdown = 4; }
        if (pulsing) { pulseP += 0.028; if (pulseP >= 1) pulsing = false; }
      }
    }

    // ── Draw ───────────────────────────────────────────────────────────────
    function draw() {
      ctx!.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const R  = Math.min(W, H) * 0.46;
      const cp = currentPlan;

      // 1. Expanding rings
      if (cp >= 0) {
        for (const ring of RING_CFG[cp]) {
          const phase = ((t - ring.delay) / ring.period + 100) % 1;
          const r     = R * ring.baseR * (1 + phase);
          const alpha = 0.45 * (1 - phase);
          if (alpha < 0.01) continue;
          ctx!.save();
          ctx!.beginPath();
          ctx!.arc(cx, cy, r, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(124,58,237,${alpha.toFixed(3)})`;
          ctx!.lineWidth   = 1.5;
          ctx!.stroke();
          ctx!.restore();
        }
      }

      // 2. Connection lines
      for (const c of conns) {
        if (c.drawP < 0.01) continue;
        const ax = c.a < 0 ? cx : dots[c.a]?.x ?? cx;
        const ay = c.a < 0 ? cy : dots[c.a]?.y ?? cy;
        if (c.a >= 0 && (dots[c.a]?.opacity ?? 0) < 0.05) continue;
        if ((dots[c.b]?.opacity ?? 0) < 0.05) continue;
        const bx  = dots[c.b].x, by = dots[c.b].y;
        const len = Math.hypot(bx - ax, by - ay);
        ctx!.save();
        ctx!.strokeStyle = "rgba(124,58,237,0.2)";
        ctx!.lineWidth   = 0.8;
        if (c.drawP < 0.99) ctx!.setLineDash([len * c.drawP, len]);
        ctx!.beginPath(); ctx!.moveTo(ax, ay); ctx!.lineTo(bx, by); ctx!.stroke();
        ctx!.setLineDash([]);
        ctx!.restore();
      }

      // 3. Center orb
      if (cp >= 0) {
        const orbR  = [10, 14, 18][cp];
        const glowR = [20, 32, 46][cp];
        ctx!.save();
        ctx!.shadowBlur  = glowR;
        ctx!.shadowColor = "#7C3AED";
        ctx!.beginPath(); ctx!.arc(cx, cy, orbR, 0, Math.PI * 2);
        ctx!.fillStyle   = "#7C3AED"; ctx!.fill();
        ctx!.restore();
      }

      // 4. Dots
      const pulseBoost = pulsing ? Math.sin(pulseP * Math.PI) * 0.4 : 0;
      for (const d of dots) {
        if (d.opacity < 0.01) continue;
        const col   = d.accent ? "#A78BFA" : "#7C3AED";
        const r     = d.accent ? 2.8 : 2.2;
        const alpha = Math.min(1, d.opacity + pulseBoost);
        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.shadowBlur  = d.accent ? 10 : 7;
        ctx!.shadowColor = col;
        ctx!.beginPath(); ctx!.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx!.fillStyle   = col; ctx!.fill();
        ctx!.restore();
      }

      // 5. Particles
      for (const pt of ptcls) {
        if (pt.alpha < 0.02 || !dots[pt.conn.b]) continue;
        const c  = pt.conn;
        const ax = c.a < 0 ? cx : (dots[c.a]?.x ?? cx);
        const ay = c.a < 0 ? cy : (dots[c.a]?.y ?? cy);
        const px = ax + (dots[c.b].x - ax) * pt.prog;
        const py = ay + (dots[c.b].y - ay) * pt.prog;
        ctx!.save();
        ctx!.globalAlpha = pt.alpha;
        ctx!.shadowBlur  = 6;
        ctx!.shadowColor = "rgba(255,255,255,0.9)";
        ctx!.beginPath(); ctx!.arc(px, py, 2, 0, Math.PI * 2);
        ctx!.fillStyle   = "#fff"; ctx!.fill();
        ctx!.restore();
      }
    }

    function loop() {
      if (!document.hidden) { update(); draw(); }
      rafId = requestAnimationFrame(loop);
    }

    // Pause when tab hidden
    const onVis = () => {
      if (document.hidden) { cancelAnimationFrame(rafId); rafId = 0; }
      else if (!rafId) rafId = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { if (!rafId) rafId = requestAnimationFrame(loop); }
      else { cancelAnimationFrame(rafId); rafId = 0; }
    }, { threshold: 0 });
    observer.observe(canvas);

    const onResize = () => {
      resize(); generateDots();
      buildConns(Math.max(0, currentPlan));
      buildPtcls(Math.max(0, currentPlan));
    };
    window.addEventListener("resize", onResize);

    resize();
    generateDots();
    applyPlan(planRef.current);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(connTimer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}
