"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  CREATE_LISTING_CATEGORY_DETAILS,
  type MarketplaceCategorySlug,
  type SellerCategorySlug,
  formatKes,
} from "@/lib/marketplace";

type CreateListingCategoryFormProps = {
  category: {
    slug: MarketplaceCategorySlug;
    apiCategory: SellerCategorySlug;
    label: string;
  };
};

type FormState = {
  title: string;
  description: string;
  price: string;
  quantity: string;
  unit: string;
  county: string;
  location: string;
  contact: string;
  imageUrl: string;
};

export default function CreateListingCategoryForm({
  category,
}: CreateListingCategoryFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const details = CREATE_LISTING_CATEGORY_DETAILS[category.apiCategory];
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    price: "",
    quantity: "",
    unit: details.unitOptions[0],
    county: "",
    location: "",
    contact: user?.phone || user?.email || "",
    imageUrl: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const publishPreview = useMemo(() => {
    const price = Number(form.price);
    return Number.isFinite(price) && price > 0 ? formatKes(price) : "Set a price";
  }, [form.price]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const created = await apiRequest(API_ENDPOINTS.unifiedListings.create, {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: category.apiCategory,
          type: category.apiCategory === "service" ? "service" : "product",
          price: Number(form.price),
          quantity: form.quantity ? Number(form.quantity) : undefined,
          unit: form.unit,
          contact: form.contact.trim(),
          images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
          deliveryScope: "negotiable",
          location: {
            country: "KE",
            region: form.county.trim(),
            county: form.county.trim(),
            approximateLocation: form.location.trim(),
          },
        }),
      });

      const listingId = created?.listing?._id || created?.data?._id || created?._id;
      if (!listingId) {
        throw new Error("The listing was created but the listing ID was missing from the response.");
      }

      await apiRequest(API_ENDPOINTS.unifiedListings.publish(listingId), {
        method: "POST",
      });

      setSuccess("Listing published successfully. Redirecting to the live listing...");
      startTransition(() => {
        router.push(`/listings/${listingId}`);
      });
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to publish the listing right now.");
    }
  };

  return (
    <div className="page-shell py-10 sm:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link href="/create-listing" className="hover:text-terra-600">
          Create listing
        </Link>
        <span>/</span>
        <span className="text-stone-900">{details.heading}</span>
      </nav>

      <section className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
          <p className="section-kicker">{category.label}</p>
          <h1 className="mt-4 text-4xl font-bold text-stone-900">{details.heading}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">{details.intro}</p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-6 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-medium text-forest-700">
              {success}
            </div>
          ) : null}

          <div className="mt-8 grid gap-5">
            <div>
              <label className="field-label">Listing title</label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                placeholder={details.placeholderTitle}
                className="field-input"
                required
              />
            </div>

            <div>
              <label className="field-label">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                placeholder={details.placeholderDescription}
                className="field-textarea"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Price in KES</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={(event) => handleChange("price", event.target.value)}
                  placeholder="Example: 4500"
                  className="field-input"
                  required
                />
              </div>
              <div>
                <label className="field-label">{details.quantityLabel}</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(event) => handleChange("quantity", event.target.value)}
                  placeholder={details.quantityHint}
                  className="field-input"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Unit</label>
                <select
                  value={form.unit}
                  onChange={(event) => handleChange("unit", event.target.value)}
                  className="field-select"
                >
                  {details.unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">County</label>
                <input
                  type="text"
                  value={form.county}
                  onChange={(event) => handleChange("county", event.target.value)}
                  placeholder="Example: Nakuru"
                  className="field-input"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Approximate location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(event) => handleChange("location", event.target.value)}
                  placeholder="Town, ward, or trading centre"
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Contact phone or email</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(event) => handleChange("contact", event.target.value)}
                  placeholder="Best contact for buyers"
                  className="field-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">Optional image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(event) => handleChange("imageUrl", event.target.value)}
                placeholder="https://..."
                className="field-input"
              />
            </div>

            <button type="submit" disabled={isPending} className="primary-button w-full">
              {isPending ? "Publishing..." : "Publish listing"}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <p className="section-kicker">Preview</p>
            <h2 className="mt-4 text-3xl font-bold text-stone-900">
              {form.title.trim() || details.placeholderTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {form.description.trim() || details.placeholderDescription}
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Price</p>
                <p className="mt-1 font-semibold text-stone-900">{publishPreview}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Coverage</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {[form.location, form.county].filter(Boolean).join(", ") || "County not set yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="soft-panel p-6">
            <h2 className="text-2xl font-bold text-stone-900">Good listing habits</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
              <li>Use a clear product or service name instead of vague marketing language.</li>
              <li>State the county and quantity accurately so buyers can act quickly.</li>
              <li>Describe actual quality, packaging, timing, and delivery expectations.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
