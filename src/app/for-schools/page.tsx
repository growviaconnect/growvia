"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap, BarChart3, Users, CheckCircle, ArrowRight,
  Shield, Sparkles, Send, BookOpen, TrendingUp,
} from "lucide-react";
import { useLang } from "@/contexts/LangContext";

export default function ForSchoolsPage() {
  const { t } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", institution: "", email: "", message: "" });

  const benefits = [
    { icon: GraduationCap, title: t("schools_b1_title"), desc: t("schools_b1_desc") },
    { icon: BarChart3,     title: t("schools_b2_title"), desc: t("schools_b2_desc") },
    { icon: Users,         title: t("schools_b3_title"), desc: t("schools_b3_desc") },
    { icon: Shield,        title: t("schools_b4_title"), desc: t("schools_b4_desc") },
    { icon: Sparkles,      title: t("schools_b5_title"), desc: t("schools_b5_desc") },
    { icon: BookOpen,      title: t("schools_b6_title"), desc: t("schools_b6_desc") },
  ];

  const dashboardFeatures = [
    t("schools_f1"),
    t("schools_f2"),
    t("schools_f3"),
    t("schools_f4"),
    t("schools_f5"),
    t("schools_f6"),
  ];

  const steps = [
    { num: "01", title: t("schools_step1_title"), desc: t("schools_step1_desc") },
    { num: "02", title: t("schools_step2_title"), desc: t("schools_step2_desc") },
    { num: "03", title: t("schools_step3_title"), desc: t("schools_step3_desc") },
    { num: "04", title: t("schools_step4_title"), desc: t("schools_step4_desc") },
  ];

  const dashboardStats = [
    { label: t("schools_stat_students"),      value: "142", trend: t("schools_stat_trend1") },
    { label: t("schools_stat_sessions"),      value: "89",  trend: t("schools_stat_trend2") },
    { label: t("schools_stat_mentors"),       value: "28",  trend: t("schools_stat_trend3") },
    { label: t("schools_stat_participation"), value: "76%", trend: t("schools_stat_trend4") },
  ];

  const pageStats = [
    { value: "50+",   label: t("schools_stats_partners") },
    { value: "5,000+", label: t("schools_stats_students") },
    { value: "94%",   label: t("schools_stats_satisfaction") },
    { value: "3x",    label: t("schools_stats_decisions") },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* Header */}
      <section className="gradient-bg pt-20 pb-20 text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <GraduationCap className="w-4 h-4" />
            {t("schools_badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            {t("schools_hero_title")}
          </h1>
          <p className="text-purple-100 text-xl leading-relaxed mb-8">
            {t("schools_hero_sub")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 font-semibold px-8 py-4 rounded-2xl hover:bg-purple-50 transition-colors"
            >
              {t("schools_hero_demo")} <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors"
            >
              {t("schools_hero_contact")}
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t("schools_why_title")}
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              {t("schools_why_sub")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-gray-100 card-shadow-hover card-shadow">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-purple-600 font-semibold text-sm mb-3">{t("schools_hiw_label")}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                {t("schools_hiw_title")}
              </h2>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.num} className="flex items-start gap-4">
                    <div className="text-2xl font-black gradient-text flex-shrink-0 w-8">{step.num}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-7 card-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">{t("schools_dashboard_title")}</h3>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {t("schools_dashboard_live")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {dashboardStats.map((stat) => (
                  <div key={stat.label} className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-xs font-medium text-gray-700">{stat.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{stat.trend}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("schools_features_label")}
                </h4>
                {dashboardFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {pageStats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo form */}
      <section id="demo-form" className="section-padding bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t("schools_form_title")}</h2>
            <p className="text-gray-500">{t("schools_form_sub")}</p>
          </div>
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-5">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("schools_success_title")}</h3>
              <p className="text-gray-500">{t("schools_success_sub")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("schools_form_name")}
                  </label>
                  <input
                    type="text" required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("schools_form_institution")}
                  </label>
                  <input
                    type="text" required
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    placeholder="University of Paris"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("schools_form_email")}
                </label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@university.edu"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("schools_form_message")}
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How many students, what are your goals..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full gradient-bg text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {t("schools_form_submit")} <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
