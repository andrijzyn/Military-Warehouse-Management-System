"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LOCALES, DEFAULT_LOCALE, makeTranslate, type Locale, type Translate } from "./translate";

const STORAGE_KEY = "stockpulse:language";

interface LanguageContextType {
  language: Locale;
  setLanguage: (locale: Locale) => void;
  t: Translate;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (LOCALES as string[]).includes(stored)) {
      setLanguage(stored as Locale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const t = useMemo(() => makeTranslate(language), [language]);
  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
