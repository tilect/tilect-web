import { Display, Text } from "@/src/components/ui/typography";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <Display size="sm">{t("title")}</Display>

      <section className="mt-8">
        <Text weight="bold" size="lg">
          {t("s1Title")}
        </Text>
        <Text className="mt-2 text-foreground/80">{t("s1P1")}</Text>
      </section>

      <hr className="my-6 border-foreground/10" />

      <section>
        <Text weight="bold" size="lg">
          {t("s2Title")}
        </Text>
        <Text className="mt-2 text-foreground/80">{t("s2P1")}</Text>
        <ul className="mt-2 ml-6 list-disc">
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s2L1")}
            </Text>
          </li>
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s2L2")}
            </Text>
          </li>
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s2L3")}
            </Text>
          </li>
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s2L4")}
            </Text>
          </li>
        </ul>
      </section>

      <hr className="my-6 border-foreground/10" />

      <section>
        <Text weight="bold" size="lg">
          {t("s3Title")}
        </Text>
        <Text className="mt-2 text-foreground/80">{t("s3P1")}</Text>
        <ul className="mt-2 ml-6 list-disc">
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s3L1")}
            </Text>
          </li>
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s3L2")}
            </Text>
          </li>
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s3L3")}
            </Text>
          </li>
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s3L4")}
            </Text>
          </li>
        </ul>
        <Text className="mt-2 text-foreground/80">{t("s3P2")}</Text>
      </section>

      <hr className="my-6 border-foreground/10" />

      <section>
        <Text weight="bold" size="lg">
          {t("s4Title")}
        </Text>
        <Text className="mt-2 text-foreground/80">{t("s4P1")}</Text>
      </section>

      <hr className="my-6 border-foreground/10" />

      <section>
        <Text weight="bold" size="lg">
          {t("s5Title")}
        </Text>
        <Text className="mt-2 text-foreground/80">{t("s5P1")}</Text>
      </section>

      <hr className="my-6 border-foreground/10" />

      <section>
        <Text weight="bold" size="lg">
          {t("s6Title")}
        </Text>
        <Text className="mt-2 text-foreground/80">{t("s6P1")}</Text>
        <ul className="mt-2 ml-6 list-disc">
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s6L1")}
            </Text>
          </li>
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s6L2")}
            </Text>
          </li>
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s6L3")}
            </Text>
          </li>
          <li>
            <Text as="span" size="sm" className="text-foreground/80">
              {t("s6L4")}
            </Text>
          </li>
        </ul>
        <Text className="mt-2 text-foreground/80">{t("s6P2")}</Text>
      </section>

      <hr className="my-6 border-foreground/10" />

      <section>
        <Text weight="bold" size="lg">
          {t("s7Title")}
        </Text>
        <Text className="mt-2 text-foreground/80">{t("s7P1")}</Text>
      </section>
    </main>
  );
}
