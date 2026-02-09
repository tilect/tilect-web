"use client";

import { ImageDialog } from "@/src/components/ui/ImageDialog";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

const images = [
  {
    src: "/images/manga_corta-1083\u00d71599.jpeg",
    altKey: "shortSleeveAlt" as const,
  },
  {
    src: "/images/manga_larga-1083\u00d71599.jpeg",
    altKey: "longSleeveAlt" as const,
  },
];

/**
 * TShirtGallery — displays both t-shirt images side-by-side.
 * Tap an image to open it fullscreen in the ImageDialog.
 */
export function TShirtGallery() {
  const t = useTranslations("shirts");
  const [dialogImage, setDialogImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {images.map((img) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setDialogImage({ src: img.src, alt: t(img.altKey) })}
            className="relative aspect-1083/1599 cursor-pointer overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          >
            <Image
              src={img.src}
              alt={t(img.altKey)}
              fill
              sizes="(max-width: 640px) 50vw, 250px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <ImageDialog
        src={dialogImage?.src ?? ""}
        alt={dialogImage?.alt ?? ""}
        open={dialogImage !== null}
        onClose={() => setDialogImage(null)}
      />
    </>
  );
}
