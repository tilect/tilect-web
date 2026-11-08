import { HomeStage } from "@/src/components/home";
import { Icon } from "@/src/components/icons";
import { ThemeToggle } from "@/src/components/theme";
import { Text } from "@/src/components/ui/typography";
import { localizedAlternates, SITE_URL, type Locale } from "@/src/i18n/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const EMAIL = "tilect.art@gmail.com";

const SOCIALS = [
  { icon: "soundcloud", href: "https://soundcloud.com/tilect" },
  { icon: "youtube", href: "https://www.youtube.com/@TILECTart" },
  { icon: "instagram", href: "https://instagram.com/tilect.art" },
] as const;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localizedAlternates(locale as Locale, "/") };
}

export default async function Home({ searchParams }: Props) {
  const t = await getTranslations("home");
  // Design panel: only where SHOW_DESIGN_PANEL=true (local / TEST), and only with `?tune`.
  // Short-circuit so production never reads searchParams and the page stays static.
  const tune = process.env.SHOW_DESIGN_PANEL === "true" && "tune" in (await searchParams);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TILECT",
    legalName: "Associació Cultural Tilect",
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    email: EMAIL,
    description: t("description"),
    address: { "@type": "PostalAddress", addressLocality: "Barcelona", addressCountry: "ES" },
    sameAs: SOCIALS.map(({ href }) => href),
  };

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">{t("logoAlt")}</h1>

      <ThemeToggle className="fixed right-4 top-4 z-50" />

      <div className="grid min-h-0 flex-1 place-items-center px-6">
        <HomeStage tune={tune} />
      </div>

      <div className="flex flex-col items-center gap-6 px-6 pb-6">
        <ul className="flex items-center gap-3">
          {SOCIALS.map(({ icon, href }) => (
            <li key={icon}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={icon}
                className="social-icon relative grid size-12 place-items-center rounded-full text-foreground sm:size-14"
              >
                <span className="block w-5 sm:w-6">
                  <Icon icon={icon} color="currentColor" />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <footer>
          <Text size="xs" className="text-center text-[11px] text-foreground/70 sm:text-xs">
            <span className="whitespace-nowrap">Associació Cultural Tilect</span>{" "}
            <span className="whitespace-nowrap">
              ·{" "}
              <a href={`mailto:${EMAIL}`} className="underline-offset-2 hover:underline">
                {EMAIL}
              </a>{" "}
              · 2026
            </span>
          </Text>
        </footer>
      </div>
    </main>
  );
}
