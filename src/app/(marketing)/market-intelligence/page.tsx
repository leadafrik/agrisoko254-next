import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleDot,
  FlaskConical,
  MapPinned,
  Megaphone,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import InvitePriceButton from "@/components/intelligence/InvitePriceButton";
import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  formatIntelligenceDate,
  formatKes,
  formatTrendLabel,
  getFallbackIntelligenceOverview,
  normalizeIntelligenceOverview,
} from "@/lib/market-intelligence";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Market Intelligence | Agrisoko",
  description:
    "Crowdsourced Kenyan agricultural market intelligence with current price signals, best markets to sell, fertilizer pricing, and contribution links.",
  alternates: { canonical: "https://www.agrisoko254.com/market-intelligence" },
};

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

export default async function MarketIntelligencePage() {
  const payload = await serverFetch<any>(API_ENDPOINTS.marketIntelligence.overview, {
    revalidate: 300,
  });
  const overview = normalizeIntelligenceOverview(payload);
  const produceBoard =
    overview.produceBoard.length > 0
      ? overview.produceBoard
      : getFallbackIntelligenceOverview().produceBoard;
  const fertilizerBoard =
    overview.fertilizerBoard.length > 0
      ? overview.fertilizerBoard
      : getFallbackIntelligenceOverview().fertilizerBoard;

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="section-kicker">Market intelligence</p>
            <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">
              What should you do with your crops today?
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              Agrisoko combines field-reported prices, reviewed submissions, and clean market
              comparisons so farmers, traders, and institutional buyers can act with more clarity.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/market-intelligence/submit" className="primary-button">
                Submit today&apos;s price
              </Link>
              <Link href="/browse" className="secondary-button">
                Browse marketplace
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-stone-600">
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                {overview.meta.approvedSubmissions || 0} approved reports in the current board
              </span>
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                {overview.meta.trackedMarkets || 0} tracked county markets
              </span>
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 font-medium">
                Updated {formatIntelligenceDate(overview.generatedAt)}
              </span>
            </div>

            {overview.isFallback ? (
              <p className="mt-4 max-w-2xl text-sm text-stone-500">
                You are seeing the Agrisoko starter board while live verified submissions build up.
                New approved reports will automatically replace these reference signals.
              </p>
            ) : null}
          </div>

          <div className="surface-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Best markets to sell now
            </p>
            <div className="mt-4 space-y-3">
              {produceBoard.slice(0, 3).map((item) => (
                <div
                  key={item.productKey}
                  className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
                        {item.productName}
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-stone-900">
                        {item.bestMarket?.county}
                      </h2>
                    </div>
                    <span className="rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-700">
                      {formatKes(item.bestMarket?.avgPrice || 0)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Today&apos;s prices</p>
            <h2 className="mt-3 text-3xl font-bold text-stone-900">
              Live commodity signals by market
            </h2>
          </div>
          <Link
            href="/market-intelligence/submit"
            className="hidden text-sm font-semibold text-terra-600 hover:text-terra-700 sm:inline-flex"
          >
            Add a price report
          </Link>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {produceBoard.map((item) => {
            const TrendIcon = trendIcon[item.overallTrendDirection];

            return (
              <article key={item.productKey} className="surface-card p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-terra-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-700">
                        {item.productName}
                      </span>
                      <span className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-500">
                        {item.unit}
                      </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-bold text-stone-900">
                      {item.bestMarket?.county} is currently the strongest selling signal
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.insight}</p>

                    <div className="mt-5 flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full border border-stone-200 px-3 py-1.5 font-semibold text-stone-700">
                        {formatKes(item.bestMarket?.avgPrice || 0)} best price
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 font-semibold text-stone-700">
                        <TrendIcon className="h-3.5 w-3.5" />
                        {formatTrendLabel(item.overallTrendDirection, item.overallTrendPercentage)}
                      </span>
                      <span className="rounded-full border border-stone-200 px-3 py-1.5 font-semibold text-stone-700">
                        {item.submissionsCount} approved reports
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full max-w-sm flex-col gap-3">
                    <Link
                      href={`/market-intelligence/${item.productKey}`}
                      className="primary-button w-full"
                    >
                      Open {item.productName} board
                    </Link>
                    <InvitePriceButton
                      productKey={item.productKey}
                      productName={item.productName}
                      county={item.bestMarket?.county}
                      marketName={item.bestMarket?.marketName}
                      unit={item.unit}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {item.markets.slice(0, 4).map((market) => (
                    <div
                      key={market.marketKey}
                      className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                        {market.marketName}
                      </p>
                      <h4 className="mt-2 text-lg font-bold text-stone-900">{market.county}</h4>
                      <p className="mt-3 text-xl font-bold text-terra-600">
                        {formatKes(market.avgPrice)}
                      </p>
                      <p className="mt-2 text-xs font-medium text-stone-500">
                        {formatTrendLabel(market.trendDirection, market.trendPercentage)}
                      </p>
                      <p className="mt-2 text-xs text-stone-500">
                        {market.submissionsCount} reports • Updated{" "}
                        {formatIntelligenceDate(market.lastUpdated)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="surface-card p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3ea] text-forest-700">
                    <MapPinned className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Best market to sell
              </p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">
                The useful question is not just price. It is location.
              </h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {produceBoard.slice(0, 4).map((item) => (
              <div
                key={item.productKey}
                className="rounded-[22px] border border-stone-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{item.productName}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      Sell in {item.bestMarket?.marketName}, {item.bestMarket?.county}
                    </p>
                  </div>
                  <span className="rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-700">
                    {formatKes(item.bestMarket?.avgPrice || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2dd] text-amber-700">
              <FlaskConical className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Fertilizer monitor
              </p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">
                Input prices deserve the same discipline as crop prices.
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {fertilizerBoard.map((item) => (
              <div
                key={item.productKey}
                className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {item.unit}
                </p>
                <h3 className="mt-2 text-xl font-bold text-stone-900">{item.productName}</h3>
                <p className="mt-3 text-2xl font-bold text-terra-600">
                  {formatKes(item.bestMarket?.avgPrice || 0)}
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Highest observed in {item.bestMarket?.county}
                </p>
                <p className="mt-2 text-xs text-stone-500">{item.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="surface-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            How Agrisoko builds this
          </p>
          <div className="mt-5 space-y-4">
            {[
              {
                title: "Field reports first",
                copy: "Farmers, traders, agrovets, and the Agrisoko team submit current prices by product, market, and unit.",
              },
              {
                title: "Reviewed before publishing",
                copy: "Submissions do not hit the public board automatically. They are reviewed, cleaned, and approved first.",
              },
              {
                title: "Averages over single quotes",
                copy: "The board compares multiple reports so the signal is more useful than one isolated number.",
              },
            ].map((item, index) => (
              <div key={item.title} className="rounded-[22px] border border-stone-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terra-500 text-xs font-bold text-white">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-terra-50 text-terra-700">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Latest approved contributions
              </p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">
                Invite others to answer one practical question
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {overview.recentContributions.slice(0, 4).map((entry) => (
              <div
                key={entry.id}
                className="rounded-[22px] border border-stone-200 bg-[#fbf8f2] p-4"
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  <CircleDot className="h-3.5 w-3.5 text-forest-600" />
                  {entry.productName}
                </div>
                <h3 className="mt-3 text-xl font-bold text-stone-900">
                  {formatKes(entry.price)}
                </h3>
                <p className="mt-1 text-sm text-stone-600">
                  {entry.marketName}, {entry.county}
                </p>
                <p className="mt-3 text-xs text-stone-500">
                  Submitted by {entry.contributorName} • {formatIntelligenceDate(entry.observationDate)}
                </p>
                <div className="mt-4">
                  <InvitePriceButton
                    productKey={entry.productKey}
                    productName={entry.productName}
                    county={entry.county}
                    marketName={entry.marketName}
                    unit={entry.unit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-terra-200 hover:text-terra-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14 overflow-hidden rounded-[32px] bg-gradient-to-br from-stone-900 via-stone-800 to-[#4b2b1f] p-8 text-white shadow-[0_26px_72px_-44px_rgba(28,25,23,0.55)] sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Help build the board
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Invite your buyers, farmers, and agrovets into one cleaner pricing loop.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
              The best intelligence board in Kenya will be built one credible market report at a
              time. Start with one product, one market, and one clean contribution link.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link href="/market-intelligence/submit" className="secondary-button border-white/20 bg-white text-stone-900 hover:bg-stone-100">
              Submit today&apos;s price
            </Link>
            <Link
              href="/market-intelligence/maize"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open maize board
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
