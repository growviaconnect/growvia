"use client";

import Link from "next/link";
import { ArrowRight, Heart, Target, Globe, Lightbulb } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

export default function WhoWeArePage() {
  const { t } = useLang();

  const founders = [
    {
      name: "Luna Davin",
      role: "Co-Founder & CEO",
      initials: "LD",
      bio: t("wwa_founder1_bio"),
      color: "from-purple-500 to-violet-600",
    },
    {
      name: "Yasmine Tunon",
      role: "Co-Founder & COO",
      initials: "YT",
      bio: t("wwa_founder2_bio"),
      color: "from-violet-500 to-purple-700",
    },
  ];

  const values = [
    { icon: Heart,     title: t("wwa_value1_title"), desc: t("wwa_value1_desc") },
    { icon: Target,    title: t("wwa_value2_title"), desc: t("wwa_value2_desc") },
    { icon: Globe,     title: t("wwa_value3_title"), desc: t("wwa_value3_desc") },
    { icon: Lightbulb, title: t("wwa_value4_title"), desc: t("wwa_value4_desc") },
  ];

  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            {t("wwa_badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            {t("wwa_hero_title1")}{" "}
            <span className="gradient-text">{t("wwa_hero_title2")}</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            {t("wwa_hero_sub")}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-purple-600 font-semibold text-sm mb-3">{t("wwa_mission_label")}</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">
                {t("wwa_mission_title")}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5">{t("wwa_mission_p1")}</p>
              <p className="text-gray-500 leading-relaxed mb-5">{t("wwa_mission_p2")}</p>
              <p className="text-gray-500 leading-relaxed">{t("wwa_mission_p3")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">2024</div>
                <div className="text-sm text-gray-500">{t("wwa_stat_founded")}</div>
              </div>
              <div className="bg-violet-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">Paris</div>
                <div className="text-sm text-gray-500">{t("wwa_stat_hq")}</div>
              </div>
              <div className="bg-indigo-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">3</div>
                <div className="text-sm text-gray-500">{t("wwa_stat_langs")}</div>
              </div>
              <div className="bg-fuchsia-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">Global</div>
                <div className="text-sm text-gray-500">{t("wwa_stat_vision")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-purple-200 font-semibold text-sm mb-4">{t("wwa_vision_label")}</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">
            {t("wwa_vision_title")}
          </h2>
          <p className="text-purple-100 text-lg leading-relaxed mb-8">
            {t("wwa_vision_sub")}
          </p>
          <div className="inline-block bg-white/10 backdrop-blur rounded-2xl px-8 py-6">
            <p className="text-xl font-light italic text-white">
              {t("wwa_vision_quote")}
            </p>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("wwa_founders_title")}</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              {t("wwa_founders_sub")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {founders.map((founder) => (
              <div key={founder.name} className="bg-white rounded-2xl p-8 border border-gray-100 card-shadow">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${founder.color} rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6`}
                >
                  {founder.initials}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{founder.name}</h3>
                <div className="text-sm font-medium text-purple-600 mb-4">{founder.role}</div>
                <p className="text-gray-500 leading-relaxed text-sm">{founder.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("wwa_values_title")}</h2>
            <p className="text-gray-500 text-lg">{t("wwa_values_sub")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 card-shadow">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("wwa_cta_title")}</h2>
          <p className="text-gray-500 mb-8">{t("wwa_cta_sub")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 gradient-bg text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity"
            >
              {t("wwa_cta_start")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              {t("wwa_cta_contact")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
