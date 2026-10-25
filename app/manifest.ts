import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tilect",
    short_name: "Tilect",
    description:
      "Decentralized arts collective aiming to recover Barcelona's local artistic meritocracy through a phygital community.",
    start_url: "/",
    display: "standalone",
    background_color: "#403b59",
    theme_color: "#403b59",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
