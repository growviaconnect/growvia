"use client";

import { useState } from "react";
import { Mail, MessageSquare, Clock, MapPin, Send } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

export default function ContactPage() {
  const { t } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const contactItems = [
    { icon: Mail,         label: t("contact_email_label"),    value: "hello@growvia.com" },
    { icon: MessageSquare, label: t("contact_inquiries_label"), value: "support@growvia.com" },
    { icon: Clock,        label: t("contact_response_label"), value: t("contact_response_value") },
    { icon: MapPin,       label: t("contact_hq_label"),       value: "Paris, France" },
  ];

  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            {t("contact_badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            {t("contact_title1")} <span className="gradient-text">{t("contact_title2")}</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            {t("contact_sub")}
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">{t("contact_get_in_touch")}</h2>
                <div className="space-y-5">
                  {contactItems.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-400 mb-0.5">{item.label}</div>
                        <div className="text-gray-800 font-medium">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t("contact_schools_title")}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t("contact_schools_sub")}
                </p>
                <a href="mailto:schools@growvia.com" className="text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors">
                  schools@growvia.com
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-5">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("contact_success_title")}</h3>
                  <p className="text-gray-500">
                    {t("contact_success_sub")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("contact_form_name")}
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("contact_form_email")}
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("contact_form_subject")}
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm text-gray-700"
                    >
                      <option value="">{t("contact_form_select")}</option>
                      <option value="general">{t("contact_form_general")}</option>
                      <option value="mentoring">{t("contact_form_mentoring")}</option>
                      <option value="schools">{t("contact_form_schools")}</option>
                      <option value="billing">{t("contact_form_billing")}</option>
                      <option value="safety">{t("contact_form_safety")}</option>
                      <option value="other">{t("contact_form_other")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("contact_form_message")}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us how we can help..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full gradient-bg text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    {t("contact_form_submit")} <Send className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    {t("contact_form_privacy")}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
