"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Users } from "lucide-react";
import { Suspense } from "react";

const PLAN_LABELS: Record<string, string> = {
  basic:    "Basic",
  standard: "Standard",
  premium:  "Premium",
};

function SuccessContent() {
  const params = useSearchParams();
  const plan   = params.get("plan") ?? "";
  const label  = PLAN_LABELS[plan] ?? "Premium";

  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "rgba(124,58,237,0.12)", border: "2px solid rgba(124,58,237,0.3)" }}
        >
          <CheckCircle className="w-10 h-10 text-[#A78BFA]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          You&apos;re all set! 🎉
        </h1>
        <p className="text-white/55 text-lg mb-2">
          Your <span className="text-[#A78BFA] font-semibold">{label}</span> subscription is active.
        </p>
        <p className="text-white/35 text-sm mb-10">
          Your card is saved for session payments — mentors will charge automatically when they confirm.
        </p>

        {/* Info card */}
        <div
          className="rounded-2xl p-6 mb-8 text-left space-y-3"
          style={{ background: "#13111F", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(124,58,237,0.12)" }}
            >
              <Users className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">What&apos;s next?</p>
              <p className="text-sm text-white/50 leading-relaxed">
                Browse mentors, pick one that fits your goals, and book a session. Your mentor
                will confirm and a Google Meet link will be sent to both of you.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/explore/find-a-mentor"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "#7C3AED" }}
        >
          Find a mentor <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/dashboard"
          className="block text-sm text-white/35 hover:text-white/60 transition-colors mt-5"
        >
          Go to my dashboard
        </Link>

      </div>
    </div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0A1A]" />}>
      <SuccessContent />
    </Suspense>
  );
}
