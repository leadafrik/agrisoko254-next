"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

const institutionTypes = [
  "farm",
  "cooperative",
  "restaurant",
  "hotel",
  "hospital",
  "school",
  "processor",
  "distributor",
  "retailer",
  "ngo",
  "government",
  "other",
];

export default function BulkAccessPage() {
  const { isAuthenticated, user } = useAuth();
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    role: "buyer",
    contactName: user?.fullName || user?.name || "",
    organizationName: "",
    institutionType: "other",
    county: "",
    phone: user?.phone || "",
    email: user?.email || "",
    products: "",
    deliveryCoverage: "negotiable",
    procurementFrequency: "monthly",
    monthlyVolume: "",
    estimatedBudgetPerOrder: "",
    yearsInAgriculture: "",
    notes: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    apiRequest(API_ENDPOINTS.bulkApplications.myStatus)
      .then((response) => setSnapshot(response?.data ?? response))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest(API_ENDPOINTS.bulkApplications.submit, {
        method: "POST",
        body: JSON.stringify({
          role: form.role,
          contactName: form.contactName,
          organizationName: form.organizationName,
          institutionType: form.institutionType,
          address: {
            county: form.county,
          },
          phone: form.phone,
          email: form.email,
          products: form.products,
          deliveryCoverage: form.deliveryCoverage,
          procurementFrequency: form.procurementFrequency,
          monthlyVolume: form.monthlyVolume,
          estimatedBudgetPerOrder: form.estimatedBudgetPerOrder,
          yearsInAgriculture: form.yearsInAgriculture ? Number(form.yearsInAgriculture) : undefined,
          notes: form.notes,
        }),
      });
      setSuccess("Bulk access application submitted. Admin will review it and contact you.");
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to submit the bulk access application.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-shell py-10 sm:py-12">
        <div className="hero-panel p-6 sm:p-8">
          <p className="section-kicker">Bulk access</p>
          <h1 className="mt-4 text-4xl font-bold text-stone-900">Apply for structured bulk trade</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
            Bulk orders are separate from standard buyer requests. Use this flow when one buyer
            needs bigger supply, multiple sellers may bid, one offer gets accepted, payment is made
            through Agrisoko, and delivery follow-up is managed cleanly.
          </p>
          <Link href="/login?mode=signup&redirect=/bulk" className="primary-button mt-6">
            Sign in to apply
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8">
        <p className="section-kicker">Bulk trade</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-900">Apply for larger demand and supply workflows</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          This is the in-app bulk layer for bigger transactions. Buyers post structured demand,
          approved suppliers place bids, one offer is accepted, payment goes through Agrisoko, and
          the trade moves into delivery follow-up.
        </p>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-6 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-medium text-forest-700">
              {success}
            </div>
          ) : null}

          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Applying as</label>
                <select
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                  className="field-select"
                >
                  <option value="buyer">Bulk buyer</option>
                  <option value="seller">Bulk seller</option>
                </select>
              </div>
              <div>
                <label className="field-label">Institution type</label>
                <select
                  value={form.institutionType}
                  onChange={(event) => setForm((current) => ({ ...current, institutionType: event.target.value }))}
                  className="field-select"
                >
                  {institutionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Contact name</label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))}
                  className="field-input"
                  required
                />
              </div>
              <div>
                <label className="field-label">Organization name</label>
                <input
                  type="text"
                  value={form.organizationName}
                  onChange={(event) => setForm((current) => ({ ...current, organizationName: event.target.value }))}
                  className="field-input"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="field-label">County</label>
                <input
                  type="text"
                  value={form.county}
                  onChange={(event) => setForm((current) => ({ ...current, county: event.target.value }))}
                  className="field-input"
                  required
                />
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="field-input"
                  required
                />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="field-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">Products you buy or supply</label>
              <textarea
                value={form.products}
                onChange={(event) => setForm((current) => ({ ...current, products: event.target.value }))}
                className="field-textarea"
                placeholder="Example: maize, beans, potatoes, onions"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Delivery coverage</label>
                <select
                  value={form.deliveryCoverage}
                  onChange={(event) => setForm((current) => ({ ...current, deliveryCoverage: event.target.value }))}
                  className="field-select"
                >
                  <option value="countrywide">Countrywide</option>
                  <option value="within_county">Within county</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>
              <div>
                <label className="field-label">Procurement frequency</label>
                <select
                  value={form.procurementFrequency}
                  onChange={(event) => setForm((current) => ({ ...current, procurementFrequency: event.target.value }))}
                  className="field-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="as_needed">As needed</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="field-label">Monthly volume</label>
                <input
                  type="text"
                  value={form.monthlyVolume}
                  onChange={(event) => setForm((current) => ({ ...current, monthlyVolume: event.target.value }))}
                  className="field-input"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="field-label">Budget per order</label>
                <input
                  type="text"
                  value={form.estimatedBudgetPerOrder}
                  onChange={(event) => setForm((current) => ({ ...current, estimatedBudgetPerOrder: event.target.value }))}
                  className="field-input"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="field-label">Years in agriculture</label>
                <input
                  type="number"
                  min="0"
                  value={form.yearsInAgriculture}
                  onChange={(event) => setForm((current) => ({ ...current, yearsInAgriculture: event.target.value }))}
                  className="field-input"
                  placeholder={form.role === "seller" ? "Required for sellers" : "Optional"}
                />
              </div>
            </div>

            <div>
              <label className="field-label">Notes</label>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="field-textarea"
                placeholder="Anything that helps the Agrisoko team assess your use case."
              />
            </div>

            <button type="submit" disabled={saving} className="primary-button w-full">
              {saving ? "Submitting application..." : "Submit bulk access application"}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <h2 className="text-2xl font-bold text-stone-900">Current access snapshot</h2>
            {loading ? (
              <p className="mt-4 text-sm text-stone-500">Loading access status...</p>
            ) : snapshot ? (
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                {Object.entries(snapshot).map(([key, value]) => (
                  <div key={key} className="rounded-2xl bg-stone-50 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">{key}</p>
                    <p className="mt-1 font-semibold text-stone-900">{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-stone-500">
                No bulk access snapshot is available yet. Submit an application to begin review.
              </p>
            )}
          </div>

          <div className="soft-panel p-6">
            <h2 className="text-2xl font-bold text-stone-900">After approval</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
              <li>Buyers can post bulk demand separately from the normal buyer-request board.</li>
              <li>Sellers can review bulk orders and place formal bids where they qualify.</li>
              <li>Accepted offers move into payment and delivery follow-up.</li>
            </ul>
            <Link href="/bulk/orders" className="secondary-button mt-5 w-full">
              Open bulk order board
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
