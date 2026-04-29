"use client";

import Link from "next/link";
import { Video, Bell, Clock, CheckCircle, ArrowRight, Mail } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const serif = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

const stepImages = [
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&q=80",
  "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80",
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80",
  "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=900&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
];

export default function HowItWorksPage() {
  const { t } = useLang();

  const steps = [
    {
      num: "01",
      title: t("hiw_s1_title"),
      desc:  t("hiw_s1_desc"),
      detail: [t("hiw_s1_d1"), t("hiw_s1_d2"), t("hiw_s1_d3")],
      image: stepImages[0],
    },
    {
      num: "02",
      title: t("hiw_s2_title"),
      desc:  t("hiw_s2_desc"),
      detail: [t("hiw_s2_d1"), t("hiw_s2_d2"), t("hiw_s2_d3")],
      image: stepImages[1],
    },
    {
      num: "03",
      title: t("hiw_s3_title"),
      desc:  t("hiw_s3_desc"),
      detail: [t("hiw_s3_d1"), t("hiw_s3_d2"), t("hiw_s3_d3")],
      image: stepImages[2],
    },
    {
      num: "04",
      title: t("hiw_s4_title"),
      desc:  t("hiw_s4_desc"),
      detail: [t("hiw_s4_d1"), t("hiw_s4_d2"), t("hiw_s4_d3")],
      image: stepImages[3],
    },
    {
      num: "05",
      title: t("hiw_s5_title"),
      desc:  t("hiw_s5_desc"),
      detail: [t("hiw_s5_d1"), t("hiw_s5_d2"), t("hiw_s5_d3")],
      image: stepImages[4],
    },
    {
      num: "06",
      title: t("hiw_s6_title"),
      desc:  t("hiw_s6_desc"),
      detail: [t("hiw_s6_d1"), t("hiw_s6_d2"), t("hiw_s6_d3")],
      image: stepImages[5],
    },
    {
      num: "07",
      title: t("hiw_s7_title"),
      desc:  t("hiw_s7_desc"),
      detail: [t("hiw_s7_d1"), t("hiw_s7_d2"), t("hiw_s7_d3")],
      image: stepImages[6],
    },
  ];

  const sessionCards = [
    { Icon: Video, title: t("hiw_c1_title"), desc: t("hiw_c1_desc") },
    { Icon: Bell,  title: t("hiw_c2_title"), desc: t("hiw_c2_desc") },
    { Icon: Clock, title: t("hiw_c3_title"), desc: t("hiw_c3_desc") },
  ];

  const notifications = [
    { time: "Now",            msg: t("hiw_notif_confirmed"), dot: "#10b981" },
    { time: "Tomorrow 09:00", msg: t("hiw_notif_reminder24"), dot: "#60a5fa" },
    { time: "Tomorrow 09:59", msg: t("hiw_notif_reminder1"),  dot: "#f59e0b" },
    { time: "Tomorrow 11:00", msg: t("hiw_notif_join"),       dot: "#7C3AED" },
  ];

  const notifItems = [
    { Icon: Mail,        label: t("hiw_n1") },
    { Icon: Bell,        label: t("hiw_n2") },
    { Icon: Bell,        label: t("hiw_n3") },
    { Icon: CheckCircle, label: t("hiw_n4") },
  ];

  return (
    <>
      {/* ── SECTION 1, HERO ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80"
          alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.35) saturate(0.6)" }}
        />
        <div className="absolute inset-0 bg-[#0D0A1A]/65" />
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: "30%", background: "linear-gradient(to bottom, transparent, #0D0A1A)" }}
        />

        <div className="relative px-6 max-w-4xl mx-auto">
          <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8">
            {t("hiw_label")}
          </p>
          <h1 className="reveal reveal-delay-1 text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-8">
            {t("hiw_title1")}{" "}
            <span style={{ ...serif, color: "#A78BFA" }}>{t("hiw_title2")}</span>
          </h1>
          <p className="reveal reveal-delay-2 text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto">
            {t("hiw_sub")}
          </p>
        </div>
      </section>

      {/* ── SECTION 2, STEPS ──────────────────────────────────── */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {steps.map((step, i) => {
            const reversed = i % 2 === 1;
            return (
              <div key={step.num}>
                <div
                  className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-16 lg:gap-24 items-center py-28`}
                >
                  <div className="reveal flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7C3AED] mb-5">
                      {step.num}
                    </p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6 tracking-tight">
                      {step.title}
                    </h2>
                    <p className="text-base text-white/50 leading-relaxed mb-8">
                      {step.desc}
                    </p>
                    <ul className="space-y-4">
                      {step.detail.map((d) => (
                        <li key={d} className="flex items-start gap-3 text-sm text-white/55">
                          <CheckCircle className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="reveal reveal-delay-2 flex-1 min-w-0 relative overflow-hidden rounded-2xl" style={{ aspectRatio: "4/3" }}>
                    <div className="w-full h-full overflow-hidden rounded-2xl">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover ken-burns-img"
                        style={{ animationDelay: `${i * 0.8}s` }}
                      />
                    </div>
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ background: "linear-gradient(135deg, rgba(76,29,149,0.25) 0%, transparent 60%)" }}
                    />
                  </div>
                </div>

                {i < steps.length - 1 && (
                  <div className="w-full h-px" style={{ background: "linear-gradient(to right, transparent 0%, rgba(124,58,237,0.12) 50%, transparent 100%)" }} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 3, SESSIONS ───────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
              {t("hiw_sessions_label")}
            </p>
            <h2 className="reveal reveal-delay-1 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {t("hiw_sessions_title")}
            </h2>
            <p className="reveal reveal-delay-2 text-lg text-white/40 mt-5 max-w-xl mx-auto">
              {t("hiw_sessions_sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessionCards.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                className={`reveal reveal-delay-${i + 1} rounded-2xl p-8 border border-white/[0.07] hover:border-[#7C3AED]/40 transition-colors duration-300`}
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
                >
                  <Icon className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4, NOTIFICATIONS ──────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            <div>
              <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
                {t("hiw_notif_label")}
              </p>
              <h2 className="reveal reveal-delay-1 text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-7">
                {t("hiw_notif_title1")}{" "}
                <span style={serif}>{t("hiw_notif_title2")}</span>
              </h2>
              <p className="reveal reveal-delay-2 text-white/45 leading-relaxed mb-10 text-base">
                {t("hiw_notif_sub")}
              </p>
              <div className="reveal reveal-delay-3 space-y-5">
                {notifItems.map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                    >
                      <Icon className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <span className="text-white/60 text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="reveal reveal-delay-2 rounded-2xl p-8 border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/25 mb-6">
                {t("hiw_activity")}
              </p>
              <div className="space-y-3">
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl p-4 border border-white/[0.05]"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: n.dot, boxShadow: `0 0 8px ${n.dot}80` }}
                    />
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{n.time}</div>
                      <div className="text-sm font-medium text-white/75">{n.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 5, CTA ─────────────────────────────────────── */}
      <section className="relative py-40 text-center overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src="https://videos.pexels.com/video-files/3252312/3252312-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-10" style={{ background: "rgba(60,20,100,0.75)" }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none z-20" style={{ height: "220px", background: "linear-gradient(to bottom, #0D0A1A 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-20" style={{ height: "220px", background: "linear-gradient(to top, #0D0A1A 0%, transparent 100%)" }} />

        <div className="relative z-30 max-w-2xl mx-auto px-6">
          <p className="reveal text-xs font-semibold text-[#C4B5FD] uppercase tracking-[0.25em] mb-8">
            {t("hiw_cta_label")}
          </p>
          <h2 className="reveal reveal-delay-1 text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-7">
            {t("hiw_cta_title1")}{" "}
            <span style={serif}>{t("hiw_cta_title2")}</span>
          </h2>
          <p className="reveal reveal-delay-2 text-white/60 text-lg leading-relaxed mb-12">
            {t("hiw_cta_sub")}
          </p>
          <div className="reveal reveal-delay-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2.5 bg-white text-[#4C1D95] font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-colors text-sm"
            >
              {t("hiw_cta_btn")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
