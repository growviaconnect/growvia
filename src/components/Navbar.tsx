"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/who-we-are", label: "Founders" },
  { href: "/for-schools", label: "Stories" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0D0A1A]/95 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-white font-extrabold text-lg tracking-tight flex-shrink-0">
            GrowVia
          </Link>

          {/* Centered nav links — desktop */}
          <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA — desktop */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/auth/register"
              className="text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-lg transition-colors duration-200"
            >
              Build the future
            </Link>
          </div>

          {/* Hamburger — mobile */}
          <button
            className="lg:hidden text-white/60 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0D0A1A] border-t border-white/5 px-6 pt-4 pb-8 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-base font-medium text-white/50 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-6">
            <Link
              href="/auth/register"
              onClick={() => setMenuOpen(false)}
              className="block text-center text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-3.5 rounded-lg transition-colors"
            >
              Build the future
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
