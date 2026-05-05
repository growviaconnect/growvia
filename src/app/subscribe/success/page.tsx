"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  basic:    "Basic",
  standard: "Standard",
  premium:  "Premium",
};

function SuccessContent() {
  const params      = useSearchParams();
  const router      = useRouter();
  const plan        = params.get("plan") ?? "";
  const redirectUrl = params.get("redirect") ?? "";
  const label       = PLAN_LABELS[plan] ?? "Premium";

  // Auto-redirect back to mentor page after 3 s if a redirect URL was passed
  useEffect(() => {
    if (!redirectUrl) return;
    const timer = setTimeout(() => router.push(redirectUrl), 3000);
    return () => clearTimeout(timer);
  }, [redirectUrl, router]);

  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

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
          Your card is saved — sessions are charged automatically when a mentor confirms.
        </p>

        {redirectUrl ? (
          <>
            <p className="text-white/40 text-sm mb-6">Returning to your mentor in a moment…</p>
            <Link
              href={redirectUrl}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#7C3AED" }}
            >
              Book a session now <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "#7C3AED" }}
          >
            Find a mentor <ArrowRight className="w-4 h-4" />
          </Link>
        )}

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
