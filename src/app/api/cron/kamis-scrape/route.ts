/**
 * Vercel Cron — Daily KAMIS Price Scrape
 * ======================================
 * Fetches yesterday's prices from the Kenya Agricultural Market Information
 * System (KAMIS) and submits them to the Agrisoko market intelligence backend.
 *
 * Triggered by Vercel Cron at 06:00 EAT (03:00 UTC) every day.
 * Configure in vercel.json:
 *   { "crons": [{ "path": "/api/cron/kamis-scrape", "schedule": "0 3 * * *" }] }
 *
 * Required env vars:
 *   CRON_SECRET      — Vercel passes this; we validate it to block external calls
 *   ADMIN_EMAIL      — admin login for the backend
 *   ADMIN_PASSWORD   — admin password
 *   NEXT_PUBLIC_API_URL (optional) — overrides backend URL
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300; // 5-minute max — KAMIS can be slow

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://kodisha-backend-vjr9.onrender.com/api";

// ---------------------------------------------------------------------------
// KAMIS product definitions
// ---------------------------------------------------------------------------
interface KamisProduct {
  id: number;
  productKey: string;
  productName: string;
  category: string;
  unit: string;
  kgFactor: number;
}

const KAMIS_PRODUCTS: KamisProduct[] = [
  { id: 1,   productKey: "maize",    productName: "Dry Maize",       category: "produce",   unit: "90kg bag",       kgFactor: 90  },
  { id: 29,  productKey: "beans",    productName: "Beans",           category: "produce",   unit: "90kg bag",       kgFactor: 90  },
  { id: 64,  productKey: "beans",    productName: "Beans",           category: "produce",   unit: "90kg bag",       kgFactor: 90  },
  { id: 61,  productKey: "tomatoes", productName: "Tomatoes",        category: "produce",   unit: "crate",          kgFactor: 64  },
  { id: 158, productKey: "onions",   productName: "Dry Onions",      category: "produce",   unit: "kg",             kgFactor: 1   },
  { id: 163, productKey: "potatoes", productName: "Irish Potatoes",  category: "produce",   unit: "120kg bag",      kgFactor: 120 },
  { id: 73,  productKey: "beef",     productName: "Beef",            category: "livestock", unit: "kg",             kgFactor: 1   },
  { id: 76,  productKey: "broilers", productName: "Broiler Chicken", category: "livestock", unit: "kg live weight", kgFactor: 1   },
];

// ---------------------------------------------------------------------------
// HTML parsing
// ---------------------------------------------------------------------------

function stripHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .trim();
}

/**
 * Parse <tbody> rows from KAMIS HTML.
 * KAMIS columns (0-indexed):
 *   0  County
 *   1  Market
 *   2  Commodity
 *   3  Classification / subtype
 *   4  Grade
 *   5  Selling Price (KES/kg)
 *   6  Wholesale Price (KES/kg)
 *   7  Retail Price (KES/kg)
 *   8  Supply Volume
 *   9  Date (DD/MM/YYYY)
 */
function parseKamisRows(html: string): string[][] {
  const rows: string[][] = [];
  const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return rows;

  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch: RegExpExecArray | null;
  while ((trMatch = trRe.exec(tbodyMatch[1])) !== null) {
    const cells: string[] = [];
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch: RegExpExecArray | null;
    while ((tdMatch = tdRe.exec(trMatch[1])) !== null) {
      cells.push(stripHtml(tdMatch[1]));
    }
    if (cells.length >= 9) rows.push(cells);
  }
  return rows;
}

interface SubmissionPayload {
  productKey: string;
  productName: string;
  category: string;
  county: string;
  marketName: string;
  subType: string;
  price: number;
  unit: string;
  currency: string;
  observationDate: string;
  contributorName: string;
  sourceType: string;
  notes: string;
}

function rowToSubmission(cells: string[], product: KamisProduct): SubmissionPayload | null {
  const county = cells[0]?.trim() || "";
  const marketName = cells[1]?.trim() || "";
  const subType = cells[3]?.trim() || cells[2]?.trim() || "";
  const dateRaw = cells[9]?.trim() || cells[8]?.trim() || "";

  // Average all valid price columns (retail + wholesale + selling)
  const retail = parseFloat(cells[7]);
  const selling = parseFloat(cells[5]);
  const wholesale = parseFloat(cells[6]);
  const validPrices = [retail, selling, wholesale].filter((v) => Number.isFinite(v) && v > 0);
  if (!validPrices.length) return null;
  const perKg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;

  const price = Math.round(perKg * product.kgFactor);
  if (price <= 0) return null;

  // Parse DD/MM/YYYY → YYYY-MM-DD
  const dateParts = dateRaw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dateParts) return null;
  const observationDate = `${dateParts[3]}-${dateParts[2].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`;

  if (!county || !marketName) return null;

  return {
    productKey: product.productKey,
    productName: product.productName,
    category: product.category,
    county,
    marketName,
    subType: subType || product.productName,
    price,
    unit: product.unit,
    currency: "KES",
    observationDate,
    contributorName: "KAMIS (kilimo.go.ke)",
    sourceType: "kamis",
    notes: `KAMIS avg(${validPrices.map(Math.round).join("+")})=${Math.round(perKg)} KES/kg × ${product.kgFactor} = ${price} KES/${product.unit}`,
  };
}

// ---------------------------------------------------------------------------
// Network helpers
// ---------------------------------------------------------------------------

async function adminLogin(): Promise<string> {
  const res = await fetch(`${API_BASE}/admin-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    }),
  });
  if (!res.ok) throw new Error(`Admin login failed: ${res.status}`);
  const data = await res.json();
  const token = data?.token || data?.data?.token || data?.accessToken;
  if (!token) throw new Error("No token in admin login response");
  return String(token);
}

async function fetchKamisHtml(productId: number, date: string): Promise<string> {
  const url = `https://kamis.kilimo.go.ke/site/market_search?product[]=${productId}&start=${date}&end=${date}&per_page=3000`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Agrisoko-KAMIS-Scraper/1.0; +https://agrisoko254.com)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`KAMIS HTTP ${res.status} for product ${productId}`);
  return res.text();
}

async function submitPrice(payload: SubmissionPayload, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/market-intelligence/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Submit ${res.status}: ${text.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  // Vercel Cron passes the secret via Authorization header.
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Target date: yesterday
  const target = new Date();
  target.setDate(target.getDate() - 1);
  const dateStr = target.toISOString().split("T")[0];

  const log: string[] = [`KAMIS scrape for ${dateStr}`];
  let submitted = 0;
  let failed = 0;

  let token: string;
  try {
    token = await adminLogin();
    log.push("Admin login OK");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.push(`Admin login failed: ${msg}`);
    return NextResponse.json({ ok: false, log }, { status: 500 });
  }

  for (const product of KAMIS_PRODUCTS) {
    let html: string;
    try {
      html = await fetchKamisHtml(product.id, dateStr);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.push(`[SKIP] ${product.productKey} fetch failed: ${msg}`);
      failed++;
      continue;
    }

    const rows = parseKamisRows(html);
    let productSubmitted = 0;
    let productFailed = 0;

    for (const cells of rows) {
      const payload = rowToSubmission(cells, product);
      if (!payload) {
        productFailed++;
        continue;
      }

      try {
        await submitPrice(payload, token);
        productSubmitted++;
        submitted++;
        // 60ms delay — polite rate limiting
        await new Promise((r) => setTimeout(r, 60));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        log.push(`[FAIL] ${product.productKey}/${payload.county}/${payload.marketName}: ${msg}`);
        productFailed++;
        failed++;
      }
    }

    log.push(
      `${product.productKey}: ${rows.length} rows → ${productSubmitted} submitted, ${productFailed} skipped`
    );
  }

  log.push(`Total: ${submitted} submitted, ${failed} failed`);
  return NextResponse.json({ ok: true, date: dateStr, submitted, failed, log });
}
