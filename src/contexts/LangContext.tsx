"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, locales, type Locale } from "@/lib/i18n";

interface LangContextValue {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "fr",
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>("fr");

  useEffect(() => {
    // Priority 1: user's saved preference
    const saved = localStorage.getItem("gv_lang") as Locale | null;
    if (saved && locales.includes(saved)) {
      setLangState(saved);
      return;
    }
    // Priority 2: browser language (navigator.language)
    const browserLang = (navigator.language ?? "").slice(0, 2) as Locale;
    if (locales.includes(browserLang)) {
      setLangState(browserLang);
      return;
    }
    // Priority 3: fallback to French (default)
    // (already set to "fr" in useState)
  }, []);

  // Sync <html lang="..."> so CSS can target CJK font via html[lang='zh']
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(l: Locale) {
    setLangState(l);
    localStorage.setItem("gv_lang", l);
  }

  function t(key: string): string {
    return translations[lang]?.[key] ?? translations["en"]?.[key] ?? key;
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
