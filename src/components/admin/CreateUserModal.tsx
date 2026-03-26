"use client";

import type { Dispatch, SetStateAction } from "react";
import { X, UserPlus } from "lucide-react";
import {
  getConstituenciesByCounty,
  getWardsByConstituency,
  kenyaCounties,
} from "@/data/kenyaCounties";

export type AdminAccessType = "regular" | "bulk_buyer" | "bulk_seller";
type InstitutionType =
  | "farm"
  | "cooperative"
  | "restaurant"
  | "hotel"
  | "hospital"
  | "school"
  | "processor"
  | "distributor"
  | "retailer"
  | "ngo"
  | "government"
  | "other";
type DeliveryCoverage = "countrywide" | "within_county" | "negotiable";
type ProcurementFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "as_needed";

export type CreateUserFormState = {
  accessType: AdminAccessType;
  fullName: string;
  email: string;
  phone: string;
  organizationName: string;
  institutionType: InstitutionType;
  county: string;
  constituency: string;
  ward: string;
  streetAddress: string;
  productsText: string;
  deliveryCoverage: DeliveryCoverage;
  yearsInAgriculture: string;
  procurementFrequency: ProcurementFrequency;
  monthlyVolume: string;
  estimatedBudgetPerOrder: string;
  notes: string;
};

const INSTITUTION_TYPES: Array<{ value: InstitutionType; label: string }> = [
  { value: "farm", label: "Farm" },
  { value: "cooperative", label: "Cooperative" },
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel", label: "Hotel" },
  { value: "hospital", label: "Hospital" },
  { value: "school", label: "School" },
  { value: "processor", label: "Processor" },
  { value: "distributor", label: "Distributor" },
  { value: "retailer", label: "Retailer" },
  { value: "ngo", label: "NGO" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

const DELIVERY_COVERAGE_OPTIONS: Array<{ value: DeliveryCoverage; label: string }> = [
  { value: "countrywide", label: "Countrywide" },
  { value: "within_county", label: "Within county" },
  { value: "negotiable", label: "Negotiable" },
];

const PROCUREMENT_FREQUENCY_OPTIONS: Array<{ value: ProcurementFrequency; label: string }> = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "as_needed", label: "As needed" },
];

export const createDefaultForm = (): CreateUserFormState => ({
  accessType: "regular",
  fullName: "",
  email: "",
  phone: "",
  organizationName: "",
  institutionType: "farm",
  county: "",
  constituency: "",
  ward: "",
  streetAddress: "",
  productsText: "",
  deliveryCoverage: "within_county",
  yearsInAgriculture: "",
  procurementFrequency: "weekly",
  monthlyVolume: "",
  estimatedBudgetPerOrder: "",
  notes: "",
});

const accessTypeLabel = (value: AdminAccessType) => {
  if (value === "bulk_buyer") return "Bulk buyer";
  if (value === "bulk_seller") return "Bulk seller";
  return "Regular user";
};

export function CreateUserModal({
  form,
  setForm,
  createError,
  createSubmitting,
  createSuccess,
  onClose,
  onSubmit,
}: {
  form: CreateUserFormState;
  setForm: Dispatch<SetStateAction<CreateUserFormState>>;
  createError: string;
  createSubmitting: boolean;
  createSuccess: { fullName: string; accessType: AdminAccessType; setupUrl: string; expiresAt?: string } | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const constituencyOptions = form.county ? getConstituenciesByCounty(form.county) : [];
  const wardOptions = form.county && form.constituency ? getWardsByConstituency(form.county, form.constituency) : [];
  const isBulkAccess = form.accessType !== "regular";
  const isBulkBuyer = form.accessType === "bulk_buyer";
  const isBulkSeller = form.accessType === "bulk_seller";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="ui-card max-h-[92vh] w-full max-w-4xl overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="ui-section-kicker">Admin onboarding</p>
            <h2 className="mt-3 text-2xl font-bold text-stone-900">Create user and setup link</h2>
            <p className="mt-2 text-sm text-stone-600">Create standard or bulk accounts and send a password setup link immediately.</p>
          </div>
          <button type="button" onClick={onClose} className="ui-btn-ghost px-3 py-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        {createError ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createError}</div> : null}
        {createSuccess ? (
          <div className="mt-5 ui-accent-panel p-5">
            <p className="text-sm font-semibold text-stone-900">{createSuccess.fullName} created as {accessTypeLabel(createSuccess.accessType)}.</p>
            <p className="mt-2 break-all text-sm text-stone-600">{createSuccess.setupUrl}</p>
            {createSuccess.expiresAt ? <p className="mt-1 text-xs text-stone-500">Link expires {new Date(createSuccess.expiresAt).toLocaleString("en-KE")}</p> : null}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label><span className="ui-label">Access type</span><select className="ui-select" value={form.accessType} onChange={(event) => setForm((current) => ({ ...current, accessType: event.target.value as AdminAccessType }))}><option value="regular">Regular user</option><option value="bulk_buyer">Bulk buyer</option><option value="bulk_seller">Bulk seller</option></select></label>
          <label><span className="ui-label">Full name</span><input className="ui-input" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} /></label>
          <label><span className="ui-label">Email</span><input className="ui-input" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
          <label><span className="ui-label">Phone</span><input className="ui-input" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
        </div>

        {isBulkAccess ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label><span className="ui-label">Organisation</span><input className="ui-input" value={form.organizationName} onChange={(event) => setForm((current) => ({ ...current, organizationName: event.target.value }))} /></label>
            <label><span className="ui-label">Institution type</span><select className="ui-select" value={form.institutionType} onChange={(event) => setForm((current) => ({ ...current, institutionType: event.target.value as InstitutionType }))}>{INSTITUTION_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label><span className="ui-label">County</span><select className="ui-select" value={form.county} onChange={(event) => setForm((current) => ({ ...current, county: event.target.value, constituency: "", ward: "" }))}><option value="">Select county</option>{kenyaCounties.map((county) => <option key={county.code} value={county.name}>{county.name}</option>)}</select></label>
            <label><span className="ui-label">Constituency</span><select className="ui-select" value={form.constituency} onChange={(event) => setForm((current) => ({ ...current, constituency: event.target.value, ward: "" }))}><option value="">Select constituency</option>{constituencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label><span className="ui-label">Ward</span><select className="ui-select" value={form.ward} onChange={(event) => setForm((current) => ({ ...current, ward: event.target.value }))}><option value="">Select ward</option>{wardOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label><span className="ui-label">Street address</span><input className="ui-input" value={form.streetAddress} onChange={(event) => setForm((current) => ({ ...current, streetAddress: event.target.value }))} /></label>
            <label className="md:col-span-2"><span className="ui-label">Products</span><textarea className="ui-textarea" value={form.productsText} onChange={(event) => setForm((current) => ({ ...current, productsText: event.target.value }))} placeholder="maize, beans, onions" /></label>
            <label><span className="ui-label">Delivery coverage</span><select className="ui-select" value={form.deliveryCoverage} onChange={(event) => setForm((current) => ({ ...current, deliveryCoverage: event.target.value as DeliveryCoverage }))}>{DELIVERY_COVERAGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            {isBulkSeller ? <label><span className="ui-label">Years in agriculture</span><input type="number" min="0" className="ui-input" value={form.yearsInAgriculture} onChange={(event) => setForm((current) => ({ ...current, yearsInAgriculture: event.target.value }))} /></label> : null}
            {isBulkBuyer ? (
              <>
                <label><span className="ui-label">Procurement frequency</span><select className="ui-select" value={form.procurementFrequency} onChange={(event) => setForm((current) => ({ ...current, procurementFrequency: event.target.value as ProcurementFrequency }))}>{PROCUREMENT_FREQUENCY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <label><span className="ui-label">Monthly volume</span><input className="ui-input" value={form.monthlyVolume} onChange={(event) => setForm((current) => ({ ...current, monthlyVolume: event.target.value }))} /></label>
                <label><span className="ui-label">Budget per order</span><input className="ui-input" value={form.estimatedBudgetPerOrder} onChange={(event) => setForm((current) => ({ ...current, estimatedBudgetPerOrder: event.target.value }))} /></label>
              </>
            ) : null}
            <label className="md:col-span-2"><span className="ui-label">Notes</span><textarea className="ui-textarea" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></label>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="ui-btn-secondary px-5 py-2.5">Close</button>
          <button type="button" onClick={onSubmit} disabled={createSubmitting} className="ui-btn-primary gap-2 px-5 py-2.5">
            <UserPlus className="h-4 w-4" />
            {createSubmitting ? "Creating..." : "Create user"}
          </button>
        </div>
      </div>
    </div>
  );
}
