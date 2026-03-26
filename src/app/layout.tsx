import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.agrisoko254.com"),
  title: {
    default: "Agrisoko | Kenya's Agricultural Marketplace",
    template: "%s | Agrisoko",
  },
  description:
    "Buy and sell produce, livestock, farm inputs, and services in Kenya. Verified trust signals, direct trade, and practical market access for farmers.",
  keywords: [
    "kenya agriculture",
    "farm produce kenya",
    "buy maize kenya",
    "sell livestock kenya",
    "agrisoko",
  ],
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://www.agrisoko254.com",
    siteName: "Agrisoko",
    title: "Agrisoko | Kenya's Agricultural Marketplace",
    description: "Buy and sell produce, livestock, farm inputs, and services in Kenya.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agrisoko | Kenya's Agricultural Marketplace",
    description: "Buy and sell produce, livestock, farm inputs, and services in Kenya.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo192.png",
    apple: "/logo192.png",
    shortcut: "/favicon.ico",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.agrisoko254.com" },
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
