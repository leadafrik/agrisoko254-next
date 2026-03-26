import { getDeliveryScopeLabel } from "@/lib/marketplace";

const card = "rounded-2xl border border-stone-200 bg-stone-50 p-5";
const heading = "mb-3 text-base font-semibold text-stone-900";
const row = "flex items-start justify-between gap-4 py-2 border-b border-stone-100 last:border-0";
const label = "text-xs text-stone-500 shrink-0";
const value = "text-sm font-medium text-stone-900 text-right";

function Row({ k, v }: { k: string; v?: string | number | boolean | null }) {
  if (v === null || v === undefined || v === "" || v === false) return null;
  const display = typeof v === "boolean" ? (v ? "Yes" : "No") : String(v);
  return (
    <div className={row}>
      <span className={label}>{k}</span>
      <span className={value}>{display}</span>
    </div>
  );
}

export function ProductDetails({ listing }: { listing: any }) {
  return (
    <div className={card}>
      <p className={heading}>Product information</p>
      <div>
        <Row k="Category" v={listing?.category} />
        <Row k="Price per unit" v={listing?.price ? `KES ${Number(listing.price).toLocaleString()}` : null} />
        <Row k="Unit" v={listing?.unit} />
        <Row k="Quantity available" v={listing?.quantity ? `${listing.quantity} ${listing?.unit || ""}`.trim() : null} />
        <Row k="Delivery" v={getDeliveryScopeLabel(listing)} />
        <Row k="Grade" v={listing?.grade} />
        <Row k="Harvest date" v={listing?.harvestDate ? new Date(listing.harvestDate).toLocaleDateString() : null} />
      </div>
    </div>
  );
}

export function EquipmentDetails({ listing }: { listing: any }) {
  const services = Array.isArray(listing?.services)
    ? listing.services.join(", ")
    : typeof listing?.services === "string"
    ? listing.services
    : null;

  return (
    <div className={card}>
      <p className={heading}>Equipment & services</p>
      <div>
        <Row k="Services available" v={services} />
        <Row k="Pricing" v={listing?.pricing || (listing?.price ? `KES ${Number(listing.price).toLocaleString()}` : null)} />
        <Row k="Operator included" v={typeof listing?.operatorIncluded !== "undefined" ? listing.operatorIncluded : null} />
        <Row k="Delivery" v={getDeliveryScopeLabel(listing)} />
        <Row k="Min hire period" v={listing?.minHirePeriod} />
        <Row k="Max hire period" v={listing?.maxHirePeriod} />
      </div>
    </div>
  );
}

export function ProfessionalDetails({ listing }: { listing: any }) {
  const services = Array.isArray(listing?.services)
    ? listing.services.join(", ")
    : typeof listing?.services === "string"
    ? listing.services
    : null;

  return (
    <div className={card}>
      <p className={heading}>Professional services</p>
      <div>
        <Row k="Services offered" v={services} />
        <Row k="Years of experience" v={listing?.experience} />
        <Row k="Qualifications" v={listing?.qualifications} />
        <Row k="Rate" v={listing?.pricing || (listing?.price ? `KES ${Number(listing.price).toLocaleString()}` : null)} />
        <Row k="Delivery" v={getDeliveryScopeLabel(listing)} />
      </div>
    </div>
  );
}

export function AgrovetDetails({ listing }: { listing: any }) {
  const renderServices = () => {
    if (!listing?.services) return null;
    if (Array.isArray(listing.services)) return listing.services.join(", ");
    if (typeof listing.services === "object") {
      return Object.entries(listing.services)
        .filter(([, v]) => Array.isArray(v) && (v as any[]).length > 0)
        .map(([k, v]) => {
          const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
          return `${label}: ${(v as string[]).join(", ")}`;
        })
        .join(" • ") || null;
    }
    return String(listing.services);
  };

  return (
    <div className={card}>
      <p className={heading}>Agrovet details</p>
      <div>
        <Row k="Products / services" v={renderServices()} />
        <Row k="Pricing" v={listing?.pricing || (listing?.price ? `KES ${Number(listing.price).toLocaleString()}` : null)} />
        <Row k="Specialization" v={listing?.specialization} />
        <Row k="Business hours" v={listing?.businessHours} />
        <Row k="Delivery" v={getDeliveryScopeLabel(listing)} />
      </div>
    </div>
  );
}

export function LandDetails({ listing }: { listing: any }) {
  const previousCrops = Array.isArray(listing?.previousCrops)
    ? listing.previousCrops.join(", ")
    : listing?.previousCrops || null;

  return (
    <div className={card}>
      <p className={heading}>Land details</p>
      <div>
        <Row k="Size" v={listing?.size ? `${listing.size} acres` : null} />
        <Row k="Soil type" v={listing?.soilType} />
        <Row k="Water availability" v={listing?.waterAvailability} />
        <Row k="Organic certified" v={typeof listing?.organicCertified !== "undefined" ? listing.organicCertified : null} />
        <Row k="Previous crops" v={previousCrops} />
        <Row k="Available from" v={listing?.availableFrom ? new Date(listing.availableFrom).toLocaleDateString() : null} />
        <Row k="Available until" v={listing?.availableTo ? new Date(listing.availableTo).toLocaleDateString() : null} />
        <Row k="Min lease period" v={listing?.minLeasePeriod ? `${listing.minLeasePeriod} months` : null} />
        <Row k="Max lease period" v={listing?.maxLeasePeriod ? `${listing.maxLeasePeriod} months` : null} />
      </div>
    </div>
  );
}

export default function ListingTypeDetails({ listing }: { listing: any }) {
  const type = String(listing?.type || listing?.serviceType || listing?.listingType || listing?.category || "").toLowerCase();

  if (type === "equipment") return <EquipmentDetails listing={listing} />;
  if (type === "service" || type === "professional" || type === "professional_services") return <ProfessionalDetails listing={listing} />;
  if (type === "agrovet" || type === "agrovets") return <AgrovetDetails listing={listing} />;
  if (type === "land") return <LandDetails listing={listing} />;
  if (type === "produce" || type === "livestock" || type === "inputs" || type === "product") return <ProductDetails listing={listing} />;

  // Fallback: show product details if price/unit/quantity are present
  if (listing?.price || listing?.unit || listing?.quantity) return <ProductDetails listing={listing} />;
  return null;
}
