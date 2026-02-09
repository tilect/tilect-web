import { Navbar } from "@/src/components/navbar";
import { routing } from "@/src/i18n/routing";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

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
    <>
      <Navbar />
      {children}
    </>
  );
}
