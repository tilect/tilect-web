import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ca", "es"],
  defaultLocale: "ca",
  pathnames: {
    "/": "/",
    "/home-2": {
      ca: "/inici-2",
      es: "/inicio-2",
      en: "/home-2",
    },
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
