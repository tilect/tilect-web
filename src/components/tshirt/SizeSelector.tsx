"use client";

import { Text } from "@/src/components/ui/typography";
import { SIZES, SIZE_MEASUREMENTS, type Size } from "./schema";

type SizeSelectorProps = {
  value: Size | null;
  onChange: (size: Size) => void;
};

/**
 * SizeSelector — grid of selectable size cards with chest-width measurements.
 */
export function SizeSelector({ value, onChange }: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SIZES.map((size) => {
        const isSelected = value === size;

        const cardClasses = [
          "flex min-w-16 flex-col items-center rounded-lg border-2 px-4 py-3 transition-colors cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-foreground/20",
          isSelected
            ? "border-foreground bg-foreground/5"
            : "border-foreground/10 hover:border-foreground/30",
        ].join(" ");

        return (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={cardClasses}
          >
            <Text weight="bold" size="sm" as="span">
              {size}
            </Text>
            <Text size="xs" as="span" className="text-foreground/60">
              {SIZE_MEASUREMENTS[size]}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
