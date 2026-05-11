"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";
import { locales, localeNames, arabicLocales, arabicFlags, portugueseLocales, portugueseFlags, type Locale } from "@/lib/i18n";
import { ChevronDown, ChevronLeft } from "lucide-react";

/** Locales that appear at the top level (Arabic dialects and pt-BR are in submenus) */
const topLevelLocales = locales.filter(l => !arabicLocales.includes(l) && l !== 'pt-BR');

export default function LangSwitcher() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen]             = useState(false);
  const [arabicOpen, setArabicOpen] = useState(false);
  const [ptOpen, setPtOpen]         = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setArabicOpen(false);
        setPtOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isArabicActive = arabicLocales.includes(lang);
  const isPortugueseActive = portugueseLocales.includes(lang);

  const itemStyle = (active: boolean): React.CSSProperties => ({
    color: active ? "#A78BFA" : "rgba(255,255,255,0.55)",
    background: active ? "rgba(124,58,237,0.12)" : "transparent",
  });

  function selectLocale(l: Locale) {
    setLang(l);
    setOpen(false);
    setArabicOpen(false);
    setPtOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white transition-colors duration-200 px-2 py-1 rounded-md hover:bg-white/5"
        aria-label={t("nav_lang_toggle")}
      >
        <span className="text-base leading-none">🌐</span>
        <span className="text-xs uppercase tracking-wide">
          {isArabicActive ? 'AR' : isPortugueseActive ? 'PT' : lang.toUpperCase().slice(0, 2)}
        </span>
        <ChevronDown
          className="w-3 h-3 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Main dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-44 rounded-lg overflow-visible z-50"
          style={{
            background: "#1A1730",
            border: "1px solid rgba(124,58,237,0.25)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top-level locales (pt renders as a parent with submenu) */}
          {topLevelLocales.map((locale) => {
            if (locale === 'pt') {
              return (
                <div key="pt" className="relative">
                  <button
                    onClick={() => setPtOpen(!ptOpen)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left"
                    style={itemStyle(isPortugueseActive)}
                    onMouseEnter={(e) => {
                      if (!isPortugueseActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isPortugueseActive) (e.currentTarget as HTMLElement).style.background = ptOpen ? "rgba(255,255,255,0.03)" : "transparent";
                    }}
                  >
                    <span>Português</span>
                    <ChevronLeft
                      className="w-3 h-3 opacity-50 transition-transform duration-200 ml-auto"
                      style={{ transform: ptOpen ? "rotate(-90deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {/* Portuguese sub-menu — inline expand */}
                  {ptOpen && (
                    <div
                      className="overflow-hidden"
                      style={{
                        background: "rgba(0,0,0,0.25)",
                        borderTop: "1px solid rgba(124,58,237,0.12)",
                      }}
                    >
                      {portugueseLocales.map((ptLocale) => (
                        <button
                          key={ptLocale}
                          onClick={() => selectLocale(ptLocale)}
                          className="w-full flex items-center gap-3 px-5 py-2 text-sm transition-colors duration-150 text-left"
                          style={itemStyle(ptLocale === lang)}
                          onMouseEnter={(e) => {
                            if (ptLocale !== lang) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                          }}
                          onMouseLeave={(e) => {
                            if (ptLocale !== lang) (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          <span>{portugueseFlags[ptLocale]}</span>
                          <span>{localeNames[ptLocale]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={locale}
                onClick={() => selectLocale(locale)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left"
                style={itemStyle(locale === lang)}
                onMouseEnter={(e) => {
                  if (locale !== lang) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (locale !== lang) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span>{localeNames[locale]}</span>
              </button>
            );
          })}

          {/* Arabic parent row */}
          <div className="relative">
            <button
              onClick={() => setArabicOpen(!arabicOpen)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left"
              style={itemStyle(isArabicActive)}
              onMouseEnter={(e) => {
                if (!isArabicActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (!isArabicActive) (e.currentTarget as HTMLElement).style.background = arabicOpen ? "rgba(255,255,255,0.03)" : "transparent";
              }}
            >
              <span style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>العربية</span>
              <ChevronLeft
                className="w-3 h-3 opacity-50 transition-transform duration-200 ml-auto"
                style={{ transform: arabicOpen ? "rotate(-90deg)" : "rotate(0deg)" }}
              />
            </button>

            {/* Arabic sub-menu — inline expand */}
            {arabicOpen && (
              <div
                className="overflow-hidden"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  borderTop: "1px solid rgba(124,58,237,0.12)",
                }}
              >
                {arabicLocales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => selectLocale(locale)}
                    className="w-full flex items-center gap-3 px-5 py-2 text-sm transition-colors duration-150 text-right"
                    style={{
                      ...itemStyle(locale === lang),
                      direction: "rtl",
                      fontFamily: "'Noto Sans Arabic', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      if (locale !== lang) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (locale !== lang) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span>{arabicFlags[locale]}</span>
                    <span>{localeNames[locale]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
