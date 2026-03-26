"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { kenyaCounties } from "@/data/kenyaCounties";
import RequestCard from "@/components/marketplace/RequestCard";
import {
  ArrowUpRight,
  Clock3,
  Filter,
  MapPin,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";

type SortOption = "recommended" | "newest" | "urgent" | "budget_high";

const CATEGORY_LABELS: Record<string, string> = {
  produce: "Produce",
  livestock: "Livestock",
  inputs: "Inputs",
  service: "Services",
};

const COUNTIES = ["All Counties", ...kenyaCounties.map((county) => county.name)];

const getBudgetScore = (request: any) => {
  const min = typeof request?.budget?.min === "number" ? request.budget.min : 0;
  const max = typeof request?.budget?.max === "number" ? request.budget.max : 0;
  return Math.max(min, max);
};

const getUrgencyScore = (request: any) => {
  if (request?.urgency === "high") return 3;
  if (request?.urgency === "medium") return 2;
  return 1;
};

const getRecencyScore = (request: any) => {
  const createdAt = new Date(request?.createdAt || "").getTime();
  if (!Number.isFinite(createdAt)) return 0;
  const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);
  if (ageHours <= 24) return 4;
  if (ageHours <= 72) return 3;
  if (ageHours <= 24 * 7) return 2;
  return 1;
};

const getRequestScore = (request: any) => {
  const detailScore =
    (request?.productType ? 1 : 0) +
    (request?.quantity ? 1 : 0) +
    (request?.location?.constituency ? 0.5 : 0);

  return getUrgencyScore(request) * 4 + getBudgetScore(request) / 100000 + getRecencyScore(request) + detailScore;
};

export default function BrowseBuyerRequestsBoard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    county: "All Counties",
    urgency: "",
    search: "",
  });
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        limit: "24",
        status: "active",
        marketType: "standard",
      });

      if (filters.category) params.set("category", filters.category);
      if (filters.county !== "All Counties") params.set("county", filters.county);
      if (filters.urgency) params.set("urgency", filters.urgency);

      const response = await apiRequest(`${API_ENDPOINTS.buyerRequests.list}?${params.toString()}`);
      const items = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.requests)
        ? response.requests
        : [];
      setRequests(items);
    } catch (loadError: any) {
      setError(loadError?.message || "Unable to load buyer requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.county, filters.urgency]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    const searchToken = filters.search.trim().toLowerCase();
    const matchesSearch = (request: any) => {
      if (!searchToken) return true;
      return [
        request?.title,
        request?.description,
        request?.productType,
        request?.location?.county,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchToken));
    };

    const sorted = requests.filter(matchesSearch).sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "urgent") {
        const urgencyDiff = getUrgencyScore(b) - getUrgencyScore(a);
        if (urgencyDiff !== 0) return urgencyDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "budget_high") {
        const budgetDiff = getBudgetScore(b) - getBudgetScore(a);
        if (budgetDiff !== 0) return budgetDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      const scoreDiff = getRequestScore(b) - getRequestScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }, [filters.search, requests, sortBy]);

  const featuredRequests = useMemo(
    () => filteredRequests.slice(0, Math.min(3, filteredRequests.length)),
    [filteredRequests]
  );

  const urgentCount = filteredRequests.filter((request) => request?.urgency === "high").length;
  const countyCount = new Set(
    filteredRequests
      .map((request) => String(request?.location?.county || "").trim().toLowerCase())
      .filter(Boolean)
  ).size;

  const activeFilters: string[] = [];
  if (filters.category) activeFilters.push(`Category: ${CATEGORY_LABELS[filters.category]}`);
  if (filters.county !== "All Counties") activeFilters.push(`County: ${filters.county}`);
  if (filters.urgency) activeFilters.push(`Urgency: ${filters.urgency}`);
  if (filters.search.trim()) activeFilters.push(`Search: ${filters.search.trim()}`);

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="section-kicker">Demand board</p>
            <h1 className="mt-4 text-4xl font-bold text-stone-900">
              Real buyer demand across Kenya
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Suppliers should not guess what the market needs. This board keeps active requests
              visible, sortable, and serious enough to guide what gets listed next.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/request/new" className="primary-button">
              Post a request
            </Link>
            <Link href="/browse" className="secondary-button">
              Browse listings
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-terra-600" />
              <div>
                <p className="text-sm font-semibold text-stone-900">{filteredRequests.length} active requests</p>
                <p className="text-xs text-stone-500">Open demand visible right now</p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-terra-600" />
              <div>
                <p className="text-sm font-semibold text-stone-900">{urgentCount} urgent opportunities</p>
                <p className="text-xs text-stone-500">Requests that need fast response</p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-terra-600" />
              <div>
                <p className="text-sm font-semibold text-stone-900">{countyCount} counties represented</p>
                <p className="text-xs text-stone-500">County-level demand coverage</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.8fr_0.8fr_auto]">
            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Search maize, fertilizer, transport, onions..."
              className="field-input"
            />
            <select
              value={filters.county}
              onChange={(event) =>
                setFilters((current) => ({ ...current, county: event.target.value }))
              }
              className="field-select"
            >
              {COUNTIES.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters((current) => ({ ...current, category: event.target.value }))
              }
              className="field-select"
            >
              <option value="">All categories</option>
              <option value="produce">Produce</option>
              <option value="livestock">Livestock</option>
              <option value="inputs">Inputs</option>
              <option value="service">Services</option>
            </select>
            <select
              value={filters.urgency}
              onChange={(event) =>
                setFilters((current) => ({ ...current, urgency: event.target.value }))
              }
              className="field-select"
            >
              <option value="">All urgency</option>
              <option value="high">Urgent</option>
              <option value="medium">Within a week</option>
              <option value="low">Can wait</option>
            </select>
            <button type="button" onClick={loadRequests} className="secondary-button">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              <Filter className="h-3.5 w-3.5" />
              Sort
            </div>
            {[
              ["recommended", "Top picks"],
              ["newest", "Newest"],
              ["urgent", "Urgent first"],
              ["budget_high", "Higher budget"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSortBy(value as SortOption)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  sortBy === value
                    ? "bg-terra-500 text-white"
                    : "border border-stone-200 bg-stone-50 text-stone-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeFilters.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {activeFilters.map((item) => (
            <span
              key={item}
              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700"
            >
              {item}
            </span>
          ))}
          <button
            type="button"
            onClick={() =>
              setFilters({
                category: "",
                county: "All Counties",
                urgency: "",
                search: "",
              })
            }
            className="text-sm font-semibold text-terra-600 hover:text-terra-700"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      {featuredRequests.length > 0 ? (
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Live demand</p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">Requests worth reviewing first</h2>
            </div>
            <Link href="/request/new" className="text-sm font-semibold text-terra-600 hover:text-terra-700">
              Post your own
            </Link>
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            {featuredRequests.map((request) => (
              <RequestCard key={request._id || request.id} request={request} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="section-kicker">All active requests</p>
            <h2 className="mt-1 text-2xl font-bold text-stone-900">
              Demand across counties and categories
            </h2>
          </div>
          <Link href="/browse" className="inline-flex items-center gap-2 text-sm font-semibold text-terra-600 hover:text-terra-700">
            See matching listings
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="surface-card p-10 text-center text-sm text-stone-500">
            Loading buyer requests...
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRequests.map((request) => (
              <RequestCard key={request._id || request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className="surface-card p-10 text-center">
            <h2 className="text-2xl font-bold text-stone-900">No buyer requests match those filters</h2>
            <p className="mt-3 text-sm text-stone-600">
              Reset the filters or post a fresh request to start the demand signal.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    category: "",
                    county: "All Counties",
                    urgency: "",
                    search: "",
                  })
                }
                className="secondary-button"
              >
                Clear filters
              </button>
              <Link href="/request/new" className="primary-button">
                Post a request
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
