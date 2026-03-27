import type { Metadata } from "next";
import MarketIntelligenceExplorer from "@/components/intelligence/MarketIntelligenceExplorer";
import JsonLd from "@/components/seo/JsonLd";
import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  getFallbackIntelligenceOverview,
  normalizeIntelligenceOverview,
} from "@/lib/market-intelligence";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Market Intelligence | Agrisoko",
  description:
    "Live Kenyan agricultural price signals, best markets to sell, fertilizer tracking, and contribution links built from reviewed field reports.",
  keywords: [
    "market intelligence kenya",
    "maize price kenya",
    "onion price kenya",
    "fertilizer price kenya",
    "farm gate prices kenya",
    "agricultural market prices kenya",
    "agrisoko market intelligence",
  ],
  alternates: { canonical: "https://www.agrisoko254.com/market-intelligence" },
  openGraph: {
    type: "website",
    url: "https://www.agrisoko254.com/market-intelligence",
    title: "Kenya Market Intelligence | Agrisoko",
    description:
      "Live Kenyan price signals, best markets to sell, cheapest markets to buy, and reviewed field reports.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kenya Market Intelligence | Agrisoko",
    description:
      "Live commodity and input price signals for Kenyan farmers, traders, and buyers.",
  },
};

export default async function MarketIntelligencePage() {
  const payload = await serverFetch<any>(API_ENDPOINTS.marketIntelligence.overview, {
    revalidate: 300,
  });
  const overview = payload
    ? normalizeIntelligenceOverview(payload)
    : getFallbackIntelligenceOverview();

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Agrisoko Market Intelligence Kenya",
    description:
      "Live Kenyan agricultural market signals built from reviewed field reports across produce, livestock, and farm inputs.",
    url: "https://www.agrisoko254.com/market-intelligence",
    provider: {
      "@type": "Organization",
      name: "Agrisoko",
      url: "https://www.agrisoko254.com",
    },
    spatialCoverage: { "@type": "Place", name: "Kenya" },
    keywords: overview.meta.commoditiesCovered,
  };

  return (
    <>
      <JsonLd data={datasetSchema} />
      <MarketIntelligenceExplorer initialOverview={overview} />
    </>
  );
}
