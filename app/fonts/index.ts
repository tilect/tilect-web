import localFont from "next/font/local";

/**
 * Doner font family — local .woff2 files loaded via next/font for optimization.
 * Weights: Light (300), Regular (400), Bold (700), Black (900); normal + italic.
 */
export const doner = localFont({
  src: [
    {
      path: "./Doner-Text/Doner-LightText.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./Doner-Text/Doner-LightTextItalic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "./Doner-Text/Doner-RegularText.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Doner-Text/Doner-RegularTextItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./Doner-Text/Doner-BoldText.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./Doner-Text/Doner-BoldTextItalic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "./Doner-Text/Doner-BlackText.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "./Doner-Text/Doner-BlackTextItalic.woff2",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-doner",
  display: "swap",
});

export const donerDisplay = localFont({
  src: [
    {
      path: "./Doner-Display/Doner-LightDisplay.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./Doner-Display/Doner-LightDisplayItalic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "./Doner-Display/Doner-RegularDisplay.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Doner-Display/Doner-RegularDisplayItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./Doner-Display/Doner-BoldDisplay.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./Doner-Display/Doner-BoldDisplayItalic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "./Doner-Display/Doner-BlackDisplay.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "./Doner-Display/Doner-BlackDisplayItalic.woff2",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-doner-display",
  display: "swap",
});
