import {
  SEEDED_INTELLIGENCE_UPDATED_AT,
  SEEDED_MAIZE_RECENT_CONTRIBUTIONS,
  SEEDED_MAIZE_SNAPSHOT,
} from "./market-intelligence-seed";

export type IntelligenceCategory = "produce" | "livestock" | "inputs";
export type TrendDirection = "up" | "down" | "stable";

export type IntelligenceMarket = {
  marketKey: string;
  marketName: string;
  county: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  submissionsCount: number;
  currentWindowCount?: number;
  lastUpdated: string | null;
  trendDirection: TrendDirection;
  trendPercentage: number;
  notes?: string;
  sourceType?: string;
  sourceLabel?: string;
};

export type IntelligenceProductSnapshot = {
  productKey: string;
  productName: string;
  category: IntelligenceCategory;
  unit: string;
  submissionsCount: number;
  approvedMarkets: number;
  lastUpdated: string | null;
  overallAverage: number;
  overallTrendDirection: TrendDirection;
  overallTrendPercentage: number;
  bestMarket: IntelligenceMarket | null;
  weakestMarket: IntelligenceMarket | null;
  markets: IntelligenceMarket[];
  insight: string;
  recentContributions?: IntelligenceContribution[];
  generatedAt?: string;
  isFallback?: boolean;
};

export type IntelligenceContribution = {
  id: string;
  productKey: string;
  productName: string;
  county: string;
  marketName: string;
  price: number;
  unit: string;
  sourceType: string;
  contributorName: string;
  observationDate: string | null;
};

export type IntelligenceHistoryPoint = {
  id: string;
  county: string;
  marketName: string;
  price: number;
  unit: string;
  currency: string;
  observationDate: string | null;
  sourceType: string;
  sourceLabel: string;
  notes: string;
};

export type IntelligenceHistoryAverageRow = {
  county?: string;
  marketName?: string;
  date?: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  submissionsCount: number;
  lastUpdated: string | null;
};

export type IntelligenceProductHistory = {
  generatedAt: string;
  productKey: string;
  productName: string;
  unit: string;
  points: IntelligenceHistoryPoint[];
  summary: {
    count: number;
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
  };
  countyAverages: IntelligenceHistoryAverageRow[];
  marketAverages: IntelligenceHistoryAverageRow[];
  dailyAverageSeries: IntelligenceHistoryAverageRow[];
  isFallback?: boolean;
};

export type IntelligenceSubmissionFeedback = {
  reportsToday: number;
  currentAverage: number;
  approvedReportsInWindow: number;
  deltaPercentage: number;
  comparisonLabel: "above" | "below" | "near";
};

export type IntelligenceOverview = {
  generatedAt: string;
  meta: {
    approvedSubmissions: number;
    trackedProducts: number;
    trackedMarkets: number;
    commoditiesCovered: string[];
  };
  produceBoard: IntelligenceProductSnapshot[];
  livestockBoard: IntelligenceProductSnapshot[];
  fertilizerBoard: IntelligenceProductSnapshot[];
  topSignals: Array<{
    productKey: string;
    productName: string;
    trendDirection: TrendDirection;
    trendPercentage: number;
    bestCounty: string;
    bestMarketName: string;
    bestPrice: number;
    summary: string;
  }>;
  recentContributions: IntelligenceContribution[];
  isFallback?: boolean;
};

export const TRACKED_INTELLIGENCE_PRODUCTS = [
  { key: "maize", name: "Maize", category: "produce", defaultUnit: "90kg bag" },
  { key: "beans", name: "Beans", category: "produce", defaultUnit: "90kg bag" },
  { key: "tomatoes", name: "Tomatoes", category: "produce", defaultUnit: "crate" },
  { key: "onions", name: "Onions", category: "produce", defaultUnit: "net bag" },
  { key: "potatoes", name: "Potatoes", category: "produce", defaultUnit: "120kg bag" },
  { key: "beef", name: "Beef Cattle", category: "livestock", defaultUnit: "kg live weight" },
  { key: "broilers", name: "Broilers", category: "livestock", defaultUnit: "kg live weight" },
  { key: "dap-fertilizer", name: "DAP Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
  { key: "can-fertilizer", name: "CAN Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
  { key: "npk-fertilizer", name: "NPK Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
] as const;

export const TRACKED_INTELLIGENCE_MARKETS = [
  { county: "Nairobi", marketName: "Wakulima Market" },
  { county: "Uasin Gishu", marketName: "Eldoret Market" },
  { county: "Nakuru", marketName: "Nakuru Market" },
  { county: "Trans Nzoia", marketName: "Kitale Grain Belt" },
  { county: "Bungoma", marketName: "Bungoma Grain Desk" },
  { county: "Kirinyaga", marketName: "Mwea Town Grain Desk" },
  { county: "Migori", marketName: "Migori Town Market" },
  { county: "Kisumu", marketName: "Kibuye Market" },
  { county: "Mombasa", marketName: "Kongowea Market" },
  { county: "Meru", marketName: "Meru Town Market" },
  { county: "Kiambu", marketName: "Limuru Market" },
  { county: "Kajiado", marketName: "Kiserian Market" },
] as const;

const nowIso = SEEDED_INTELLIGENCE_UPDATED_AT;

const fallbackProduceBoard: IntelligenceProductSnapshot[] = [
  {
    ...SEEDED_MAIZE_SNAPSHOT,
    bestMarket: { ...SEEDED_MAIZE_SNAPSHOT.bestMarket },
    weakestMarket: { ...SEEDED_MAIZE_SNAPSHOT.weakestMarket },
    markets: SEEDED_MAIZE_SNAPSHOT.markets.map((market) => ({ ...market })),
  },
  {
    productKey: "beans",
    productName: "Beans",
    category: "produce",
    unit: "90kg bag",
    submissionsCount: 12,
    approvedMarkets: 3,
    lastUpdated: nowIso,
    overallAverage: 9760,
    overallTrendDirection: "up",
    overallTrendPercentage: 3.1,
    bestMarket: {
      marketKey: "beans-nairobi",
      marketName: "Wakulima Market",
      county: "Nairobi",
      avgPrice: 10400,
      minPrice: 10150,
      maxPrice: 10600,
      submissionsCount: 4,
      currentWindowCount: 4,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 4.8,
    },
    weakestMarket: {
      marketKey: "beans-meru",
      marketName: "Meru Town Market",
      county: "Meru",
      avgPrice: 9200,
      minPrice: 9050,
      maxPrice: 9340,
      submissionsCount: 4,
      currentWindowCount: 4,
      lastUpdated: nowIso,
      trendDirection: "stable",
      trendPercentage: 1.7,
    },
    markets: [
      {
        marketKey: "beans-nairobi",
        marketName: "Wakulima Market",
        county: "Nairobi",
        avgPrice: 10400,
        minPrice: 10150,
        maxPrice: 10600,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 4.8,
      },
      {
        marketKey: "beans-kisumu",
        marketName: "Kibuye Market",
        county: "Kisumu",
        avgPrice: 9680,
        minPrice: 9520,
        maxPrice: 9810,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 2.6,
      },
      {
        marketKey: "beans-meru",
        marketName: "Meru Town Market",
        county: "Meru",
        avgPrice: 9200,
        minPrice: 9050,
        maxPrice: 9340,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 1.7,
      },
    ],
    insight:
      "Beans remain strongest in Nairobi, with Meru and Kisumu still offering firmer than usual prices for clean stock.",
    isFallback: true,
  },
  {
    productKey: "tomatoes",
    productName: "Tomatoes",
    category: "produce",
    unit: "crate",
    submissionsCount: 16,
    approvedMarkets: 4,
    lastUpdated: nowIso,
    overallAverage: 1115,
    overallTrendDirection: "down",
    overallTrendPercentage: -7.6,
    bestMarket: {
      marketKey: "tomatoes-mombasa",
      marketName: "Kongowea Market",
      county: "Mombasa",
      avgPrice: 1420,
      minPrice: 1360,
      maxPrice: 1490,
      submissionsCount: 4,
      currentWindowCount: 4,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 3.2,
    },
    weakestMarket: {
      marketKey: "tomatoes-kajiado",
      marketName: "Kiserian Market",
      county: "Kajiado",
      avgPrice: 900,
      minPrice: 850,
      maxPrice: 950,
      submissionsCount: 4,
      currentWindowCount: 4,
      lastUpdated: nowIso,
      trendDirection: "down",
      trendPercentage: -8.5,
    },
    markets: [
      {
        marketKey: "tomatoes-mombasa",
        marketName: "Kongowea Market",
        county: "Mombasa",
        avgPrice: 1420,
        minPrice: 1360,
        maxPrice: 1490,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 3.2,
      },
      {
        marketKey: "tomatoes-nairobi",
        marketName: "Wakulima Market",
        county: "Nairobi",
        avgPrice: 1150,
        minPrice: 1080,
        maxPrice: 1220,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -10.5,
      },
      {
        marketKey: "tomatoes-nakuru",
        marketName: "Nakuru Market",
        county: "Nakuru",
        avgPrice: 990,
        minPrice: 930,
        maxPrice: 1040,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -4.8,
      },
      {
        marketKey: "tomatoes-kajiado",
        marketName: "Kiserian Market",
        county: "Kajiado",
        avgPrice: 900,
        minPrice: 850,
        maxPrice: 950,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -8.5,
      },
    ],
    insight:
      "Tomatoes are soft in Nairobi after heavier supply from nearby counties. Mombasa remains the better selling market this week.",
    isFallback: true,
  },
  {
    productKey: "onions",
    productName: "Onions",
    category: "produce",
    unit: "net bag",
    submissionsCount: 11,
    approvedMarkets: 3,
    lastUpdated: nowIso,
    overallAverage: 3285,
    overallTrendDirection: "up",
    overallTrendPercentage: 4.2,
    bestMarket: {
      marketKey: "onions-kisumu",
      marketName: "Kibuye Market",
      county: "Kisumu",
      avgPrice: 3600,
      minPrice: 3520,
      maxPrice: 3690,
      submissionsCount: 3,
      currentWindowCount: 3,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 6.0,
    },
    weakestMarket: {
      marketKey: "onions-kajiado",
      marketName: "Kiserian Market",
      county: "Kajiado",
      avgPrice: 2900,
      minPrice: 2810,
      maxPrice: 2980,
      submissionsCount: 4,
      currentWindowCount: 4,
      lastUpdated: nowIso,
      trendDirection: "stable",
      trendPercentage: 1.3,
    },
    markets: [
      {
        marketKey: "onions-kisumu",
        marketName: "Kibuye Market",
        county: "Kisumu",
        avgPrice: 3600,
        minPrice: 3520,
        maxPrice: 3690,
        submissionsCount: 3,
        currentWindowCount: 3,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 6.0,
      },
      {
        marketKey: "onions-nairobi",
        marketName: "Wakulima Market",
        county: "Nairobi",
        avgPrice: 3355,
        minPrice: 3270,
        maxPrice: 3440,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 4.7,
      },
      {
        marketKey: "onions-kajiado",
        marketName: "Kiserian Market",
        county: "Kajiado",
        avgPrice: 2900,
        minPrice: 2810,
        maxPrice: 2980,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 1.3,
      },
    ],
    insight:
      "Onions are moving better in Kisumu and Nairobi than in Kajiado. Traders closer to western demand are getting the strongest signals.",
    isFallback: true,
  },
];

const fallbackLivestockBoard: IntelligenceProductSnapshot[] = [
  {
    productKey: "beef",
    productName: "Beef Cattle",
    category: "livestock",
    unit: "kg live weight",
    submissionsCount: 8,
    approvedMarkets: 4,
    lastUpdated: nowIso,
    overallAverage: 215,
    overallTrendDirection: "up",
    overallTrendPercentage: 3.4,
    bestMarket: {
      marketKey: "beef-nairobi",
      marketName: "Dagoretti Market",
      county: "Nairobi",
      avgPrice: 248,
      minPrice: 230,
      maxPrice: 265,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 5.1,
    },
    weakestMarket: {
      marketKey: "beef-kisumu",
      marketName: "Kibuye Market",
      county: "Kisumu",
      avgPrice: 188,
      minPrice: 180,
      maxPrice: 195,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "stable",
      trendPercentage: 0.9,
    },
    markets: [
      {
        marketKey: "beef-nairobi",
        marketName: "Dagoretti Market",
        county: "Nairobi",
        avgPrice: 248,
        minPrice: 230,
        maxPrice: 265,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 5.1,
      },
      {
        marketKey: "beef-kajiado",
        marketName: "Kiserian Market",
        county: "Kajiado",
        avgPrice: 225,
        minPrice: 215,
        maxPrice: 235,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 3.7,
      },
      {
        marketKey: "beef-eldoret",
        marketName: "Eldoret Market",
        county: "Uasin Gishu",
        avgPrice: 200,
        minPrice: 192,
        maxPrice: 208,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 1.5,
      },
      {
        marketKey: "beef-kisumu",
        marketName: "Kibuye Market",
        county: "Kisumu",
        avgPrice: 188,
        minPrice: 180,
        maxPrice: 195,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 0.9,
      },
    ],
    insight:
      "Beef cattle are pricing strongest in Nairobi's Dagoretti Market, where urban butcher demand keeps prices firm. Kajiado remains a reliable secondary selling point for Rift Valley producers.",
    isFallback: true,
  },
  {
    productKey: "broilers",
    productName: "Broilers",
    category: "livestock",
    unit: "kg live weight",
    submissionsCount: 10,
    approvedMarkets: 4,
    lastUpdated: nowIso,
    overallAverage: 210,
    overallTrendDirection: "stable",
    overallTrendPercentage: 1.2,
    bestMarket: {
      marketKey: "broilers-nairobi",
      marketName: "Wakulima Market",
      county: "Nairobi",
      avgPrice: 235,
      minPrice: 225,
      maxPrice: 245,
      submissionsCount: 3,
      currentWindowCount: 3,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 2.6,
    },
    weakestMarket: {
      marketKey: "broilers-eldoret",
      marketName: "Eldoret Market",
      county: "Uasin Gishu",
      avgPrice: 192,
      minPrice: 185,
      maxPrice: 198,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "down",
      trendPercentage: -1.8,
    },
    markets: [
      {
        marketKey: "broilers-nairobi",
        marketName: "Wakulima Market",
        county: "Nairobi",
        avgPrice: 235,
        minPrice: 225,
        maxPrice: 245,
        submissionsCount: 3,
        currentWindowCount: 3,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 2.6,
      },
      {
        marketKey: "broilers-mombasa",
        marketName: "Kongowea Market",
        county: "Mombasa",
        avgPrice: 220,
        minPrice: 210,
        maxPrice: 230,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 1.4,
      },
      {
        marketKey: "broilers-nakuru",
        marketName: "Nakuru Market",
        county: "Nakuru",
        avgPrice: 205,
        minPrice: 196,
        maxPrice: 214,
        submissionsCount: 3,
        currentWindowCount: 3,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 0.5,
      },
      {
        marketKey: "broilers-eldoret",
        marketName: "Eldoret Market",
        county: "Uasin Gishu",
        avgPrice: 192,
        minPrice: 185,
        maxPrice: 198,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -1.8,
      },
    ],
    insight:
      "Broiler demand is firmest in Nairobi and coastal markets where quick-service restaurants and households keep steady offtake. Upcountry production areas show softer pricing.",
    isFallback: true,
  },
];

const fallbackFertilizerBoard: IntelligenceProductSnapshot[] = [
  {
    productKey: "dap-fertilizer",
    productName: "DAP Fertilizer",
    category: "inputs",
    unit: "50kg bag",
    submissionsCount: 9,
    approvedMarkets: 3,
    lastUpdated: nowIso,
    overallAverage: 6417,
    overallTrendDirection: "stable",
    overallTrendPercentage: 0.8,
    bestMarket: {
      marketKey: "dap-nairobi",
      marketName: "Nairobi Agrovet Cluster",
      county: "Nairobi",
      avgPrice: 6600,
      minPrice: 6500,
      maxPrice: 6700,
      submissionsCount: 3,
      currentWindowCount: 3,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 2.3,
    },
    weakestMarket: {
      marketKey: "dap-eldoret",
      marketName: "Eldoret Agrovet Cluster",
      county: "Uasin Gishu",
      avgPrice: 6250,
      minPrice: 6180,
      maxPrice: 6320,
      submissionsCount: 3,
      currentWindowCount: 3,
      lastUpdated: nowIso,
      trendDirection: "down",
      trendPercentage: -1.1,
    },
    markets: [
      {
        marketKey: "dap-nairobi",
        marketName: "Nairobi Agrovet Cluster",
        county: "Nairobi",
        avgPrice: 6600,
        minPrice: 6500,
        maxPrice: 6700,
        submissionsCount: 3,
        currentWindowCount: 3,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 2.3,
      },
      {
        marketKey: "dap-nakuru",
        marketName: "Nakuru Agrovet Cluster",
        county: "Nakuru",
        avgPrice: 6400,
        minPrice: 6340,
        maxPrice: 6480,
        submissionsCount: 3,
        currentWindowCount: 3,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 0.2,
      },
      {
        marketKey: "dap-eldoret",
        marketName: "Eldoret Agrovet Cluster",
        county: "Uasin Gishu",
        avgPrice: 6250,
        minPrice: 6180,
        maxPrice: 6320,
        submissionsCount: 3,
        currentWindowCount: 3,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -1.1,
      },
    ],
    insight:
      "DAP remains highest in Nairobi. Nakuru and Eldoret are still the sharper places to buy if you are preparing for planting.",
    isFallback: true,
  },
  {
    productKey: "can-fertilizer",
    productName: "CAN Fertilizer",
    category: "inputs",
    unit: "50kg bag",
    submissionsCount: 8,
    approvedMarkets: 3,
    lastUpdated: nowIso,
    overallAverage: 5217,
    overallTrendDirection: "stable",
    overallTrendPercentage: -0.6,
    bestMarket: {
      marketKey: "can-nairobi",
      marketName: "Nairobi Agrovet Cluster",
      county: "Nairobi",
      avgPrice: 5400,
      minPrice: 5330,
      maxPrice: 5460,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 1.4,
    },
    weakestMarket: {
      marketKey: "can-eldoret",
      marketName: "Eldoret Agrovet Cluster",
      county: "Uasin Gishu",
      avgPrice: 5050,
      minPrice: 4990,
      maxPrice: 5110,
      submissionsCount: 3,
      currentWindowCount: 3,
      lastUpdated: nowIso,
      trendDirection: "down",
      trendPercentage: -2.0,
    },
    markets: [
      {
        marketKey: "can-nairobi",
        marketName: "Nairobi Agrovet Cluster",
        county: "Nairobi",
        avgPrice: 5400,
        minPrice: 5330,
        maxPrice: 5460,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 1.4,
      },
      {
        marketKey: "can-nakuru",
        marketName: "Nakuru Agrovet Cluster",
        county: "Nakuru",
        avgPrice: 5200,
        minPrice: 5140,
        maxPrice: 5270,
        submissionsCount: 3,
        currentWindowCount: 3,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: -0.1,
      },
      {
        marketKey: "can-eldoret",
        marketName: "Eldoret Agrovet Cluster",
        county: "Uasin Gishu",
        avgPrice: 5050,
        minPrice: 4990,
        maxPrice: 5110,
        submissionsCount: 3,
        currentWindowCount: 3,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -2.0,
      },
    ],
    insight:
      "CAN is broadly stable, with Eldoret still slightly cheaper than Nakuru and Nairobi this week.",
    isFallback: true,
  },
  {
    productKey: "npk-fertilizer",
    productName: "NPK Fertilizer",
    category: "inputs",
    unit: "50kg bag",
    submissionsCount: 7,
    approvedMarkets: 3,
    lastUpdated: nowIso,
    overallAverage: 6500,
    overallTrendDirection: "up",
    overallTrendPercentage: 1.9,
    bestMarket: {
      marketKey: "npk-nairobi",
      marketName: "Nairobi Agrovet Cluster",
      county: "Nairobi",
      avgPrice: 6750,
      minPrice: 6680,
      maxPrice: 6830,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 2.6,
    },
    weakestMarket: {
      marketKey: "npk-eldoret",
      marketName: "Eldoret Agrovet Cluster",
      county: "Uasin Gishu",
      avgPrice: 6300,
      minPrice: 6220,
      maxPrice: 6390,
      submissionsCount: 3,
      currentWindowCount: 3,
      lastUpdated: nowIso,
      trendDirection: "stable",
      trendPercentage: 0.5,
    },
    markets: [
      {
        marketKey: "npk-nairobi",
        marketName: "Nairobi Agrovet Cluster",
        county: "Nairobi",
        avgPrice: 6750,
        minPrice: 6680,
        maxPrice: 6830,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 2.6,
      },
      {
        marketKey: "npk-meru",
        marketName: "Meru Agrovet Cluster",
        county: "Meru",
        avgPrice: 6450,
        minPrice: 6390,
        maxPrice: 6510,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 1.8,
      },
      {
        marketKey: "npk-eldoret",
        marketName: "Eldoret Agrovet Cluster",
        county: "Uasin Gishu",
        avgPrice: 6300,
        minPrice: 6220,
        maxPrice: 6390,
        submissionsCount: 3,
        currentWindowCount: 3,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 0.5,
      },
    ],
    insight:
      "NPK is edging higher in Nairobi. Eldoret still looks better for farmers trying to lock in input costs early.",
    isFallback: true,
  },
];

const fallbackRecentContributions: IntelligenceContribution[] = [
  ...SEEDED_MAIZE_RECENT_CONTRIBUTIONS.map((entry) => ({ ...entry })),
  {
    id: "fallback-2",
    productKey: "tomatoes",
    productName: "Tomatoes",
    county: "Kajiado",
    marketName: "Kiserian Market",
    price: 900,
    unit: "crate",
    sourceType: "external",
    contributorName: "Field contributor",
    observationDate: nowIso,
  },
  {
    id: "fallback-3",
    productKey: "dap-fertilizer",
    productName: "DAP Fertilizer",
    county: "Nakuru",
    marketName: "Nakuru Agrovet Cluster",
    price: 6400,
    unit: "50kg bag",
    sourceType: "admin",
    contributorName: "Agrisoko market desk",
    observationDate: nowIso,
  },
];

const FALLBACK_OVERVIEW: IntelligenceOverview = {
  generatedAt: nowIso,
  meta: {
    approvedSubmissions: 81,
    trackedProducts: fallbackProduceBoard.length + fallbackLivestockBoard.length + fallbackFertilizerBoard.length,
    trackedMarkets: TRACKED_INTELLIGENCE_MARKETS.length,
    commoditiesCovered: [
      ...fallbackProduceBoard.map((item) => item.productKey),
      ...fallbackLivestockBoard.map((item) => item.productKey),
      ...fallbackFertilizerBoard.map((item) => item.productKey),
    ],
  },
  produceBoard: fallbackProduceBoard,
  livestockBoard: fallbackLivestockBoard,
  fertilizerBoard: fallbackFertilizerBoard,
  topSignals: [
    {
      productKey: "maize",
      productName: "Maize",
      trendDirection: "stable",
      trendPercentage: 2.1,
      bestCounty: "Nakuru",
      bestMarketName: "Nakuru Yellow Maize Desk",
      bestPrice: 3800,
      summary:
        "Starter maize signals already show a real spread, from about KES 2,500 in lower Nakuru quotes to KES 3,800 in stronger Nakuru premium and yellow-maize desks.",
    },
    {
      productKey: "tomatoes",
      productName: "Tomatoes",
      trendDirection: "down",
      trendPercentage: -7.6,
      bestCounty: "Mombasa",
      bestMarketName: "Kongowea Market",
      bestPrice: 1420,
      summary:
        "Tomatoes are weak in Nairobi and Kajiado after heavier supply. Coastal demand is firmer right now.",
    },
    {
      productKey: "dap-fertilizer",
      productName: "DAP Fertilizer",
      trendDirection: "stable",
      trendPercentage: 0.8,
      bestCounty: "Nairobi",
      bestMarketName: "Nairobi Agrovet Cluster",
      bestPrice: 6600,
      summary:
        "DAP is relatively stable, but Nakuru and Eldoret still look sharper than Nairobi for disciplined input buyers.",
    },
    {
      productKey: "onions",
      productName: "Onions",
      trendDirection: "up",
      trendPercentage: 4.2,
      bestCounty: "Kisumu",
      bestMarketName: "Kibuye Market",
      bestPrice: 3600,
      summary:
        "Onions are strongest in Kisumu and Nairobi, with Kajiado trailing the market average.",
    },
  ],
  recentContributions: fallbackRecentContributions,
  isFallback: true,
};

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const normalizeTrend = (value: unknown): TrendDirection =>
  value === "up" || value === "down" || value === "stable" ? value : "stable";

const normalizeMarket = (item: any): IntelligenceMarket => ({
  marketKey: String(item?.marketKey || `${item?.marketName || "market"}-${item?.county || "county"}`),
  marketName: String(item?.marketName || "Market"),
  county: String(item?.county || "Kenya"),
  avgPrice: Number(item?.avgPrice || 0),
  minPrice: Number(item?.minPrice || item?.avgPrice || 0),
  maxPrice: Number(item?.maxPrice || item?.avgPrice || 0),
  submissionsCount: Number(item?.submissionsCount || 0),
  currentWindowCount:
    typeof item?.currentWindowCount === "number" ? Number(item.currentWindowCount) : undefined,
  lastUpdated: item?.lastUpdated ? String(item.lastUpdated) : null,
  trendDirection: normalizeTrend(item?.trendDirection),
  trendPercentage: Number(item?.trendPercentage || 0),
  notes: item?.notes ? String(item.notes) : undefined,
  sourceType: item?.sourceType ? String(item.sourceType) : undefined,
  sourceLabel: item?.sourceLabel ? String(item.sourceLabel) : undefined,
});

const normalizeProduct = (item: any): IntelligenceProductSnapshot => ({
  productKey: String(item?.productKey || ""),
  productName: String(item?.productName || "Commodity"),
  category: item?.category === "inputs" ? "inputs" : item?.category === "livestock" ? "livestock" : "produce",
  unit: String(item?.unit || "unit"),
  submissionsCount: Number(item?.submissionsCount || 0),
  approvedMarkets: Number(item?.approvedMarkets || item?.markets?.length || 0),
  lastUpdated: item?.lastUpdated ? String(item.lastUpdated) : null,
  overallAverage: Number(item?.overallAverage || 0),
  overallTrendDirection: normalizeTrend(item?.overallTrendDirection),
  overallTrendPercentage: Number(item?.overallTrendPercentage || 0),
  bestMarket: item?.bestMarket ? normalizeMarket(item.bestMarket) : null,
  weakestMarket: item?.weakestMarket ? normalizeMarket(item.weakestMarket) : null,
  markets: Array.isArray(item?.markets) ? item.markets.map(normalizeMarket) : [],
  insight: String(item?.insight || ""),
  recentContributions: Array.isArray(item?.recentContributions)
    ? item.recentContributions.map(normalizeContribution)
    : undefined,
  generatedAt: item?.generatedAt ? String(item.generatedAt) : undefined,
  isFallback: Boolean(item?.isFallback),
});

const normalizeContribution = (item: any): IntelligenceContribution => ({
  id: String(item?.id || item?._id || ""),
  productKey: String(item?.productKey || ""),
  productName: String(item?.productName || "Commodity"),
  county: String(item?.county || "Kenya"),
  marketName: String(item?.marketName || "Market"),
  price: Number(item?.price || 0),
  unit: String(item?.unit || "unit"),
  sourceType: String(item?.sourceType || "user"),
  contributorName: String(item?.contributorName || "Contributor"),
  observationDate: item?.observationDate ? String(item.observationDate) : null,
});

const normalizeHistoryPoint = (item: any): IntelligenceHistoryPoint => ({
  id: String(item?.id || item?._id || ""),
  county: String(item?.county || "Kenya"),
  marketName: String(item?.marketName || "Market"),
  price: Number(item?.price || 0),
  unit: String(item?.unit || "unit"),
  currency: String(item?.currency || "KES"),
  observationDate: item?.observationDate ? String(item.observationDate) : null,
  sourceType: String(item?.sourceType || "external"),
  sourceLabel: String(item?.sourceLabel || ""),
  notes: String(item?.notes || ""),
});

const normalizeHistoryAverageRow = (item: any): IntelligenceHistoryAverageRow => ({
  county: item?.county ? String(item.county) : undefined,
  marketName: item?.marketName ? String(item.marketName) : undefined,
  date: item?.date ? String(item.date) : undefined,
  averagePrice: Number(item?.averagePrice || 0),
  minPrice: Number(item?.minPrice || 0),
  maxPrice: Number(item?.maxPrice || 0),
  submissionsCount: Number(item?.submissionsCount || 0),
  lastUpdated: item?.lastUpdated ? String(item.lastUpdated) : null,
});

export function normalizeSubmissionFeedback(payload: any): IntelligenceSubmissionFeedback | null {
  if (!payload || typeof payload !== "object") return null;

  const comparisonLabel =
    payload?.comparisonLabel === "above" ||
    payload?.comparisonLabel === "below" ||
    payload?.comparisonLabel === "near"
      ? payload.comparisonLabel
      : "near";

  return {
    reportsToday: Number(payload?.reportsToday || 0),
    currentAverage: Number(payload?.currentAverage || 0),
    approvedReportsInWindow: Number(payload?.approvedReportsInWindow || 0),
    deltaPercentage: Number(payload?.deltaPercentage || 0),
    comparisonLabel,
  };
}

export function getFallbackIntelligenceOverview(): IntelligenceOverview {
  return deepClone(FALLBACK_OVERVIEW);
}

export function getFallbackProductSnapshot(
  productKey: string
): IntelligenceProductSnapshot | null {
  const overview = getFallbackIntelligenceOverview();
  return (
    overview.produceBoard.find((item) => item.productKey === productKey) ||
    overview.livestockBoard.find((item) => item.productKey === productKey) ||
    overview.fertilizerBoard.find((item) => item.productKey === productKey) ||
    null
  );
}

export function getFallbackProductHistory(
  productKey: string
): IntelligenceProductHistory | null {
  const product = getFallbackProductSnapshot(productKey);
  if (!product) return null;

  const points = product.markets.map((market) => ({
    id: market.marketKey,
    county: market.county,
    marketName: market.marketName,
    price: market.avgPrice,
    unit: product.unit,
    currency: "KES",
    observationDate: market.lastUpdated || product.lastUpdated,
    sourceType: market.sourceType || "external",
    sourceLabel: market.sourceLabel || "",
    notes: market.notes || "",
  }));

  const countyMap = new Map<string, typeof points>();
  for (const point of points) {
    const bucket = countyMap.get(point.county) || [];
    bucket.push(point);
    countyMap.set(point.county, bucket);
  }

  const countyAverages = Array.from(countyMap.entries()).map(([county, items]) => {
    const values = items.map((item) => item.price);
    return {
      county,
      averagePrice: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
      minPrice: Math.min(...values),
      maxPrice: Math.max(...values),
      submissionsCount: items.length,
      lastUpdated: items[items.length - 1]?.observationDate || product.lastUpdated,
    };
  });

  return {
    generatedAt: product.generatedAt || product.lastUpdated || new Date().toISOString(),
    productKey: product.productKey,
    productName: product.productName,
    unit: product.unit,
    points,
    summary: {
      count: points.length,
      minPrice: points.length ? Math.min(...points.map((item) => item.price)) : 0,
      maxPrice: points.length ? Math.max(...points.map((item) => item.price)) : 0,
      averagePrice: product.overallAverage,
    },
    countyAverages,
    marketAverages: product.markets.map((market) => ({
      county: market.county,
      marketName: market.marketName,
      averagePrice: market.avgPrice,
      minPrice: market.minPrice,
      maxPrice: market.maxPrice,
      submissionsCount: market.submissionsCount,
      lastUpdated: market.lastUpdated,
    })),
    dailyAverageSeries: [
      {
        date: (product.lastUpdated || new Date().toISOString()).slice(0, 10),
        averagePrice: product.overallAverage,
        minPrice: product.weakestMarket?.avgPrice || product.overallAverage,
        maxPrice: product.bestMarket?.avgPrice || product.overallAverage,
        submissionsCount: product.submissionsCount,
        lastUpdated: product.lastUpdated,
      },
    ],
    isFallback: true,
  };
}

export function normalizeIntelligenceOverview(payload: any): IntelligenceOverview {
  const raw = payload?.data && (payload.data.produceBoard || payload.data.fertilizerBoard || payload.data.livestockBoard)
    ? payload.data
    : payload;

  if (!raw || (!Array.isArray(raw.produceBoard) && !Array.isArray(raw.fertilizerBoard) && !Array.isArray(raw.livestockBoard))) {
    return getFallbackIntelligenceOverview();
  }

  const produceBoard = Array.isArray(raw.produceBoard) ? raw.produceBoard.map(normalizeProduct) : [];
  const livestockBoard = Array.isArray(raw.livestockBoard) ? raw.livestockBoard.map(normalizeProduct) : [];
  const fertilizerBoard = Array.isArray(raw.fertilizerBoard)
    ? raw.fertilizerBoard.map(normalizeProduct)
    : [];

  if (!produceBoard.length && !livestockBoard.length && !fertilizerBoard.length) {
    return getFallbackIntelligenceOverview();
  }

  return {
    generatedAt: raw?.generatedAt ? String(raw.generatedAt) : new Date().toISOString(),
    meta: {
      approvedSubmissions: Number(raw?.meta?.approvedSubmissions || 0),
      trackedProducts: Number(raw?.meta?.trackedProducts || produceBoard.length + livestockBoard.length + fertilizerBoard.length),
      trackedMarkets: Number(raw?.meta?.trackedMarkets || 0),
      commoditiesCovered: Array.isArray(raw?.meta?.commoditiesCovered)
        ? raw.meta.commoditiesCovered.map((item: unknown) => String(item))
        : [],
    },
    produceBoard,
    livestockBoard,
    fertilizerBoard,
    topSignals: Array.isArray(raw?.topSignals)
      ? raw.topSignals.map((signal: any) => ({
          productKey: String(signal?.productKey || ""),
          productName: String(signal?.productName || "Commodity"),
          trendDirection: normalizeTrend(signal?.trendDirection),
          trendPercentage: Number(signal?.trendPercentage || 0),
          bestCounty: String(signal?.bestCounty || ""),
          bestMarketName: String(signal?.bestMarketName || ""),
          bestPrice: Number(signal?.bestPrice || 0),
          summary: String(signal?.summary || ""),
        }))
      : [],
    recentContributions: Array.isArray(raw?.recentContributions)
      ? raw.recentContributions.map(normalizeContribution)
      : [],
    isFallback: Boolean(raw?.isFallback),
  };
}

export function normalizeIntelligenceProduct(
  payload: any,
  productKey?: string
): IntelligenceProductSnapshot | null {
  const raw = payload?.data && payload.data?.productKey ? payload.data : payload;
  if (!raw || !raw.productKey) {
    return productKey ? getFallbackProductSnapshot(productKey) : null;
  }

  const normalized = normalizeProduct(raw);
  if (!normalized.markets.length && productKey) {
    return getFallbackProductSnapshot(productKey);
  }

  return normalized;
}

export function normalizeIntelligenceHistory(
  payload: any,
  productKey?: string
): IntelligenceProductHistory | null {
  const raw = payload?.data?.productKey ? payload.data : payload;
  if (!raw || !raw.productKey) {
    return productKey ? getFallbackProductHistory(productKey) : null;
  }

  const normalized: IntelligenceProductHistory = {
    generatedAt: raw?.generatedAt ? String(raw.generatedAt) : new Date().toISOString(),
    productKey: String(raw?.productKey || productKey || ""),
    productName: String(raw?.productName || "Commodity"),
    unit: String(raw?.unit || "unit"),
    points: Array.isArray(raw?.points) ? raw.points.map(normalizeHistoryPoint) : [],
    summary: {
      count: Number(raw?.summary?.count || 0),
      minPrice: Number(raw?.summary?.minPrice || 0),
      maxPrice: Number(raw?.summary?.maxPrice || 0),
      averagePrice: Number(raw?.summary?.averagePrice || 0),
    },
    countyAverages: Array.isArray(raw?.countyAverages)
      ? raw.countyAverages.map(normalizeHistoryAverageRow)
      : [],
    marketAverages: Array.isArray(raw?.marketAverages)
      ? raw.marketAverages.map(normalizeHistoryAverageRow)
      : [],
    dailyAverageSeries: Array.isArray(raw?.dailyAverageSeries)
      ? raw.dailyAverageSeries.map(normalizeHistoryAverageRow)
      : [],
    isFallback: Boolean(raw?.isFallback),
  };

  if (!normalized.points.length && productKey) {
    return getFallbackProductHistory(productKey);
  }

  return normalized;
}

export function formatKes(value: number) {
  return `KES ${Math.round(value || 0).toLocaleString()}`;
}

export function formatIntelligenceDate(value?: string | null) {
  if (!value) return "Recent field update";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent field update";
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTrendLabel(direction: TrendDirection, percentage: number) {
  if (direction === "up") return `Rising ${Math.abs(percentage).toFixed(1)}%`;
  if (direction === "down") return `Falling ${Math.abs(percentage).toFixed(1)}%`;
  return "Stable";
}

export function buildPriceContributionHref(params: {
  productKey: string;
  county?: string;
  marketName?: string;
  unit?: string;
}) {
  const query = new URLSearchParams();
  query.set("product", params.productKey);
  if (params.county) query.set("county", params.county);
  if (params.marketName) query.set("market", params.marketName);
  if (params.unit) query.set("unit", params.unit);
  return `/market-intelligence/submit?${query.toString()}`;
}

export function buildPriceContributionPrompt(params: {
  productName: string;
  county?: string;
  marketName?: string;
}) {
  const where = params.marketName
    ? `${params.marketName}, ${params.county || "Kenya"}`
    : params.county || "your market";
  return `What is the price of ${params.productName.toLowerCase()} in ${where} today?`;
}

export function getDealSignal(
  product: IntelligenceProductSnapshot,
  market: IntelligenceMarket
) {
  if (!product.markets.length) return "Watch the market";
  if (market === product.bestMarket) return "Best market to sell";
  if (market === product.weakestMarket) return "Best market to buy";

  const midpoint = product.overallAverage || 0;
  if (market.avgPrice >= midpoint * 1.06) return "Strong selling market";
  if (market.avgPrice <= midpoint * 0.94) return "Good buying market";
  return "Near market average";
}
