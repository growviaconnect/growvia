"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LangContext";
import LangSwitcher from "@/components/LangSwitcher";
import UserAvatar from "@/components/UserAvatar";
import AuthModal from "@/components/AuthModal";

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { session, clearSession } = useAuth();
  const { t } = useLang();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [modalTab,   setModalTab]   = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  function openModal(tab: "signin" | "signup" = "signin") {
    setModalTab(tab);
    setModalOpen(true);
    setMenuOpen(false);
  }

  const navLinks = [
    { href: "/founders", label: t("nav_founders") },
    { href: "/explore",  label: t("nav_explore") },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={
          scrolled
            ? {
                background: "rgba(13,10,26,0.88)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }
            : { background: "transparent" }
        }
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0 select-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.svg" alt="" width={36} height={36} aria-hidden="true" />
              <span className="text-white font-extrabold text-lg tracking-tight leading-none">
                GrowVia<span style={{ color: "#A855F7" }}>Connect</span>
              </span>
            </Link>

            {/* Center: Nav links (desktop) */}
            <div className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
              {navLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: pathname === l.href ? "#fff" : "rgba(255,255,255,0.55)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = pathname === l.href ? "#fff" : "rgba(255,255,255,0.55)"; }}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right: Auth area (desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {session ? (
                <>
                  <div className="flex items-center gap-2">
                    <UserAvatar editable photo={session.photo} name={session.nom} size={28} rounded="lg" />
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                    >
                      {t("nav_dashboard")}
                    </Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-white/30 hover:text-white/70 transition-colors"
                  >
                    {t("nav_signout")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => openModal("signin")}
                  className="text-sm font-bold text-white px-5 py-2 rounded-full transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                    boxShadow: "0 0 0 1px rgba(124,58,237,0.5), 0 4px 16px rgba(124,58,237,0.35)",
                  }}
                >
                  Enter
                </button>
              )}
              <LangSwitcher />
            </div>

            {/* Hamburger (mobile) */}
            <button
              className="lg:hidden text-white hover:text-white/70 transition-colors p-1"
              onClick={() => setMenuOpen(m => !m)}
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
              {navLinks.map(l => (
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

            {/* Auth */}
            {session ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-3">
                  <UserAvatar editable photo={session.photo} name={session.nom} size={32} rounded="lg" />
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="text-base font-medium text-white/70 hover:text-white transition-colors"
                  >
                    {t("nav_dashboard")}
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-3 text-base font-medium text-red-400/70 hover:text-red-400 transition-colors"
                >
                  {t("nav_signout")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => openModal("signin")}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
                }}
              >
                Enter
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth modal */}
      <AuthModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tab={modalTab}
        onTabChange={setModalTab}
      />
    </>
  );
}
