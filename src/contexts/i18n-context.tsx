import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Lang = 'en' | 'vi';

const STORAGE_KEY = 'daisan.lang';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  /** Pick the string for the active language: t(english, vietnamese). */
  t: (en: string, vi: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'vi') return saved;
  } catch {
    /* ignore */
  }
  // Auto-detect from the browser: Vietnamese visitors default to VI.
  const nav = window.navigator;
  const langs = [
    ...(nav.languages ?? []),
    nav.language,
  ].filter(Boolean) as string[];
  if (langs.some((l) => l.toLowerCase().startsWith('vi'))) return 'vi';
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggle = useCallback(
    () => setLangState((l) => (l === 'en' ? 'vi' : 'en')),
    [],
  );

  const t = useCallback(
    (en: string, vi: string) => (lang === 'vi' ? vi : en),
    [lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, toggle, t }),
    [lang, setLang, toggle, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback so a component used outside the provider still renders in EN
    // instead of crashing.
    return {
      lang: 'en',
      setLang: () => {},
      toggle: () => {},
      t: (en: string) => en,
    };
  }
  return ctx;
}
