"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { kenyaCounties, getConstituenciesByCounty, getWardsByConstituency } from "@/data/kenyaCounties";

type BulkOrderCategory = "produce" | "livestock" | "inputs" | "service";

export default function BulkOrderCreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const counties = useMemo(() => kenyaCounties.map((c) => c.name), []);

  const [accessLoading, setAccessLoading] = useState(true);
  const [canPost, setCanPost] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<BulkOrderCategory>("produce");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deliveryScope, setDeliveryScope] = useState<"countrywide" | "within_county" | "negotiable">("within_county");
  const [county, setCounty] = useState("");
  const [constituency, setConstituency] = useState("");
  const [ward, setWard] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const constituencyOptions = useMemo(() => county ? getConstituenciesByCounty(county) : [], [county]);
  const wardOptions = useMemo(() => county && constituency ? getWardsByConstituency(county, constituency) : [], [county, constituency]);

  useEffect(() => {
    if (!county) { setConstituency(""); setWard(""); return; }
    const valid = getConstituenciesByCounty(county).some((o) => o.value === constituency);
    if (!valid) { setConstituency(""); setWard(""); return; }
    const wardValid = getWardsByConstituency(county, constituency).some((o) => o.value === ward);
    if (!wardValid) setWard("");
  }, [county, constituency, ward]);

  useEffect(() => {
    if (!user) { setAccessLoading(false); return; }
    let active = true;
    apiRequest(API_ENDPOINTS.bulkApplications.myStatus)
      .then((s: any) => { if (active) setCanPost(Boolean(s?.canPostB2BDemand || s?.isAdmin)); })
      .catch(() => {})
      .finally(() => { if (active) setAccessLoading(false); });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (user?.phone) setContactPhone(user.phone);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const qty = Number(quantity);
    const minN = budgetMin ? Number(budgetMin) : undefined;
    const maxN = budgetMax ? Number(budgetMax) : undefined;
    if (!title.trim() || !itemName.trim()) return setError("Title and item are required.");
    if (!Number.isFinite(qty) || qty <= 0) return setError("Quantity must be greater than zero.");
    if (!county.trim()) return setError("County is required.");
    if (minN === undefined && maxN === undefined) return setError("Budget is required.");
    try {
      setSubmitting(true);
      const res = await apiRequest(API_ENDPOINTS.bulkOrders.create, {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(), itemName: itemName.trim(), category,
          description: description.trim() || undefined,
          quantity: qty, unit: unit.trim() || "kg",
          budget: { ...(minN !== undefined ? { min: minN } : {}), ...(maxN !== undefined ? { max: maxN } : {}), currency: "KES" },
          deliveryScope,
          deliveryLocation: { county: county.trim(), constituency: constituency.trim() || undefined, ward: ward.trim() || undefined, addressLine: addressLine.trim() || undefined },
          deliveryDeadline: deliveryDeadline || undefined,
          contactPhone: contactPhone.trim() || undefined,
        }),
      });
      router.push(`/bulk/orders/${res?.data?._id || res?._id || ""}`);
    } catch (err: any) {
      setError(err?.message || "Failed to create bulk order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-2xl border border-stone-100 bg-white p-8">
        <h1 className="text-2xl font-bold text-stone-900">Post a bulk order</h1>
        <p className="mt-2 text-sm text-stone-500">Sign in first to continue.</p>
        <Link href="/login?redirect=/bulk/orders/new" className="mt-5 inline-block rounded-xl bg-terra-500 px-5 py-3 text-sm font-semibold text-white hover:bg-terra-600">Sign in</Link>
      </div>
    </div>
  );

  if (!accessLoading && !canPost) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-bold text-amber-900">Bulk buyer approval required</h1>
        <p className="mt-2 text-sm text-amber-800">Apply as a bulk buyer first, then post demand after approval.</p>
        <Link href="/bulk?role=buyer" className="mt-5 inline-block rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700">Open buyer application</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Bulk buying</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">Post bulk demand</h1>
        <p className="mt-1 text-sm text-stone-500">This is separate from the normal buyer-request board. Add quantity, budget, and delivery details so suppliers can bid clearly.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Order title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" placeholder="Need tomatoes for weekly supply" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Item *</label>
            <input value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" placeholder="Tomatoes" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as BulkOrderCategory)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400">
              {(["produce", "livestock", "inputs", "service"] as const).map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Delivery scope</label>
            <select value={deliveryScope} onChange={(e) => setDeliveryScope(e.target.value as typeof deliveryScope)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400">
              <option value="within_county">Within county</option>
              <option value="countrywide">Countrywide</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" placeholder="Quality requirements, packaging, and expectations." />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Quantity *", value: quantity, set: setQuantity, type: "number", placeholder: "" },
            { label: "Unit *", value: unit, set: setUnit, type: "text", placeholder: "kg" },
            { label: "Min budget (KES)", value: budgetMin, set: setBudgetMin, type: "number", placeholder: "" },
            { label: "Max budget (KES)", value: budgetMax, set: setBudgetMax, type: "number", placeholder: "" },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
              <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">County *</label>
            <select value={county} onChange={(e) => setCounty(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400">
              <option value="">Select county</option>
              {counties.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Constituency</label>
            <select value={constituency} onChange={(e) => setConstituency(e.target.value)} disabled={!county} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400 disabled:opacity-50">
              <option value="">Select constituency</option>
              {constituencyOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Ward</label>
            <select value={ward} onChange={(e) => setWard(e.target.value)} disabled={!constituency} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400 disabled:opacity-50">
              <option value="">Select ward</option>
              {wardOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Address / area</label>
            <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" placeholder="Estate, road, or institution" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Delivery deadline</label>
            <input type="date" value={deliveryDeadline} onChange={(e) => setDeliveryDeadline(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Contact phone</label>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" placeholder="+2547..." />
          </div>
        </div>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="submit" disabled={submitting} className="rounded-xl bg-terra-500 px-6 py-3 text-sm font-semibold text-white hover:bg-terra-600 disabled:opacity-50">
            {submitting ? "Posting..." : "Post bulk order"}
          </button>
          <Link href="/bulk/orders" className="rounded-xl border border-stone-200 px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
