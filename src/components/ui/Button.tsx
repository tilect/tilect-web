import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = {
  /** Visual variant. @default "primary" */
  variant?: "primary" | "outline";
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Button — touch-friendly button with variant support.
 * Full-width and h-12 by default for mobile-first design.
 *
 * @example
 * <Button type="submit">Register</Button>
 * <Button variant="outline" onClick={handleClick}>Cancel</Button>
 */
export function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-lg px-6 py-3 font-text text-base font-bold",
    "transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20",
    "disabled:pointer-events-none disabled:opacity-50",
    "w-full h-12 cursor-pointer",
    variant === "primary"
      ? "bg-foreground text-background hover:bg-foreground/90"
      : "border border-foreground/20 bg-transparent hover:bg-foreground/5",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
