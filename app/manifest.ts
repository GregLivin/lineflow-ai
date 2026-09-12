import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LineFlow AI",
    short_name: "LineFlow",
    description: "Real-time material request and delivery system for production teams.",
    start_url: "/",
    display: "standalone",
    background_color: "#08111f",
    theme_color: "#0b1220",
    orientation: "any",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
