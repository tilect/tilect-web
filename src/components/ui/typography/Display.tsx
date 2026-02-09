import type { ElementType } from "react";
import type { DisplayProps, DisplaySize, FontWeight } from "./types";

/* ------------------------------------------------------------------ */
/*  Style maps (static Tailwind class names — safe for scanning)       */
/* ------------------------------------------------------------------ */

const sizeClasses: Record<DisplaySize, string> = {
  "2xl": "text-7xl leading-none",
  xl: "text-6xl leading-none",
  lg: "text-5xl leading-tight",
  md: "text-4xl leading-tight",
  sm: "text-3xl leading-snug",
  xs: "text-2xl leading-snug",
};

const weightClasses: Record<FontWeight, string> = {
  light: "font-light",
  normal: "font-normal",
  bold: "font-bold",
  black: "font-black",
};

/** Maps each Display size to a sensible default HTML element. */
const defaultElementMap: Record<DisplaySize, ElementType> = {
  "2xl": "h1",
  xl: "h1",
  lg: "h2",
  md: "h3",
  sm: "h4",
  xs: "h5",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Display — large-scale headings using the Doner Display font.
 *
 * @example
 * <Display size="xl">Hero title</Display>
 * <Display size="sm" weight="light" as="span">Sub-heading</Display>
 */
export function Display({
  size = "md",
  weight = "bold",
  italic = false,
  as,
  className = "",
  children,
  ...rest
}: DisplayProps) {
  const Component = as ?? defaultElementMap[size];

  const classes = [
    "font-display",
    sizeClasses[size],
    weightClasses[weight],
    italic && "italic",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
