"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit3, Save, ArrowLeft, Camera, Briefcase, BookOpen, TrendingUp, GraduationCap } from "lucide-react";

const categories = [
  { icon: Briefcase, label: "Career" },
  { icon: TrendingUp, label: "Business" },
  { icon: BookOpen, label: "Personal Growth" },
  { icon: GraduationCap, label: "Students" },
];

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(["Career"]);
  const [form, setForm] = useState({
    firstName: "Luna",
    lastName: "K.",
    bio: "Marketing student passionate about brand strategy and creative campaigns. Looking for mentorship to navigate my transition from studies to my first full-time role.",
    location: "Paris, France",
    goals: "Land my first marketing role at a fast-growing startup",
    languages: "French, English",
  });

  function toggleCategory(label: string) {
    setSelectedCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          {/* Header */}
          <div className="gradient-bg p-8 relative">
            <div className="flex items-end gap-5">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30">
                  LK
                </div>
                {editing && (
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center card-shadow">
                    <Camera className="w-4 h-4 text-purple-600" />
                  </button>
                )}
              </div>
              <div className="flex-1 text-white">
                <h1 className="text-2xl font-bold">{form.firstName} {form.lastName}</h1>
                <div className="text-purple-200 text-sm">Mentee</div>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 bg-white/20 backdrop-blur text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/30 transition-colors"
              >
                {editing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {editing ? "Save" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Basic info */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">About You</h2>
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                    <textarea
                      rows={3}
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm leading-relaxed">{form.bio}</p>
                  <p className="text-gray-400 text-sm">{form.location}</p>
                </div>
              )}
            </div>

            {/* Goals */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Career Goals</h2>
              {editing ? (
                <textarea
                  rows={2}
                  value={form.goals}
                  onChange={(e) => setForm({ ...form, goals: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm resize-none"
                />
              ) : (
                <div className="bg-purple-50 rounded-xl px-4 py-3">
                  <p className="text-gray-700 text-sm">{form.goals}</p>
                </div>
              )}
            </div>

            {/* Areas of interest */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Areas of Interest
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => editing && toggleCategory(cat.label)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedCategories.includes(cat.label)
                        ? "gradient-bg text-white"
                        : editing
                        ? "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                        : "bg-gray-100 text-gray-500"
                    } ${!editing ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Languages</h2>
              {editing ? (
                <input
                  type="text"
                  value={form.languages}
                  onChange={(e) => setForm({ ...form, languages: e.target.value })}
                  placeholder="e.g. French, English, Spanish"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.languages.split(", ").map((lang) => (
                    <span key={lang} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Save Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
