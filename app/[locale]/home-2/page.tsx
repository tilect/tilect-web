import { Home2Stage } from "@/src/components/home2";
import { localizedAlternates, type Locale } from "@/src/i18n/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: localizedAlternates(locale as Locale, "/home-2"),
    // Experimental home variant: reachable, but kept out of search results.
    robots: { index: false, follow: true },
  };
}

export default async function Home2({ searchParams }: Props) {
  const t = await getTranslations("home");
  // Tuning panel: always in development, opt-in with `?tune` elsewhere.
  const tune = process.env.NODE_ENV === "development" || "tune" in (await searchParams);

  return (
    <main className="grid h-dvh w-full place-items-center overflow-hidden bg-ink px-6">
      <h1 className="sr-only">{t("logoAlt")}</h1>
      <Home2Stage tune={tune} />
    </main>
  );
}
