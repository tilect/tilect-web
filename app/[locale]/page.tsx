import { Icon } from "@/src/components/icons";
import { Text } from "@/src/components/ui/typography";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

const SOCIALS = [
  { icon: "instagram", href: "https://instagram.com/tilect.art" },
  { icon: "soundcloud", href: "https://soundcloud.com/tilect" },
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
          <ul className="absolute left-1/2 top-full mt-12 grid -translate-x-1/2 grid-cols-2 gap-8">
            {SOCIALS.map(({ icon, href }) => (
              <li key={icon} className="flex items-center justify-center">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={icon}
                  className="block w-8 text-black transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-125 hover:text-white sm:w-12"
                >
                  <Icon icon={icon} color="currentColor" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <footer className="absolute inset-x-0 bottom-0 px-6 pb-8">
        <Text
          size="xs"
          className="mx-auto max-w-2xl text-center text-[10px] leading-snug text-black/80"
        >
          {t("footer")}
        </Text>
      </footer>
    </div>
  );
}
