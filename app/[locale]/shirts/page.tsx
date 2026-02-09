import { TShirtForm } from "@/src/components/tshirt/TShirtForm";
import { Display, Text } from "@/src/components/ui/typography";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shirts" });

  return {
    title: t("pageTitle"),
    description: `${t("pageDescription")} ${t("pageDescription2")}`,
    openGraph: {
      title: t("pageTitle"),
      description: t("pageDescription"),
    },
    twitter: {
      title: t("pageTitle"),
      description: t("pageDescription"),
    },
  };
}

export default async function ShirtsPage() {
  const t = await getTranslations("shirts");

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <Display size="sm">{t("pageTitle")}</Display>
      <Text size="lg" className="mt-3">
        {t("pageDescription")}
      </Text>
      <Text className="mt-3 text-foreground/70">{t("pageDescription2")}</Text>
      <TShirtForm />
    </main>
  );
}
