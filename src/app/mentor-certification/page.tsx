import Link from "next/link";
import { BadgeCheck, PlayCircle, ClipboardList, Award, ArrowRight, Users, TrendingUp } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: PlayCircle,
    title: "Watch 3 short training videos",
    desc: "Learn proven techniques for effective mentoring — active listening, goal-setting frameworks, and how to give feedback that actually lands.",
  },
  {
    num: "02",
    icon: ClipboardList,
    title: "Complete a brief assessment",
    desc: "A short quiz to validate your understanding and confirm you're ready to guide mentees with confidence.",
  },
  {
    num: "03",
    icon: Award,
    title: "Earn your certified badge",
    desc: "Your public profile displays the \"GrowVia Certified Mentor\" badge — instantly visible to mentees browsing the platform.",
  },
];

export default function MentorCertificationPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="pt-20 pb-20 text-center px-4"
        style={{ background: "linear-gradient(135deg, #0F1020 0%, #1B1F3B 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6"
            style={{ background: "rgba(91,61,245,0.15)", color: "#9B8FFF", border: "1px solid rgba(91,61,245,0.3)" }}
          >
            <BadgeCheck className="w-4 h-4" />
            Mentor Certification
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-5 leading-tight">
            Become a GrowVia{" "}
            <span className="gradient-text">Certified Mentor</span>
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: "#9B8FFF" }}>
            All mentors on GrowVia complete a short certification before going live. It takes less than an hour and it makes all the difference.
          </p>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-3">The process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Three steps to certification</h2>
            <p className="text-lg" style={{ color: "#6B6F80" }}>Less than an hour. Done once. Valid permanently.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 relative">
            {/* Connector line (desktop only) */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
              style={{ background: "linear-gradient(90deg, rgba(91,61,245,0.2) 0%, rgba(91,61,245,0.5) 50%, rgba(91,61,245,0.2) 100%)" }}
            />

            {steps.map((step, i) => (
              <div key={step.num} className={`reveal reveal-delay-${i + 1} relative flex flex-col items-center text-center`}>
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 z-10"
                  style={{ background: "linear-gradient(135deg, #5B3DF5 0%, #7C5CFF 100%)", boxShadow: "0 8px 32px rgba(91,61,245,0.35)" }}
                >
                  <step.icon className="w-9 h-9 text-white" />
                </div>
                <div className="text-xs font-bold mb-2 text-purple-600 uppercase tracking-widest">
                  Step {step.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B6F80" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-24 bg-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-3">The impact</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Why it matters</h2>
            <p className="text-lg" style={{ color: "#6B6F80" }}>Certification builds trust on both sides of the relationship.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For mentees */}
            <div
              className="reveal reveal-delay-1 rounded-2xl p-8 bg-white"
              style={{ boxShadow: "0 4px 24px rgba(91,61,245,0.07)", border: "1px solid rgba(91,61,245,0.1)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(91,61,245,0.08)" }}
              >
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-purple-600">For mentees</p>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Every mentor has been vetted and trained.
              </h3>
              <p className="leading-relaxed text-sm" style={{ color: "#6B6F80" }}>
                You know every mentor you meet has been vetted and trained. No guessing. When you book a session with a GrowVia Certified Mentor, you're working with someone who understands how to guide, listen, and help you move forward.
              </p>
            </div>

            {/* For mentors */}
            <div
              className="reveal reveal-delay-2 rounded-2xl p-8"
              style={{ background: "linear-gradient(135deg, #0F1020 0%, #1B1F3B 100%)", border: "1px solid rgba(91,61,245,0.2)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(91,61,245,0.15)" }}
              >
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-purple-400">For mentors</p>
              <h3 className="text-xl font-bold text-white mb-3">
                Your badge signals credibility.
              </h3>
              <p className="leading-relaxed text-sm" style={{ color: "#9B8FFF" }}>
                Your badge signals credibility and increases your visibility in matching results. Certified mentors appear higher in AI-powered recommendations and are more likely to be booked by serious mentees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 text-center px-4"
        style={{ background: "linear-gradient(135deg, #5B3DF5 0%, #7C5CFF 100%)" }}
      >
        <div className="max-w-2xl mx-auto reveal">
          <BadgeCheck className="w-12 h-12 mx-auto mb-5" style={{ color: "rgba(255,255,255,0.7)" }} />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get certified?
          </h2>
          <p className="mb-8 text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            Apply to join GrowVia as a mentor. Once approved, you'll complete the certification as part of your onboarding — before your first session goes live.
          </p>
          <Link
            href="/auth/register?role=mentor"
            className="inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-xl hover:bg-purple-50 transition-colors text-base"
            style={{ color: "#5B3DF5", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
          >
            Apply to become a mentor <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
