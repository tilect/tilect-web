import { HomeStage } from "@/src/components/home";
import { Icon } from "@/src/components/icons";
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

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localizedAlternates(locale as Locale, "/") };
}

export default async function Home() {
  const t = await getTranslations("home");
  // Design drawer (brush button): only where SHOW_DESIGN_PANEL=true, i.e. local / TEST.
  const tune = process.env.SHOW_DESIGN_PANEL === "true";

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
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">{t("logoAlt")}</h1>

      <header className="absolute inset-x-0 top-0 px-6 pt-6 text-center">
        <Text size="xs" className="text-[11px] uppercase tracking-widest text-foreground/70 sm:text-xs">
          Associació Cultural
        </Text>
      </header>

      {/* Logo dead center of the screen. */}
      <div className="grid min-h-0 flex-1 place-items-center">
        <HomeStage tune={tune} />
      </div>

      {/* Socials: a third up from the bottom on mobile; tucked under the logo on desktop. */}
      <ul className="absolute inset-x-0 top-2/3 flex items-center justify-center gap-3 sm:top-1/2 sm:mt-20">
        {SOCIALS.map(({ icon, href }) => (
          <li key={icon}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={icon}
              className="social-icon relative grid size-12 place-items-center rounded-full sm:size-14"
            >
              <span className="block w-5 sm:w-6">
                <Icon icon={icon} color="currentColor" />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <footer className="absolute inset-x-0 bottom-0 px-6 pb-6">
        <Text size="xs" className="text-center text-[11px] text-foreground/70 sm:text-xs">
          <a href={`mailto:${EMAIL}`} className="underline-offset-2 hover:underline">
            {EMAIL}
          </a>{" "}
          · 2026
        </Text>
      </footer>
    </main>
  );
}
