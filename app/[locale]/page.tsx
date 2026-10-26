import { Icon } from "@/src/components/icons";
import { Text } from "@/src/components/ui/typography";
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
    <div className="relative min-h-dvh w-full bg-brand text-black">
      <main className="flex min-h-dvh items-center justify-center px-6">
        <div className="relative w-full max-w-3xl">
          <Image
            src="/logo/Tilect_black2.png"
            alt={t("logoAlt")}
            width={983}
            height={175}
            priority
            className="h-auto w-full"
          />
          <div className="absolute left-1/2 top-full mt-8 flex w-full -translate-x-1/2 flex-col items-center gap-8">
            <ul className="grid grid-cols-3 gap-6">
              {SOCIALS.map(({ icon, href }) => (
                <li key={icon} className="flex items-center justify-center">
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={icon}
                    className="social-icon relative grid size-14 place-items-center rounded-full text-black sm:size-16"
                  >
                    <span className="block w-6 sm:w-7">
                      <Icon icon={icon} color="currentColor" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <footer className="absolute inset-x-0 bottom-0 px-6 pb-6">
        <Text
          size="xs"
          className="text-center text-[10px] leading-snug text-black/80"
        >
          Associació Cultural Tilect ·{" "}
          <a
            href="mailto:hola@tilect.art"
            className="underline-offset-2 hover:underline"
          >
            hola@tilect.art
          </a>{" "}
          · 2026
        </Text>
      </footer>
    </div>
  );
}
