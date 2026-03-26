import type { Metadata } from "next";
import PriceSubmissionForm from "@/components/intelligence/PriceSubmissionForm";
import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  getFallbackIntelligenceOverview,
  normalizeIntelligenceOverview,
} from "@/lib/market-intelligence";

type Props = {
  searchParams: {
    product?: string | string[];
    county?: string | string[];
    market?: string | string[];
    unit?: string | string[];
  };
};

export const metadata: Metadata = {
  title: "Submit Market Price | Agrisoko",
  description:
    "Share a current market price on Agrisoko to help build cleaner Kenyan agricultural intelligence.",
  alternates: { canonical: "https://www.agrisoko254.com/market-intelligence/submit" },
};

const getSingleValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function MarketIntelligenceSubmitPage({ searchParams }: Props) {
  const payload = await serverFetch<any>(API_ENDPOINTS.marketIntelligence.overview, {
    revalidate: 60,
  });
  const initialOverview = payload
    ? normalizeIntelligenceOverview(payload)
    : getFallbackIntelligenceOverview();

  return (
    <div className="page-shell py-10 sm:py-12">
      <PriceSubmissionForm
        initialOverview={initialOverview}
        defaults={{
          product: getSingleValue(searchParams.product),
          county: getSingleValue(searchParams.county),
          market: getSingleValue(searchParams.market),
          unit: getSingleValue(searchParams.unit),
        }}
      />
    </div>
  );
}
