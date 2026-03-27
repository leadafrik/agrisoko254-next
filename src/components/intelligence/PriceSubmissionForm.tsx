"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import CommodityQuickPicker from "@/components/intelligence/CommodityQuickPicker";
import DecisionSnapshotCard from "@/components/intelligence/DecisionSnapshotCard";
import IntelligenceStatusStrip from "@/components/intelligence/IntelligenceStatusStrip";
import MarketBoardTable from "@/components/intelligence/MarketBoardTable";
import MarketPulsePanel from "@/components/intelligence/MarketPulsePanel";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  type IntelligenceCategory,
  type IntelligenceOverview,
  type IntelligenceSubmissionFeedback,
  TRACKED_INTELLIGENCE_MARKETS,
  TRACKED_INTELLIGENCE_PRODUCTS,
  formatKes,
  getFallbackIntelligenceOverview,
  getFallbackProductSnapshot,
  normalizeIntelligenceOverview,
  normalizeSubmissionFeedback,
} from "@/lib/market-intelligence";
import { buildProductPulseItems } from "@/lib/market-intelligence-presentation";
import InvitePriceButton from "./InvitePriceButton";

type Props = {
  defaults?: { product?: string; county?: string; market?: string; unit?: string };
  initialOverview?: IntelligenceOverview;
};

type SubmissionState = {
  productKey: string;
  productName: string;
  county: string;
  marketName: string;
  unit: string;
  feedback: IntelligenceSubmissionFeedback | null;
};

const CATEGORY_LABELS: Record<IntelligenceCategory, string> = {
  produce: "Produce",
  livestock: "Livestock",
  inputs: "Farm inputs",
};

const todayInputValue = new Date().toISOString().slice(0, 10);

const normalizeText = (value?: string | null) => String(value || "").trim().toLowerCase();

const buildFeedbackCopy = (feedback: IntelligenceSubmissionFeedback) => {
  if (feedback.comparisonLabel === "above") {
    return `Your price is ${Math.abs(feedback.deltaPercentage).toFixed(1)}% above the current approved average.`;
  }

  if (feedback.comparisonLabel === "below") {
    return `Your price is ${Math.abs(feedback.deltaPercentage).toFixed(1)}% below the current approved average.`;
  }

  return "Your price sits close to the current approved average.";
};

const getCategoryFromProductKey = (productKey?: string): IntelligenceCategory => {
  const product = TRACKED_INTELLIGENCE_PRODUCTS.find((item) => item.key === productKey);
  return product?.category || "produce";
};

export default function PriceSubmissionForm({ defaults, initialOverview }: Props) {
  const { user } = useAuth();
  const [overview, setOverview] = useState<IntelligenceOverview>(
    initialOverview || getFallbackIntelligenceOverview()
  );
  const [activeCategory, setActiveCategory] = useState<IntelligenceCategory>(
    getCategoryFromProductKey(defaults?.product)
  );
  const [form, setForm] = useState({
    productKey: defaults?.product || "maize",
    county: defaults?.county || "Nairobi",
    marketName: defaults?.market || "Wakulima Market",
    unit: defaults?.unit || "90kg bag",
    price: "",
    observationDate: todayInputValue,
    notes: "",
    contributorName: user?.fullName || user?.name || "",
    contributorPhone: user?.phone || "",
  });
  const [selectedMarketKey, setSelectedMarketKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SubmissionState | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showContact, setShowContact] = useState(Boolean(user?.phone || user?.fullName || user?.name));

  const selectedProduct =
    TRACKED_INTELLIGENCE_PRODUCTS.find((product) => product.key === form.productKey) ||
    TRACKED_INTELLIGENCE_PRODUCTS[0];

  const allBoards = [
    ...overview.produceBoard,
    ...overview.livestockBoard,
    ...overview.fertilizerBoard,
  ];

  const selectedSnapshot =
    allBoards.find((product) => product.productKey === form.productKey) ||
    getFallbackProductSnapshot(form.productKey) ||
    getFallbackProductSnapshot("maize")!;

  const categoryProducts = TRACKED_INTELLIGENCE_PRODUCTS.filter(
    (product) => product.category === activeCategory
  );

  const countyList = Array.from(
    new Set(
      selectedSnapshot.markets.length
        ? selectedSnapshot.markets.map((market) => market.county)
        : TRACKED_INTELLIGENCE_MARKETS.map((market) => market.county)
    )
  ).sort();

  const statusItems = [
    { label: "Board average", value: formatKes(selectedSnapshot.overallAverage) },
    {
      label: "Best market",
      value: selectedSnapshot.bestMarket
        ? `${selectedSnapshot.bestMarket.county} ${formatKes(selectedSnapshot.bestMarket.avgPrice)}`
        : "Waiting for signals",
    },
    {
      label: "Cheapest market",
      value: selectedSnapshot.weakestMarket
        ? `${selectedSnapshot.weakestMarket.county} ${formatKes(selectedSnapshot.weakestMarket.avgPrice)}`
        : "Waiting for signals",
    },
    {
      label: "Reports",
      value: selectedSnapshot.submissionsCount.toLocaleString(),
    },
  ];

  useEffect(() => {
    setActiveCategory(selectedProduct.category);
  }, [selectedProduct.category]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      contributorName: current.contributorName || user?.fullName || user?.name || "",
      contributorPhone: current.contributorPhone || user?.phone || "",
    }));
  }, [user?.fullName, user?.name, user?.phone]);

  useEffect(() => {
    if (user?.phone || user?.fullName || user?.name) {
      setShowContact(true);
    }
  }, [user?.fullName, user?.name, user?.phone]);

  useEffect(() => {
    if (defaults?.unit) return;
    setForm((current) =>
      current.unit === selectedProduct.defaultUnit
        ? current
        : { ...current, unit: selectedProduct.defaultUnit }
    );
  }, [defaults?.unit, selectedProduct.defaultUnit]);

  useEffect(() => {
    if (!selectedSnapshot.markets.length) return;

    const exactMatch = selectedSnapshot.markets.find(
      (market) =>
        normalizeText(market.county) === normalizeText(form.county) &&
        normalizeText(market.marketName) === normalizeText(form.marketName)
    );

    const preferredMarket = exactMatch || selectedSnapshot.bestMarket || selectedSnapshot.markets[0];
    if (!preferredMarket) return;

    setSelectedMarketKey((current) => current || preferredMarket.marketKey);
  }, [form.county, form.marketName, selectedSnapshot]);

  const selectProduct = (productKey: string) => {
    const nextProduct =
      TRACKED_INTELLIGENCE_PRODUCTS.find((product) => product.key === productKey) || selectedProduct;
    const nextSnapshot =
      allBoards.find((product) => product.productKey === productKey) ||
      getFallbackProductSnapshot(productKey);
    const preferredMarket = nextSnapshot?.bestMarket || nextSnapshot?.markets[0];

    setActiveCategory(nextProduct.category);
    setSelectedMarketKey(preferredMarket?.marketKey || "");
    setForm((current) => ({
      ...current,
      productKey,
      unit: defaults?.unit || nextProduct.defaultUnit,
      county: preferredMarket?.county || current.county,
      marketName: preferredMarket?.marketName || current.marketName,
    }));
  };

  const applyMarketSelection = (marketKey: string) => {
    const market = selectedSnapshot.markets.find((item) => item.marketKey === marketKey);
    if (!market) return;

    setSelectedMarketKey(marketKey);
    setForm((current) => ({
      ...current,
      county: market.county,
      marketName: market.marketName,
      unit: current.unit || selectedProduct.defaultUnit,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await apiRequest(API_ENDPOINTS.marketIntelligence.submissions, {
        method: "POST",
        body: JSON.stringify({
          productKey: form.productKey,
          county: form.county,
          marketName: form.marketName,
          unit: form.unit,
          price: Number(form.price),
          observationDate: form.observationDate,
          notes: form.notes.trim() || undefined,
          contributorName: form.contributorName.trim() || undefined,
          contributorPhone: form.contributorPhone.trim() || undefined,
        }),
      });

      setSuccess({
        productKey: form.productKey,
        productName: selectedProduct.name,
        county: form.county,
        marketName: form.marketName,
        unit: form.unit,
        feedback: normalizeSubmissionFeedback(response?.feedback),
      });

      setForm((current) => ({ ...current, price: "", notes: "" }));

      fetch(API_ENDPOINTS.marketIntelligence.overview, {
        cache: "no-store",
        credentials: "include",
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload) => {
          if (payload) {
            setOverview(normalizeIntelligenceOverview(payload));
          }
        })
        .catch(() => {});
    } catch (submitError: any) {
      setError(submitError?.message || "Could not save right now. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-[28px] border border-forest-200 bg-forest-50 p-8 shadow-[0_20px_50px_-36px_rgba(39,174,96,0.3)]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-600 text-white">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-stone-900">Price report received</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Your report for {success.marketName}, {success.county} is in review. Approved reports
            update the live board automatically.
          </p>

          {success.feedback ? (
            <div className="mt-5 rounded-[22px] border border-forest-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">
                Impact
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-900">
                {success.feedback.reportsToday} report
                {success.feedback.reportsToday !== 1 ? "s" : ""} logged today
              </p>
              <p className="mt-1 text-sm text-stone-600">{buildFeedbackCopy(success.feedback)}</p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={`/market-intelligence/${success.productKey}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-800"
            >
              View {success.productName} board <ArrowRight className="h-4 w-4" />
            </Link>
            <InvitePriceButton
              productKey={success.productKey}
              productName={success.productName}
              county={success.county}
              marketName={success.marketName}
              unit={success.unit}
            />
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="text-sm font-semibold text-stone-500 hover:text-stone-800"
            >
              Submit another price
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="max-w-3xl">
        <p className="section-kicker">Submit a price</p>
        <h1 className="mt-3 text-4xl font-bold text-stone-900 sm:text-5xl">
          Participate in the market, not just the form.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          Pick the commodity, confirm the live board, tap the market you are reporting on, then
          submit one clean price. Every approved report strengthens the board for farmers and buyers.
        </p>
      </div>

      <div className="mt-8 inline-flex rounded-full border border-stone-200 bg-stone-50 p-1">
        {(Object.keys(CATEGORY_LABELS) as IntelligenceCategory[]).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => {
              setActiveCategory(category);
              const firstProduct = TRACKED_INTELLIGENCE_PRODUCTS.find(
                (product) => product.category === category
              );
              if (firstProduct) {
                selectProduct(firstProduct.key);
              }
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === category
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <CommodityQuickPicker
        className="mt-6"
        title={`Choose a ${CATEGORY_LABELS[activeCategory].toLowerCase()} product`}
        description="Start with the commodity you want to report today."
        products={categoryProducts.map((product) => {
          const snapshot =
            allBoards.find((item) => item.productKey === product.key) ||
            getFallbackProductSnapshot(product.key);
          return {
            key: product.key,
            name: product.name,
            value: snapshot ? formatKes(snapshot.overallAverage) : undefined,
            helper: snapshot?.bestMarket
              ? `Best sell: ${snapshot.bestMarket.county} at ${formatKes(snapshot.bestMarket.avgPrice)}`
              : "Waiting for approved signals",
          };
        })}
        selectedKey={form.productKey}
        onSelect={selectProduct}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr,0.95fr]">
        <DecisionSnapshotCard
          product={selectedSnapshot}
          focusMarket={
            selectedSnapshot.markets.find((market) => market.marketKey === selectedMarketKey) ||
            selectedSnapshot.bestMarket
          }
        />
        <div className="space-y-6">
          <IntelligenceStatusStrip items={statusItems} />
          <MarketPulsePanel
            title="Live guidance"
            items={buildProductPulseItems(
              selectedSnapshot,
              selectedSnapshot.markets.find((market) => market.marketKey === selectedMarketKey) ||
                selectedSnapshot.bestMarket
            )}
          />
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-stone-200 bg-[#faf7f2] px-5 py-4 text-sm text-stone-600">
        Tap a market row below to prefill the county and market fields automatically.
      </div>

      <MarketBoardTable
        className="mt-6"
        product={selectedSnapshot}
        markets={selectedSnapshot.markets}
        selectedMarketKey={selectedMarketKey}
        onSelectMarket={applyMarketSelection}
      />

      <div className="mt-8 rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_-36px_rgba(120,83,47,0.3)] sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
                Low-friction reporting
              </p>
              <h2 className="mt-2 text-2xl font-bold text-stone-900">Share one clean price</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
                Start with the market and price. Date, notes, and contact details are optional unless
                you want to add more context.
              </p>
            </div>
            <div className="rounded-[22px] border border-stone-200 bg-[#faf7f2] px-4 py-3 text-sm text-stone-600">
              Unit: <span className="font-semibold text-stone-900">{form.unit}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Product</span>
              <select
                value={form.productKey}
                onChange={(event) => selectProduct(event.target.value)}
                className="field-select"
              >
                {TRACKED_INTELLIGENCE_PRODUCTS.map((product) => (
                  <option key={product.key} value={product.key}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">County</span>
              <select
                value={form.county}
                onChange={(event) => {
                  const nextCounty = event.target.value;
                  const preferredMarket = selectedSnapshot.markets.find(
                    (market) => market.county === nextCounty
                  );
                  setForm((current) => ({
                    ...current,
                    county: nextCounty,
                    marketName: preferredMarket?.marketName || current.marketName,
                  }));
                  if (preferredMarket) {
                    setSelectedMarketKey(preferredMarket.marketKey);
                  }
                }}
                className="field-select"
              >
                {countyList.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Market name</span>
              <input
                value={form.marketName}
                onChange={(event) => setForm((current) => ({ ...current, marketName: event.target.value }))}
                className="field-input"
                placeholder="Wakulima Market"
                required
              />
            </label>
            <label>
              <span className="field-label">Price (KES)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className="field-input text-lg font-bold"
                placeholder="e.g. 4500"
                required
              />
            </label>
          </div>

          <div className="grid gap-3 rounded-[24px] border border-stone-200 bg-[#fcf8f2] p-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                Selected market
              </p>
              <p className="mt-2 text-base font-semibold text-stone-900">{form.marketName}</p>
              <p className="mt-1 text-sm text-stone-600">{form.county}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                Current board average
              </p>
              <p className="mt-2 text-base font-semibold text-stone-900">
                {formatKes(selectedSnapshot.overallAverage)}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Use the board as context, then report what you are seeing now.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowAdvanced((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-terra-200 hover:text-terra-700"
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAdvanced ? "Hide extra details" : "Add notes or change date"}
            </button>
            <button
              type="button"
              onClick={() => setShowContact((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-terra-200 hover:text-terra-700"
            >
              {showContact ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showContact ? "Hide contact details" : "Add contact details"}
            </button>
          </div>

          {showAdvanced ? (
            <div className="grid gap-4 rounded-[24px] border border-stone-200 bg-[#fcf8f2] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="field-label">Observed on</span>
                  <input
                    type="date"
                    value={form.observationDate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, observationDate: event.target.value }))
                    }
                    className="field-input"
                    required
                  />
                </label>
                <label>
                  <span className="field-label">Unit</span>
                  <input
                    value={form.unit}
                    onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
                    className="field-input"
                    placeholder="90kg bag"
                    required
                  />
                </label>
              </div>

              <label>
                <span className="field-label">Notes - optional</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  className="field-textarea min-h-[80px]"
                  placeholder="Oversupply, premium grade, transport pressure, buyer shortage..."
                />
              </label>
            </div>
          ) : null}

          {showContact ? (
            <div className="grid gap-4 rounded-[24px] border border-stone-200 bg-[#fcf8f2] p-4">
              <p className="text-sm leading-relaxed text-stone-600">
                Contact details are optional. They only help if the Agrisoko team needs to verify a
                price or follow up with you.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="field-label">Your name - optional</span>
                  <input
                    value={form.contributorName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contributorName: event.target.value }))
                    }
                    className="field-input"
                    placeholder="Your name"
                  />
                </label>
                <label>
                  <span className="field-label">Phone - optional</span>
                  <input
                    value={form.contributorPhone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contributorPhone: event.target.value }))
                    }
                    className="field-input"
                    placeholder="+254712345678"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-3">
            <button type="submit" disabled={saving} className="primary-button w-full">
              {saving ? "Submitting..." : "Share this price"}
            </button>
            <p className="text-center text-sm text-stone-500">
              You can submit anonymously. Adding a name or phone is optional.
            </p>
          </div>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-500">
        <span>
          Need the full board for {selectedProduct.name.toLowerCase()}? Open the decision page for
          this commodity.
        </span>
        <Link
          href={`/market-intelligence/${form.productKey}`}
          className="font-semibold text-terra-600 hover:text-terra-700"
        >
          View full board
        </Link>
      </div>
    </div>
  );
}
