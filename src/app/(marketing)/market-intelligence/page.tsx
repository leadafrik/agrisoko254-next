import type { Metadata } from "next";
import MarketIntelligenceExplorer from "@/components/intelligence/MarketIntelligenceExplorer";
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
  alternates: { canonical: "https://www.agrisoko254.com/market-intelligence" },
};

export default async function MarketIntelligencePage() {
  const payload = await serverFetch<any>(API_ENDPOINTS.marketIntelligence.overview, {
    revalidate: 300,
  });
  const overview = payload
    ? normalizeIntelligenceOverview(payload)
    : getFallbackIntelligenceOverview();

  return <MarketIntelligenceExplorer initialOverview={overview} />;
}
