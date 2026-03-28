"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  CREATE_LISTING_CATEGORY_DETAILS,
  type MarketplaceCategorySlug,
  type SellerCategorySlug,
  formatKes,
} from "@/lib/marketplace";
import {
  getConstituenciesByCounty,
  getWardsByConstituency,
  kenyaCounties,
} from "@/data/kenyaCounties";
import GooglePlacesInput from "@/components/map/GooglePlacesInput";
import MapPicker from "@/components/map/MapPicker";
import {
  matchLocationCandidate,
  type GooglePlaceSelection,
} from "@/utils/googleMaps";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  MapPin,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

type CreateListingCategoryFormProps = {
  category: {
    slug: MarketplaceCategorySlug;
    apiCategory: SellerCategorySlug;
    label: string;
  };
};

type DeliveryScope = "countrywide" | "within_county" | "negotiable";

type FormState = {
  title: string;
  description: string;
  price: string;
  quantity: string;
  unit: string;
  county: string;
  constituency: string;
  ward: string;
  approximateLocation: string;
  contact: string;
  availableFrom: string;
  deliveryScope: DeliveryScope;
  latitude?: number;
  longitude?: number;
  images: File[];
};

const MAX_IMAGES = 5;

const DELIVERY_SCOPE_OPTIONS: Array<{
  value: DeliveryScope;
  label: string;
  helper: string;
}> = [
  {
    value: "countrywide",
    label: "Countrywide",
    helper: "You can coordinate delivery beyond your county.",
  },
  {
    value: "within_county",
    label: "Within county",
    helper: "You deliver only within your county or nearby towns.",
  },
  {
    value: "negotiable",
    label: "Negotiable",
    helper: "You will agree delivery on a case-by-case basis.",
  },
];

const buildImagePreview = (file: File) => ({
  key: `${file.name}-${file.size}-${file.lastModified}`,
  file,
  url: URL.createObjectURL(file),
});

export default function CreateListingCategoryForm({
  category,
}: CreateListingCategoryFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const details = CREATE_LISTING_CATEGORY_DETAILS[category.apiCategory];
  const countyOptions = useMemo(() => kenyaCounties.map((county) => county.name), []);
  const verifiedSeller = Boolean(
    user?.verification?.idVerified || user?.verification?.isVerified
  );

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    price: "",
    quantity: "",
    unit: details.unitOptions[0],
    county: "",
    constituency: "",
    ward: "",
    approximateLocation: "",
    contact: user?.phone || user?.email || "",
    availableFrom: "",
    deliveryScope: "negotiable",
    images: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    publishStatus: string;
    listingId?: string;
  } | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const constituencyOptions = useMemo(
    () => (form.county ? getConstituenciesByCounty(form.county) : []),
    [form.county]
  );
  const wardOptions = useMemo(
    () =>
      form.county && form.constituency
        ? getWardsByConstituency(form.county, form.constituency)
        : [],
    [form.county, form.constituency]
  );

  const previewImages = useMemo(
    () => form.images.map((file) => buildImagePreview(file)),
    [form.images]
  );

  useEffect(() => {
    return () => {
      previewImages.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewImages]);

  useEffect(() => {
    if (!user?.phone && !user?.email) return;
    setForm((current) => {
      if (current.contact) return current;
      return { ...current, contact: user?.phone || user?.email || "" };
    });
  }, [user?.email, user?.phone]);

  useEffect(() => {
    if (!form.county) {
      setForm((current) => ({ ...current, constituency: "", ward: "" }));
      return;
    }

    const validConstituency = constituencyOptions.some(
      (item) => item.value === form.constituency
    );

    if (!validConstituency) {
      setForm((current) => ({ ...current, constituency: "", ward: "" }));
      return;
    }

    const validWard = wardOptions.some((item) => item.value === form.ward);
    if (!validWard && form.ward) {
      setForm((current) => ({ ...current, ward: "" }));
    }
  }, [constituencyOptions, form.constituency, form.county, form.ward, wardOptions]);

  const publishPreview = useMemo(() => {
    const price = Number(form.price);
    return Number.isFinite(price) && price > 0 ? formatKes(price) : "Set a price";
  }, [form.price]);

  const locationPreview = useMemo(() => {
    return [
      form.approximateLocation.trim(),
      form.ward.trim(),
      form.constituency.trim(),
      form.county.trim(),
    ]
      .filter(Boolean)
      .join(", ");
  }, [form.approximateLocation, form.constituency, form.county, form.ward]);

  const handleChange = (field: keyof FormState, value: string | File[]) => {
    setForm((current) => ({ ...current, [field]: value } as FormState));
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const nextImages = [...form.images, ...files].slice(0, MAX_IMAGES);
    setForm((current) => ({ ...current, images: nextImages }));
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
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
      latitude: selection.coordinates?.lat,
      longitude: selection.coordinates?.lng,
    }));
  };

  const validate = () => {
    if (!form.title.trim()) return "Add a clear listing title.";
    if (!form.description.trim()) return "Describe what you are listing clearly.";
    if (!form.price.trim()) return "Set the listing price.";
    if (!form.county.trim()) return "Choose the county where the listing is based.";
    if (!form.contact.trim()) return "Add the phone or email buyers should use.";
    if (!form.images.length) return "Upload at least one real image for the listing.";
    return "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess(null);

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("category", category.apiCategory);
    payload.append("listingType", "sell");
    payload.append("price", form.price.trim());
    if (form.quantity.trim()) payload.append("quantity", form.quantity.trim());
    if (form.unit.trim()) payload.append("unit", form.unit.trim());
    payload.append("county", form.county.trim());
    if (form.constituency.trim()) payload.append("constituency", form.constituency.trim());
    if (form.ward.trim()) payload.append("ward", form.ward.trim());
    if (form.approximateLocation.trim()) {
      payload.append("approximateLocation", form.approximateLocation.trim());
    }
    if (typeof form.latitude === "number" && typeof form.longitude === "number") {
      payload.append("latitude", String(form.latitude));
      payload.append("longitude", String(form.longitude));
    }
    if (form.availableFrom) payload.append("availableFrom", form.availableFrom);
    payload.append("deliveryScope", form.deliveryScope);
    payload.append("contact", form.contact.trim());
    form.images.forEach((image) => payload.append("images", image));

    try {
      const response = await apiRequest(API_ENDPOINTS.products.create, {
        method: "POST",
        body: payload,
      });

      const listing = response?.data ?? response;
      const publishStatus = String(listing?.publishStatus || "").toLowerCase();
      const listingId = listing?._id ? String(listing._id) : undefined;

      setSuccess({
        publishStatus,
        listingId,
      });

      if (publishStatus === "active") {
        startTransition(() => {
          if (listingId) {
            router.push(`/listings/${listingId}`);
          }
        });
      }
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

      <section className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
          <p className="section-kicker">{category.label}</p>
          <h1 className="mt-4 text-4xl font-bold text-stone-900">{details.heading}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
            {details.intro}
          </p>

          <div className="mt-6 rounded-[24px] border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-terra-600" />
              <div className="text-sm text-stone-700">
                <p className="font-semibold text-stone-900">
                  {verifiedSeller
                    ? "Your profile is verified. Your listing can go live immediately."
                    : "Your profile is not verified yet."}
                </p>
                <p className="mt-1 leading-relaxed text-stone-600">
                  {verifiedSeller
                    ? "Moderation may still review listings when needed."
                    : "Your listing will go to review before it goes live."}
                </p>
                {!verifiedSeller ? (
                  <Link href="/verify" className="mt-3 inline-flex text-sm font-semibold text-terra-600 hover:text-terra-700">
                    Open verification
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-6 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-4 text-sm text-forest-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">
                    {success.publishStatus === "active"
                      ? "Listing published successfully."
                      : "Listing submitted for review."}
                  </p>
                  <p className="mt-1 leading-relaxed">
                    {success.publishStatus === "active"
                      ? "The listing is now live in the marketplace."
                      : "Admin approval is required before this listing becomes public because the seller profile is not fully verified yet."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {success.publishStatus === "active" && success.listingId ? (
                      <Link href={`/listings/${success.listingId}`} className="text-sm font-semibold text-forest-800 underline underline-offset-2">
                        View live listing
                      </Link>
                    ) : null}
                    <Link href="/browse" className="text-sm font-semibold text-forest-800 underline underline-offset-2">
                      Browse marketplace
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-6">
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

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="field-label">
                  Price (KES){form.unit ? ` — per ${form.unit}` : ""}
                </label>
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
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={(event) => handleChange("quantity", event.target.value)}
                  placeholder={details.quantityHint}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Unit (what the price is per)</label>
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
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-terra-600" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-stone-900">Location</h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    County is required. Add a town or map pin so nearby buyers can find you faster.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <GooglePlacesInput
                  label="Search location"
                  value={form.approximateLocation}
                  onChange={(value) => handleChange("approximateLocation", value)}
                  onPlaceSelected={handlePlaceSelected}
                  helperText="Search a town, market, road, or landmark."
                />

                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="field-label">County</label>
                    <select
                      value={form.county}
                      onChange={(event) => handleChange("county", event.target.value)}
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
                      onChange={(event) => handleChange("constituency", event.target.value)}
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
                      onChange={(event) => handleChange("ward", event.target.value)}
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

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="field-label">Town / trading centre / landmark</label>
                    <input
                      type="text"
                      value={form.approximateLocation}
                      onChange={(event) =>
                        handleChange("approximateLocation", event.target.value)
                      }
                      placeholder="Example: Wakulima Market, Kikuyu town, near main road"
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label className="field-label">Available from</label>
                    <input
                      type="date"
                      value={form.availableFrom}
                      onChange={(event) => handleChange("availableFrom", event.target.value)}
                      className="field-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label">Refine the pin on the map</label>
                  <MapPicker
                    onChange={(coords) =>
                      setForm((current) => ({
                        ...current,
                        latitude: coords.lat,
                        longitude: coords.lng,
                      }))
                    }
                    defaultCenter={
                      typeof form.latitude === "number" && typeof form.longitude === "number"
                        ? { lat: form.latitude, lng: form.longitude }
                        : undefined
                    }
                    height="260px"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
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
              <div>
                <label className="field-label">Delivery scope</label>
                <select
                  value={form.deliveryScope}
                  onChange={(event) =>
                    handleChange("deliveryScope", event.target.value as DeliveryScope)
                  }
                  className="field-select"
                >
                  {DELIVERY_SCOPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-stone-500">
                  {
                    DELIVERY_SCOPE_OPTIONS.find(
                      (option) => option.value === form.deliveryScope
                    )?.helper
                  }
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="field-label">Listing images</label>
                <span className="text-xs text-stone-500">
                  {form.images.length}/{MAX_IMAGES} uploaded
                </span>
              </div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center transition hover:border-terra-300 hover:bg-white">
                <UploadCloud className="h-8 w-8 text-terra-600" />
                <p className="mt-3 text-sm font-semibold text-stone-900">
                  Upload real photos, not URLs
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  JPG, PNG, or WebP. Up to {MAX_IMAGES} images.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelection}
                />
              </label>

              {previewImages.length > 0 ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {previewImages.map((item, index) => (
                    <div
                      key={item.key}
                      className="overflow-hidden rounded-[24px] border border-stone-200 bg-white"
                    >
                      <div className="relative aspect-[4/3] bg-stone-100">
                        <Image
                          src={item.url}
                          alt={`Listing upload ${index + 1}`}
                          fill
                          sizes="(max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-stone-600">
                        <span className="truncate">{item.file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-500">
                  No photos uploaded yet. Clear photos help buyers trust the listing faster.
                </div>
              )}
            </div>

            <button type="submit" disabled={isPending} className="primary-button w-full">
              {isPending ? "Publishing..." : "Publish listing"}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Preview</p>
                <p className="mt-3 text-sm font-semibold text-stone-900 xl:hidden">
                  {publishPreview} · {form.images.length} image{form.images.length === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobilePreview((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1.5 text-sm font-semibold text-stone-600 transition hover:border-terra-200 hover:text-terra-700 xl:hidden"
                aria-expanded={showMobilePreview}
              >
                {showMobilePreview ? "Hide" : "Show"}
                {showMobilePreview ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className={`${showMobilePreview ? "mt-4 block" : "hidden"} xl:mt-4 xl:block`}>
              <h2 className="text-3xl font-bold text-stone-900">
                {form.title.trim() || details.placeholderTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {form.description.trim() || details.placeholderDescription}
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Price</p>
                  <p className="mt-1 font-semibold text-stone-900">
                    {publishPreview}
                    {form.unit && form.price ? (
                      <span className="ml-1 text-sm font-normal text-stone-500">per {form.unit}</span>
                    ) : null}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Coverage</p>
                  <p className="mt-1 font-semibold text-stone-900">
                    {locationPreview || "County and town not set yet"}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Images</p>
                  <p className="mt-1 font-semibold text-stone-900">
                    {form.images.length} image{form.images.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center gap-3">
              <ImagePlus className="h-5 w-5 text-terra-600" />
              <h2 className="text-2xl font-bold text-stone-900">Quick tips</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
              <li>Use real photos of the actual stock or service.</li>
              <li>Name the town or trading centre buyers already know.</li>
              <li>State quantity, quality, timing, and delivery clearly.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
