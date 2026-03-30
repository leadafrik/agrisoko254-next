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

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const fallback = getFallbackProductSnapshot(params.productKey);
  const live = await serverFetch<any>(API_ENDPOINTS.marketIntelligence.byProduct(params.productKey), {
    revalidate: 120,
  });
  const product = normalizeIntelligenceProduct(live, params.productKey) || fallback;

  if (!product) {
    return {
      title: "Commodity Intelligence | Agrisoko",
    };
  }

  const avg = product.overallAverage > 0 ? `KES ${product.overallAverage.toLocaleString()}` : null;
  const best = product.bestMarket
    ? `Best market: ${product.bestMarket.marketName} (${product.bestMarket.county}) at KES ${product.bestMarket.avgPrice.toLocaleString()}.`
    : null;
  const updatedDate = product.lastUpdated
    ? new Date(product.lastUpdated).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "recently";

  const descParts = [
    `Live ${product.productName.toLowerCase()} price signals across ${product.approvedMarkets} Kenyan markets.`,
    avg ? `Board average: ${avg} / ${product.unit}.` : null,
    best,
    `${product.submissionsCount} reviewed field reports. Updated ${updatedDate}.`,
  ].filter(Boolean);
  const updatedKey = encodeURIComponent(product.lastUpdated || product.generatedAt || "live");
  const shareImageUrl = `/market-intelligence/${product.productKey}/opengraph-image?updated=${updatedKey}`;

  return {
    title: `${product.productName} Price Kenya ${new Date().getFullYear()} | Live Market Intelligence | Agrisoko`,
    description: descParts.join(" "),
    keywords: [
      `${product.productName.toLowerCase()} price kenya`,
      `${product.productName.toLowerCase()} price ${new Date().getFullYear()}`,
      `${product.productName.toLowerCase()} market kenya`,
      `buy ${product.productName.toLowerCase()} kenya`,
      `sell ${product.productName.toLowerCase()} kenya`,
      `${product.productName.toLowerCase()} price nairobi`,
      `agrisoko ${product.productName.toLowerCase()}`,
    ],
    alternates: {
      canonical: `https://agrisoko254.com/market-intelligence/${product.productKey}`,
    },
    openGraph: {
      type: "website",
      url: `https://agrisoko254.com/market-intelligence/${product.productKey}`,
      title: `${product.productName} Prices Kenya - Live Market Board`,
      description: descParts.join(" "),
      images: [
        {
          url: shareImageUrl,
          width: 1200,
          height: 630,
          alt: `${product.productName} live market snapshot on Agrisoko`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.productName} Price Kenya | Agrisoko`,
      description: descParts.slice(0, 2).join(" "),
      images: [shareImageUrl],
    },
  };
}

export default async function CommodityIntelligencePage({ params }: Props) {
  const [productPayload, historyPayload] = await Promise.all([
    serverFetch<any>(API_ENDPOINTS.marketIntelligence.byProduct(params.productKey), {
      revalidate: 120,
    }),
    serverFetch<any>(API_ENDPOINTS.marketIntelligence.history(params.productKey), {
      revalidate: 120,
    }),
  ]);

  const product =
    normalizeIntelligenceProduct(productPayload, params.productKey) ||
    getFallbackProductSnapshot(params.productKey);
  const history =
    normalizeIntelligenceHistory(historyPayload, params.productKey) ||
    getFallbackProductHistory(params.productKey);

  if (!product || !history) notFound();

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${product.productName} Price Intelligence Kenya ${new Date().getFullYear()}`,
    description: `Live ${product.productName.toLowerCase()} price data across ${product.approvedMarkets} Kenyan markets. ${product.submissionsCount} reviewed field reports from farmers and traders.`,
    keywords: [
      `${product.productName.toLowerCase()} price kenya`,
      `kenya ${product.productName.toLowerCase()} market`,
      "agricultural price data kenya",
      "market intelligence kenya",
      "agrisoko",
    ],
    url: `https://agrisoko254.com/market-intelligence/${product.productKey}`,
    provider: {
      "@type": "Organization",
      name: "Agrisoko",
      url: "https://agrisoko254.com",
    },
    spatialCoverage: { "@type": "Place", name: "Kenya" },
    temporalCoverage: new Date().getFullYear().toString(),
    measurementTechnique: "Field reports from farmers and traders, reviewed by Agrisoko team.",
    variableMeasured: `${product.productName} wholesale and retail prices per ${product.unit}`,
    license: "https://creativecommons.org/licenses/by/4.0/",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Market Intelligence",
        item: "https://agrisoko254.com/market-intelligence",
      },
      { "@type": "ListItem", position: 2, name: product.productName },
    ],
  };

  const updatedLabel = product.lastUpdated
    ? new Date(product.lastUpdated).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })
    : "recently";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Server-rendered price summary — visible to crawlers and AI engines */}
      <div className="max-w-4xl mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <p className="text-sm text-stone-600 leading-relaxed">
          <strong>{product.productName} price in Kenya ({new Date().getFullYear()}):</strong>{" "}
          Board average KES {product.overallAverage.toLocaleString()} per {product.unit} across {product.approvedMarkets} markets.{" "}
          {product.bestMarket && (
            <>Best price: KES {product.bestMarket.avgPrice.toLocaleString()} at {product.bestMarket.marketName}, {product.bestMarket.county}. </>
          )}
          {product.weakestMarket && (
            <>Lowest signal: KES {product.weakestMarket.avgPrice.toLocaleString()} at {product.weakestMarket.marketName}. </>
          )}
          Based on {product.submissionsCount} reviewed field reports. Updated {updatedLabel}.
        </p>
        {product.insight && (
          <p className="mt-2 text-sm text-stone-500 italic">{product.insight}</p>
        )}
        {product.markets && product.markets.length > 0 && (
          <ul className="mt-3 sr-only">
            {product.markets.map((m) => (
              <li key={m.marketKey}>
                {m.marketName}, {m.county}: KES {m.avgPrice.toLocaleString()} per {product.unit}
                {m.notes ? ` — ${m.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      <CommodityIntelligenceExplorer initialProduct={product} initialHistory={history} />
    </>
  );
}
