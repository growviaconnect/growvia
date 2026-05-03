"use client";

import Link from "next/link";
import { CheckCircle, CalendarCheck, ArrowRight } from "lucide-react";

export default function BookingConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#0D0A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
          Request sent!
        </h1>
        <p className="text-white/50 text-base leading-relaxed mb-8">
          The mentor will review your request and confirm your session soon.
          You&apos;ll receive an email once they respond.
        </p>

        {/* Info card */}
        <div
          className="rounded-2xl p-5 mb-8 text-left space-y-3"
          style={{ background: "#13111F", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-start gap-3">
            <CalendarCheck className="w-4 h-4 text-[#A78BFA] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">What happens next?</p>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">
                The mentor typically responds within 24 hours. Once confirmed,
                you&apos;ll get a Google Meet link by email.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "#7C3AED" }}
          >
            Go to my dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/mentors"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/20"
          >
            Browse more mentors
          </Link>
        </div>

      </div>
    </div>
  );
}
