import type { Locale, Currency } from "@/types";

export const LOCALES: Locale[] = ["fr", "en", "es", "de"];
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  de: "Deutsch",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇺🇸",
  es: "🇪🇸",
  de: "🇩🇪",
};

export function getCurrencyForLocale(locale: Locale): Currency {
  return locale === "en" ? "USD" : "EUR";
}

export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === "EUR" ? "fr-FR" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale): string {
  const intlLocale = locale === "en" ? "en-US" : locale === "de" ? "de-DE" : locale === "es" ? "es-ES" : "fr-FR";
  return new Intl.NumberFormat(intlLocale).format(value);
}

export function formatDate(date: string | Date, locale: Locale): string {
  const intlLocale = locale === "en" ? "en-US" : locale === "de" ? "de-DE" : locale === "es" ? "es-ES" : "fr-FR";
  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
