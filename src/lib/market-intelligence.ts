import {
  SEEDED_INTELLIGENCE_UPDATED_AT,
  SEEDED_MAIZE_RECENT_CONTRIBUTIONS,
  SEEDED_MAIZE_SNAPSHOT,
  SEEDED_ONION_RECENT_CONTRIBUTIONS,
  SEEDED_ONION_SNAPSHOT,
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
  { key: "onions", name: "Onions", category: "produce", defaultUnit: "kg" },
  { key: "potatoes", name: "Potatoes", category: "produce", defaultUnit: "50kg bag" },
  { key: "beef", name: "Beef Cattle", category: "livestock", defaultUnit: "kg live weight" },
  { key: "broilers", name: "Broilers", category: "livestock", defaultUnit: "kg live weight" },
  { key: "dap-fertilizer", name: "DAP Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
  { key: "urea-fertilizer", name: "UREA Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
  { key: "can-fertilizer", name: "CAN Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
  { key: "npk-fertilizer", name: "NPK Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
  { key: "npsb-fertilizer", name: "NPSB Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
  { key: "korn-kali", name: "Korn Kali", category: "inputs", defaultUnit: "50kg bag" },
] as const;

export const TRACKED_INTELLIGENCE_MARKETS = [
  { county: "Nairobi", marketName: "Wakulima Market" },
  { county: "Uasin Gishu", marketName: "Eldoret Market" },
  { county: "Uasin Gishu", marketName: "Eldoret Input Desk" },
  { county: "Nakuru", marketName: "Nakuru Market" },
  { county: "Nakuru", marketName: "NCPB Subsidized Desk" },
  { county: "Trans Nzoia", marketName: "Kitale Grain Belt" },
  { county: "Bungoma", marketName: "Bungoma Grain Desk" },
  { county: "Kirinyaga", marketName: "Mwea Town Grain Desk" },
  { county: "Migori", marketName: "Migori Town Market" },
  { county: "Kisumu", marketName: "Kibuye Market" },
  { county: "Mombasa", marketName: "Kongowea Market" },
  { county: "Meru", marketName: "Meru Town Market" },
  { county: "Kiambu", marketName: "Limuru Market" },
  { county: "Kajiado", marketName: "Kiserian Market" },
  { county: "Kajiado", marketName: "Isinya Input Desk" },
  { county: "Kajiado", marketName: "Isinya Export Poultry Desk" },
  { county: "Nyeri", marketName: "Naromoru Poultry Desk" },
  { county: "Nairobi", marketName: "Githurai Poultry Desk" },
  { county: "Kenya", marketName: "National Wholesale Fertilizer Desk" },
  { county: "Nyeri", marketName: "Kiawara Onion Desk" },
  { county: "Machakos", marketName: "Wamunyu Onion Desk" },
  { county: "Isiolo", marketName: "Isiolo Onion Desk" },
  { county: "Kirinyaga", marketName: "Ngurubani Onion Desk" },
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
    ...SEEDED_ONION_SNAPSHOT,
    bestMarket: { ...SEEDED_ONION_SNAPSHOT.bestMarket },
    weakestMarket: { ...SEEDED_ONION_SNAPSHOT.weakestMarket },
    markets: SEEDED_ONION_SNAPSHOT.markets.map((market) => ({ ...market })),
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
    submissionsCount: 3,
    approvedMarkets: 3,
    lastUpdated: nowIso,
    overallAverage: 322.67,
    overallTrendDirection: "up",
    overallTrendPercentage: 3.4,
    bestMarket: {
      marketKey: "broilers-isinya-export-poultry-desk-kajiado",
      marketName: "Isinya Export Poultry Desk",
      county: "Kajiado",
      avgPrice: 350,
      minPrice: 350,
      maxPrice: 350,
      submissionsCount: 1,
      currentWindowCount: 1,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 4.1,
      notes: "Export-oriented broiler pricing remains the strongest disclosed per-kilo signal.",
    },
    weakestMarket: {
      marketKey: "broilers-naromoru-poultry-desk-nyeri",
      marketName: "Naromoru Poultry Desk",
      county: "Nyeri",
      avgPrice: 276,
      minPrice: 250,
      maxPrice: 300,
      submissionsCount: 1,
      currentWindowCount: 1,
      lastUpdated: nowIso,
      trendDirection: "down",
      trendPercentage: -5.6,
      notes: "Per-bird Naromoru quote normalized into a lower per-kilo supply-zone benchmark.",
    },
    markets: [
      {
        marketKey: "broilers-isinya-export-poultry-desk-kajiado",
        marketName: "Isinya Export Poultry Desk",
        county: "Kajiado",
        avgPrice: 350,
        minPrice: 350,
        maxPrice: 350,
        submissionsCount: 1,
        currentWindowCount: 1,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 4.1,
        notes: "Export-oriented broiler pricing remains the strongest disclosed per-kilo signal.",
      },
      {
        marketKey: "broilers-githurai-poultry-desk-nairobi",
        marketName: "Githurai Poultry Desk",
        county: "Nairobi",
        avgPrice: 342,
        minPrice: 342,
        maxPrice: 342,
        submissionsCount: 1,
        currentWindowCount: 1,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 3.2,
        notes: "Buyer signal from Githurai derived from a dressed-bird price.",
      },
      {
        marketKey: "broilers-naromoru-poultry-desk-nyeri",
        marketName: "Naromoru Poultry Desk",
        county: "Nyeri",
        avgPrice: 276,
        minPrice: 250,
        maxPrice: 300,
        submissionsCount: 1,
        currentWindowCount: 1,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -5.6,
        notes: "Per-bird Naromoru quote normalized into a lower per-kilo supply-zone benchmark.",
      },
    ],
    insight:
      "Broiler prices already show a clear spread. Isinya export buying and Githurai dressed-bird demand are stronger than Naromoru supply pricing, while City Market and Kitengela also show demand without disclosed prices.",
    isFallback: true,
  },
];

const fallbackFertilizerBoard: IntelligenceProductSnapshot[] = [
  {
    productKey: "dap-fertilizer",
    productName: "DAP Fertilizer",
    category: "inputs",
    unit: "50kg bag",
    submissionsCount: 7,
    approvedMarkets: 4,
    lastUpdated: nowIso,
    overallAverage: 4131.25,
    overallTrendDirection: "down",
    overallTrendPercentage: -1.8,
    bestMarket: {
      marketKey: "dap-isinya-input-desk-kajiado",
      marketName: "Isinya Input Desk",
      county: "Kajiado",
      avgPrice: 5250,
      minPrice: 5000,
      maxPrice: 5500,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 4.6,
      notes: "Commercial DAP quotes in Isinya remain the highest in this starter survey.",
    },
    weakestMarket: {
      marketKey: "dap-ncpb-subsidized-desk-nakuru",
      marketName: "NCPB Subsidized Desk",
      county: "Nakuru",
      avgPrice: 2650,
      minPrice: 2650,
      maxPrice: 2650,
      submissionsCount: 1,
      currentWindowCount: 1,
      lastUpdated: nowIso,
      trendDirection: "down",
      trendPercentage: -12.8,
      notes: "Government subsidy pricing creates a much lower floor than commercial desks.",
    },
    markets: [
      {
        marketKey: "dap-isinya-input-desk-kajiado",
        marketName: "Isinya Input Desk",
        county: "Kajiado",
        avgPrice: 5250,
        minPrice: 5000,
        maxPrice: 5500,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 4.6,
        notes: "Commercial DAP quotes in Isinya remain the highest in this starter survey.",
      },
      {
        marketKey: "dap-eldoret-input-desk-uasin-gishu",
        marketName: "Eldoret Input Desk",
        county: "Uasin Gishu",
        avgPrice: 4425,
        minPrice: 4100,
        maxPrice: 4750,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: -0.6,
        notes: "Eldoret commercial quotes are materially below the Isinya top end.",
      },
      {
        marketKey: "dap-national-wholesale-fertilizer-desk-kenya",
        marketName: "National Wholesale Fertilizer Desk",
        county: "Kenya",
        avgPrice: 4200,
        minPrice: 3500,
        maxPrice: 4900,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -2.2,
        notes: "National wholesale quotes sit between Eldoret commercial desks and the subsidy floor.",
      },
      {
        marketKey: "dap-ncpb-subsidized-desk-nakuru",
        marketName: "NCPB Subsidized Desk",
        county: "Nakuru",
        avgPrice: 2650,
        minPrice: 2650,
        maxPrice: 2650,
        submissionsCount: 1,
        currentWindowCount: 1,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -12.8,
        notes: "Government subsidy pricing creates a much lower floor than commercial desks.",
      },
    ],
    insight:
      "Commercial DAP is strongest in Isinya at about KES 5,250 per 50kg bag, while the Nakuru subsidy desk sits much lower near KES 2,650. Eldoret and broader wholesale desks remain the sharper commercial buying points.",
    isFallback: true,
  },
  {
    productKey: "urea-fertilizer",
    productName: "UREA Fertilizer",
    category: "inputs",
    unit: "50kg bag",
    submissionsCount: 4,
    approvedMarkets: 3,
    lastUpdated: nowIso,
    overallAverage: 3916.67,
    overallTrendDirection: "stable",
    overallTrendPercentage: -0.8,
    bestMarket: {
      marketKey: "urea-eldoret-input-desk-uasin-gishu",
      marketName: "Eldoret Input Desk",
      county: "Uasin Gishu",
      avgPrice: 4350,
      minPrice: 3500,
      maxPrice: 5200,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 2.1,
      notes: "Eldoret still carries the highest UREA quotes in this baseline.",
    },
    weakestMarket: {
      marketKey: "urea-national-wholesale-fertilizer-desk-kenya",
      marketName: "National Wholesale Fertilizer Desk",
      county: "Kenya",
      avgPrice: 3400,
      minPrice: 3200,
      maxPrice: 3600,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "down",
      trendPercentage: -3.4,
      notes: "National wholesale UREA remains the lowest commercial reference point.",
    },
    markets: [
      {
        marketKey: "urea-eldoret-input-desk-uasin-gishu",
        marketName: "Eldoret Input Desk",
        county: "Uasin Gishu",
        avgPrice: 4350,
        minPrice: 3500,
        maxPrice: 5200,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 2.1,
        notes: "Eldoret still carries the highest UREA quotes in this baseline.",
      },
      {
        marketKey: "urea-isinya-input-desk-kajiado",
        marketName: "Isinya Input Desk",
        county: "Kajiado",
        avgPrice: 4000,
        minPrice: 4000,
        maxPrice: 4000,
        submissionsCount: 1,
        currentWindowCount: 1,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 0.4,
        notes: "Isinya sits close to the current commercial midpoint.",
      },
      {
        marketKey: "urea-national-wholesale-fertilizer-desk-kenya",
        marketName: "National Wholesale Fertilizer Desk",
        county: "Kenya",
        avgPrice: 3400,
        minPrice: 3200,
        maxPrice: 3600,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -3.4,
        notes: "National wholesale UREA remains the lowest commercial reference point.",
      },
    ],
    insight:
      "UREA is trading highest in Eldoret, with national wholesale desks near KES 3,400 and Isinya sitting in the middle. That gives buyers a cleaner benchmark before planting decisions.",
    isFallback: true,
  },
  {
    productKey: "can-fertilizer",
    productName: "CAN Fertilizer",
    category: "inputs",
    unit: "50kg bag",
    submissionsCount: 6,
    approvedMarkets: 3,
    lastUpdated: nowIso,
    overallAverage: 3116.67,
    overallTrendDirection: "stable",
    overallTrendPercentage: -0.9,
    bestMarket: {
      marketKey: "can-eldoret-input-desk-uasin-gishu",
      marketName: "Eldoret Input Desk",
      county: "Uasin Gishu",
      avgPrice: 3850,
      minPrice: 3100,
      maxPrice: 4600,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 1.9,
      notes: "Eldoret still prints the highest CAN levels in this baseline.",
    },
    weakestMarket: {
      marketKey: "can-isinya-input-desk-kajiado",
      marketName: "Isinya Input Desk",
      county: "Kajiado",
      avgPrice: 2700,
      minPrice: 2700,
      maxPrice: 2700,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "down",
      trendPercentage: -4.1,
      notes: "Isinya is the lowest CAN point in the current baseline.",
    },
    markets: [
      {
        marketKey: "can-eldoret-input-desk-uasin-gishu",
        marketName: "Eldoret Input Desk",
        county: "Uasin Gishu",
        avgPrice: 3850,
        minPrice: 3100,
        maxPrice: 4600,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 1.9,
        notes: "Eldoret still prints the highest CAN levels in this baseline.",
      },
      {
        marketKey: "can-national-wholesale-fertilizer-desk-kenya",
        marketName: "National Wholesale Fertilizer Desk",
        county: "Kenya",
        avgPrice: 2800,
        minPrice: 2750,
        maxPrice: 2850,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: -1.2,
        notes: "National wholesale CAN is only slightly above the Isinya desk.",
      },
      {
        marketKey: "can-isinya-input-desk-kajiado",
        marketName: "Isinya Input Desk",
        county: "Kajiado",
        avgPrice: 2700,
        minPrice: 2700,
        maxPrice: 2700,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -4.1,
        notes: "Isinya is the lowest CAN point in the current baseline.",
      },
    ],
    insight:
      "CAN is much lower than the older placeholder board suggested. Eldoret is the high side in this survey, while Isinya and broader wholesale desks sit near KES 2,700 to 2,800.",
    isFallback: true,
  },
  {
    productKey: "npk-fertilizer",
    productName: "NPK Fertilizer",
    category: "inputs",
    unit: "50kg bag",
    submissionsCount: 6,
    approvedMarkets: 3,
    lastUpdated: nowIso,
    overallAverage: 3687.5,
    overallTrendDirection: "stable",
    overallTrendPercentage: 1.1,
    bestMarket: {
      marketKey: "npk-eldoret-input-desk-uasin-gishu",
      marketName: "Eldoret Input Desk",
      county: "Uasin Gishu",
      avgPrice: 4100,
      minPrice: 3200,
      maxPrice: 5000,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 3.1,
      notes: "Eldoret posts the highest NPK average after the wide commercial range is normalized.",
    },
    weakestMarket: {
      marketKey: "npk-national-wholesale-fertilizer-desk-kenya",
      marketName: "National Wholesale Fertilizer Desk",
      county: "Kenya",
      avgPrice: 3462.5,
      minPrice: 3300,
      maxPrice: 3625,
      submissionsCount: 2,
      currentWindowCount: 2,
      lastUpdated: nowIso,
      trendDirection: "down",
      trendPercentage: -2.1,
      notes: "National wholesale NPK remains the lowest large-sample comparison point.",
    },
    markets: [
      {
        marketKey: "npk-eldoret-input-desk-uasin-gishu",
        marketName: "Eldoret Input Desk",
        county: "Uasin Gishu",
        avgPrice: 4100,
        minPrice: 3200,
        maxPrice: 5000,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 3.1,
        notes: "Eldoret posts the highest NPK average after the wide commercial range is normalized.",
      },
      {
        marketKey: "npk-isinya-input-desk-kajiado",
        marketName: "Isinya Input Desk",
        county: "Kajiado",
        avgPrice: 3500,
        minPrice: 3500,
        maxPrice: 3500,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 0.2,
        notes: "Isinya NPK is steady in this starter baseline.",
      },
      {
        marketKey: "npk-national-wholesale-fertilizer-desk-kenya",
        marketName: "National Wholesale Fertilizer Desk",
        county: "Kenya",
        avgPrice: 3462.5,
        minPrice: 3300,
        maxPrice: 3625,
        submissionsCount: 2,
        currentWindowCount: 2,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -2.1,
        notes: "National wholesale NPK remains the lowest large-sample comparison point.",
      },
    ],
    insight:
      "NPK sits in a narrower commercial band than DAP. Eldoret is still the high side, while Isinya and national wholesale desks cluster around KES 3,500.",
    isFallback: true,
  },
  {
    productKey: "npsb-fertilizer",
    productName: "NPSB Fertilizer",
    category: "inputs",
    unit: "50kg bag",
    submissionsCount: 1,
    approvedMarkets: 1,
    lastUpdated: nowIso,
    overallAverage: 3200,
    overallTrendDirection: "stable",
    overallTrendPercentage: 0,
    bestMarket: {
      marketKey: "npsb-isinya-input-desk-kajiado",
      marketName: "Isinya Input Desk",
      county: "Kajiado",
      avgPrice: 3200,
      minPrice: 3200,
      maxPrice: 3200,
      submissionsCount: 1,
      currentWindowCount: 1,
      lastUpdated: nowIso,
      trendDirection: "stable",
      trendPercentage: 0,
      notes: "Starter NPSB signal from Isinya.",
    },
    weakestMarket: {
      marketKey: "npsb-isinya-input-desk-kajiado",
      marketName: "Isinya Input Desk",
      county: "Kajiado",
      avgPrice: 3200,
      minPrice: 3200,
      maxPrice: 3200,
      submissionsCount: 1,
      currentWindowCount: 1,
      lastUpdated: nowIso,
      trendDirection: "stable",
      trendPercentage: 0,
      notes: "Starter NPSB signal from Isinya.",
    },
    markets: [
      {
        marketKey: "npsb-isinya-input-desk-kajiado",
        marketName: "Isinya Input Desk",
        county: "Kajiado",
        avgPrice: 3200,
        minPrice: 3200,
        maxPrice: 3200,
        submissionsCount: 1,
        currentWindowCount: 1,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 0,
        notes: "Starter NPSB signal from Isinya.",
      },
    ],
    insight:
      "NPSB has only one cleaned baseline signal so far, at about KES 3,200 in Isinya. More reports will make this line far more useful.",
    isFallback: true,
  },
  {
    productKey: "korn-kali",
    productName: "Korn Kali",
    category: "inputs",
    unit: "50kg bag",
    submissionsCount: 1,
    approvedMarkets: 1,
    lastUpdated: nowIso,
    overallAverage: 4000,
    overallTrendDirection: "stable",
    overallTrendPercentage: 0,
    bestMarket: {
      marketKey: "korn-kali-isinya-input-desk-kajiado",
      marketName: "Isinya Input Desk",
      county: "Kajiado",
      avgPrice: 4000,
      minPrice: 4000,
      maxPrice: 4000,
      submissionsCount: 1,
      currentWindowCount: 1,
      lastUpdated: nowIso,
      trendDirection: "stable",
      trendPercentage: 0,
      notes: "Starter Korn Kali signal from Isinya.",
    },
    weakestMarket: {
      marketKey: "korn-kali-isinya-input-desk-kajiado",
      marketName: "Isinya Input Desk",
      county: "Kajiado",
      avgPrice: 4000,
      minPrice: 4000,
      maxPrice: 4000,
      submissionsCount: 1,
      currentWindowCount: 1,
      lastUpdated: nowIso,
      trendDirection: "stable",
      trendPercentage: 0,
      notes: "Starter Korn Kali signal from Isinya.",
    },
    markets: [
      {
        marketKey: "korn-kali-isinya-input-desk-kajiado",
        marketName: "Isinya Input Desk",
        county: "Kajiado",
        avgPrice: 4000,
        minPrice: 4000,
        maxPrice: 4000,
        submissionsCount: 1,
        currentWindowCount: 1,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 0,
        notes: "Starter Korn Kali signal from Isinya.",
      },
    ],
    insight:
      "Korn Kali has one cleaned baseline signal so far, at about KES 4,000 in Isinya. It is now visible and ready for more market reports.",
    isFallback: true,
  },
];

const fallbackRecentContributions: IntelligenceContribution[] = [
  ...SEEDED_MAIZE_RECENT_CONTRIBUTIONS.map((entry) => ({ ...entry })),
  ...SEEDED_ONION_RECENT_CONTRIBUTIONS.map((entry) => ({ ...entry })),
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
    marketName: "NCPB Subsidized Desk",
    price: 2650,
    unit: "50kg bag",
    sourceType: "external",
    contributorName: "Agrisoko market desk",
    observationDate: nowIso,
  },
  {
    id: "fallback-4",
    productKey: "urea-fertilizer",
    productName: "UREA Fertilizer",
    county: "Uasin Gishu",
    marketName: "Eldoret Input Desk",
    price: 5200,
    unit: "50kg bag",
    sourceType: "external",
    contributorName: "Agrisoko market desk",
    observationDate: nowIso,
  },
  {
    id: "fallback-5",
    productKey: "broilers",
    productName: "Broilers",
    county: "Kajiado",
    marketName: "Isinya Export Poultry Desk",
    price: 350,
    unit: "kg live weight",
    sourceType: "external",
    contributorName: "Agrisoko market desk",
    observationDate: nowIso,
  },
];

const FALLBACK_OVERVIEW: IntelligenceOverview = {
  generatedAt: nowIso,
  meta: {
    approvedSubmissions: 120,
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
      trendDirection: "down",
      trendPercentage: -1.8,
      bestCounty: "Kajiado",
      bestMarketName: "Isinya Input Desk",
      bestPrice: 5250,
      summary:
        "DAP now shows a much clearer spread: commercial Isinya quotes sit above Eldoret and wholesale desks, while subsidy pricing near Nakuru pulls the floor sharply lower.",
    },
    {
      productKey: "broilers",
      productName: "Broilers",
      trendDirection: "up",
      trendPercentage: 3.4,
      bestCounty: "Kajiado",
      bestMarketName: "Isinya Export Poultry Desk",
      bestPrice: 350,
      summary:
        "Broiler signals already show a real spread, with Isinya export and Githurai buyer demand pricing well above Naromoru supply-side levels.",
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

/**
 * Returns how many kilograms one unit represents.
 * Used to convert between per-unit and per-kg price display modes.
 * Returns 0 when no meaningful kg conversion exists (head, bird, acre, etc.).
 */
export const getUnitKgFactor = (unit: string): number => {
  const u = String(unit || "").toLowerCase().trim();
  if (u === "90kg bag") return 90;
  if (u === "120kg bag") return 120;
  if (u === "50kg bag") return 50;
  if (u === "25kg bag") return 25;
  if (u === "crate") return 64; // tomato crate ≈ 64 kg net
  return 0; // kg, kg live weight, head, bird, tray, dozen, acre, hour → no conversion
};
