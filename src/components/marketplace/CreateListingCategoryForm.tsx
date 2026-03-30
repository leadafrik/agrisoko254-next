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
type ListingEntryMode = "single" | "batch";

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

type BatchListingItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  quantity: string;
  unit: string;
  deliveryScope: DeliveryScope;
  images: File[];
};

type SuccessState =
  | {
      mode: "single";
      publishStatus: string;
      listingId?: string;
    }
  | {
      mode: "batch";
      createdCount: number;
      activeCount: number;
      failedCount: number;
    };

const MAX_IMAGES = 5;
const MAX_BATCH_ITEMS = 20;

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

const createBatchItem = (
  unit: string,
  deliveryScope: DeliveryScope = "negotiable"
): BatchListingItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: "",
  description: "",
  price: "",
  quantity: "",
  unit,
  deliveryScope,
  images: [],
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
  const [entryMode, setEntryMode] = useState<ListingEntryMode>("single");
  const [batchItems, setBatchItems] = useState<BatchListingItem[]>([
    createBatchItem(details.unitOptions[0], "negotiable"),
  ]);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const batchPreviewGroups = useMemo(
    () =>
      batchItems.map((item) => ({
        id: item.id,
        previews: item.images.map((file) => buildImagePreview(file)),
      })),
    [batchItems]
  );

  useEffect(() => {
    return () => {
      previewImages.forEach((item) => URL.revokeObjectURL(item.url));
      batchPreviewGroups.forEach((group) => {
        group.previews.forEach((item) => URL.revokeObjectURL(item.url));
      });
    };
  }, [batchPreviewGroups, previewImages]);

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
  const batchReadiness = useMemo(() => {
    const itemCount = batchItems.length;
    const readyCount = batchItems.filter((item) => {
      return (
        item.title.trim().length >= 4 &&
        item.description.trim().length >= 20 &&
        !!item.price.trim() &&
        item.images.length > 0
      );
    }).length;
    return { itemCount, readyCount };
  }, [batchItems]);
  const batchImageCount = useMemo(
    () => batchItems.reduce((sum, item) => sum + item.images.length, 0),
    [batchItems]
  );
  const batchTitlePreview = useMemo(
    () =>
      batchItems
        .map((item) => item.title.trim())
        .filter(Boolean)
        .slice(0, 4),
    [batchItems]
  );

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

  const updateBatchItem = (
    itemId: string,
    updater: (item: BatchListingItem) => BatchListingItem
  ) => {
    setBatchItems((current) =>
      current.map((item) => (item.id === itemId ? updater(item) : item))
    );
  };

  const handleBatchImageSelection = (
    itemId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    updateBatchItem(itemId, (item) => ({
      ...item,
      images: [...item.images, ...files].slice(0, MAX_IMAGES),
    }));
    event.target.value = "";
  };

  const removeBatchImage = (itemId: string, imageIndex: number) => {
    updateBatchItem(itemId, (item) => ({
      ...item,
      images: item.images.filter((_, currentIndex) => currentIndex !== imageIndex),
    }));
  };

  const addBatchItem = () => {
    setError("");
    setSuccess(null);
    if (batchItems.length >= MAX_BATCH_ITEMS) {
      setError(
        `You can add up to ${MAX_BATCH_ITEMS} items in one batch. Submit this batch, then add more.`
      );
      return;
    }

    setBatchItems((current) => [
      ...current,
      createBatchItem(details.unitOptions[0], form.deliveryScope),
    ]);
  };

  const removeBatchItem = (itemId: string) => {
    setBatchItems((current) => {
      if (current.length <= 1) return current;
      return current.filter((item) => item.id !== itemId);
    });
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

  const validateSharedFields = () => {
    if (!form.county.trim()) return "Choose the county where the listing is based.";
    if (!form.contact.trim()) return "Add the phone or email buyers should use.";
    return "";
  };

  const validateSingle = () => {
    const sharedError = validateSharedFields();
    if (sharedError) return sharedError;
    if (!form.title.trim()) return "Add a clear listing title.";
    if (!form.description.trim()) return "Describe what you are listing clearly.";
    if (!form.price.trim()) return "Set the listing price.";
    if (!form.images.length) return "Upload at least one real image for the listing.";
    return "";
  };

  const validateBatch = () => {
    const sharedError = validateSharedFields();
    if (sharedError) return sharedError;
    if (!batchItems.length) return "Add at least one item to the batch.";
    if (batchItems.length > MAX_BATCH_ITEMS) {
      return `A batch can contain up to ${MAX_BATCH_ITEMS} items.`;
    }

    for (let index = 0; index < batchItems.length; index += 1) {
      const item = batchItems[index];
      const itemLabel = `Item ${index + 1}`;

      if (!item.title.trim()) return `${itemLabel}: add a listing title.`;
      if (!item.description.trim()) return `${itemLabel}: add a description.`;
      if (!item.price.trim()) return `${itemLabel}: set the listing price.`;
      if (!item.images.length) return `${itemLabel}: upload at least one real image.`;
    }

    return "";
  };

  const postListing = async (payloadItem: {
    title: string;
    description: string;
    price: string;
    quantity: string;
    unit: string;
    deliveryScope: DeliveryScope;
    images: File[];
  }) => {
    const payload = new FormData();
    payload.append("title", payloadItem.title.trim());
    payload.append("description", payloadItem.description.trim());
    payload.append("category", category.apiCategory);
    payload.append("listingType", "sell");
    payload.append("price", payloadItem.price.trim());
    if (payloadItem.quantity.trim()) payload.append("quantity", payloadItem.quantity.trim());
    if (payloadItem.unit.trim()) payload.append("unit", payloadItem.unit.trim());
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
    payload.append("deliveryScope", payloadItem.deliveryScope);
    payload.append("contact", form.contact.trim());
    payloadItem.images.forEach((image) => payload.append("images", image));

    const response = await apiRequest(API_ENDPOINTS.products.create, {
      method: "POST",
      body: payload,
    });

    const listing = response?.data ?? response;
    return {
      publishStatus: String(listing?.publishStatus || "").toLowerCase(),
      listingId: listing?._id ? String(listing._id) : undefined,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess(null);

    const validationMessage = entryMode === "batch" ? validateBatch() : validateSingle();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      if (entryMode === "single") {
        const result = await postListing({
          title: form.title,
          description: form.description,
          price: form.price,
          quantity: form.quantity,
          unit: form.unit,
          deliveryScope: form.deliveryScope,
          images: form.images,
        });

        setSuccess({
          mode: "single",
          publishStatus: result.publishStatus,
          listingId: result.listingId,
        });

        if (result.publishStatus === "active" && result.listingId) {
          startTransition(() => {
            router.push(`/listings/${result.listingId}`);
          });
        }

        return;
      }

      const failedItems: Array<{ item: BatchListingItem; errorMsg: string }> = [];
      let createdCount = 0;
      let activeCount = 0;

      for (const item of batchItems) {
        try {
          const result = await postListing({
            title: item.title,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
            deliveryScope: item.deliveryScope,
            images: item.images,
          });

          createdCount += 1;
          if (result.publishStatus === "active") {
            activeCount += 1;
          }
        } catch (submitError: any) {
          failedItems.push({
            item,
            errorMsg:
              submitError?.message || "Unable to publish one of the batch listings right now.",
          });
        }
      }

      if (createdCount === 0) {
        setError(failedItems[0]?.errorMsg || "Unable to publish the batch right now.");
        return;
      }

      setSuccess({
        mode: "batch",
        createdCount,
        activeCount,
        failedCount: failedItems.length,
      });

      if (failedItems.length > 0) {
        setBatchItems(
          failedItems.map((entry) => ({
            ...entry.item,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          }))
        );
        setError(
          `${failedItems.length} item(s) still need fixes before they can be published. Update the remaining cards and submit again.`
        );
        return;
      }

      setBatchItems([createBatchItem(details.unitOptions[0], form.deliveryScope)]);
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to publish the listing right now.");
    } finally {
      setIsSubmitting(false);
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
                    ? "Clear photos, price, and location help buyers respond faster."
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

          <div className="mt-6 rounded-[24px] border border-stone-200 bg-white p-5">
            <p className="text-sm font-semibold text-stone-900">Listing mode</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              Single is fastest for one listing. Batch lets you publish up to {MAX_BATCH_ITEMS}
              listings at once while sharing the same location and contact details.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-stone-200 bg-stone-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setEntryMode("single");
                  setError("");
                  setSuccess(null);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  entryMode === "single"
                    ? "bg-terra-500 text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Single
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntryMode("batch");
                  setError("");
                  setSuccess(null);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  entryMode === "batch"
                    ? "bg-terra-500 text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Batch
              </button>
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
                  {success.mode === "single" ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">
                        {success.createdCount} listing(s) submitted successfully.
                      </p>
                      <p className="mt-1 leading-relaxed">
                        {success.activeCount > 0 ? `${success.activeCount} are already live. ` : ""}
                        {success.failedCount > 0
                          ? `${success.failedCount} item(s) still need fixes before they can be published.`
                          : "The full batch went through successfully."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <Link href="/browse" className="text-sm font-semibold text-forest-800 underline underline-offset-2">
                          Browse marketplace
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-6">
            {entryMode === "single" ? (
              <>
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

              </>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {batchReadiness.readyCount}/{batchReadiness.itemCount} items ready
                      </p>
                      <p className="mt-1 text-sm text-stone-600">
                        Each item needs a title, description, price, and at least one real image.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addBatchItem}
                      className="secondary-button"
                      disabled={batchItems.length >= MAX_BATCH_ITEMS}
                    >
                      Add item
                    </button>
                  </div>
                </div>

                {batchItems.map((item, index) => {
                  const previews =
                    batchPreviewGroups.find((group) => group.id === item.id)?.previews || [];

                  return (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-stone-200 bg-white p-5"
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-stone-900">
                            Item {index + 1}
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            This becomes its own marketplace listing.
                          </p>
                        </div>
                        {batchItems.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeBatchItem(item.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                            Remove
                          </button>
                        ) : null}
                      </div>

                      <div className="grid gap-5">
                        <div>
                          <label className="field-label">Listing title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(event) =>
                              updateBatchItem(item.id, (current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            }
                            placeholder={details.placeholderTitle}
                            className="field-input"
                          />
                        </div>

                        <div>
                          <label className="field-label">Description</label>
                          <textarea
                            value={item.description}
                            onChange={(event) =>
                              updateBatchItem(item.id, (current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                            placeholder={details.placeholderDescription}
                            className="field-textarea"
                          />
                        </div>

                        <div className="grid gap-5 md:grid-cols-4">
                          <div>
                            <label className="field-label">
                              Price (KES){item.unit ? ` - per ${item.unit}` : ""}
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.price}
                              onChange={(event) =>
                                updateBatchItem(item.id, (current) => ({
                                  ...current,
                                  price: event.target.value,
                                }))
                              }
                              placeholder="Example: 4500"
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className="field-label">{details.quantityLabel}</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={item.quantity}
                              onChange={(event) =>
                                updateBatchItem(item.id, (current) => ({
                                  ...current,
                                  quantity: event.target.value,
                                }))
                              }
                              placeholder={details.quantityHint}
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className="field-label">Unit</label>
                            <select
                              value={item.unit}
                              onChange={(event) =>
                                updateBatchItem(item.id, (current) => ({
                                  ...current,
                                  unit: event.target.value,
                                }))
                              }
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
                            <label className="field-label">Delivery scope</label>
                            <select
                              value={item.deliveryScope}
                              onChange={(event) =>
                                updateBatchItem(item.id, (current) => ({
                                  ...current,
                                  deliveryScope: event.target.value as DeliveryScope,
                                }))
                              }
                              className="field-select"
                            >
                              {DELIVERY_SCOPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <label className="field-label">Listing images</label>
                            <span className="text-xs text-stone-500">
                              {item.images.length}/{MAX_IMAGES} uploaded
                            </span>
                          </div>
                          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center transition hover:border-terra-300 hover:bg-white">
                            <UploadCloud className="h-8 w-8 text-terra-600" />
                            <p className="mt-3 text-sm font-semibold text-stone-900">
                              Upload photos for this item
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              JPG, PNG, or WebP. Up to {MAX_IMAGES} images.
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(event) => handleBatchImageSelection(item.id, event)}
                            />
                          </label>

                          {previews.length > 0 ? (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                              {previews.map((preview, imageIndex) => (
                                <div
                                  key={`${preview.key}-${imageIndex}`}
                                  className="overflow-hidden rounded-[24px] border border-stone-200 bg-white"
                                >
                                  <div className="relative aspect-[4/3] bg-stone-100">
                                    <Image
                                      src={preview.url}
                                      alt={`Batch upload ${index + 1}-${imageIndex + 1}`}
                                      fill
                                      sizes="(max-width: 1024px) 50vw, 33vw"
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                  <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-stone-600">
                                    <span className="truncate">{preview.file.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeBatchImage(item.id, imageIndex)}
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
                              No photos uploaded yet. Each batch item needs its own real photos.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-terra-600" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-stone-900">Location</h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    County is required. Add a town or map pin so nearby buyers can find you faster.
                    In batch mode, this applies to every listing in the batch.
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
              {entryMode === "single" ? (
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
              ) : (
                <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-600">
                  Delivery scope is set inside each batch item so you can vary it per listing when
                  needed.
                </div>
              )}
            </div>

            {entryMode === "single" ? (
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
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || isPending}
              className="primary-button w-full"
            >
              {isSubmitting || isPending
                ? entryMode === "batch"
                  ? "Publishing batch..."
                  : "Publishing..."
                : entryMode === "batch"
                ? "Publish batch listings"
                : "Publish listing"}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">
                  {entryMode === "batch" ? "Batch summary" : "Preview"}
                </p>
                <p className="hidden">
                  {publishPreview} · {form.images.length} image{form.images.length === 1 ? "" : "s"}
                </p>
                <p className="hidden">
                  {entryMode === "batch"
                    ? `${batchReadiness.itemCount} item${
                        batchReadiness.itemCount === 1 ? "" : "s"
                      } · ${batchImageCount} image${batchImageCount === 1 ? "" : "s"}`
                    : `${publishPreview} · ${form.images.length} image${
                        form.images.length === 1 ? "" : "s"
                      }`}
                </p>
                <p className="mt-3 text-sm font-semibold text-stone-900 xl:hidden">
                  {entryMode === "batch"
                    ? `${batchReadiness.itemCount} item${
                        batchReadiness.itemCount === 1 ? "" : "s"
                      } / ${batchImageCount} image${batchImageCount === 1 ? "" : "s"}`
                    : `${publishPreview} / ${form.images.length} image${
                        form.images.length === 1 ? "" : "s"
                      }`}
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
              {entryMode === "batch" ? (
                <>
                  <h2 className="text-3xl font-bold text-stone-900">
                    {batchReadiness.itemCount} listing
                    {batchReadiness.itemCount === 1 ? "" : "s"} in this batch
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    Each item publishes as its own marketplace listing while sharing the same
                    contact details and location.
                  </p>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                        Ready
                      </p>
                      <p className="mt-1 font-semibold text-stone-900">
                        {batchReadiness.readyCount}/{batchReadiness.itemCount} items ready
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                        Coverage
                      </p>
                      <p className="mt-1 font-semibold text-stone-900">
                        {locationPreview || "County and town not set yet"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                        Images
                      </p>
                      <p className="mt-1 font-semibold text-stone-900">
                        {batchImageCount} image{batchImageCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-[24px] border border-stone-200 bg-white px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                      Items in batch
                    </p>
                    {batchTitlePreview.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm text-stone-700">
                        {batchTitlePreview.map((title) => (
                          <li key={title} className="truncate">
                            {title}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-stone-500">
                        Add item titles and they will appear here.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-stone-900">
                    {form.title.trim() || details.placeholderTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {form.description.trim() || details.placeholderDescription}
                  </p>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                        Price
                      </p>
                      <p className="mt-1 font-semibold text-stone-900">
                        {publishPreview}
                        {form.unit && form.price ? (
                          <span className="ml-1 text-sm font-normal text-stone-500">
                            per {form.unit}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                        Coverage
                      </p>
                      <p className="mt-1 font-semibold text-stone-900">
                        {locationPreview || "County and town not set yet"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                        Images
                      </p>
                      <p className="mt-1 font-semibold text-stone-900">
                        {form.images.length} image{form.images.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </>
              )}
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
