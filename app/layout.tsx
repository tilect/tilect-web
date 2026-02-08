import type { Metadata } from "next";
import "./globals.css";

const description =
  "Decentralized arts collective aiming to recover Barcelona's local artistic meritocracy through a phygital community.";

export const metadata: Metadata = {
  title: "Tilect.art",
  description,
  metadataBase: new URL("https://www.tilect.art/"),
  openGraph: {
    type: "website",
    url: "https://www.tilect.art/",
    title: "Tilect.art",
    description,
    images: ["/tilect_logo512.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tilect.art",
    description,
    images: ["/tilect_logo512.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/tilect_logo192.png",
  },
  manifest: "/manifest.json",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
