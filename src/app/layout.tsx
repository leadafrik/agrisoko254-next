import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://agrisoko254.com"),
  title: {
    default: "Agrisoko | Kenya's Agricultural Marketplace",
    template: "%s | Agrisoko",
  },
  description:
    "Kenya's agricultural marketplace - buy and sell produce, livestock, farm inputs, and services directly. Live price intelligence across all 47 counties. No middlemen.",
  keywords: [
    "agrisoko",
    "agrisoko kenya",
    "agrisoko254",
    "kenya agricultural marketplace",
    "kenya farming marketplace",
    "kenya farmers market online",
    "buy farm produce kenya",
    "sell farm produce kenya",
    "agricultural trade kenya",
    "buy maize kenya",
    "sell maize kenya",
    "maize price kenya",
    "unga price kenya",
    "buy onions kenya",
    "sell onions kenya",
    "buy tomatoes kenya",
    "buy potatoes kenya",
    "buy beans kenya",
    "buy vegetables kenya",
    "farm produce nairobi",
    "buy cattle kenya",
    "sell cattle kenya",
    "livestock market kenya",
    "buy goats kenya",
    "sell goats kenya",
    "buy poultry kenya",
    "broilers kenya",
    "buy dairy cows kenya",
    "livestock prices kenya",
    "farm inputs kenya",
    "seeds kenya",
    "fertilizer kenya",
    "animal feeds kenya",
    "farming tools kenya",
    "agrochemicals kenya",
    "farm services kenya",
    "agronomy services kenya",
    "tractor hire kenya",
    "spraying services kenya",
    "transport farm produce kenya",
    "maize price nairobi",
    "market prices kenya",
    "agricultural prices kenya",
    "farm gate prices kenya",
    "market intelligence kenya",
    "nairobi farm produce",
    "kiambu farming",
    "nakuru market",
    "meru produce",
    "kisumu agriculture",
    "eldoret grain market",
    "trans nzoia maize",
    "sell directly to buyer kenya",
    "buy directly from farmer kenya",
    "no middlemen kenya farming",
    "verified farmer kenya",
  ],
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://agrisoko254.com",
    siteName: "Agrisoko",
    title: "Agrisoko | Kenya's Agricultural Marketplace",
    description:
      "Kenya's agricultural marketplace - buy and sell produce, livestock, farm inputs, and services directly. Live price intelligence, verified sellers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agrisoko - Kenya's Agricultural Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agrisoko | Kenya's Agricultural Marketplace",
    description:
      "Buy and sell produce, livestock, farm inputs and services across Kenya. Live price intelligence. No middlemen.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/logo192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/logo192.png", sizes: "192x192", type: "image/png" }],
    shortcut: [{ url: "/logo192.png", sizes: "192x192", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://agrisoko254.com" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
