"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LangContext";
import LangSwitcher from "@/components/LangSwitcher";

export default function Navbar() {
  const router = useRouter();
  const { session, clearSession } = useAuth();
  const { t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change (body scroll lock side-effect guard)
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    clearSession();
    setMenuOpen(false);
    router.push("/");
  }

  const navLinks = [
    { href: "/explore",       label: t("nav_explore") },
    { href: "/#how-it-works", label: t("nav_how_it_works") },
    { href: "/for-schools",   label: t("nav_for_schools") },
    { href: "/pricing",       label: t("nav_pricing") },
  ];

  const initials = session?.nom
    ? session.nom.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? {
              background: "rgba(13,10,26,0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }
          : {
              background: "transparent",
            }
      }
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="text-white font-extrabold text-lg tracking-tight flex-shrink-0"
          >
            GrowVia
          </Link>

          {/* Centered nav links — desktop */}
          <div className="hidden lg:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right area — desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <LangSwitcher />

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
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
                >
                  {t("nav_signout")}
                </button>
              </>
            ) : (
              <>
                {/* Outline CTA */}
                <Link
                  href="/become-a-mentor"
                  className="text-sm font-semibold text-white/80 hover:text-white px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    border: "1px solid rgba(124,58,237,0.45)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.85)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.45)";
                    (e.currentTarget as HTMLElement).style.background = "";
                  }}
                >
                  {t("nav_im_mentor")}
                </Link>

                {/* Filled CTA */}
                <Link
                  href="/explore/find-a-mentor"
                  className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  style={{ background: "#7C3AED" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#6D28D9"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#7C3AED"; }}
                >
                  {t("nav_find_mentor")}
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            className="lg:hidden text-white hover:text-white/70 transition-colors p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t("nav_toggle_menu")}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-screen" : "max-h-0"}`}
        style={{
          background: "rgba(13,10,26,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: menuOpen ? "1px solid rgba(255,255,255,0.05)" : "none",
        }}
      >
        <div className="px-6 pt-4 pb-8">

          {/* Nav links */}
          <div className="space-y-0.5 mb-5">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-base font-medium text-white/60 hover:text-white transition-colors border-b border-white/[0.04]"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Lang switcher */}
          <div className="mb-6">
            <LangSwitcher />
          </div>

          {/* CTA buttons — always at bottom */}
          {session ? (
            <div className="space-y-3">
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
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Outline */}
              <Link
                href="/become-a-mentor"
                onClick={() => setMenuOpen(false)}
                className="block text-center text-sm font-semibold text-white py-3.5 rounded-lg transition-colors"
                style={{ border: "1px solid rgba(124,58,237,0.5)" }}
              >
                {t("nav_im_mentor")}
              </Link>
              {/* Filled */}
              <Link
                href="/explore/find-a-mentor"
                onClick={() => setMenuOpen(false)}
                className="block text-center text-sm font-semibold text-white py-3.5 rounded-lg"
                style={{ background: "#7C3AED" }}
              >
                {t("nav_find_mentor")}
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
