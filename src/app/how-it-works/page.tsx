import Link from "next/link";
import {
  UserCircle,
  Sparkles,
  Gift,
  Search,
  CalendarCheck,
  Video,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  Bell,
  Mail,
  Clock,
} from "lucide-react";

const steps = [
  {
    icon: UserCircle,
    num: "01",
    title: "Create your profile",
    desc: "Tell us about yourself: your goals, background, career stage, and what kind of guidance you are looking for. This takes about 5 minutes.",
    detail: [
      "Choose your focus area (Career, Business, Personal Growth, Students)",
      "Describe your current situation and where you want to go",
      "Set your availability preferences",
    ],
  },
  {
    icon: Sparkles,
    num: "02",
    title: "Get your AI match (free, 1 time)",
    desc: "Our AI Smart Matching engine analyzes your profile and suggests the most compatible mentors. You get one free AI match on sign-up.",
    detail: [
      "Compatibility score based on goals, personality, and experience",
      "Shows percentage match for transparency",
      "Unlock unlimited matching with a subscription",
    ],
  },
  {
    icon: Gift,
    num: "03",
    title: "Try a free session",
    desc: "Your first session is completely free. No credit card required. Meet your mentor, explore the fit, and experience GrowVia risk-free.",
    detail: [
      "30 or 60 minute session options",
      "Fully integrated Google Meet link generated automatically",
      "Same link shared with mentor and mentee",
    ],
  },
  {
    icon: Search,
    num: "04",
    title: "Choose your mentor",
    desc: "Browse our curated community of verified mentors or go with your AI suggestion. Filter by category, language, availability, and more.",
    detail: [
      "Save mentors to your favorites",
      "Read detailed mentor profiles",
      "See mentor availability in real time",
    ],
  },
  {
    icon: CalendarCheck,
    num: "05",
    title: "Book your session",
    desc: "Pick a time that works for both of you. Confirm, pay, and you are all set. Sessions are booked directly through the platform.",
    detail: [
      "Freemium: first session free",
      "Pay-per-session: 29€",
      "Subscription: 3 sessions/month for 39€",
    ],
  },
  {
    icon: Video,
    num: "06",
    title: "Join via Google Meet",
    desc: "On session day, join your session through the integrated Google Meet link. No extra apps needed. One click and you are in.",
    detail: [
      "Automatic meeting link generated after booking",
      "Email confirmation with join link",
      "Reminder 24h and 1h before session",
    ],
  },
  {
    icon: RefreshCw,
    num: "07",
    title: "Continue your growth",
    desc: "After your session, decide how you want to continue. Subscribe for ongoing guidance or pay per session. The choice is yours.",
    detail: [
      "Subscription unlocks unlimited AI matching",
      "Priority booking for subscribers",
      "Personalized mentor recommendations",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            The Process
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            From uncertainty to{" "}
            <span className="gradient-text">clarity</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            GrowVia is designed to make every step simple, structured, and actionable.
            Here is exactly how it works.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-6 sm:gap-10">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-purple-100 my-3" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="text-xs font-bold text-purple-400 mb-1">{step.num}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-4">{step.desc}</p>
                  <ul className="space-y-2">
                    {step.detail.map((d) => (
                      <li key={d} className="flex items-start gap-2.5 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sessions info */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sessions that run smoothly</h2>
            <p className="text-gray-500 text-lg">Everything you need is built right into the platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Video,
                title: "Google Meet Integrated",
                desc: "After booking, a unique Google Meet link is automatically generated and shared with both mentor and mentee. One click to join.",
              },
              {
                icon: Bell,
                title: "Automatic Reminders",
                desc: "You receive an email confirmation right away, a reminder 24 hours before your session, and another 1 hour before.",
              },
              {
                icon: Clock,
                title: "Cancellation Policy",
                desc: "Cancel at least 1 hour before your session to avoid any issues. Late cancellations are noted on your profile. No refund after cancellation.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 card-shadow">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications detail */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">Stay informed at every step</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                We make sure you never miss a session or an important update. From booking to follow-up, GrowVia keeps you in the loop.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email confirmation after booking" },
                  { icon: Bell, label: "Reminder 24 hours before your session" },
                  { icon: Bell, label: "Reminder 1 hour before your session" },
                  { icon: CheckCircle, label: "Session summary and next steps" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-600 text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
              <div className="space-y-3">
                {[
                  { time: "Now", msg: "Session confirmed with Sophie Chen", type: "success" },
                  { time: "Tomorrow 9:00", msg: "Reminder: session in 24 hours", type: "info" },
                  { time: "Tomorrow 9:59", msg: "Your session starts in 1 hour", type: "warning" },
                  { time: "Tomorrow 11:00", msg: "Join session via Google Meet", type: "action" },
                ].map((notif, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 card-shadow flex items-start gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                        notif.type === "success"
                          ? "bg-emerald-400"
                          : notif.type === "action"
                          ? "bg-purple-500"
                          : notif.type === "warning"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                      }`}
                    />
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">{notif.time}</div>
                      <div className="text-sm font-medium text-gray-800">{notif.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding gradient-bg text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to take the first step?</h2>
          <p className="text-purple-100 mb-8 text-lg">
            Create your profile and start your free session today. No commitment required.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-8 py-4 rounded-2xl hover:bg-purple-50 transition-colors"
          >
            Get Started for Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
