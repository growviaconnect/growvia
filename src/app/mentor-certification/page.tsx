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
        className="pt-20 pb-16 text-center px-4"
        style={{ background: "linear-gradient(135deg, #0f1a16 0%, #0d2118 50%, #111827 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full mb-6"
            style={{ background: "rgba(29,158,117,0.15)", color: "#1D9E75", border: "1px solid rgba(29,158,117,0.3)" }}
          >
            <BadgeCheck className="w-4 h-4" />
            Mentor Certification
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Become a GrowVia{" "}
            <span style={{ background: "linear-gradient(135deg, #1D9E75 0%, #22b87f 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Certified Mentor
            </span>
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: "#9ca3af" }}>
            All mentors on GrowVia complete a short certification before going live. It takes less than an hour and it makes all the difference.
          </p>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Three steps to certification</h2>
            <p className="text-gray-500">Less than an hour. Done once. Valid permanently.</p>
          </div>

          {/* Desktop: horizontal — Mobile: vertical */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            {/* Connector line (desktop only) */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5"
              style={{ background: "linear-gradient(90deg, rgba(29,158,117,0.3) 0%, rgba(29,158,117,0.6) 50%, rgba(29,158,117,0.3) 100%)" }}
            />

            {steps.map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                {/* Icon circle */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 z-10"
                  style={{ background: "linear-gradient(135deg, #1D9E75 0%, #22b87f 100%)", boxShadow: "0 8px 24px rgba(29,158,117,0.3)" }}
                >
                  <step.icon className="w-9 h-9 text-white" />
                </div>
                <div className="text-xs font-bold mb-2" style={{ color: "#1D9E75" }}>
                  Step {step.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section
        className="py-20"
        style={{ background: "linear-gradient(135deg, #f0fdf8 0%, #ecfdf5 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why it matters</h2>
            <p className="text-gray-500">Certification builds trust on both sides of the relationship.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For mentees */}
            <div
              className="rounded-2xl p-8 border"
              style={{ background: "white", borderColor: "rgba(29,158,117,0.2)", boxShadow: "0 4px 20px rgba(29,158,117,0.08)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(29,158,117,0.1)" }}
              >
                <Users className="w-6 h-6" style={{ color: "#1D9E75" }} />
              </div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "#1D9E75" }}
              >
                For mentees
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Every mentor has been vetted and trained.
              </h3>
              <p className="text-gray-500 leading-relaxed">
                You know every mentor you meet has been vetted and trained. No guessing. When you book a session with a GrowVia Certified Mentor, you're working with someone who understands how to guide, listen, and help you move forward.
              </p>
            </div>

            {/* For mentors */}
            <div
              className="rounded-2xl p-8 border"
              style={{ background: "linear-gradient(135deg, #0f1a16 0%, #111827 100%)", borderColor: "rgba(29,158,117,0.25)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(29,158,117,0.15)" }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: "#1D9E75" }} />
              </div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "#1D9E75" }}
              >
                For mentors
              </p>
              <h3 className="text-xl font-bold text-white mb-3">
                Your badge signals credibility.
              </h3>
              <p className="leading-relaxed" style={{ color: "#9ca3af" }}>
                Your badge signals credibility and increases your visibility in matching results. Certified mentors appear higher in AI-powered recommendations and are more likely to be booked by serious mentees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 text-center px-4"
        style={{ background: "linear-gradient(135deg, #1D9E75 0%, #22b87f 100%)" }}
      >
        <div className="max-w-2xl mx-auto">
          <BadgeCheck className="w-12 h-12 text-white/80 mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get certified?
          </h2>
          <p className="text-white/80 mb-8 text-lg leading-relaxed">
            Apply to join GrowVia as a mentor. Once approved, you'll complete the certification as part of your onboarding — before your first session goes live.
          </p>
          <Link
            href="/auth/register?role=mentor"
            className="inline-flex items-center gap-2 bg-white font-semibold px-8 py-4 rounded-2xl hover:bg-green-50 transition-colors text-base"
            style={{ color: "#1D9E75" }}
          >
            Apply to become a mentor <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
