import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CommodityIntelligenceExplorer from "@/components/intelligence/CommodityIntelligenceExplorer";
import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  getFallbackProductHistory,
  getFallbackProductSnapshot,
  normalizeIntelligenceHistory,
  normalizeIntelligenceProduct,
} from "@/lib/market-intelligence";

type Props = {
  params: {
    productKey: string;
  };
};

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const fallback = getFallbackProductSnapshot(params.productKey);
  const live = await serverFetch<any>(API_ENDPOINTS.marketIntelligence.byProduct(params.productKey), {
    revalidate: 300,
  });
  const product = normalizeIntelligenceProduct(live, params.productKey) || fallback;

  if (!product) {
    return {
      title: "Commodity Intelligence | Agrisoko",
    };
  }

  return {
    title: `${product.productName} Market Intelligence | Agrisoko`,
    description:
      `${product.productName} price signals across Kenyan markets, including best places to sell, trend direction, and reviewed market submissions.`,
    alternates: {
      canonical: `https://www.agrisoko254.com/market-intelligence/${product.productKey}`,
    },
  };
}

export default async function CommodityIntelligencePage({ params }: Props) {
  const [productPayload, historyPayload] = await Promise.all([
    serverFetch<any>(API_ENDPOINTS.marketIntelligence.byProduct(params.productKey), {
      revalidate: 300,
    }),
    serverFetch<any>(API_ENDPOINTS.marketIntelligence.history(params.productKey), {
      revalidate: 300,
    }),
  ]);

  const product =
    normalizeIntelligenceProduct(productPayload, params.productKey) ||
    getFallbackProductSnapshot(params.productKey);
  const history =
    normalizeIntelligenceHistory(historyPayload, params.productKey) ||
    getFallbackProductHistory(params.productKey);

  if (!product || !history) notFound();

  return (
    <CommodityIntelligenceExplorer initialProduct={product} initialHistory={history} />
  );
}
