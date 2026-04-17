"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, locales, type Locale } from "@/lib/i18n";

interface LangContextValue {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("gv_lang") as Locale | null;
    if (saved && locales.includes(saved)) {
      setLangState(saved);
    }
  }, []);

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
