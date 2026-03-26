import Link from "next/link";
import { formatShortDate, getBudgetLabel, getCategoryByApi, getLocationLabel, getQuantityLabel } from "@/lib/marketplace";

type RequestCardProps = {
  request: any;
  href?: string;
};

const URGENCY_STYLES: Record<string, string> = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-sky-200 bg-sky-50 text-sky-700",
};

export default function RequestCard({ request, href }: RequestCardProps) {
  const category = getCategoryByApi(request?.category);
  const location = getLocationLabel(request);
  const budget = getBudgetLabel(request?.budget);
  const quantity = getQuantityLabel(request);
  const urgency = String(request?.urgency || "").toLowerCase();
  const requestHref = href || `/request/${request?._id || request?.id}`;

  return (
    <Link
      href={requestHref}
      className="group flex h-full flex-col rounded-[26px] border border-stone-200 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(120,83,47,0.45)] transition duration-200 hover:-translate-y-1 hover:border-terra-200 hover:shadow-[0_28px_55px_-35px_rgba(120,83,47,0.55)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-600">
            {category?.shortLabel || "Request"}
          </p>
          <h3 className="mt-2 line-clamp-2 text-xl font-semibold text-stone-900 transition group-hover:text-terra-600">
            {request?.title || "Buyer request"}
          </h3>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            URGENCY_STYLES[urgency] || "border-stone-200 bg-stone-50 text-stone-600"
          }`}
        >
          {urgency || "open"}
        </span>
      </div>

      {request?.description ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-600">{request.description}</p>
      ) : null}

      <div className="mt-4 grid gap-3 text-sm text-stone-600 sm:grid-cols-2">
        {location ? (
          <div className="rounded-2xl bg-stone-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">County</p>
            <p className="mt-1 font-medium text-stone-900">{location}</p>
          </div>
        ) : null}
        {quantity ? (
          <div className="rounded-2xl bg-stone-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Quantity</p>
            <p className="mt-1 font-medium text-stone-900">{quantity}</p>
          </div>
        ) : null}
        {budget ? (
          <div className="rounded-2xl bg-stone-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Budget</p>
            <p className="mt-1 font-medium text-stone-900">{budget}</p>
          </div>
        ) : null}
        {request?.createdAt ? (
          <div className="rounded-2xl bg-stone-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Posted</p>
            <p className="mt-1 font-medium text-stone-900">{formatShortDate(request.createdAt)}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-sm font-semibold text-terra-600">
        <span>Review demand</span>
        <span>Open request</span>
      </div>
    </Link>
  );
}
