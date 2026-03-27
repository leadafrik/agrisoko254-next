import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Agrisoko - Kenya's Agricultural Marketplace",
    short_name: "Agrisoko",
    description:
      "Buy and sell produce, livestock, farm inputs, and services across Kenya. Live price intelligence, verified sellers, and direct trade.",
    scope: "/",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#a0452e",
    orientation: "portrait-primary",
    categories: ["shopping", "food", "business", "productivity"],
    lang: "en-KE",
    icons: [
      { src: "/logo192.png", sizes: "192x192", type: "image/png" },
      { src: "/logo512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
      },
    ],
  };
}
