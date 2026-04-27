"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";
import { locales, localeNames, type Locale } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";

export default function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white transition-colors duration-200 px-2 py-1 rounded-md hover:bg-white/5"
        aria-label="Change language"
      >
        <span className="text-base leading-none">🌐</span>
        <span className="text-xs uppercase tracking-wide">{lang}</span>
        <ChevronDown
          className="w-3 h-3 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-36 rounded-lg overflow-hidden z-50"
          style={{
            background: "#1A1730",
            border: "1px solid rgba(124,58,237,0.25)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => { setLang(locale); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left"
              style={{
                color: locale === lang ? "#A78BFA" : "rgba(255,255,255,0.55)",
                background: locale === lang ? "rgba(124,58,237,0.12)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (locale !== lang) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (locale !== lang) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span>{localeNames[locale]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
