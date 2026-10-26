import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TILECT",
    short_name: "TILECT",
    description:
      "Associació cultural de Barcelona. Comunitat, esdeveniments i pòdcasts al voltant de la música electrònica i la creació audiovisual.",
    lang: "ca",
    start_url: "/",
    display: "standalone",
    background_color: "#1d1d1b",
    theme_color: "#1d1d1b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
