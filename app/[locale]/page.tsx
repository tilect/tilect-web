import { Icon } from "@/src/components/icons";
import { Display, Text } from "@/src/components/ui/typography";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

const SOCIALS = [
  { icon: "soundcloud", href: "https://soundcloud.com/tilect" },
  { icon: "youtube", href: "https://www.youtube.com/@TILECTart" },
  { icon: "instagram", href: "https://instagram.com/tilect.art" },
] as const;

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <main className="flex h-dvh w-full flex-col bg-ink text-paper">
      <div className="mx-auto grid min-h-0 w-full max-w-4xl flex-1 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6 px-6 pb-10 pt-8 sm:gap-12">
        <div className="relative">
          <Image
            src="/logo/Tilect_purple_vertical.png"
            alt={t("logoAlt")}
            width={168}
            height={915}
            priority
            className="absolute left-0 top-0 h-full w-auto max-w-full object-contain object-left"
          />
        </div>

        <div className="grid grid-rows-[1fr_auto_1fr]">
          <Display
            size="xs"
            as="p"
            weight="normal"
            className="row-start-2 text-paper md:text-4xl"
          >
            {t.rich("tagline", {
              em: (chunks) => <em className="text-accent">{chunks}</em>,
            })}
          </Display>

          <ul className="row-start-3 flex items-end gap-3 self-end">
            {SOCIALS.map(({ icon, href }) => (
              <li key={icon}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={icon}
                  className="social-icon relative grid size-12 place-items-center rounded-full text-paper sm:size-14"
                >
                  <span className="block w-5 sm:w-6">
                    <Icon icon={icon} color="currentColor" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="px-6 pb-6">
        <Text size="xs" className="text-center text-[11px] text-paper/70 sm:text-xs">
          <span className="whitespace-nowrap">Associació Cultural Tilect</span>{" "}
          <span className="whitespace-nowrap">
            ·{" "}
            <a
              href="mailto:hola@tilect.art"
              className="underline-offset-2 hover:underline"
            >
              hola@tilect.art
            </a>{" "}
            · 2026
          </span>
        </Text>
      </footer>
    </main>
  );
}
