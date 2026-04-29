"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { useLang } from "@/contexts/LangContext";

/* ── Custom social SVG icons ──────────────────────────────────── */
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.89 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.27 6.27 0 0 0-6.27 6.27 6.27 6.27 0 0 0 6.27 6.27 6.27 6.27 0 0 0 6.27-6.27V9.51a8.14 8.14 0 0 0 4.75 1.5V7.57a4.84 4.84 0 0 1-.97-.88z" />
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

type SocialLink = { label: string; href: string; Icon: React.ComponentType<{ className?: string }> };

const socials: SocialLink[] = [
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "TikTok",    href: "#", Icon: TikTokIcon },
  { label: "YouTube",   href: "#", Icon: YouTubeIcon },
  { label: "X",         href: "#", Icon: XIcon },
  { label: "LinkedIn",  href: "#", Icon: LinkedInIcon },
];

/* ── Footer component ─────────────────────────────────────────── */
export default function Footer() {
  const pathname = usePathname();
  const { t } = useLang();
  const hideHeadline = pathname === "/how-it-works";

  const navLinks = [
    { label: t("footer_link_home"),     href: "/" },
    { label: t("footer_link_founders"), href: "/founders" },
    { label: t("footer_link_stories"),  href: "/for-schools" },
    { label: t("footer_link_pricing"),  href: "/pricing" },
  ];

  const companyLinks = [
    { label: t("footer_link_manifesto"), href: "/#manifesto" },
    { label: t("footer_link_careers"),   href: "/careers" },
    { label: t("footer_link_contact"),   href: "/contact" },
    { label: t("footer_link_privacy"),   href: "/legal/privacy" },
  ];

  const cities = [
    { city: "Barcelona", country: "Spain" },
    { city: t("footer_online"), country: t("footer_online_sub") },
  ];

  return (
    <footer className="bg-[#0D0A1A] pt-20 pb-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* ── Big headline ───────────────────────────────────── */}
        {!hideHeadline && (
          <div className="reveal mb-16 lg:mb-20">
            <h2 className="font-extrabold text-white leading-[0.88] tracking-tight text-5xl md:text-7xl lg:text-[7.5rem]">
              {t("footer_headline_1")}{" "}
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  textShadow: "0 0 80px rgba(124,58,237,0.35)",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(76,29,149,0.55)",
                  textDecorationThickness: "2px",
                  textUnderlineOffset: "8px",
                }}
              >
                {t("footer_headline_2")}
              </span>
              {t("footer_headline_3")}
            </h2>
          </div>
        )}

        {/* ── Links + cities row ─────────────────────────────── */}
        <div className="reveal reveal-delay-1 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-14 mb-16">

          {/* Left: two nav columns */}
          <div className="flex gap-12 md:gap-20">
            {/* NAVIGATION */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4C1D95] mb-6">
                {t("footer_nav_label")}
              </p>
              <ul className="space-y-3.5">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/45 hover:text-white transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COMPANY */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4C1D95] mb-6">
                {t("footer_company_label")}
              </p>
              <ul className="space-y-3.5">
                {companyLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/45 hover:text-white transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: three city columns */}
          <div className="flex gap-10 md:gap-14 lg:gap-16">
            {cities.map((c) => (
              <div key={c.city}>
                {/* Decorative vertical line */}
                <div className="w-px h-6 bg-[#4C1D95] mb-5" />
                <p className="text-sm font-semibold text-white leading-snug">{c.city}</p>
                <p className="text-xs text-[#7C3AED]/60 mt-1.5 leading-snug">{c.country}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-5 py-6"
          style={{ borderTop: "1px solid rgba(76,29,149,0.3)" }}
        >
          {/* Email — left */}
          <a
            href="mailto:contact@growviaconnect.com"
            className="text-sm text-[#7C3AED] hover:text-[#A78BFA] transition-colors duration-200 order-2 md:order-1"
          >
            contact@growviaconnect.com
          </a>

          {/* Copyright + admin — center */}
          <div className="flex items-center gap-3 order-1 md:order-2">
            <p className="text-xs text-white/20 uppercase tracking-widest">
              {t("footer_copyright")}
            </p>
            <Link
              href="/admin"
              className="text-xs text-white/[0.12] hover:text-white/25 transition-colors duration-200"
            >
              Admin
            </Link>
          </div>

          {/* Social icons — right */}
          <div className="flex items-center gap-4 order-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                title={label}
                className="text-white/35 hover:text-[#7C3AED] transition-colors duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
