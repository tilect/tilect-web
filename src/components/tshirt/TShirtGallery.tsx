"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ImageDialog } from "@/src/components/ui/ImageDialog";

const galleryImages = [
  { src: "/images/manga_corta-1083\u00d71599.jpeg", altKey: "shortSleeveAlt" },
  { src: "/images/manga_larga-1083\u00d71599.jpeg", altKey: "longSleeveAlt" },
  {
    src: "/images/manga_corta_2-1024x1280.jpg",
    altKey: "shortSleeveDetailAlt",
  },
  {
    src: "/images/manga_larga_2-1024x1280.jpg",
    altKey: "longSleeveDetailAlt",
  },
  { src: "/images/ilustracion-1024x1280.jpg", altKey: "illustrationAlt" },
  { src: "/images/texto-1024x1280.jpg", altKey: "textAlt" },
];

/**
 * TShirtGallery — horizontal carousel of t-shirt images.
 * Swipe on mobile, chevron arrows on desktop. Tap to zoom fullscreen.
 */
export function TShirtGallery() {
  const t = useTranslations("shirts");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dialogImage, setDialogImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const firstItem = el.querySelector("button");
    const itemWidth = firstItem?.offsetWidth ?? el.clientWidth * 0.7;
    const gap = 12; // gap-3 = 0.75rem = 12px
    el.scrollBy({
      left: direction === "left" ? -(itemWidth + gap) : itemWidth + gap,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      <div className="relative">
        {/* Scrollable carousel */}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {galleryImages.map((img) => (
            <button
              key={img.src}
              type="button"
              onClick={() =>
                setDialogImage({ src: img.src, alt: t(img.altKey) })
              }
              className="relative aspect-[4/5] w-[70%] shrink-0 snap-start cursor-pointer overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 sm:w-[48%]"
            >
              <Image
                src={img.src}
                alt={t(img.altKey)}
                fill
                sizes="(max-width: 640px) 70vw, 48vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Left chevron — desktop only */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-background/80 text-foreground shadow-md transition-opacity hover:bg-background sm:flex"
          aria-label="Previous"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Right chevron — desktop only */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-background/80 text-foreground shadow-md transition-opacity hover:bg-background sm:flex"
          aria-label="Next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
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
