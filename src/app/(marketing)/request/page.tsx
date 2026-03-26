import type { Metadata } from "next";
import Link from "next/link";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Buy Requests — Find Buyers for Your Farm Produce",
  description: "Browse buyer requests from buyers across Kenya looking for farm produce, livestock, and agricultural products.",
};

export default async function BuyerRequestsPage() {
  const data = await serverFetch<any>(`${API_BASE_URL}/buyer-requests?limit=30`, { revalidate: 60 });
  const requests = data?.requests ?? data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-stone-900 mb-1">Buy Requests</h1>
          <p className="text-stone-500">Buyers looking for produce across Kenya — respond if you can supply</p>
        </div>
        <Link href="/request/new"
          className="bg-terra-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-terra-600 transition-colors">
          + Post Request
        </Link>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <Link key={req._id} href={`/request/${req._id}`}
              className="block bg-white rounded-xl border border-stone-100 p-5 hover:border-terra-200 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-terra-600 font-semibold uppercase tracking-wide mb-1">{req.category}</p>
                  <h2 className="font-semibold text-stone-800 group-hover:text-terra-600">{req.title}</h2>
                  {req.description && (
                    <p className="text-sm text-stone-500 mt-1 line-clamp-2">{req.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-stone-400">
                    {req.location && <span>📍 {req.location}</span>}
                    {req.quantity && <span>📦 {req.quantity}</span>}
                    {req.budget && <span>💰 KES {req.budget.toLocaleString()}</span>}
                  </div>
                </div>
                <span className="shrink-0 bg-forest-50 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full border border-forest-200">
                  Open
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg mb-4">No buy requests yet.</p>
          <Link href="/request/new" className="bg-terra-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-terra-600">
            Post the first request
          </Link>
        </div>
      )}
    </div>
  );
}
