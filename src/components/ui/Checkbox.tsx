import type { InputHTMLAttributes } from "react";

export type CheckboxProps = {
  /** Label text displayed beside the checkbox. */
  label?: string;
  /** Error message displayed below the checkbox. */
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Checkbox — large touch-target checkbox with label and error state.
 *
 * @example
 * <Checkbox label="I agree" checked={agreed} onChange={handleChange} id="agree" />
 */
export function Checkbox({
  label,
  error,
  className = "",
  id,
  ...props
}: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-3 py-2"
      >
        <input
          type="checkbox"
          id={id}
          className={[
            "h-5 w-5 shrink-0 cursor-pointer rounded border-foreground/20 accent-foreground",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        <span className="font-text text-base leading-normal">{label}</span>
      </label>
      {error && (
        <p className="font-text text-sm leading-normal text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
