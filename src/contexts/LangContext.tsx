"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, locales, type Locale } from "@/lib/i18n";

interface LangContextValue {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LangContext = createContext<LangContextValue>({
  lang: "fr",
  setLang: () => {},
  t: (k) => k,
  isRTL: false,
});

function isArabic(l: Locale) { return l === 'ar' || l.startsWith('ar-'); }

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>("fr");

  useEffect(() => {
    // Priority 1: user's saved preference
    const saved = localStorage.getItem("gv_lang") as Locale | null;
    if (saved && locales.includes(saved)) {
      setLangState(saved);
      return;
    }
    // Priority 2: browser language — check full tag first (e.g. 'ar-EG'), then base
    const navLang = navigator.language ?? "";
    if (locales.includes(navLang as Locale)) { setLangState(navLang as Locale); return; }
    const base = navLang.slice(0, 2) as Locale;
    if (locales.includes(base)) { setLangState(base); return; }
    // Priority 3: fallback to French
  }, []);

  // Sync <html lang> + dir attributes for i18n and RTL support
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  function setLang(l: Locale) {
    setLangState(l);
    localStorage.setItem("gv_lang", l);
  }

  function t(key: string): string {
    // Fallback chain: dialect → MSA (ar) → English → key
    const base: Locale = lang.startsWith('ar-') ? 'ar' : lang;
    return (
      translations[lang]?.[key] ??
      (base !== lang ? translations[base]?.[key] : undefined) ??
      translations["en"]?.[key] ??
      key
    );
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t, isRTL: isArabic(lang) }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
