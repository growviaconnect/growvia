"use client";

import Link from "next/link";
import { Sparkles, CheckCircle, ArrowRight, Zap, Target, Brain, BarChart3, Lock } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

export default function AISmartMatchingPage() {
  const { t } = useLang();

  const features = [
    { icon: Brain,    title: t("ai_feat1_title"), desc: t("ai_feat1_desc") },
    { icon: Target,   title: t("ai_feat2_title"), desc: t("ai_feat2_desc") },
    { icon: BarChart3, title: t("ai_feat3_title"), desc: t("ai_feat3_desc") },
    { icon: Lock,     title: t("ai_feat4_title"), desc: t("ai_feat4_desc") },
  ];

  const steps = [
    { num: "01", label: t("ai_s1_label"), desc: t("ai_s1_desc") },
    { num: "02", label: t("ai_s2_label"), desc: t("ai_s2_desc") },
    { num: "03", label: t("ai_s3_label"), desc: t("ai_s3_desc") },
    { num: "04", label: t("ai_s4_label"), desc: t("ai_s4_desc") },
  ];

  const bullets = [
    t("ai_f1"), t("ai_f2"), t("ai_f3"), t("ai_f4"),
  ];

  const discFeatures = [t("ai_disc_f1"), t("ai_disc_f2"), t("ai_disc_f3")];
  const premFeatures = [t("ai_prem_f1"), t("ai_prem_f2"), t("ai_prem_f3"), t("ai_prem_f4")];

  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            <Sparkles className="w-4 h-4" />
            {t("ai_badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            {t("ai_title1")} <span className="gradient-text">{t("ai_title2")}</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            {t("ai_sub")}
          </p>
        </div>
      </section>

      {/* What it does */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                {t("ai_section_title")}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5">
                {t("ai_section_p1")}
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                {t("ai_section_p2")}
              </p>
              <ul className="space-y-3">
                {bullets.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual mockup */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 border border-purple-100">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900 text-sm">{t("ai_matches_title")}</span>
                <span className="ml-auto text-xs text-purple-600 bg-white px-2.5 py-1 rounded-full font-medium card-shadow">
                  3 results
                </span>
              </div>
              {[
                { name: "Sophie Chen", role: "Product Manager at Spotify", pct: 98, tags: ["Career Change", "Product"] },
                { name: "Marcus Dubois", role: "Founder, TechStart Paris", pct: 94, tags: ["Entrepreneurship", "Business"] },
                { name: "Aisha Patel", role: "HR Director at L'Oréal", pct: 89, tags: ["Personal Growth", "Students"] },
              ].map((m, i) => (
                <div key={m.name} className={`bg-white rounded-2xl p-5 card-shadow ${i < 2 ? "mb-3" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {m.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0">
                      <Zap className="w-3 h-3" />
                      {m.pct}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                    <div className="gradient-bg h-1.5 rounded-full" style={{ width: `${m.pct}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("ai_how_title")}</h2>
            <p className="text-gray-500 text-lg">{t("ai_how_sub")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 card-shadow">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("ai_steps_title")}</h2>
          </div>
          <div className="space-y-4">
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-5 bg-gray-50 rounded-2xl p-5">
                <div className="text-2xl font-black gradient-text flex-shrink-0 w-8">{s.num}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.label}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing callout */}
      <section className="py-16 gradient-bg-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-7 card-shadow flex flex-col">
              <div className="text-sm font-semibold text-purple-600 mb-2">{t("ai_disc_label")}</div>
              <div className="text-3xl font-black text-gray-900 mb-1">9.99€</div>
              <p className="text-sm text-gray-400 mb-5">{t("ai_disc_ai")}</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {discFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="block text-center gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm">
                {t("ai_disc_btn")}
              </Link>
            </div>
            <div className="gradient-bg rounded-2xl p-7 flex flex-col text-white shadow-2xl shadow-purple-300">
              <div className="text-sm font-semibold text-purple-200 mb-2">{t("ai_prem_label")}</div>
              <div className="text-3xl font-black text-white mb-1">{t("ai_prem_value")}</div>
              <p className="text-sm text-purple-100 mb-5">{t("ai_prem_sub")}</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {premFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                    <CheckCircle className="w-4 h-4 text-purple-200 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block text-center bg-white text-purple-700 font-semibold py-3 rounded-xl hover:bg-purple-50 transition-colors text-sm">
                {t("ai_prem_btn")} <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
