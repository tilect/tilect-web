"use client";

import { submitTShirtOrder } from "@/src/actions/shirts";
import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Input } from "@/src/components/ui/Input";
import { Display, Text } from "@/src/components/ui/typography";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { SizeSelector } from "./SizeSelector";
import { TShirtGallery } from "./TShirtGallery";
import { TypeSelector } from "./TypeSelector";
import { tshirtFormSchema, type Size, type SleeveType } from "./schema";

/* ------------------------------------------------------------------ */
/*  CopyButton — small inline button to copy text to clipboard         */
/* ------------------------------------------------------------------ */

function CopyButton({
  text,
  toastMessage,
}: {
  text: string;
  toastMessage: string;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(toastMessage);
    } catch {
      /* fallback: select-all + copy */
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success(toastMessage);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
      aria-label="Copy"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  TShirtForm                                                         */
/* ------------------------------------------------------------------ */

/**
 * TShirtForm — full pre-registration form for t-shirts.
 * Manages state, validates with Zod, and submits to Google Sheets via server action.
 */
export function TShirtForm() {
  const t = useTranslations("shirts");

  /* ---- form state ---- */
  const [sleeveType, setSleeveType] = useState<SleeveType | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paid, setPaid] = useState(false);

  /* ---- ui state ---- */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /* ---- handlers ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      fullName,
      email,
      phone,
      size: size ?? "",
      type: sleeveType ?? "",
      paid,
    };

    const result = tshirtFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = t(`errors.${field}`);
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitTShirtOrder(result.data);

      if (response.success) {
        setIsSubmitted(true);
        toast.success(t("successTitle"), {
          description: t("successMessage"),
        });
      } else {
        toast.error(t("errorMessage"));
      }
    } catch {
      toast.error(t("errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- success state ---- */
  if (isSubmitted) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <Display size="xs">{t("successTitle")}</Display>
        <Text className="text-foreground/70">{t("successMessage")}</Text>
      </div>
    );
  }

  /* ---- form ---- */
  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
      {/* Image gallery */}
      <TShirtGallery />

      {/* Product details (italic, extra small) */}
      <div className="flex flex-col gap-1.5">
        <Text size="xs" italic className="text-foreground/60">
          {t("productDetails")}
        </Text>
        <Text size="xs" italic className="text-foreground/60">
          {t("careInstructions")}
        </Text>
        <Text size="xs" italic className="text-foreground/60">
          {t("certifications")}
        </Text>
      </div>

      {/* Sleeve type selection */}
      <div>
        <Text weight="bold" className="mb-3">
          {t("selectType")}
        </Text>
        <TypeSelector value={sleeveType} onChange={setSleeveType} />
        {errors.type && (
          <Text size="sm" className="mt-1.5 text-red-500">
            {errors.type}
          </Text>
        )}
      </div>

      {/* Size selection */}
      <div>
        <Text weight="bold" className="mb-2">
          {t("selectSize")}
        </Text>
        <Text size="xs" className="mb-3 text-foreground/60">
          {t("sizeGuide")}
        </Text>
        <SizeSelector value={size} onChange={setSize} />
        {errors.size && (
          <Text size="sm" className="mt-1.5 text-red-500">
            {errors.size}
          </Text>
        )}
      </div>

      {/* Personal info */}
      <Input
        label={t("fullName")}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
        id="fullName"
        autoComplete="name"
      />

      <Input
        label={t("email")}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        id="email"
        autoComplete="email"
      />

      <Input
        label={t("phone")}
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        id="phone"
        autoComplete="tel"
      />

      {/* Payment instructions */}
      <div className="rounded-lg border border-foreground/10 p-4">
        <Text weight="bold" className="mb-3">
          {t("paymentTitle")}
        </Text>
        <div className="flex flex-col gap-3">
          {/* Step 1 */}
          <Text size="sm">
            {"1. "}
            {t("paymentStep1")}
          </Text>
          <div className="ml-4 flex flex-col gap-2">
            {/* Phone for Bizum — tel: link */}
            <div>
              <Text size="xs" className="text-foreground/60">
                {t("paymentPhoneLabel")}
              </Text>
              <a
                href={`tel:${t("paymentPhoneValue")}`}
                className="font-text text-sm font-bold underline underline-offset-2"
              >
                {t("paymentPhoneValue")}
              </a>
            </div>
            {/* IBAN — with copy button */}
            <div>
              <Text size="xs" className="text-foreground/60">
                {t("paymentIbanLabel")}
              </Text>
              <div className="flex items-center gap-2">
                <Text size="sm" weight="bold" as="span">
                  {t("paymentIbanValue")}
                </Text>
                <CopyButton
                  text={t("paymentIbanValue")}
                  toastMessage={t("copied")}
                />
              </div>
            </div>
            {/* Subject — with copy button */}
            <div>
              <Text size="xs" className="text-foreground/60">
                {t("paymentSubjectLabel")}
              </Text>
              <div className="flex items-center gap-2">
                <Text size="sm" weight="bold" as="span">
                  {t("paymentSubjectValue")}
                </Text>
                <CopyButton
                  text={t("paymentSubjectValue")}
                  toastMessage={t("copied")}
                />
              </div>
            </div>
          </div>
          {/* Step 2 */}
          <Text size="sm">
            {"2. "}
            {t("paymentStep2")}
          </Text>
          {/* Step 3 */}
          <Text size="sm">
            {"3. "}
            {t("paymentStep3")}
          </Text>
        </div>
      </div>

      {/* Payment confirmation */}
      <Checkbox
        label={t("paidCheckbox")}
        checked={paid}
        onChange={(e) => setPaid(e.target.checked)}
        error={errors.paid}
        id="paid"
      />

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
