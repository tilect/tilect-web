import type { InputHTMLAttributes } from "react";

export type InputProps = {
  /** Label text displayed above the input. */
  label?: string;
  /** Error message displayed below the input. */
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

/**
 * Input — styled text input with optional label and error state.
 *
 * @example
 * <Input label="Email" type="email" id="email" error={errors.email} />
 */
export function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputClasses = [
    "w-full rounded-lg border px-4 py-3 font-text text-base",
    "bg-transparent outline-none transition-colors",
    "placeholder:text-foreground/40",
    "focus:ring-2 focus:ring-foreground/20",
    error
      ? "border-red-500 focus:ring-red-500/20"
      : "border-foreground/20 focus:border-foreground/40",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="font-text text-sm font-bold leading-normal"
        >
          {label}
        </label>
      )}
      <input id={id} className={inputClasses} {...props} />
      {error && (
        <p className="font-text text-sm leading-normal text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
