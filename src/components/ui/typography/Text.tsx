import type { FontWeight, TextProps, TextSize } from "./types";

/* ------------------------------------------------------------------ */
/*  Style maps (static Tailwind class names — safe for scanning)       */
/* ------------------------------------------------------------------ */

const sizeClasses: Record<TextSize, string> = {
  xl: "text-xl leading-relaxed",
  lg: "text-lg leading-relaxed",
  md: "text-base leading-normal",
  sm: "text-sm leading-normal",
  xs: "text-xs leading-normal",
};

const weightClasses: Record<FontWeight, string> = {
  light: "font-light",
  normal: "font-normal",
  bold: "font-bold",
  black: "font-black",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Text — body copy and inline text using the Doner Text font.
 *
 * @example
 * <Text>Default paragraph text.</Text>
 * <Text size="sm" weight="bold" as="span">Bold label</Text>
 */
export function Text({
  size = "md",
  weight = "normal",
  italic = false,
  as: Component = "p",
  className = "",
  children,
  ...rest
}: TextProps) {
  const classes = [
    "font-text",
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
