import type { ComponentPropsWithoutRef, ElementType } from "react";

/* ------------------------------------------------------------------ */
/*  Shared token types                                                 */
/* ------------------------------------------------------------------ */

/** Font-weight tokens matching the Doner family weights. */
export type FontWeight = "light" | "normal" | "bold" | "black";

/** Size scale for Display component. */
export type DisplaySize = "2xl" | "xl" | "lg" | "md" | "sm" | "xs";

/** Size scale for Text component. */
export type TextSize = "xl" | "lg" | "md" | "sm" | "xs";

/* ------------------------------------------------------------------ */
/*  Component prop types                                               */
/* ------------------------------------------------------------------ */

export type DisplayProps = {
  /** Visual size token (controls font-size & line-height). @default "md" */
  size?: DisplaySize;
  /** Font weight. @default "bold" */
  weight?: FontWeight;
  /** Render italic variant. @default false */
  italic?: boolean;
  /** Override the rendered HTML element. @default automatic per size */
  as?: ElementType;
} & Omit<ComponentPropsWithoutRef<"h2">, "ref">;

export type TextProps = {
  /** Visual size token (controls font-size & line-height). @default "md" */
  size?: TextSize;
  /** Font weight. @default "normal" */
  weight?: FontWeight;
  /** Render italic variant. @default false */
  italic?: boolean;
  /** Override the rendered HTML element. @default "p" */
  as?: ElementType;
} & Omit<ComponentPropsWithoutRef<"p">, "ref">;
