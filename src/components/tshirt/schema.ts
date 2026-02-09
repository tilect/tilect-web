import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export const SLEEVE_TYPES = ["short", "long"] as const;
export type SleeveType = (typeof SLEEVE_TYPES)[number];

/** Chest-width measurements per size. */
export const SIZE_MEASUREMENTS: Record<Size, string> = {
  XS: "47.5cm",
  S: "49.5cm",
  M: "53.5cm",
  L: "56.5cm",
  XL: "59.5cm",
};

/* ------------------------------------------------------------------ */
/*  Validation schema                                                  */
/* ------------------------------------------------------------------ */

export const tshirtFormSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z
    .string()
    .min(6)
    .regex(/^[+\d\s()\-]+$/),
  size: z.enum(SIZES),
  type: z.enum(SLEEVE_TYPES),
  paid: z.boolean().refine((v) => v === true),
  termsAccepted: z.boolean().refine((v) => v === true),
});

export type TShirtFormData = z.infer<typeof tshirtFormSchema>;
