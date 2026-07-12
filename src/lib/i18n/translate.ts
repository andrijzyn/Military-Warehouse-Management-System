import en from "./locales/en.json";
import uk from "./locales/uk.json";
import hr from "./locales/hr.json";
import de from "./locales/de.json";

export type Locale = "en" | "uk" | "hr" | "de";
export const LOCALES: Locale[] = ["en", "uk", "hr", "de"];
export const DEFAULT_LOCALE: Locale = "uk";
const FALLBACK_LOCALE: Locale = "en";

const DICTIONARIES: Record<Locale, unknown> = { en, uk, hr, de };

type Dictionary = typeof en;
type Join<K extends string, P extends string> = P extends ""
  ? K
  : `${K}.${P}`;

// A plural group leaf, e.g. { "one": "...", "other": "..." }.
type PluralGroup = { one?: string; few?: string; many?: string; other: string };

// Paths to plain string leaves only (excludes plural group objects).
type DotPaths<T> = T extends string
  ? ""
  : {
      [K in keyof T & string]: T[K] extends PluralGroup
        ? never
        : T[K] extends Record<string, unknown>
          ? Join<K, DotPaths<T[K]>>
          : K;
    }[keyof T & string];
export type TranslationKey = DotPaths<Dictionary>;

// Paths to plural group objects only (the parent path passed to t.plural()).
type PluralPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends PluralGroup
        ? K
        : T[K] extends Record<string, unknown>
          ? Join<K, PluralPaths<T[K]>>
          : never;
    }[keyof T & string];
export type PluralTranslationKey = PluralPaths<Dictionary>;

function getPath(dict: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object" && part in (acc as Record<string, unknown>)
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      dict,
    );
}

function interpolate(
  tpl: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return tpl;
  return tpl.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export interface Translate {
  (key: TranslationKey, vars?: Record<string, string | number>): string;
  plural(
    key: PluralTranslationKey,
    count: number,
    vars?: Record<string, string | number>,
  ): string;
}

export function makeTranslate(locale: Locale): Translate {
  const pluralRules = new Intl.PluralRules(locale);

  const resolve = (key: string): string | undefined => {
    const direct = getPath(DICTIONARIES[locale], key);
    if (typeof direct === "string") return direct;

    if (locale !== FALLBACK_LOCALE) {
      const fallback = getPath(DICTIONARIES[FALLBACK_LOCALE], key);
      if (typeof fallback === "string") {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[i18n] Missing key "${key}" for locale "${locale}"; falling back to English.`,
          );
        }
        return fallback;
      }
    }

    return undefined;
  };

  const t = ((key: TranslationKey, vars?: Record<string, string | number>) => {
    const tpl = resolve(key);
    if (tpl === undefined) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] Unknown key "${key}".`);
      }
      return key;
    }
    return interpolate(tpl, vars);
  }) as Translate;

  t.plural = (
    key: PluralTranslationKey,
    count: number,
    vars?: Record<string, string | number>,
  ) => {
    const category = pluralRules.select(count);
    const tpl = resolve(`${key}.${category}`) ?? resolve(`${key}.other`);
    if (tpl === undefined) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] Missing plural key "${key}" (${category}).`);
      }
      return key;
    }
    return interpolate(tpl, { count, ...vars });
  };

  return t;
}
