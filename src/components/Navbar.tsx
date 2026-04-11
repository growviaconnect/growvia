"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Globe, Sparkles, Users, BookOpen, Shield, CircleHelp, Mail, GraduationCap, UserPlus, Star, LayoutDashboard, BadgeCheck } from "lucide-react";
import { locales, localeNames, type Locale } from "@/lib/i18n";

interface NavbarProps {
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
}

const platformLinks = [
  { href: "/who-we-are", label: "Who We Are", icon: BookOpen, desc: "Our story & founders" },
  { href: "/how-it-works", label: "How It Works", icon: BookOpen, desc: "The mentoring process" },
  { href: "/pricing", label: "Pricing", icon: Star, desc: "Simple, transparent pricing" },
  { href: "/ai-smart-matching", label: "AI Smart Matching", icon: Sparkles, desc: "Premium AI mentor matching" },
];

const forYouLinks = [
  { href: "/auth/register", label: "Find Mentors", icon: Users, desc: "Browse expert mentors" },
  { href: "/for-schools", label: "For Schools", icon: GraduationCap, desc: "Institutional programs" },
  { href: "/dashboard", label: "Profile", icon: LayoutDashboard, desc: "View and edit your account" },
  { href: "/pricing", label: "Pricing", icon: Star, desc: "Plans and pricing" },
];

const mentorLinks = [
  { href: "/auth/register?role=mentor", label: "Become a Mentor", icon: UserPlus, desc: "Share your expertise" },
  { href: "/mentor-certification", label: "Mentor Certification", icon: BadgeCheck, desc: "Get certified before going live" },
];

const supportLinks = [
  { href: "/safety-trust", label: "Safety & Trust", icon: Shield, desc: "How we keep you safe" },
  { href: "/faq", label: "FAQ", icon: CircleHelp, desc: "Common questions answered" },
  { href: "/contact", label: "Contact", icon: Mail, desc: "Get in touch with us" },
];

export default function Navbar({ locale = "en", onLocaleChange }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Grow<span className="gradient-text">Via</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Mega-menu trigger */}
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                Explore
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
              </button>

              {megaOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[820px] bg-white rounded-2xl card-shadow border border-gray-100 p-5 grid grid-cols-4 gap-5">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Platform</p>
                    <div className="space-y-1">
                      {platformLinks.map((l) => (
                        <Link key={l.href} href={l.href} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-purple-50 group transition-colors">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <l.icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 group-hover:text-purple-700 transition-colors">{l.label}</p>
                            <p className="text-xs text-gray-400">{l.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">For Mentees</p>
                    <div className="space-y-1">
                      {forYouLinks.map((l) => (
                        <Link key={l.href} href={l.href} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-purple-50 group transition-colors">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <l.icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 group-hover:text-purple-700 transition-colors">{l.label}</p>
                            <p className="text-xs text-gray-400">{l.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">For Mentors</p>
                    <div className="space-y-1">
                      {mentorLinks.map((l) => (
                        <Link key={l.href} href={l.href} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-purple-50 group transition-colors">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(29,158,117,0.1)" }}>
                            <l.icon className="w-4 h-4" style={{ color: "#1D9E75" }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 group-hover:text-purple-700 transition-colors">{l.label}</p>
                            <p className="text-xs text-gray-400">{l.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Support</p>
                    <div className="space-y-1">
                      {supportLinks.map((l) => (
                        <Link key={l.href} href={l.href} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-purple-50 group transition-colors">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <l.icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 group-hover:text-purple-700 transition-colors">{l.label}</p>
                            <p className="text-xs text-gray-400">{l.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Flat links */}
            {[
              { href: "/who-we-are", label: "Who We Are" },
              { href: "/for-schools", label: "For Schools" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-purple-50"
              >
                <Globe className="w-4 h-4" />
                <span>{localeNames[locale]}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl card-shadow border border-purple-50 py-1 min-w-[140px]">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => { onLocaleChange?.(l); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 transition-colors ${l === locale ? "text-purple-700 font-medium" : "text-gray-700"}`}
                    >
                      {localeNames[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-purple-700 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-semibold text-white gradient-bg px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-purple-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-purple-50 max-h-[85vh] overflow-y-auto">
          <div className="px-4 py-4">
            {/* Platform */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Platform</p>
            {platformLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                <l.icon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                {l.label}
              </Link>
            ))}

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">For Mentees</p>
            {forYouLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                <l.icon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                {l.label}
              </Link>
            ))}

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">For Mentors</p>
            {mentorLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                <l.icon className="w-4 h-4 flex-shrink-0" style={{ color: "#1D9E75" }} />
                {l.label}
              </Link>
            ))}

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">Company</p>
            {[
              { href: "/who-we-are", label: "Who We Are" },
              { href: "/for-schools", label: "For Schools" },
              ...supportLinks,
            ].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                {"icon" in l && <l.icon className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                {l.label}
              </Link>
            ))}

            <div className="border-t border-purple-50 pt-4 mt-4 space-y-3">
              <div className="flex gap-2">
                {locales.map((l) => (
                  <button key={l} onClick={() => { onLocaleChange?.(l); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${l === locale ? "gradient-bg text-white" : "bg-purple-50 text-gray-600 hover:bg-purple-100"}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-opacity">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
