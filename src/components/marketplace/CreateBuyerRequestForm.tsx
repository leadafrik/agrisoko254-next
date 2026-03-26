"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  getConstituenciesByCounty,
  getWardsByConstituency,
  kenyaCounties,
} from "@/data/kenyaCounties";
import GooglePlacesInput from "@/components/map/GooglePlacesInput";
import {
  matchLocationCandidate,
  type GooglePlaceSelection,
} from "@/utils/googleMaps";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

type RequestCategory = "produce" | "livestock" | "inputs" | "service";
type Urgency = "low" | "medium" | "high";
type Step = 1 | 2 | 3;

type FormState = {
  title: string;
  description: string;
  category: RequestCategory;
  productType: string;
  quantity: string;
  unit: string;
  budgetMin: string;
  budgetMax: string;
  urgency: Urgency;
  county: string;
  constituency: string;
  ward: string;
  approximateLocation: string;
  contactPhone: string;
};

const DEMAND_TEMPLATES = [
  {
    id: "maize",
    label: "Bulk maize",
    category: "produce" as const,
    title: "Need dry maize for immediate purchase",
    productType: "Dry maize",
    description:
      "Looking for clean, dry maize in bulk. Share moisture level, packaging, and whether transport can be arranged.",
    quantity: "50",
    unit: "bags",
    urgency: "high" as const,
    budgetMin: "180000",
    budgetMax: "230000",
  },
  {
    id: "potatoes",
    label: "Fresh potatoes",
    category: "produce" as const,
    title: "Need ware potatoes for weekly supply",
    productType: "Ware potatoes",
    description:
      "Looking for consistent potato supply with clear grading, clean packaging, and dependable delivery timing.",
    quantity: "120",
    unit: "bags",
    urgency: "medium" as const,
    budgetMin: "220000",
    budgetMax: "300000",
  },
  {
    id: "livestock",
    label: "Dairy cattle",
    category: "livestock" as const,
    title: "Need healthy dairy cows",
    productType: "Dairy cows",
    description:
      "Looking for healthy dairy cows with breed, age, health records, and current location shared clearly.",
    quantity: "5",
    unit: "head",
    urgency: "medium" as const,
    budgetMin: "250000",
    budgetMax: "450000",
  },
  {
    id: "inputs",
    label: "Farm inputs",
    category: "inputs" as const,
    title: "Need certified farm inputs for planting season",
    productType: "Certified seeds and fertilizer",
    description:
      "Looking for verified suppliers with clear brands, pack sizes, and delivery options to my county.",
    quantity: "30",
    unit: "bags",
    urgency: "medium" as const,
    budgetMin: "90000",
    budgetMax: "140000",
  },
];

const CATEGORY_OPTIONS: Array<{
  value: RequestCategory;
  label: string;
  hint: string;
}> = [
  { value: "produce", label: "Produce", hint: "Crops, grains, fruits, vegetables" },
  { value: "livestock", label: "Livestock", hint: "Cattle, poultry, goats, pigs" },
  { value: "inputs", label: "Inputs", hint: "Seed, fertilizer, tools, equipment" },
  { value: "service", label: "Services", hint: "Transport, labour, agronomy, spraying" },
];

const URGENCY_OPTIONS: Array<{
  value: Urgency;
  label: string;
  hint: string;
}> = [
  { value: "low", label: "Can wait", hint: "Flexible timing" },
  { value: "medium", label: "Within a week", hint: "Active sourcing window" },
  { value: "high", label: "Urgent", hint: "Immediate responses needed" },
];

const STEP_COPY: Array<{ id: Step; title: string; caption: string }> = [
  { id: 1, title: "Demand", caption: "What you need" },
  { id: 2, title: "Specs", caption: "Quantity and budget" },
  { id: 3, title: "Post", caption: "Location and contact" },
];

const computeRequestScore = (form: FormState) => {
  let score = 0;
  if (form.title.trim()) score += 20;
  if (form.description.trim().length >= 60) score += 20;
  if (form.productType.trim()) score += 15;
  if (form.quantity.trim()) score += 15;
  if (form.budgetMin.trim() || form.budgetMax.trim()) score += 15;
  if (form.county.trim()) score += 10;
  if (form.contactPhone.trim()) score += 5;
  return Math.min(score, 100);
};

const scoreLabel = (score: number) => {
  if (score >= 85) return "Outstanding";
  if (score >= 65) return "Strong";
  if (score >= 45) return "Good";
  return "Building";
};

export default function CreateBuyerRequestForm() {
  const router = useRouter();
  const { user } = useAuth();
  const countyOptions = useMemo(() => kenyaCounties.map((county) => county.name), []);

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "produce",
    productType: "",
    quantity: "",
    unit: "kg",
    budgetMin: "",
    budgetMax: "",
    urgency: "medium",
    county: user?.county || "",
    constituency: "",
    ward: "",
    approximateLocation: "",
    contactPhone: user?.phone || "",
  });

  const constituencyOptions = useMemo(
    () => (form.county ? getConstituenciesByCounty(form.county) : []),
    [form.county]
  );
  const wardOptions = useMemo(
    () =>
      form.county && form.constituency
        ? getWardsByConstituency(form.county, form.constituency)
        : [],
    [form.constituency, form.county]
  );
  const qualityScore = useMemo(() => computeRequestScore(form), [form]);

  useEffect(() => {
    if (!form.county) {
      setForm((current) => ({ ...current, constituency: "", ward: "" }));
      return;
    }

    const constituencyValid = constituencyOptions.some(
      (item) => item.value === form.constituency
    );
    if (!constituencyValid && form.constituency) {
      setForm((current) => ({ ...current, constituency: "", ward: "" }));
      return;
    }

    const wardValid = wardOptions.some((item) => item.value === form.ward);
    if (!wardValid && form.ward) {
      setForm((current) => ({ ...current, ward: "" }));
    }
  }, [constituencyOptions, form.constituency, form.county, form.ward, wardOptions]);

  const handleTemplate = (templateId: string) => {
    const template = DEMAND_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    setForm((current) => ({
      ...current,
      category: template.category,
      title: template.title,
      productType: template.productType,
      description: template.description,
      quantity: template.quantity,
      unit: template.unit,
      urgency: template.urgency,
      budgetMin: template.budgetMin,
      budgetMax: template.budgetMax,
    }));
  };

  const handlePlaceSelected = (selection: GooglePlaceSelection) => {
    const matchedCounty =
      matchLocationCandidate(selection.county, countyOptions) || form.county;
    const matchedConstituency =
      matchedCounty && selection.constituency
        ? matchLocationCandidate(
            selection.constituency,
            getConstituenciesByCounty(matchedCounty)
          ) || ""
        : "";
    const matchedWard =
      matchedCounty && matchedConstituency && selection.ward
        ? matchLocationCandidate(
            selection.ward,
            getWardsByConstituency(matchedCounty, matchedConstituency)
          ) || ""
        : "";

    setForm((current) => ({
      ...current,
      county: matchedCounty,
      constituency: matchedConstituency,
      ward: matchedWard,
      approximateLocation:
        selection.formattedAddress || selection.approximateLocation || current.approximateLocation,
    }));
  };

  const validateStep = (targetStep: Step) => {
    if (targetStep === 1) {
      if (!form.title.trim()) return "Add a request title.";
      if (!form.description.trim()) return "Describe the demand clearly.";
      if (!form.productType.trim()) return "State what item or service you need.";
    }

    if (targetStep === 2) {
      if (!form.quantity.trim()) return "Add the quantity buyers need.";
      if (!form.unit.trim()) return "Add the unit you are buying in.";
      if (!form.budgetMin.trim() && !form.budgetMax.trim()) {
        return "Add at least a minimum or maximum budget.";
      }
      if (
        form.budgetMin.trim() &&
        form.budgetMax.trim() &&
        Number(form.budgetMax) < Number(form.budgetMin)
      ) {
        return "Max budget must be greater than or equal to min budget.";
      }
    }

    if (targetStep === 3) {
      if (!form.county.trim()) return "Select the county where delivery is needed.";
      if (!form.contactPhone.trim()) return "Add the contact phone suppliers should use.";
    }

    return "";
  };

  const goNext = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setStep((current) => Math.min(3, current + 1) as Step);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateStep(3);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest(API_ENDPOINTS.buyerRequests.create, {
        method: "POST",
        body: JSON.stringify({
          marketType: "standard",
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          productType: form.productType.trim(),
          quantity: Number(form.quantity),
          unit: form.unit.trim(),
          urgency: form.urgency,
          contactPhone: form.contactPhone.trim(),
          budget: {
            ...(form.budgetMin.trim() ? { min: Number(form.budgetMin) } : {}),
            ...(form.budgetMax.trim() ? { max: Number(form.budgetMax) } : {}),
            currency: "KES",
          },
          location: {
            county: form.county.trim(),
            constituency: form.constituency.trim() || undefined,
            ward: form.ward.trim() || undefined,
            approximateLocation: form.approximateLocation.trim() || undefined,
          },
        }),
      });

      setSuccess("Buyer request posted successfully. Redirecting to the demand board...");
      setTimeout(() => router.push("/request"), 900);
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to post the buyer request.");
    } finally {
      setLoading(false);
    }
  };

  const activeStep = STEP_COPY.find((item) => item.id === step);

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8">
        <p className="section-kicker">Buyer request</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-900">Post a serious demand signal</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600">
          The goal is not to fill a form. The goal is to help suppliers decide quickly whether they
          can fulfill this request, where it is needed, and what budget range is real.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {DEMAND_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplate(template.id)}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-terra-300 hover:text-terra-700"
            >
              {template.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_0.86fr]">
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
          <div className="flex flex-wrap gap-3">
            {STEP_COPY.map((item) => {
              const active = item.id === step;
              const done = item.id < step;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border px-4 py-3 ${
                    active
                      ? "border-terra-300 bg-terra-50"
                      : done
                      ? "border-forest-200 bg-forest-50"
                      : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Step {item.id}
                  </p>
                  <p className="mt-1 font-semibold text-stone-900">{item.title}</p>
                  <p className="text-xs text-stone-500">{item.caption}</p>
                </div>
              );
            })}
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-6 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-medium text-forest-800">
              {success}
            </div>
          ) : null}

          <div className="mt-8 grid gap-6">
            {step === 1 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, category: option.value }))}
                      className={`rounded-[24px] border px-5 py-5 text-left transition ${
                        form.category === option.value
                          ? "border-terra-300 bg-terra-50"
                          : "border-stone-200 bg-stone-50 hover:border-terra-200"
                      }`}
                    >
                      <p className="font-semibold text-stone-900">{option.label}</p>
                      <p className="mt-1 text-sm text-stone-600">{option.hint}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="field-label">Request title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Example: Need dry maize in 90kg bags"
                    className="field-input"
                    required
                  />
                </div>

                <div>
                  <label className="field-label">Item or service needed</label>
                  <input
                    type="text"
                    value={form.productType}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, productType: event.target.value }))
                    }
                    placeholder="Example: Grade 1 potatoes, dairy heifers, DAP fertilizer"
                    className="field-input"
                    required
                  />
                </div>

                <div>
                  <label className="field-label">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Describe quality, timing, packaging, sourcing rules, and anything that helps serious suppliers respond well."
                    className="field-textarea"
                    required
                  />
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="grid gap-5 md:grid-cols-4">
                  <div>
                    <label className="field-label">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, quantity: event.target.value }))
                      }
                      className="field-input"
                      placeholder="50"
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label">Unit</label>
                    <input
                      type="text"
                      value={form.unit}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, unit: event.target.value }))
                      }
                      className="field-input"
                      placeholder="bags, kg, crates..."
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label">Min budget (KES)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.budgetMin}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, budgetMin: event.target.value }))
                      }
                      className="field-input"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="field-label">Max budget (KES)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.budgetMax}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, budgetMax: event.target.value }))
                      }
                      className="field-input"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label">Urgency</label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {URGENCY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({ ...current, urgency: option.value }))
                        }
                        className={`rounded-[24px] border px-5 py-4 text-left transition ${
                          form.urgency === option.value
                            ? "border-terra-300 bg-terra-50"
                            : "border-stone-200 bg-stone-50 hover:border-terra-200"
                        }`}
                      >
                        <p className="font-semibold text-stone-900">{option.label}</p>
                        <p className="mt-1 text-sm text-stone-600">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                  <h2 className="text-lg font-semibold text-stone-900">Delivery location</h2>
                  <p className="mt-1 text-sm text-stone-600">
                    County is still the core market signal. Constituency and ward are available,
                    but the approximate location is what most suppliers will understand first.
                  </p>

                  <div className="mt-5 space-y-5">
                    <GooglePlacesInput
                      label="Search market, town, estate, or landmark"
                      value={form.approximateLocation}
                      onChange={(value) =>
                        setForm((current) => ({ ...current, approximateLocation: value }))
                      }
                      onPlaceSelected={handlePlaceSelected}
                      helperText="Search a Kenya location once to auto-fill county, constituency, ward, and a better delivery landmark."
                    />

                    <div className="grid gap-5 md:grid-cols-3">
                      <div>
                        <label className="field-label">County</label>
                        <select
                          value={form.county}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, county: event.target.value }))
                          }
                          className="field-select"
                          required
                        >
                          <option value="">Select county</option>
                          {countyOptions.map((countyName) => (
                            <option key={countyName} value={countyName}>
                              {countyName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="field-label">Constituency</label>
                        <select
                          value={form.constituency}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              constituency: event.target.value,
                            }))
                          }
                          className="field-select"
                          disabled={!form.county}
                        >
                          <option value="">Optional</option>
                          {constituencyOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="field-label">Ward</label>
                        <select
                          value={form.ward}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, ward: event.target.value }))
                          }
                          className="field-select"
                          disabled={!form.constituency}
                        >
                          <option value="">Optional</option>
                          {wardOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="field-label">Contact phone</label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contactPhone: event.target.value }))
                    }
                    placeholder="07..."
                    className="field-input"
                    required
                  />
                </div>
              </>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(1, current - 1) as Step)}
                className="secondary-button"
                disabled={step === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              {step < 3 ? (
                <button type="button" onClick={goNext} className="primary-button">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="primary-button">
                  {loading ? "Posting request..." : "Post buyer request"}
                </button>
              )}
            </div>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <p className="section-kicker">{activeStep?.title}</p>
            <h2 className="mt-4 text-3xl font-bold text-stone-900">
              {form.title.trim() || "Your demand preview"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {form.description.trim() ||
                "Suppliers will see your request title, the exact item you need, the budget range, urgency, and the delivery county."}
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Quantity</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {form.quantity.trim()
                    ? `${form.quantity} ${form.unit || "units"}`
                    : "Set the quantity"}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Budget</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {form.budgetMin || form.budgetMax
                    ? `KES ${Number(form.budgetMin || 0).toLocaleString()}${
                        form.budgetMin && form.budgetMax
                          ? " - "
                          : form.budgetMax
                          ? " to "
                          : "+"
                      }${
                        form.budgetMax
                          ? Number(form.budgetMax).toLocaleString()
                          : form.budgetMin
                          ? ""
                          : ""
                      }`
                    : "Add a realistic budget"}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Location</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {[form.approximateLocation, form.county].filter(Boolean).join(", ") ||
                    "Set county and delivery location"}
                </p>
              </div>
            </div>
          </div>

          <div className="soft-panel p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-terra-600" />
              <h2 className="text-2xl font-bold text-stone-900">Request quality</h2>
            </div>
            <div className="mt-4 rounded-2xl bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-stone-900">{scoreLabel(qualityScore)}</p>
                <p className="text-sm font-semibold text-terra-700">{qualityScore}/100</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-stone-100">
                <div
                  className="h-2 rounded-full bg-terra-500 transition-all"
                  style={{ width: `${qualityScore}%` }}
                />
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
              <li>Good requests help sellers self-qualify instead of wasting your time.</li>
              <li>Budget and quantity clarity improve quote quality dramatically.</li>
              <li>County plus a recognisable town or landmark reduces friction more than over-structuring location.</li>
            </ul>
          </div>

          <div className="surface-card p-6">
            <h2 className="text-2xl font-bold text-stone-900">Looking for bigger supply?</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              For institutional or recurring volume, use the bulk board instead of a standard
              buyer request.
            </p>
            <Link href="/bulk/orders" className="primary-button mt-5">
              Open bulk demand board
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
