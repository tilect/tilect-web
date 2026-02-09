import { routing } from "@/src/i18n/routing";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { doner, donerDisplay } from "../fonts";
import "./globals.css";

const description =
  "Decentralized arts collective aiming to recover Barcelona's local artistic meritocracy through a phygital community.";

export const metadata: Metadata = {
  title: {
    default: "Tilect",
    template: "%s | Tilect",
  },
  description,
  metadataBase: new URL("https://www.tilect.art/"),
  openGraph: {
    type: "website",
    url: "https://www.tilect.art/",
    title: "Tilect.art",
    description,
    images: ["/tilect_logo512.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tilect",
    description,
    images: ["/tilect_logo512.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/tilect_logo192.png",
  },
  manifest: "/manifest.json",
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
    >
      <body className={`${doner.className} ${donerDisplay.className}`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
