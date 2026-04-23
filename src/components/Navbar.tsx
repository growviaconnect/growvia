"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { getUserSession, clearUserSession, type UserSession } from "@/lib/session";
import { clearAuthCookie } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LangContext";
import LangSwitcher from "@/components/LangSwitcher";

const shadow = "0 1px 4px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.5)";

export default function Navbar() {
  const router = useRouter();
  const { t } = useLang();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [session, setSession]     = useState<UserSession | null>(null);
  const [hydrated, setHydrated]   = useState(false);

  useEffect(() => {
    setSession(getUserSession());
    setHydrated(true);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    clearAuthCookie();
    clearUserSession();
    setSession(null);
    setMenuOpen(false);
    router.push("/");
  }

  const navLinks = [
    { href: "/explore",     label: t("nav_explore") },
    { href: "/founders",    label: t("nav_founders") },
    { href: "/for-schools", label: t("nav_stories") },
  ];

  const initials = session?.nom
    ? session.nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

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

          {/* Right CTA — desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <LangSwitcher />
            {hydrated && session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                  style={{ textShadow: shadow }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
                  >
                    {initials}
                  </div>
                  {t("nav_dashboard")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-white/35 hover:text-white/70 transition-colors"
                  style={{ textShadow: shadow }}
                >
                  {t("nav_signout")}
                </button>
              </>
            ) : (
              <Link
                href="/auth/register"
                className="text-sm font-semibold bg-white hover:bg-white/90 text-[#0D0A1A] px-5 py-2.5 rounded-lg transition-colors duration-200"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.35)" }}
              >
                {t("nav_build")}
              </Link>
            )}
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

      {/* Mobile menu */}
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
          <div className="pt-4">
            <LangSwitcher />
          </div>
          <div className="pt-4 space-y-3">
            {hydrated && session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-3 text-base font-medium text-white/70 hover:text-white transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                    style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
                  >
                    {initials}
                  </div>
                  {t("nav_dashboard")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-3 text-base font-medium text-red-400/70 hover:text-red-400 transition-colors"
                >
                  {t("nav_signout")}
                </button>
              </>
            ) : (
              <Link
                href="/auth/register"
                onClick={() => setMenuOpen(false)}
                className="block text-center text-sm font-semibold bg-white text-[#0D0A1A] px-5 py-3.5 rounded-lg"
              >
                {t("nav_build")}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
