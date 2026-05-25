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

const EmailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

type SocialLink = { label: string; href: string; Icon: React.ComponentType<{ className?: string }>; newTab?: boolean; title?: string };

const socials: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/growviaconnect",                newTab: true,  Icon: InstagramIcon },
  { label: "TikTok",    href: "https://www.tiktok.com/@growviaconnect",                  newTab: true,  Icon: TikTokIcon    },
  { label: "LinkedIn",  href: "https://www.linkedin.com/in/growvia-connect-7bb495402/",  newTab: true,  Icon: LinkedInIcon  },
  { label: "Email",     href: "mailto:contact@growviaconnect.com",                        newTab: false, Icon: EmailIcon     },
  { label: "Phone",     href: "tel:+33767508119",                                         newTab: false, Icon: PhoneIcon, title: "+33 7 67 50 81 19 / +33 7 81 89 20 21" },
];

/* ── Footer component ─────────────────────────────────────────── */
export default function Footer() {
  const pathname = usePathname();
  const { t } = useLang();
  const hideHeadline = pathname === "/how-it-works";

  const navLinks = [
    { label: "Accueil",          href: "/"                },
    { label: "Explorer",         href: "/explore"         },
    { label: "Devenir Mentor",   href: "/become-a-mentor" },
    { label: "Fonctionnement",   href: "/how-it-works"    },
    { label: "Tarifs",           href: "/pricing"         },
    { label: "Notre Histoire",   href: "/founders"        },
  ];

  const platformLinks = [
    { label: "Trouver un Mentor",     href: "/explore/find-a-mentor"  },
    { label: "Matching IA",           href: "/ai-smart-matching"      },
    { label: "Certification Mentor",  href: "/mentor-certification"   },
    { label: "Pour les Écoles",       href: "/for-schools"            },
  ];

  const companyLinks = [
    { label: "FAQ",                        href: "/faq"             },
    { label: "Sécurité & Confiance",       href: "/safety-trust"   },
    { label: "Contact",                    href: "/contact"         },
    { label: "Politique de confidentialité", href: "/legal/privacy" },
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

          {/* Left: three nav columns */}
          <div className="flex gap-12 md:gap-16">
            {/* NAVIGATION */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4C1D95] mb-6">
                Navigation
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

            {/* PLATEFORME */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4C1D95] mb-6">
                Plateforme
              </p>
              <ul className="space-y-3.5">
                {platformLinks.map((l) => (
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

            {/* ENTREPRISE */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4C1D95] mb-6">
                Entreprise
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
          {/* Email, left */}
          <a
            href="mailto:contact@growviaconnect.com"
            className="text-sm text-[#7C3AED] hover:text-[#A78BFA] transition-colors duration-200 order-2 md:order-1"
          >
            contact@growviaconnect.com
          </a>

          {/* Copyright + admin, center */}
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

          {/* Social icons, right */}
          <div className="flex items-center gap-4 order-3">
            {socials.map(({ label, href, Icon, newTab, title }) => (
              <a
                key={label}
                href={href}
                title={title ?? label}
                {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
