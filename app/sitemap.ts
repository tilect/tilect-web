import { getPathname } from "@/src/i18n/navigation";
import { routing } from "@/src/i18n/routing";
import { SITE_URL, type Href } from "@/src/i18n/seo";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const hrefs = Object.keys(routing.pathnames) as Href[];

  return hrefs.flatMap((href) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${getPathname({ locale, href })}`,
      changeFrequency: href === "/" ? ("monthly" as const) : ("yearly" as const),
      priority: href === "/" ? 1 : href === "/shirts" ? 0.8 : 0.3,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [
            l,
            `${SITE_URL}${getPathname({ locale: l, href })}`,
          ]),
        ),
      },
    })),
  );
}
