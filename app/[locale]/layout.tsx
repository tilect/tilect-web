import { ThemeProvider } from "@/src/components/theme";
import { routing } from "@/src/i18n/routing";
import { OG_LOCALES, SITE_URL, type Locale } from "@/src/i18n/seo";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { doner, donerDisplay } from "../fonts";
import "./globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const description = t("description");

  return {
    title: {
      default: "TILECT",
      template: "%s | TILECT",
    },
    description,
    applicationName: "TILECT",
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: "website",
      siteName: "TILECT",
      title: "TILECT",
      description,
      locale: OG_LOCALES[locale as Locale] ?? OG_LOCALES.ca,
    },
    twitter: {
      card: "summary_large_image",
      title: "TILECT",
      description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#1d1d1b",
};

/**
 * Pre-render all locale variants at build time.
 * @see https://next-intl.dev/docs/environments/actions-metadata-route-handlers
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${doner.variable} ${donerDisplay.variable}`}
      suppressHydrationWarning
    >
      <body className={`${doner.className} ${donerDisplay.className}`}>
        <ThemeProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
