import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  MapPinned,
  MessageSquareShare,
  Minus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import InvitePriceButton from "@/components/intelligence/InvitePriceButton";
import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  buildPriceContributionHref,
  formatIntelligenceDate,
  formatKes,
  formatTrendLabel,
  getDealSignal,
  getFallbackProductSnapshot,
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

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

export default async function CommodityIntelligencePage({ params }: Props) {
  const payload = await serverFetch<any>(API_ENDPOINTS.marketIntelligence.byProduct(params.productKey), {
    revalidate: 300,
  });
  const product =
    normalizeIntelligenceProduct(payload, params.productKey) ||
    getFallbackProductSnapshot(params.productKey);

  if (!product) notFound();

  const TrendIcon = trendIcon[product.overallTrendDirection];

  return (
    <div className="page-shell py-10 sm:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link href="/market-intelligence" className="hover:text-terra-600">
          Market intelligence
        </Link>
        <span className="text-stone-300">/</span>
        <span className="font-medium text-stone-700">{product.productName}</span>
      </nav>

      <section className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="section-kicker">{product.productName}</p>
            <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">
              {product.bestMarket?.county} is currently the strongest place to sell.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">{product.insight}</p>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-stone-600">
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                {product.unit}
              </span>
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                {product.submissionsCount} approved reports
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                <TrendIcon className="h-3.5 w-3.5" />
                {formatTrendLabel(
                  product.overallTrendDirection,
                  product.overallTrendPercentage
                )}
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={buildPriceContributionHref({
                  productKey: product.productKey,
                  county: product.bestMarket?.county,
                  marketName: product.bestMarket?.marketName,
                  unit: product.unit,
                })}
                className="primary-button"
              >
                Submit today&apos;s {product.productName.toLowerCase()} price
              </Link>
              <InvitePriceButton
                productKey={product.productKey}
                productName={product.productName}
                county={product.bestMarket?.county}
                marketName={product.bestMarket?.marketName}
                unit={product.unit}
              />
            </div>

            {product.isFallback ? (
              <p className="mt-4 text-sm text-stone-500">
                This is Agrisoko&apos;s starter board for {product.productName.toLowerCase()}. Live
                approved submissions will replace these reference signals automatically.
              </p>
            ) : null}
          </div>

          <div className="surface-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Decision summary
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Best market to sell
                </p>
                <h2 className="mt-2 text-2xl font-bold text-stone-900">
                  {product.bestMarket?.marketName}
                </h2>
                <p className="mt-2 text-sm text-stone-600">{product.bestMarket?.county}</p>
                <p className="mt-3 text-2xl font-bold text-terra-600">
                  {formatKes(product.bestMarket?.avgPrice || 0)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-stone-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Lowest market
                  </p>
                  <p className="mt-2 text-lg font-bold text-stone-900">
                    {product.weakestMarket?.county}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    {formatKes(product.weakestMarket?.avgPrice || 0)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-stone-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Last updated
                  </p>
                  <p className="mt-2 text-lg font-bold text-stone-900">
                    {formatIntelligenceDate(product.lastUpdated)}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    Reviewed market submissions only
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">By market</p>
            <h2 className="mt-3 text-3xl font-bold text-stone-900">
              Compare current price signals market by market
            </h2>
          </div>
          <Link
            href="/market-intelligence/submit"
            className="hidden text-sm font-semibold text-terra-600 hover:text-terra-700 sm:inline-flex"
          >
            Add another report
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {product.markets.map((market) => (
            <article key={market.marketKey} className="surface-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    {market.marketName}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-stone-900">{market.county}</h3>
                </div>
                <span className="rounded-full bg-terra-50 px-3 py-1 text-xs font-semibold text-terra-700">
                  {getDealSignal(product, market)}
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-terra-600">{formatKes(market.avgPrice)}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
                <span className="rounded-full border border-stone-200 px-3 py-1">
                  {formatTrendLabel(market.trendDirection, market.trendPercentage)}
                </span>
                <span className="rounded-full border border-stone-200 px-3 py-1">
                  {market.submissionsCount} reports
                </span>
              </div>

              <div className="mt-5 rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4 text-sm text-stone-600">
                <p className="flex items-start gap-2">
                  <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  Updated {formatIntelligenceDate(market.lastUpdated)}
                </p>
                <p className="mt-2">
                  Trading range: {formatKes(market.minPrice)} to {formatKes(market.maxPrice)}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  href={buildPriceContributionHref({
                    productKey: product.productKey,
                    county: market.county,
                    marketName: market.marketName,
                    unit: product.unit,
                  })}
                  className="primary-button w-full"
                >
                  Report this market
                </Link>
                <InvitePriceButton
                  productKey={product.productKey}
                  productName={product.productName}
                  county={market.county}
                  marketName={market.marketName}
                  unit={product.unit}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="surface-panel p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-700">
              <MessageSquareShare className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                How to use this board
              </p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">
                Use it to decide, then go to market fast.
              </h2>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-stone-600">
            <p>
              If you are selling, start with the strongest market signal and compare the transport
              cost against the price gap.
            </p>
            <p>
              If you are buying, watch the lowest-priced markets and ask contributors to confirm
              whether the price reflects oversupply, lower quality, or urgent selling.
            </p>
            <p>
              If the spread between markets is wide, it usually means there is real arbitrage or
              timing value to capture.
            </p>
          </div>
        </div>

        <div className="surface-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Recent approved reports
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(product.recentContributions || []).slice(0, 6).map((entry) => (
              <div
                key={entry.id}
                className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {entry.marketName}
                </p>
                <h3 className="mt-2 text-xl font-bold text-stone-900">
                  {formatKes(entry.price)}
                </h3>
                <p className="mt-1 text-sm text-stone-600">{entry.county}</p>
                <p className="mt-3 text-xs text-stone-500">
                  {entry.contributorName} • {formatIntelligenceDate(entry.observationDate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14 flex justify-between gap-4 rounded-[30px] border border-stone-200 bg-white p-6">
        <div>
          <p className="text-sm font-semibold text-stone-900">
            Want to strengthen this {product.productName.toLowerCase()} signal?
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Share one clean contribution link with your network and keep the board fresh.
          </p>
        </div>
        <Link
          href="/market-intelligence"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-terra-600 hover:text-terra-700"
        >
          Back to intelligence hub
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
