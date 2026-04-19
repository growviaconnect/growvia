"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setUserSession } from "@/lib/session";

/* ── For Mentors data ──────────────────────────────────────── */
const benefits = [
  { title: "Lead generation on autopilot", desc: "Qualified mentees come to you — no cold outreach." },
  { title: "Zero admin", desc: "We handle scheduling, payments, and session tracking." },
  { title: "Your legacy, structured", desc: "Earn your Certified Mentor badge over time." },
];

/* ── Register form data ────────────────────────────────────── */
type Role = "mentee" | "mentor" | "school_admin";

const roles: { value: Role; label: string; desc: string }[] = [
  { value: "mentee",       label: "I want to find a mentor",   desc: "Get career guidance and clarity" },
  { value: "mentor",       label: "I want to become a mentor", desc: "Share your experience and help others" },
  { value: "school_admin", label: "I represent a school",      desc: "Manage mentoring for your institution" },
];

const specialites = [
  "Career & Leadership", "Entrepreneurship & Business", "Personal Development",
  "Student Guidance", "Tech & Product", "Finance & Investment", "Creative & Design", "Other",
];

const objectifs = [
  "Find my career direction", "Change industries or roles", "Start or grow a business",
  "Improve my skills & confidence", "Prepare for university", "Navigate a specific challenge", "Other",
];

export default function BecomeAMentorPage() {
  /* form state */
  const [step, setStep]               = useState(1);
  const [role, setRole]               = useState<Role>("mentor");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", specialite: "", objectif: "",
  });

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const nom = `${form.firstName.trim()} ${form.lastName.trim()}`;
    try {
      if (role === "mentor") {
        const { error: dbError } = await supabase.from("mentors").insert({
          nom, email: form.email.trim().toLowerCase(),
          specialite: form.specialite || null, statut: "pending",
        });
        if (dbError) throw dbError;
      } else if (role === "mentee") {
        const { error: dbError } = await supabase.from("mentees").insert({
          nom, email: form.email.trim().toLowerCase(),
          objectif: form.objectif || null, statut: "pending",
        });
        if (dbError) throw dbError;
      }
      setUserSession({
        nom, email: form.email.trim().toLowerCase(), role,
        specialite: role === "mentor" ? (form.specialite || null) : null,
        objectif:   role === "mentee" ? (form.objectif  || null) : null,
        plan: "free",
      });
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("duplicate") || msg.includes("unique")
        ? "This email address is already registered."
        : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── FOR MENTORS HERO ─────────────────────────────────── */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Text side */}
            <div>
              <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-8">For Mentors</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight">
                Turn your experience into someone&apos;s breakthrough.
              </h1>
              <p className="text-lg text-white/45 leading-relaxed mb-12">
                Your career took years to build. GrowVia lets you turn that expertise into real impact — on your schedule, with zero overhead.
              </p>
              <div className="space-y-8 mb-12">
                {benefits.map((b, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-px bg-[#7C3AED] flex-shrink-0 self-stretch" />
                    <div>
                      <p className="text-white font-semibold mb-1">{b.title}</p>
                      <p className="text-sm text-white/40 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="#apply"
                className="inline-flex items-center gap-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors text-sm"
              >
                Apply as a mentor <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Image side */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=80"
                alt="Mentor session"
                className="w-full aspect-[4/5] object-cover rounded-xl"
                style={{ filter: "brightness(0.6) saturate(0.8)" }}
              />
              <div className="absolute inset-0 rounded-xl" style={{ background: "linear-gradient(to top, #0D0A1A 0%, transparent 55%)" }} />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Manual review</p>
                <p className="text-white font-semibold">Earn your Certified Mentor badge</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REGISTER FORM ────────────────────────────────────── */}
      <div id="apply" className="bg-[#0D0A1A] py-28 px-4">
        <div className="w-full max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-white/45">Join GrowVia — no credit card required.</p>
          </div>

          {/* Step dots */}
          {step < 3 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: s <= step ? 40 : 24,
                    background: s <= step ? "#7C3AED" : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 ? (
            <div className="bg-white rounded-2xl p-10 text-center" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "#7C3AED" }}>
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {role === "mentor" ? "Application received!" : "Account created!"}
              </h3>
              <p className="text-gray-500 mb-6">
                {role === "mentor"
                  ? "Thank you for applying to GrowVia. Our team will review your profile and get back to you shortly."
                  : "Welcome to GrowVia. You are all set to find your mentor and book your first session."}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: "#7C3AED" }}
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              {/* Step 1: Role */}
              {step === 1 && (
                <form onSubmit={handleNext} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">I am joining as...</h3>
                  <div className="space-y-3">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors text-left ${
                          role === r.value ? "border-purple-500 bg-purple-50" : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{r.label}</div>
                          <div className="text-xs text-gray-500">{r.desc}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          role === r.value ? "border-purple-500 bg-purple-500" : "border-gray-300"
                        }`}>
                          {role === r.value && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
                    style={{ background: "#7C3AED" }}
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">Your details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input type="text" required value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="Luna"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                      <input type="text" required value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="Davin"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required minLength={8}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="At least 8 characters"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm pr-11" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {role === "mentor" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Your speciality</label>
                      <select value={form.specialite} onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm bg-white">
                        <option value="">Select a speciality...</option>
                        {specialites.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  {role === "mentee" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Your main goal</label>
                      <select value={form.objectif} onChange={(e) => setForm({ ...form, objectif: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm bg-white">
                        <option value="">What are you looking for?</option>
                        {objectifs.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                    style={{ background: "#7C3AED" }}>
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      : <>{role === "mentor" ? "Submit Application" : "Create Account"} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    By continuing, you agree to our{" "}
                    <Link href="/legal/terms" className="text-purple-500 hover:text-purple-700">Terms</Link>
                    {" "}and{" "}
                    <Link href="/legal/privacy" className="text-purple-500 hover:text-purple-700">Privacy Policy</Link>
                  </p>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#A78BFA] font-medium hover:text-white">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
