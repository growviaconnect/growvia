"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { locales, localeNames, type Locale } from "@/lib/i18n";

interface NavbarProps {
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
}

export default function Navbar({ locale = "en", onLocaleChange }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navLinks = [
    { href: "/who-we-are", label: "Who We Are" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
    { href: "/safety-trust", label: "Safety & Trust" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Grow<span className="gradient-text">Via</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/for-schools"
              className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
            >
              For Schools
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
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
                      onClick={() => {
                        onLocaleChange?.(l);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 transition-colors ${
                        l === locale ? "text-purple-700 font-medium" : "text-gray-700"
                      }`}
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
              Log in
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
        <div className="lg:hidden bg-white border-t border-purple-50 max-h-screen overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/for-schools"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
            >
              For Schools
            </Link>
            <div className="border-t border-purple-50 pt-3 mt-3 space-y-2">
              <div className="flex gap-2">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => { onLocaleChange?.(l); setLangOpen(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      l === locale
                        ? "gradient-bg text-white"
                        : "bg-purple-50 text-gray-600 hover:bg-purple-100"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
