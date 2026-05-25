"use client";

import Link from "next/link";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "rgba(16,185,129,0.12)", border: "2px solid rgba(16,185,129,0.25)" }}
        >
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Booking confirmed!
        </h1>
        <p className="text-white/50 text-lg mb-10">
          Your payment was processed successfully.
        </p>

        {/* Info card */}
        <div
          className="rounded-2xl p-6 mb-8 text-left space-y-4"
          style={{ background: "#13111F", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(124,58,237,0.12)" }}
            >
              <Calendar className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">What happens next?</p>
              <p className="text-sm text-white/50 leading-relaxed">
                The mentor will review your request and confirm the session. You&apos;ll
                receive an email with all the details once they accept.
              </p>
            </div>
          </div>

          <div
            className="rounded-xl px-4 py-3 text-sm text-white/60 leading-relaxed"
            style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.15)" }}
          >
            A confirmation email has been sent to your inbox. Check your dashboard
            to track the status of your booking.
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "#7C3AED" }}
        >
          Go to my dashboard <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/mentors"
          className="block text-sm text-white/35 hover:text-white/60 transition-colors mt-5"
        >
          Browse more mentors
        </Link>

      </div>
    </div>
  );
}
