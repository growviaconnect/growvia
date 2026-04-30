"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, RefreshCw, Shield } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import HeroParticles from "@/components/HeroParticles";

export default function FoundersPage() {
  const { t } = useLang();

  /* ── Refs ────────────────────────────────────────────────────── */
  const missionWrapRef  = useRef<HTMLDivElement | null>(null);
  const missionTextRef  = useRef<HTMLDivElement | null>(null);
  const missionStatsRef = useRef<HTMLDivElement | null>(null);
  const visionGridRef   = useRef<HTMLDivElement | null>(null);
  const visionCardRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const valuesWrapRef   = useRef<HTMLDivElement | null>(null);
  const valueCardRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const historyRef      = useRef<HTMLDivElement | null>(null);
  const teamWrapRef     = useRef<HTMLDivElement | null>(null);
  const teamCardRefs    = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Mission: translateX slide-in ───────────────────────────── */
  useEffect(() => {
    const text  = missionTextRef.current;
    const stats = missionStatsRef.current;
    const wrap  = missionWrapRef.current;
    if (!text || !stats || !wrap) return;
    const ease = "0.75s cubic-bezier(0.16,1,0.3,1)";
    text.style.cssText  += `opacity:0;transform:translateX(-40px);transition:opacity ${ease},transform ${ease};`;
    stats.style.cssText += `opacity:0;transform:translateX(40px);transition:opacity ${ease} 0.1s,transform ${ease} 0.1s;`;
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      text.style.opacity  = "1"; text.style.transform  = "translateX(0)";
      stats.style.opacity = "1"; stats.style.transform = "translateX(0)";
      obs.disconnect();
    }, { threshold: 0.2 });
    obs.observe(wrap);
    return () => obs.disconnect();
  }, []);

  /* ── Vision cards: fade-up stagger 100ms ────────────────────── */
  useEffect(() => {
    const cards = visionCardRefs.current.filter(Boolean) as HTMLDivElement[];
    const grid  = visionGridRef.current;
    if (!cards.length || !grid) return;
    cards.forEach((c, i) => {
      c.style.opacity   = "0";
      c.style.transform = "translateY(24px)";
      c.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms,transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms`;
    });
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      cards.forEach((c) => { c.style.opacity = "1"; c.style.transform = "translateY(0)"; });
      obs.disconnect();
    }, { threshold: 0.15 });
    obs.observe(grid);
    return () => obs.disconnect();
  }, []);

  /* ── Values rows: slide-in from left, stagger 80ms ─────────── */
  useEffect(() => {
    const cards = valueCardRefs.current.filter(Boolean) as HTMLDivElement[];
    const wrap  = valuesWrapRef.current;
    if (!cards.length || !wrap) return;
    cards.forEach((c, i) => {
      c.style.opacity   = "0";
      c.style.transform = "translateX(-20px)";
      c.style.transition = `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms,transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms`;
    });
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      cards.forEach((c) => { c.style.opacity = "1"; c.style.transform = "translateY(0)"; });
      obs.disconnect();
    }, { threshold: 0.12 });
    obs.observe(wrap);
    return () => obs.disconnect();
  }, []);

  /* ── Notre Histoire: fade-up ─────────────────────────────────── */
  useEffect(() => {
    const el = historyRef.current;
    if (!el) return;
    el.style.opacity   = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1)";
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      el.style.opacity = "1"; el.style.transform = "translateY(0)";
      obs.disconnect();
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Team rows: fade-up, second row delayed 150ms ───────────── */
  useEffect(() => {
    const cards = teamCardRefs.current.filter(Boolean) as HTMLDivElement[];
    const wrap  = teamWrapRef.current;
    if (!cards.length || !wrap) return;
    cards.forEach((c, i) => {
      c.style.opacity   = "0";
      c.style.transform = "translateY(20px)";
      c.style.transition = `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 150}ms,transform 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 150}ms`;
    });
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      cards.forEach((c) => { c.style.opacity = "1"; c.style.transform = "translateY(0)"; });
      obs.disconnect();
    }, { threshold: 0.12 });
    obs.observe(wrap);
    return () => obs.disconnect();
  }, []);

  /* ── Data ────────────────────────────────────────────────────── */
  const founders = [
    {
      name: "Luna Davin",
      role: "Co-Founder & CEO",
      bio: "Luna a vécu de première main la confusion du choix d'un parcours professionnel après ses études. Incapable de trouver des mentors qui comprenaient vraiment son chemin, elle a décidé de créer la plateforme qu'elle aurait aimé avoir.",
    },
    {
      name: "Yasmine Tunon",
      role: "Co-Founder & COO",
      bio: "Yasmine apporte une profonde passion pour le design centré sur l'humain et la construction de communautés. Ayant travaillé dans plusieurs pays et secteurs, elle comprend les complexités du marché du travail mondial.",
    },
  ];

  const values = [
    {
      num: "01",
      title: "Grow Every Day",
      desc: "Engagez-vous dans un développement personnel et professionnel continu. Le progrès, même petit, est la seule direction.",
    },
    {
      num: "02",
      title: "Embrace Change",
      desc: "Adaptez-vous aux défis et conduisez activement le progrès. Le meilleur chemin n'est rarement le plus évident.",
    },
    {
      num: "03",
      title: "Build Trust",
      desc: "Cultivez des relations honnêtes et transparentes qui créent un impact réel. La confiance est le fondement de chaque grande connexion de mentorat.",
    },
  ];

  const visionCards = [
    { icon: TrendingUp, title: t("founders_vision_c1_title"), desc: t("founders_vision_c1_desc") },
    { icon: RefreshCw,  title: t("founders_vision_c2_title"), desc: t("founders_vision_c2_desc") },
    { icon: Shield,     title: t("founders_vision_c3_title"), desc: t("founders_vision_c3_desc") },
  ];

  return (
    <div className="bg-[#0D0A1A]">

      {/* ── SECTION 1 — Hero ──────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#0D0A1A]" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%)" }}
          />
          <HeroParticles />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full py-32 pt-40">
          <p
            className="animate-fade-up text-[10px] font-bold uppercase tracking-[0.28em] mb-8"
            style={{ color: "#A78BFA", animationDelay: "0ms" }}
          >
            {t("founders_reason_label")}
          </p>
          <h1
            className="animate-fade-up text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight max-w-4xl mb-8"
            style={{ animationDelay: "120ms" }}
          >
            {t("founders_reason_title")}
          </h1>
          <p
            className="animate-fade-up text-lg text-white/45 max-w-xl leading-relaxed mb-12"
            style={{ animationDelay: "240ms" }}
          >
            {t("founders_reason_sub")}
          </p>
          <div
            className="animate-fade-up flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ animationDelay: "360ms" }}
          >
            <Link
              href="/explore/find-a-mentor"
              className="inline-flex items-center gap-2.5 text-white font-semibold px-7 py-3.5 rounded-lg transition-colors text-sm"
              style={{ background: "#7C3AED" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#6D28D9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#7C3AED"; }}
            >
              {t("for_you_mentee_cta")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/become-a-mentor"
              className="inline-flex items-center gap-2.5 text-white/80 hover:text-white font-semibold px-7 py-3.5 rounded-lg transition-all text-sm"
              style={{ border: "1px solid rgba(124,58,237,0.45)" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(124,58,237,0.85)";
                el.style.background  = "rgba(124,58,237,0.1)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(124,58,237,0.45)";
                el.style.background  = "";
              }}
            >
              {t("for_you_mentor_cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — Notre Mission (slide-in) ─────────────────── */}
      <section className="border-t border-white/5 py-32">
        <div
          ref={missionWrapRef}
          className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-20 items-start"
        >
          <div ref={missionTextRef}>
            <p className="text-sm font-bold text-[#A78BFA] uppercase tracking-[0.3em] mb-8">
              {t("founders_mission_label")}
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-8">
              {t("founders_mission_title")}
            </h2>
            <div className="space-y-5 text-white/45 text-base leading-relaxed">
              <p>{t("founders_mission_p1")}</p>
              <p>{t("founders_mission_p2")}</p>
              <p>{t("founders_mission_p3")}</p>
            </div>
          </div>
          <div ref={missionStatsRef} className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-x-0 gap-y-4">
              {[
                { value: "2025",       label: t("founders_stat_founded") },
                { value: "Barcelone",  label: t("founders_stat_hq") },
                { value: "3+",         label: t("founders_stat_langs") },
                { value: "Global",     label: t("founders_stat_vision") },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-white/50 uppercase tracking-widest">{stat.value}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="mx-5 text-[#7C3AED] select-none" aria-hidden="true">·</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — Notre Vision ──────────────────────────────── */}
      <section className="relative border-t border-white/5 py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1600&q=80"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.28) saturate(0.4)" }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="lg:py-8">
              <p className="text-sm font-bold text-[#7C3AED] uppercase tracking-[0.3em] mb-10">
                {t("founders_vision_label")}
              </p>
              <blockquote>
                <p
                  className="text-3xl md:text-4xl text-white/85 leading-snug max-w-3xl"
                  style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                >
                  &ldquo;{t("founders_vision_quote")}&rdquo;
                </p>
              </blockquote>
            </div>
            <div ref={visionGridRef} className="flex flex-col gap-4">
              {visionCards.map((card, i) => (
                <div
                  key={card.title}
                  ref={(el) => { visionCardRefs.current[i] = el; }}
                  className="rounded-2xl p-7 flex gap-5 items-start"
                  style={{
                    background: "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(124,58,237,0.06) 60%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(167,139,250,0.25)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 24px rgba(124,58,237,0.10)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-[#7C3AED]/20"
                    style={{ background: "rgba(76,29,149,0.35)" }}
                  >
                    <card.icon className="w-5 h-5 text-[#A78BFA]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">{card.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — Nos Valeurs (editorial list) ──────────────── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-[0.3em] mb-5">
              NOS VALEURS
            </p>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              {t("founders_values_title")}
            </h2>
          </div>
          <div ref={valuesWrapRef} className="border-t border-white/10">
            {values.map((v, i) => (
              <div
                key={v.num}
                ref={(el) => { valueCardRefs.current[i] = el; }}
                className="group grid grid-cols-[80px_1fr_1fr] lg:grid-cols-[120px_1fr_1fr] items-center gap-8 py-8 border-b border-white/10 hover:border-[#7C3AED] transition-colors duration-300 cursor-default"
              >
                <span className="text-6xl font-extrabold text-white/20 leading-none select-none">
                  {v.num}
                </span>
                <h3 className="text-xl lg:text-2xl font-bold text-white inline-block transition-transform duration-300 ease-out group-hover:scale-105 origin-left">
                  {v.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5 — Notre Histoire ────────────────────────────── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            ref={historyRef}
            className="max-w-[700px] mx-auto text-center"
          >
            <p className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-[0.28em] mb-8">
              {t("founders_history_label")}
            </p>
            <p
              className="text-xl text-white/70 leading-relaxed"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
            >
              {t("founders_history_text")}
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6 — Rencontrez les fondatrices (press style) ─── */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-[0.28em] mb-5">
              {t("founders_team_label")}
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {t("founders_team_title")}
            </h2>
          </div>
          <div ref={teamWrapRef} className="border-t border-white/10">
            {founders.map((f, i) => (
              <div
                key={f.name}
                ref={(el) => { teamCardRefs.current[i] = el; }}
                className="group grid md:grid-cols-2 gap-10 items-start py-12 border-b border-white/10"
              >
                <div>
                  <h3
                    className="text-5xl font-extrabold text-white transition-colors duration-300 group-hover:text-[#A78BFA] leading-none mb-3"
                  >
                    {f.name}
                  </h3>
                  <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest">
                    {f.role}
                  </p>
                </div>
                <p className="text-base text-white/55 leading-relaxed md:pt-2">
                  {f.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7 — Rejoignez-nous ───────────────────────────── */}
      <section className="border-t border-white/5 py-40 text-center">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <p className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-[0.28em] mb-10">
            {t("founders_cta_label")}
          </p>
          <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-8">
            {t("founders_cta_title")}
          </h2>
          <p className="text-lg text-white/40 mb-14 leading-relaxed">
            {t("founders_cta_sub")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
            >
              {t("founders_cta_start")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
            >
              {t("founders_cta_contact")}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
