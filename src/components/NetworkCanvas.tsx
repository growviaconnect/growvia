"use client";

import { useEffect, useRef } from "react";

interface Node {
  type: "mentor" | "mentee";
  idx: number;
  x: number; y: number;
  tx: number; ty: number;
  opacity: number; tOpacity: number;
  scale: number; tScale: number;
  phase: number;
}

interface Conn { m: Node; e: Node; drawP: number; }
interface Particle { conn: Conn; prog: number; spd: number; dying: boolean; alpha: number; }
interface Ripple { x: number; y: number; r: number; a: number; }

const PLAN_CONNS: [number, number][][] = [
  [[0, 0]],
  [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]],
  [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [4, 5], [5, 5], [5, 0]],
];
const PLAN_CNT = [1, 3, 6];

function mkPool(type: "mentor" | "mentee"): Node[] {
  return Array.from({ length: 6 }, (_, i) => ({
    type, idx: i, x: 0, y: 0, tx: 0, ty: 0,
    opacity: 0, tOpacity: 0, scale: 0, tScale: 0,
    phase: Math.random() * Math.PI * 2,
  }));
}

function planPos(plan: number, W: number, H: number) {
  const cx = W / 2, cy = H / 2;
  const ms: [number, number][] = [], es: [number, number][] = [];
  if (plan === 0) {
    ms.push([cx - 70, cy]); es.push([cx + 70, cy]);
  } else if (plan === 1) {
    const sp = Math.min(H * 0.14, 100);
    for (let i = 0; i < 3; i++) {
      ms.push([cx - 100, cy + (i - 1) * sp]);
      es.push([cx + 100, cy + (i - 1) * sp]);
    }
  } else {
    const sp = Math.min(H * 0.11, 80);
    for (let i = 0; i < 6; i++) {
      ms.push([cx - 120, cy + (i - 2.5) * sp]);
      es.push([cx + 120, cy + (i - 2.5) * sp]);
    }
  }
  return { ms, es };
}

export default function NetworkCanvas({ plan }: { plan: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planRef = useRef(plan);

  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;

    function resize() {
      const dpr = devicePixelRatio || 1;
      W = canvas!.offsetWidth; H = canvas!.offsetHeight;
      canvas!.width = Math.round(W * dpr); canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const mentors = mkPool("mentor");
    const mentees = mkPool("mentee");
    const allNodes = [...mentors, ...mentees];

    let conns: Conn[] = [], particles: Particle[] = [], ripples: Ripple[] = [];
    let currentPlan = -1, t = 0, lastRipple = 0;
    let rafId = 0;
    let connTimer = 0;

    function initPlan0() {
      resize();
      currentPlan = 0;
      const { ms, es } = planPos(0, W, H);
      const m = mentors[0], e = mentees[0];
      m.x = m.tx = ms[0][0]; m.y = m.ty = ms[0][1]; m.opacity = m.tOpacity = 1; m.scale = m.tScale = 1;
      e.x = e.tx = es[0][0]; e.y = e.ty = es[0][1]; e.opacity = e.tOpacity = 1; e.scale = e.tScale = 1;
      conns = [{ m, e, drawP: 1 }];
      particles = [{ conn: conns[0], prog: 0.3, spd: 0.004, dying: false, alpha: 1 }];
    }

    function applyPlan(p: number) {
      if (p === currentPlan) return;
      clearTimeout(connTimer);
      currentPlan = p;
      const cnt = PLAN_CNT[p], { ms, es } = planPos(p, W, H);
      mentors.forEach((n, i) => {
        if (i < cnt) {
          n.tx = ms[i][0]; n.ty = ms[i][1];
          if (n.opacity < 0.05) { n.x = W / 2; n.y = H / 2; }
          n.tOpacity = 1; n.tScale = 1;
        } else { n.tOpacity = 0; n.tScale = 0; }
      });
      mentees.forEach((n, i) => {
        if (i < cnt) {
          n.tx = es[i][0]; n.ty = es[i][1];
          if (n.opacity < 0.05) { n.x = W / 2; n.y = H / 2; }
          n.tOpacity = 1; n.tScale = 1;
        } else { n.tOpacity = 0; n.tScale = 0; }
      });
      particles.forEach(p => p.dying = true);
      connTimer = window.setTimeout(() => {
        conns = PLAN_CONNS[p].map(([mi, ei]) => ({ m: mentors[mi], e: mentees[ei], drawP: 0 }));
        particles = conns.map(c => ({ conn: c, prog: Math.random(), spd: 0.003 + Math.random() * 0.003, dying: false, alpha: 0 }));
      }, 300);
    }

    function update() {
      t += 1 / 60;
      applyPlan(planRef.current);
      allNodes.forEach(n => {
        n.x += (n.tx - n.x) * 0.07; n.y += (n.ty - n.y) * 0.07;
        n.opacity += (n.tOpacity - n.opacity) * 0.08;
        n.scale += (n.tScale - n.scale) * 0.08;
      });
      conns.forEach(c => { c.drawP = Math.min(c.drawP + 0.022, 1); });
      particles = particles.filter(p => !p.dying || p.alpha > 0.02);
      particles.forEach(p => {
        if (p.dying) { p.alpha -= 0.06; }
        else { p.alpha = Math.min(p.alpha + 0.05, 0.7); p.prog += p.spd; if (p.prog > 1) p.prog = 0; }
      });
      ripples = ripples.filter(r => r.a > 0.01);
      ripples.forEach(r => { r.r += 0.45; r.a *= 0.972; });
      if (currentPlan === 2 && t - lastRipple > 3) {
        lastRipple = t;
        const vis = mentors.filter(n => n.opacity > 0.5);
        if (vis.length) {
          const n = vis[Math.floor(Math.random() * vis.length)];
          ripples.push({ x: n.x, y: n.y, r: 7, a: 0.8 });
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#0D0A1A"; ctx!.fillRect(0, 0, W, H);

      ripples.forEach(r => {
        ctx!.save(); ctx!.globalAlpha = r.a;
        ctx!.beginPath(); ctx!.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx!.strokeStyle = "rgba(167,139,250,0.4)"; ctx!.lineWidth = 1.5; ctx!.stroke();
        ctx!.restore();
      });

      conns.forEach(c => {
        if (c.m.opacity < 0.05 || c.e.opacity < 0.05) return;
        const fy1 = Math.sin(t * 0.8 + c.m.phase) * 0.3;
        const fy2 = Math.sin(t * 0.8 + c.e.phase) * 0.3;
        const x1 = c.m.x, y1 = c.m.y + fy1, x2 = c.e.x, y2 = c.e.y + fy2;
        const len = Math.hypot(x2 - x1, y2 - y1);
        ctx!.save();
        ctx!.strokeStyle = "rgba(124,58,237,0.3)"; ctx!.lineWidth = 1;
        if (c.drawP < 0.99) ctx!.setLineDash([len * c.drawP, len]);
        ctx!.beginPath(); ctx!.moveTo(x1, y1); ctx!.lineTo(x2, y2); ctx!.stroke();
        ctx!.setLineDash([]); ctx!.restore();
      });

      allNodes.forEach(n => {
        if (n.opacity < 0.01) return;
        const isMentor = n.type === "mentor";
        const r = Math.max((isMentor ? 7 : 5) * n.scale, 0.01);
        const col = isMentor ? "#7C3AED" : "#A78BFA";
        const fy = Math.sin(t * 0.8 + n.phase) * 0.3;
        ctx!.save(); ctx!.globalAlpha = n.opacity;
        ctx!.shadowBlur = isMentor ? 18 : 12; ctx!.shadowColor = col;
        ctx!.beginPath(); ctx!.arc(n.x, n.y + fy, r, 0, Math.PI * 2);
        ctx!.fillStyle = col; ctx!.fill();
        ctx!.shadowBlur = 0;
        ctx!.font = isMentor ? "8px sans-serif" : "6px sans-serif";
        ctx!.fillStyle = isMentor ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.15)";
        ctx!.textAlign = "center";
        ctx!.fillText(isMentor ? "M" : "•", n.x, n.y + fy + r + 10);
        ctx!.restore();
      });

      particles.forEach(p => {
        if (p.alpha < 0.02) return;
        const { m, e } = p.conn;
        const x = m.x + (e.x - m.x) * p.prog, y = m.y + (e.y - m.y) * p.prog;
        ctx!.save(); ctx!.globalAlpha = p.alpha;
        ctx!.shadowBlur = 6; ctx!.shadowColor = "rgba(255,255,255,0.8)";
        ctx!.beginPath(); ctx!.arc(x, y, 2, 0, Math.PI * 2);
        ctx!.fillStyle = "#fff"; ctx!.fill(); ctx!.restore();
      });
    }

    function loop() { update(); draw(); rafId = requestAnimationFrame(loop); }

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
      if (currentPlan < 0) return;
      const cnt = PLAN_CNT[currentPlan], { ms, es } = planPos(currentPlan, W, H);
      mentors.forEach((n, i) => { if (i < cnt) { n.tx = ms[i][0]; n.ty = ms[i][1]; } });
      mentees.forEach((n, i) => { if (i < cnt) { n.tx = es[i][0]; n.ty = es[i][1]; } });
    };
    window.addEventListener("resize", onResize);

    initPlan0();
    applyPlan(planRef.current);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(connTimer);
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
