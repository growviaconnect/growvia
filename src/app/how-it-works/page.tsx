import Link from "next/link";
import { Video, Bell, Clock, CheckCircle, ArrowRight, Mail } from "lucide-react";

/* ── Shared style helpers ──────────────────────────────────── */
const serif = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

const Divider = () => (
  <div
    className="w-full h-px"
    style={{ background: "linear-gradient(to right, transparent 0%, rgba(124,58,237,0.35) 50%, transparent 100%)" }}
  />
);

/* ── Data ──────────────────────────────────────────────────── */
const steps = [
  {
    num: "01",
    title: "Create your profile",
    desc: "Tell us about yourself: your goals, background, career stage, and what kind of guidance you are looking for. This takes about 5 minutes.",
    detail: [
      "Choose your focus area (Career, Business, Personal Growth, Students)",
      "Describe your current situation and where you want to go",
      "Set your availability preferences",
    ],
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&q=80",
  },
  {
    num: "02",
    title: "Get your AI match (free, 1 time)",
    desc: "Our AI Smart Matching engine analyzes your profile and suggests the most compatible mentors. You get one free AI match on sign-up.",
    detail: [
      "Compatibility score based on goals, personality, and experience",
      "Shows percentage match for transparency",
      "Unlock unlimited matching with a subscription",
    ],
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80",
  },
  {
    num: "03",
    title: "Book a Discovery Session",
    desc: "Start with a 15–20 minute Discovery Session for 9.99€. Meet your mentor, explore the fit, and experience GrowVia before committing to a plan.",
    detail: [
      "15–20 minute intro session · 9.99€",
      "Fully integrated Google Meet link generated automatically",
      "Same link shared with mentor and mentee",
    ],
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=80",
  },
  {
    num: "04",
    title: "Choose your mentor",
    desc: "Browse our curated community of verified mentors or go with your AI suggestion. Filter by category, language, availability, and more.",
    detail: [
      "Save mentors to your favorites",
      "Read detailed mentor profiles",
      "See mentor availability in real time",
    ],
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
  },
  {
    num: "05",
    title: "Book your session",
    desc: "Pick a time that works for both of you. Confirm, pay, and you are all set. Sessions are booked directly through the platform.",
    detail: [
      "Discovery Session: 9.99€ · 15–20 min",
      "Basic: 19.99€/month · 2 sessions",
      "Premium: 39.99€/month · 4 sessions + unlimited AI",
    ],
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80",
  },
  {
    num: "06",
    title: "Join via Google Meet",
    desc: "On session day, join your session through the integrated Google Meet link. No extra apps needed. One click and you are in.",
    detail: [
      "Automatic meeting link generated after booking",
      "Email confirmation with join link",
      "Reminder 24h and 1h before session",
    ],
    image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=900&q=80",
  },
  {
    num: "07",
    title: "Continue your growth",
    desc: "After your Discovery Session, subscribe to Basic (19.99€/month) or Premium (39.99€/month) for regular sessions and ongoing guidance.",
    detail: [
      "Basic: 2 sessions/month · 19.99€",
      "Premium: 4 sessions/month + unlimited AI · 39.99€",
      "Cancel anytime, no hidden fees",
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
  },
];

const sessionCards = [
  {
    Icon: Video,
    title: "Google Meet Integrated",
    desc: "After booking, a unique Google Meet link is automatically generated and shared with both mentor and mentee. One click to join.",
  },
  {
    Icon: Bell,
    title: "Automatic Reminders",
    desc: "You receive an email confirmation right away, a reminder 24 hours before your session, and another 1 hour before.",
  },
  {
    Icon: Clock,
    title: "Cancellation Policy",
    desc: "Cancel at least 1 hour before your session to avoid any issues. Late cancellations are noted on your profile.",
  },
];

const notifications = [
  { time: "Now",            msg: "Session confirmed with Sophie Chen",  dot: "#10b981" },
  { time: "Tomorrow 09:00", msg: "Reminder: session in 24 hours",       dot: "#60a5fa" },
  { time: "Tomorrow 09:59", msg: "Your session starts in 1 hour",       dot: "#f59e0b" },
  { time: "Tomorrow 11:00", msg: "Join session via Google Meet",        dot: "#7C3AED" },
];

const notifItems = [
  { Icon: Mail,         label: "Email confirmation after booking" },
  { Icon: Bell,         label: "Reminder 24 hours before your session" },
  { Icon: Bell,         label: "Reminder 1 hour before your session" },
  { Icon: CheckCircle,  label: "Session summary and next steps" },
];

/* ── Page ──────────────────────────────────────────────────── */
export default function HowItWorksPage() {
  return (
    <>
      {/* ── SECTION 1 — HERO ───────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.35) saturate(0.6)" }}
        />
        <div className="absolute inset-0 bg-[#0D0A1A]/65" />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: "30%", background: "linear-gradient(to bottom, transparent, #0D0A1A)" }}
        />

        <div className="relative px-6 max-w-4xl mx-auto">
          <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8">
            The Process
          </p>
          <h1 className="reveal reveal-delay-1 text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-8">
            From uncertainty to{" "}
            <span style={{ ...serif, color: "#A78BFA" }}>clarity.</span>
          </h1>
          <p className="reveal reveal-delay-2 text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto">
            GrowVia is designed to make every step simple, structured, and actionable.
            Here is exactly how it works.
          </p>
        </div>
      </section>

      <Divider />

      {/* ── SECTION 2 — STEPS ──────────────────────────────────── */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {steps.map((step, i) => {
            const reversed = i % 2 === 1;
            return (
              <div key={step.num}>
                <div
                  className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-16 lg:gap-24 items-center py-28`}
                >
                  {/* Text side */}
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

                  {/* Image side */}
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

                {i < steps.length - 1 && <Divider />}
              </div>
            );
          })}
        </div>
      </section>

      <Divider />

      {/* ── SECTION 3 — SESSIONS RUN SMOOTHLY ─────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
              Built In
            </p>
            <h2 className="reveal reveal-delay-1 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Sessions that run smoothly.
            </h2>
            <p className="reveal reveal-delay-2 text-lg text-white/40 mt-5 max-w-xl mx-auto">
              Everything you need is built right into the platform.
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

      <Divider />

      {/* ── SECTION 4 — STAY INFORMED ──────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Left — text */}
            <div>
              <p className="reveal text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-5">
                Notifications
              </p>
              <h2 className="reveal reveal-delay-1 text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-7">
                Stay informed at{" "}
                <span style={serif}>every step.</span>
              </h2>
              <p className="reveal reveal-delay-2 text-white/45 leading-relaxed mb-10 text-base">
                We make sure you never miss a session or an important update.
                From booking to follow-up, GrowVia keeps you in the loop.
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

            {/* Right — notification mockup */}
            <div
              className="reveal reveal-delay-2 rounded-2xl p-8 border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/25 mb-6">
                Activity
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

      <Divider />

      {/* ── SECTION 5 — CTA ────────────────────────────────────── */}
      <section className="relative py-40 text-center overflow-hidden">
        {/* Looping video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://videos.pexels.com/video-files/3252312/3252312-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark violet overlay */}
        <div className="absolute inset-0" style={{ background: "rgba(60,20,100,0.75)" }} />

        <div className="relative max-w-2xl mx-auto px-6">
          <p className="reveal text-xs font-semibold text-[#C4B5FD] uppercase tracking-[0.25em] mb-8">
            Get Started
          </p>
          <h2 className="reveal reveal-delay-1 text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-7">
            Ready to take the{" "}
            <span style={serif}>first step?</span>
          </h2>
          <p className="reveal reveal-delay-2 text-white/60 text-lg leading-relaxed mb-12">
            Create your profile, get AI-matched, and book your first Discovery Session.
            No long-term commitment.
          </p>
          <div className="reveal reveal-delay-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2.5 bg-white text-[#4C1D95] font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-colors text-sm"
            >
              Find my mentor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
