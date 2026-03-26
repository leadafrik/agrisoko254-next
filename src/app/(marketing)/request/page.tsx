import type { Metadata } from "next";
import Link from "next/link";
import RequestCard from "@/components/marketplace/RequestCard";
import SectionHeading from "@/components/marketplace/SectionHeading";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Buyer Requests | Active Demand Across Kenya",
  description:
    "Browse active buyer requests on Agrisoko and see what buyers across Kenya are looking for right now.",
};

const getFirst = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

export default async function BuyerRequestsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const county = getFirst(searchParams?.county) || "";
  const category = getFirst(searchParams?.category) || "";

  const params = new URLSearchParams({
    limit: "18",
    status: "active",
  });

  if (county) params.set("county", county);
  if (category) params.set("category", category);

  const data = await serverFetch<any>(`${API_BASE_URL}/buyer-requests?${params.toString()}`, {
    revalidate: 60,
  });
  const requests = Array.isArray(data?.data) ? data.data : Array.isArray(data?.requests) ? data.requests : Array.isArray(data) ? data : [];

  return (
    <div className="page-shell py-10 sm:py-12">
      <section className="hero-panel p-6 sm:p-8">
        <SectionHeading
          eyebrow="Demand board"
          title="See what buyers need before you decide what to post"
          description="Buyer requests keep the marketplace demand-led. Suppliers can scan active demand, find county-level opportunities, and respond where they can genuinely deliver."
          actions={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/request/new" className="primary-button">
                Post a request
              </Link>
              <Link href="/browse" className="secondary-button">
                Browse listings
              </Link>
            </div>
          }
        />

        <form className="mt-8 grid gap-3 rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-3">
          <input type="text" name="county" defaultValue={county} placeholder="Filter by county" className="field-input" />
          <select name="category" defaultValue={category} className="field-select">
            <option value="">All categories</option>
            <option value="produce">Produce</option>
            <option value="livestock">Livestock</option>
            <option value="inputs">Inputs</option>
            <option value="service">Services</option>
          </select>
          <button type="submit" className="primary-button w-full">
            Apply filters
          </button>
        </form>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            {requests.length} active request{requests.length === 1 ? "" : "s"} shown
          </p>
          {(county || category) && (
            <Link href="/request" className="text-sm font-semibold text-terra-600 hover:text-terra-700">
              Reset filters
            </Link>
          )}
        </div>

        {requests.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((request: any) => (
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
              <Link href="/request" className="secondary-button">
                View all requests
              </Link>
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
