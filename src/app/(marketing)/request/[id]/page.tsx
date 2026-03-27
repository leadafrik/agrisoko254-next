import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";

interface Props { params: { id: string } }

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await serverFetch<any>(`${API_BASE_URL}/buyer-requests/${params.id}`, { revalidate: 60 });
  if (!data) return {};
  return {
    title: `Buyer Request: ${data.title}`,
    description: data.description ?? `Buyer looking for ${data.title} in Kenya`,
  };
}

export default async function BuyerRequestDetailPage({ params }: Props) {
  const data = await serverFetch<any>(`${API_BASE_URL}/buyer-requests/${params.id}`, { revalidate: 60 });
  if (!data) notFound();

  const req = data.request ?? data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1">
        <Link href="/request" className="hover:text-terra-600">Buy Requests</Link>
        <span>/</span>
        <span className="text-stone-800 truncate max-w-xs">{req.title}</span>
      </nav>

      <div className="bg-white rounded-xl border border-stone-100 p-6">
        <p className="text-xs text-terra-600 font-semibold uppercase tracking-wide mb-2">{req.category}</p>
        <h1 className="text-2xl font-bold font-display text-stone-900 mb-4">{req.title}</h1>

        {req.description && (
          <p className="text-stone-600 leading-relaxed mb-6">{req.description}</p>
        )}

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {req.quantity && (
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-xs text-stone-400 mb-1">Quantity needed</p>
              <p className="font-semibold text-stone-800">{req.quantity}</p>
            </div>
          )}
          {req.budget && (
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-xs text-stone-400 mb-1">Budget</p>
              <p className="font-semibold text-stone-800">KES {req.budget.toLocaleString()}</p>
            </div>
          )}
          {req.location && (
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-xs text-stone-400 mb-1">Location</p>
              <p className="font-semibold text-stone-800">{req.location}</p>
            </div>
          )}
        </div>

        <Link href={`/request/${params.id}/respond`}
          className="block w-full bg-terra-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-terra-600 transition-colors">
          Respond to this Request
        </Link>
      </div>
    </div>
  );
}
