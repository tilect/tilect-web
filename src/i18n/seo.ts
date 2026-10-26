import { getPathname } from "./navigation";
import { routing } from "./routing";

export const SITE_URL = "https://www.tilect.art";

export const OG_LOCALES = {
  en: "en_US",
  ca: "ca_ES",
  es: "es_ES",
} as const;

export type Locale = (typeof routing.locales)[number];
export type Href = keyof typeof routing.pathnames;

/** Canonical + hreflang alternates for a route, using the localized slugs. */
export function localizedAlternates(locale: Locale, href: Href) {
  return {
    canonical: getPathname({ locale, href }),
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [l, getPathname({ locale: l, href })]),
      ),
      "x-default": getPathname({ locale: routing.defaultLocale, href }),
    },
  };
}
