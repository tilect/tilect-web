import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ca", "es"],
  defaultLocale: "ca",
  pathnames: {
    "/": "/",
    "/shirts": {
      ca: "/samarretes",
      es: "/camisetas",
      en: "/shirts",
    },
    "/terms": {
      ca: "/termes",
      es: "/terminos",
      en: "/terms",
    },
    "/privacy": {
      ca: "/privacitat",
      es: "/privacidad",
      en: "/privacy",
    },
  },
});
