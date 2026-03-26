import type {
  IntelligenceMarket,
  IntelligenceProductSnapshot,
  TrendDirection,
} from "./market-intelligence";
import { formatKes } from "./market-intelligence";

const getLatestTimestamp = (values: Array<string | null | undefined>) => {
  const timestamps = values
    .map((value) => (value ? Date.parse(value) : Number.NaN))
    .filter((value) => Number.isFinite(value));

  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
};

const getWeightedAverage = (
  markets: IntelligenceMarket[],
  getValue: (market: IntelligenceMarket) => number
) => {
  const weighted = markets.reduce(
    (accumulator, market) => {
      const weight = Math.max(market.submissionsCount, 1);
      return {
        total: accumulator.total + getValue(market) * weight,
        weight: accumulator.weight + weight,
      };
    },
    { total: 0, weight: 0 }
  );

  if (!weighted.weight) return 0;
  return Number((weighted.total / weighted.weight).toFixed(1));
};

const getTrendDirection = (value: number): TrendDirection => {
  if (value >= 0.6) return "up";
  if (value <= -0.6) return "down";
  return "stable";
};

export function buildScopedProductSnapshot(
  product: IntelligenceProductSnapshot,
  markets: IntelligenceMarket[],
  scopeLabel?: string
): IntelligenceProductSnapshot {
  if (!markets.length) return product;

  const rankedMarkets = markets.slice().sort((left, right) => right.avgPrice - left.avgPrice);
  const trendAverage = getWeightedAverage(markets, (market) => market.trendPercentage);
  const totalReports = markets.reduce(
    (sum, market) => sum + Math.max(market.submissionsCount, 0),
    0
  );

  return {
    ...product,
    markets: rankedMarkets,
    approvedMarkets: rankedMarkets.length,
    submissionsCount: totalReports,
    overallAverage: getWeightedAverage(rankedMarkets, (market) => market.avgPrice),
    overallTrendPercentage: Math.abs(trendAverage),
    overallTrendDirection: getTrendDirection(trendAverage),
    bestMarket: rankedMarkets[0] || null,
    weakestMarket: rankedMarkets[rankedMarkets.length - 1] || null,
    lastUpdated:
      getLatestTimestamp([
        ...rankedMarkets.map((market) => market.lastUpdated),
        product.lastUpdated,
        product.generatedAt,
      ]) || product.lastUpdated,
    insight:
      scopeLabel && scopeLabel !== "all"
        ? `${product.productName} view narrowed to ${scopeLabel.toLowerCase()} with ${rankedMarkets.length} active market${rankedMarkets.length === 1 ? "" : "s"}.`
        : product.insight,
  };
}

export function buildProductPulseItems(
  product: IntelligenceProductSnapshot,
  focusMarket?: IntelligenceMarket | null
) {
  const items: string[] = [];
  const bestMarket = product.bestMarket;
  const weakestMarket = product.weakestMarket;

  if (bestMarket) {
    items.push(
      `${bestMarket.marketName}, ${bestMarket.county} leads at ${formatKes(bestMarket.avgPrice)} for ${product.unit.toLowerCase()}.`
    );
  }

  if (weakestMarket && bestMarket && weakestMarket.marketKey !== bestMarket.marketKey) {
    const spread = bestMarket.avgPrice - weakestMarket.avgPrice;
    items.push(
      `${weakestMarket.marketName}, ${weakestMarket.county} is the lowest read at ${formatKes(weakestMarket.avgPrice)}. Spread: ${formatKes(spread)}.`
    );
  }

  if (focusMarket) {
    const delta = focusMarket.avgPrice - product.overallAverage;
    const deltaLabel =
      Math.abs(delta) < 1
        ? "near the board average"
        : delta > 0
          ? `${formatKes(Math.abs(delta))} above the board average`
          : `${formatKes(Math.abs(delta))} below the board average`;
    items.push(
      `${focusMarket.marketName} is ${deltaLabel} with ${focusMarket.submissionsCount} approved report${focusMarket.submissionsCount === 1 ? "" : "s"}.`
    );
  }

  if (product.overallTrendDirection === "up") {
    items.push(
      `${product.productName} is rising across the board, with the strongest move at ${Math.abs(product.overallTrendPercentage).toFixed(1)}%.`
    );
  } else if (product.overallTrendDirection === "down") {
    items.push(
      `${product.productName} is easing, so buyers should compare cheaper markets before stock tightens again.`
    );
  } else {
    items.push(
      `${product.productName} is stable right now, so location quality and transport cost matter more than headline price noise.`
    );
  }

  return items.slice(0, 3);
}
