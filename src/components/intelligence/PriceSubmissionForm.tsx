"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  TRACKED_INTELLIGENCE_MARKETS,
  TRACKED_INTELLIGENCE_PRODUCTS,
  buildPriceContributionHref,
  buildPriceContributionPrompt,
} from "@/lib/market-intelligence";
import InvitePriceButton from "./InvitePriceButton";

type Props = {
  defaults?: {
    product?: string;
    county?: string;
    market?: string;
    unit?: string;
  };
};

const todayInputValue = new Date().toISOString().slice(0, 10);

export default function PriceSubmissionForm({ defaults }: Props) {
  const { isAuthenticated, user } = useAuth();
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<null | {
    productKey: string;
    productName: string;
    county: string;
    marketName: string;
  }>(null);

  const selectedProduct =
    TRACKED_INTELLIGENCE_PRODUCTS.find((item) => item.key === form.productKey) ||
    TRACKED_INTELLIGENCE_PRODUCTS[0];

  useEffect(() => {
    setForm((current) => ({
      ...current,
      contributorName: current.contributorName || user?.fullName || user?.name || "",
      contributorPhone: current.contributorPhone || user?.phone || "",
    }));
  }, [user?.fullName, user?.name, user?.phone]);

  useEffect(() => {
    setForm((current) => {
      if (current.unit === selectedProduct.defaultUnit) return current;
      if (defaults?.unit) return current;
      return { ...current, unit: selectedProduct.defaultUnit };
    });
  }, [defaults?.unit, selectedProduct.defaultUnit]);

  const prompt = buildPriceContributionPrompt({
    productName: selectedProduct.name,
    county: form.county,
    marketName: form.marketName,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await apiRequest(API_ENDPOINTS.marketIntelligence.submissions, {
        method: "POST",
        body: JSON.stringify({
          productKey: form.productKey,
          county: form.county,
          marketName: form.marketName,
          unit: form.unit,
          price: Number(form.price),
          observationDate: form.observationDate,
          notes: form.notes,
          contributorName: form.contributorName,
          contributorPhone: form.contributorPhone,
        }),
      });

      setSuccess({
        productKey: form.productKey,
        productName: selectedProduct.name,
        county: form.county,
        marketName: form.marketName,
      });
      setForm((current) => ({
        ...current,
        price: "",
        notes: "",
      }));
    } catch (submissionError: any) {
      setError(
        submissionError?.message ||
          "We could not save this price report right now. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="surface-card p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="section-kicker">Share today&apos;s price</p>
          <h1 className="mt-4 text-3xl font-bold text-stone-900 sm:text-4xl">
            Help Agrisoko build trusted market intelligence from the ground.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Submit what you are seeing in the market today. Every report is reviewed before it
            affects public price boards, trends, and best-market recommendations.
          </p>
        </div>

        <div className="mt-6 rounded-[26px] border border-stone-200 bg-[#f8f3eb] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Contribution prompt
          </p>
          <p className="mt-2 text-xl font-bold text-stone-900">{prompt}</p>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Keep it simple: tell us the price, the market, and the unit. If the market is moving
            because of oversupply, transport, or quality differences, add that in the notes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Product</span>
              <select
                value={form.productKey}
                onChange={(event) =>
                  setForm((current) => ({ ...current, productKey: event.target.value }))
                }
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
              <span className="field-label">Unit</span>
              <input
                value={form.unit}
                onChange={(event) =>
                  setForm((current) => ({ ...current, unit: event.target.value }))
                }
                className="field-input"
                placeholder="90kg bag"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">County</span>
              <select
                value={form.county}
                onChange={(event) => {
                  const nextCounty = event.target.value;
                  const preferredMarket = TRACKED_INTELLIGENCE_MARKETS.find(
                    (item) => item.county === nextCounty
                  );
                  setForm((current) => ({
                    ...current,
                    county: nextCounty,
                    marketName: preferredMarket?.marketName || current.marketName,
                  }));
                }}
                className="field-select"
              >
                {Array.from(new Set(TRACKED_INTELLIGENCE_MARKETS.map((item) => item.county))).map(
                  (county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              <span className="field-label">Market name</span>
              <input
                value={form.marketName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, marketName: event.target.value }))
                }
                className="field-input"
                placeholder="Wakulima Market"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Observed price in KES</span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({ ...current, price: event.target.value }))
                }
                className="field-input"
                placeholder="4500"
                required
              />
            </label>

            <label>
              <span className="field-label">Observation date</span>
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
          </div>

          <label>
            <span className="field-label">What explains this price? Optional notes</span>
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
              className="field-textarea"
              placeholder="Oversupply from Kajiado, transport disruption, premium grade stock, buyer shortage..."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">
                {isAuthenticated ? "Your name" : "Your name or business"}
              </span>
              <input
                value={form.contributorName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, contributorName: event.target.value }))
                }
                className="field-input"
                placeholder="Your name"
                required={!isAuthenticated && !form.contributorPhone}
              />
            </label>

            <label>
              <span className="field-label">Phone for verification</span>
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

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" disabled={saving} className="primary-button">
              {saving ? "Submitting..." : "Submit price report"}
            </button>
            <Link
              href={buildPriceContributionHref({
                productKey: form.productKey,
                county: form.county,
                marketName: form.marketName,
                unit: form.unit,
              })}
              className="secondary-button"
            >
              Reset with this link
            </Link>
          </div>
        </form>
      </section>

      <aside className="space-y-5">
        <div className="soft-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Why this matters
          </p>
          <ul className="mt-4 space-y-4 text-sm leading-relaxed text-stone-600">
            <li>Every approved report improves the public price board for that commodity.</li>
            <li>The best-market signals compare locations, not just one quoted price.</li>
            <li>We use multiple reports per market to reduce noise and one-off outliers.</li>
          </ul>
        </div>

        <div className="surface-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Invite others
          </p>
          <h2 className="mt-3 text-2xl font-bold text-stone-900">
            Spread one clean question through your network.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">{prompt}</p>

          <div className="mt-5">
            <InvitePriceButton
              productKey={form.productKey}
              productName={selectedProduct.name}
              county={form.county}
              marketName={form.marketName}
              unit={form.unit}
            />
          </div>
        </div>

        {success ? (
          <div className="rounded-[28px] border border-forest-200 bg-forest-50 p-6 shadow-[0_20px_50px_-36px_rgba(39,174,96,0.3)]">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-stone-900">Price report received</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-700">
              The Agrisoko team will review this submission before it appears on the public market
              board.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href={`/market-intelligence/${success.productKey}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-800"
              >
                View {success.productName} intelligence
                <ArrowRight className="h-4 w-4" />
              </Link>
              <InvitePriceButton
                productKey={success.productKey}
                productName={success.productName}
                county={success.county}
                marketName={success.marketName}
                unit={form.unit}
              />
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
