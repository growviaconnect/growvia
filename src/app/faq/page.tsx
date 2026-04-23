"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-purple-500 flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-500 leading-relaxed text-sm border-t border-gray-50 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const { t } = useLang();

  const faqs = [
    {
      category: t("faq_cat1"),
      questions: [
        { q: t("faq_cat1_q1"), a: t("faq_cat1_a1") },
        { q: t("faq_cat1_q2"), a: t("faq_cat1_a2") },
        { q: t("faq_cat1_q3"), a: t("faq_cat1_a3") },
      ],
    },
    {
      category: t("faq_cat2"),
      questions: [
        { q: t("faq_cat2_q1"), a: t("faq_cat2_a1") },
        { q: t("faq_cat2_q2"), a: t("faq_cat2_a2") },
        { q: t("faq_cat2_q3"), a: t("faq_cat2_a3") },
      ],
    },
    {
      category: t("faq_cat3"),
      questions: [
        { q: t("faq_cat3_q1"), a: t("faq_cat3_a1") },
        { q: t("faq_cat3_q2"), a: t("faq_cat3_a2") },
        { q: t("faq_cat3_q3"), a: t("faq_cat3_a3") },
        { q: t("faq_cat3_q4"), a: t("faq_cat3_a4") },
      ],
    },
    {
      category: t("faq_cat4"),
      questions: [
        { q: t("faq_cat4_q1"), a: t("faq_cat4_a1") },
        { q: t("faq_cat4_q2"), a: t("faq_cat4_a2") },
      ],
    },
    {
      category: t("faq_cat5"),
      questions: [
        { q: t("faq_cat5_q1"), a: t("faq_cat5_a1") },
        { q: t("faq_cat5_q2"), a: t("faq_cat5_a2") },
        { q: t("faq_cat5_q3"), a: t("faq_cat5_a3") },
      ],
    },
    {
      category: t("faq_cat6"),
      questions: [
        { q: t("faq_cat6_q1"), a: t("faq_cat6_a1") },
        { q: t("faq_cat6_q2"), a: t("faq_cat6_a2") },
      ],
    },
  ];

  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            {t("faq_badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            {t("faq_title1")} <span className="gradient-text">{t("faq_title2")}</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            {t("faq_sub")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {section.category}
                </h2>
                <div className="space-y-3">
                  {section.questions.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-purple-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t("faq_still")}</h3>
            <p className="text-gray-500 mb-6">
              {t("faq_still_sub")}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 gradient-bg text-white font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              {t("faq_still_cta")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
