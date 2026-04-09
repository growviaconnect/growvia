"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

type Role = "mentee" | "mentor" | "school_admin";

const roles: { value: Role; label: string; desc: string }[] = [
  { value: "mentee", label: "I want to find a mentor", desc: "Get career guidance and clarity" },
  { value: "mentor", label: "I want to become a mentor", desc: "Share your experience and help others" },
  { value: "school_admin", label: "I represent a school", desc: "Manage mentoring for your institution" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>("mentee");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) setStep(2);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep(3);
  }

  return (
    <div className="min-h-screen gradient-bg-soft flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Grow<span className="gradient-text">Via</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500">Your first session is free. No credit card required.</p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s <= step ? "w-10 gradient-bg" : "w-6 bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {step === 3 ? (
          <div className="bg-white rounded-2xl p-10 card-shadow text-center">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account created!</h2>
            <p className="text-gray-500 mb-6">
              Welcome to GrowVia. You are all set to find your mentor and book your first free session.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 gradient-bg text-white font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 card-shadow">
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">I am joining as...</h2>
                <div className="space-y-3">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors text-left ${
                        role === r.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{r.label}</div>
                        <div className="text-xs text-gray-500">{r.desc}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          role === r.value
                            ? "border-purple-500 bg-purple-500"
                            : "border-gray-300"
                        }`}
                      >
                        {role === r.value && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Your details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Luna"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Davin"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
                >
                  Create Account <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-400 text-center">
                  By creating an account, you agree to our{" "}
                  <Link href="/legal/terms" className="text-purple-500 hover:text-purple-700">Terms</Link>
                  {" "}and{" "}
                  <Link href="/legal/privacy" className="text-purple-500 hover:text-purple-700">Privacy Policy</Link>
                </p>
              </form>
            )}

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-purple-600 font-medium hover:text-purple-800 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
