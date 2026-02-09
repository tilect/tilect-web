"use client";

import { useTranslations } from "next-intl";
import { Text } from "@/src/components/ui/typography";
import type { SleeveType } from "./schema";

type TypeSelectorProps = {
  value: SleeveType | null;
  onChange: (type: SleeveType) => void;
};

const types: { value: SleeveType; labelKey: string }[] = [
  { value: "short", labelKey: "shortSleeve" },
  { value: "long", labelKey: "longSleeve" },
];

/**
 * TypeSelector — two selectable cards for choosing sleeve type.
 */
export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  const t = useTranslations("shirts");

  return (
    <div className="grid grid-cols-2 gap-3">
      {types.map((type) => {
        const isSelected = value === type.value;

        const cardClasses = [
          "flex items-center justify-center rounded-lg border-2 px-4 py-4 transition-colors cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-foreground/20",
          isSelected
            ? "border-foreground bg-foreground/5"
            : "border-foreground/10 hover:border-foreground/30",
        ].join(" ");

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cardClasses}
          >
            <Text weight={isSelected ? "bold" : "normal"} size="sm" as="span">
              {t(type.labelKey)}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
