"use client";

import Link from "next/link";
import {
  Shield,
  CheckCircle,
  Lock,
  Eye,
  UserCheck,
  AlertTriangle,
  Phone,
  ArrowRight,
} from "lucide-react";
import { useLang } from "@/contexts/LangContext";

export default function SafetyTrustPage() {
  const { t } = useLang();

  const verificationSteps = [
    { label: t("safety_v1_label"), desc: t("safety_v1_desc") },
    { label: t("safety_v2_label"), desc: t("safety_v2_desc") },
    { label: t("safety_v3_label"), desc: t("safety_v3_desc") },
    { label: t("safety_v4_label"), desc: t("safety_v4_desc") },
  ];

  const processSteps = [
    t("safety_verif_step1"),
    t("safety_verif_step2"),
    t("safety_verif_step3"),
    t("safety_verif_step4"),
  ];

  const sessionCards = [
    { icon: Lock,          title: t("safety_s1_title"), desc: t("safety_s1_desc") },
    { icon: Eye,           title: t("safety_s2_title"), desc: t("safety_s2_desc") },
    { icon: UserCheck,     title: t("safety_s3_title"), desc: t("safety_s3_desc") },
    { icon: Shield,        title: t("safety_s4_title"), desc: t("safety_s4_desc") },
    { icon: AlertTriangle, title: t("safety_s5_title"), desc: t("safety_s5_desc") },
    { icon: Phone,         title: t("safety_s6_title"), desc: t("safety_s6_desc") },
  ];

  const dataItems = [
    t("safety_d1"), t("safety_d2"), t("safety_d3"),
    t("safety_d4"), t("safety_d5"), t("safety_d6"),
  ];

  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            {t("safety_badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            {t("safety_title1")}{" "}
            <span className="gradient-text">{t("safety_title2")}</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            {t("safety_sub")}
          </p>
        </div>
      </section>

      {/* Mentor Verification */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-purple-600 font-semibold text-sm mb-3">{t("safety_verif_label")}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">{t("safety_verif_title")}</h2>
              <p className="text-gray-500 leading-relaxed mb-5">
                {t("safety_verif_sub")}
              </p>
              <div className="space-y-4">
                {verificationSteps.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100">
              <div className="space-y-4">
                {processSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white card-shadow flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 bg-white rounded-xl px-4 py-3 card-shadow">
                      <span className="text-sm font-medium text-gray-800">{step}</span>
                    </div>
                  </div>
                ))}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">{t("safety_verif_badge")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Session Security */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("safety_sessions_title")}</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              {t("safety_sessions_sub")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessionCards.map((item) => (
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

      {/* Data Protection */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("safety_data_title")}</h2>
            <p className="text-gray-500 text-lg">
              {t("safety_data_sub")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {dataItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/legal/privacy" className="text-purple-600 font-medium hover:text-purple-800 transition-colors text-sm">
              {t("safety_privacy_link")}
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 gradient-bg text-white text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">{t("safety_concern_title")}</h2>
          <p className="text-purple-100 mb-8">
            {t("safety_concern_sub")}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-8 py-4 rounded-2xl hover:bg-purple-50 transition-colors"
          >
            {t("safety_concern_cta")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
