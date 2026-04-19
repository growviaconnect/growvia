"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/founders", label: "Founders" },
  { href: "/for-schools", label: "Stories" },
];

/* Text-shadow keeps white text legible over any page background */
const shadow = "0 1px 4px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.5)";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="text-white font-extrabold text-lg tracking-tight flex-shrink-0"
            style={{ textShadow: shadow }}
          >
            GrowVia
          </Link>

          {/* Centered nav links — desktop */}
          <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white hover:text-white/70 transition-colors duration-200"
                style={{ textShadow: shadow }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA — desktop */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/auth/register"
              className="text-sm font-semibold bg-white hover:bg-white/90 text-[#0D0A1A] px-5 py-2.5 rounded-lg transition-colors duration-200"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.35)" }}
            >
              Build the future
            </Link>
          </div>

          {/* Hamburger — mobile */}
          <button
            className="lg:hidden text-white hover:text-white/70 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{ textShadow: shadow }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — solid dark panel for readability */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0D0A1A]/97 backdrop-blur-md border-t border-white/5 px-6 pt-4 pb-8 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-base font-medium text-white/60 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-6">
            <Link
              href="/auth/register"
              onClick={() => setMenuOpen(false)}
              className="block text-center text-sm font-semibold bg-white text-[#0D0A1A] px-5 py-3.5 rounded-lg"
            >
              Build the future
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
