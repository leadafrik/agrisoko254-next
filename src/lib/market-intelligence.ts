export type IntelligenceCategory = "produce" | "inputs";
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

export type IntelligenceOverview = {
  generatedAt: string;
  meta: {
    approvedSubmissions: number;
    trackedProducts: number;
    trackedMarkets: number;
    commoditiesCovered: string[];
  };
  produceBoard: IntelligenceProductSnapshot[];
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
  { key: "dap-fertilizer", name: "DAP Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
  { key: "can-fertilizer", name: "CAN Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
  { key: "npk-fertilizer", name: "NPK Fertilizer", category: "inputs", defaultUnit: "50kg bag" },
] as const;

export const TRACKED_INTELLIGENCE_MARKETS = [
  { county: "Nairobi", marketName: "Wakulima Market" },
  { county: "Uasin Gishu", marketName: "Eldoret Market" },
  { county: "Nakuru", marketName: "Nakuru Market" },
  { county: "Kisumu", marketName: "Kibuye Market" },
  { county: "Mombasa", marketName: "Kongowea Market" },
  { county: "Meru", marketName: "Meru Town Market" },
  { county: "Kiambu", marketName: "Limuru Market" },
  { county: "Kajiado", marketName: "Kiserian Market" },
] as const;

const nowIso = "2026-03-26T12:00:00.000Z";

const fallbackProduceBoard: IntelligenceProductSnapshot[] = [
  {
    productKey: "maize",
    productName: "Maize",
    category: "produce",
    unit: "90kg bag",
    submissionsCount: 18,
    approvedMarkets: 4,
    lastUpdated: nowIso,
    overallAverage: 4170,
    overallTrendDirection: "up",
    overallTrendPercentage: 4.6,
    bestMarket: {
      marketKey: "maize-nairobi",
      marketName: "Wakulima Market",
      county: "Nairobi",
      avgPrice: 4550,
      minPrice: 4420,
      maxPrice: 4680,
      submissionsCount: 5,
      currentWindowCount: 5,
      lastUpdated: nowIso,
      trendDirection: "up",
      trendPercentage: 6.1,
    },
    weakestMarket: {
      marketKey: "maize-eldoret",
      marketName: "Eldoret Market",
      county: "Uasin Gishu",
      avgPrice: 3820,
      minPrice: 3750,
      maxPrice: 3900,
      submissionsCount: 4,
      currentWindowCount: 4,
      lastUpdated: nowIso,
      trendDirection: "down",
      trendPercentage: -1.8,
    },
    markets: [
      {
        marketKey: "maize-nairobi",
        marketName: "Wakulima Market",
        county: "Nairobi",
        avgPrice: 4550,
        minPrice: 4420,
        maxPrice: 4680,
        submissionsCount: 5,
        currentWindowCount: 5,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 6.1,
      },
      {
        marketKey: "maize-kisumu",
        marketName: "Kibuye Market",
        county: "Kisumu",
        avgPrice: 4340,
        minPrice: 4260,
        maxPrice: 4420,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "up",
        trendPercentage: 4.2,
      },
      {
        marketKey: "maize-nakuru",
        marketName: "Nakuru Market",
        county: "Nakuru",
        avgPrice: 3970,
        minPrice: 3890,
        maxPrice: 4050,
        submissionsCount: 5,
        currentWindowCount: 5,
        lastUpdated: nowIso,
        trendDirection: "stable",
        trendPercentage: 1.4,
      },
      {
        marketKey: "maize-eldoret",
        marketName: "Eldoret Market",
        county: "Uasin Gishu",
        avgPrice: 3820,
        minPrice: 3750,
        maxPrice: 3900,
        submissionsCount: 4,
        currentWindowCount: 4,
        lastUpdated: nowIso,
        trendDirection: "down",
        trendPercentage: -1.8,
      },
    ],
    insight:
      "Maize is paying best in Wakulima Market, Nairobi at about KES 4,550 per 90kg bag, roughly 19% above Uasin Gishu this week.",
    isFallback: true,
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
  {
    id: "fallback-1",
    productKey: "maize",
    productName: "Maize",
    county: "Nairobi",
    marketName: "Wakulima Market",
    price: 4550,
    unit: "90kg bag",
    sourceType: "admin",
    contributorName: "Agrisoko market desk",
    observationDate: nowIso,
  },
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
    trackedProducts: fallbackProduceBoard.length + fallbackFertilizerBoard.length,
    trackedMarkets: TRACKED_INTELLIGENCE_MARKETS.length,
    commoditiesCovered: [
      ...fallbackProduceBoard.map((item) => item.productKey),
      ...fallbackFertilizerBoard.map((item) => item.productKey),
    ],
  },
  produceBoard: fallbackProduceBoard,
  fertilizerBoard: fallbackFertilizerBoard,
  topSignals: [
    {
      productKey: "maize",
      productName: "Maize",
      trendDirection: "up",
      trendPercentage: 4.6,
      bestCounty: "Nairobi",
      bestMarketName: "Wakulima Market",
      bestPrice: 4550,
      summary:
        "Maize is paying best in Wakulima Market, Nairobi, with stronger upside than Eldoret and Nakuru this week.",
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
  category: item?.category === "inputs" ? "inputs" : "produce",
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

export function getFallbackIntelligenceOverview(): IntelligenceOverview {
  return deepClone(FALLBACK_OVERVIEW);
}

export function getFallbackProductSnapshot(
  productKey: string
): IntelligenceProductSnapshot | null {
  const overview = getFallbackIntelligenceOverview();
  return (
    overview.produceBoard.find((item) => item.productKey === productKey) ||
    overview.fertilizerBoard.find((item) => item.productKey === productKey) ||
    null
  );
}

export function normalizeIntelligenceOverview(payload: any): IntelligenceOverview {
  const raw = payload?.data && (payload.data.produceBoard || payload.data.fertilizerBoard)
    ? payload.data
    : payload;

  if (!raw || (!Array.isArray(raw.produceBoard) && !Array.isArray(raw.fertilizerBoard))) {
    return getFallbackIntelligenceOverview();
  }

  const produceBoard = Array.isArray(raw.produceBoard) ? raw.produceBoard.map(normalizeProduct) : [];
  const fertilizerBoard = Array.isArray(raw.fertilizerBoard)
    ? raw.fertilizerBoard.map(normalizeProduct)
    : [];

  if (!produceBoard.length && !fertilizerBoard.length) {
    return getFallbackIntelligenceOverview();
  }

  return {
    generatedAt: raw?.generatedAt ? String(raw.generatedAt) : new Date().toISOString(),
    meta: {
      approvedSubmissions: Number(raw?.meta?.approvedSubmissions || 0),
      trackedProducts: Number(raw?.meta?.trackedProducts || produceBoard.length + fertilizerBoard.length),
      trackedMarkets: Number(raw?.meta?.trackedMarkets || 0),
      commoditiesCovered: Array.isArray(raw?.meta?.commoditiesCovered)
        ? raw.meta.commoditiesCovered.map((item: unknown) => String(item))
        : [],
    },
    produceBoard,
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
