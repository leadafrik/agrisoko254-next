import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
import { API_BASE_URL } from "@/lib/endpoints";
import RespondToRequestForm from "@/components/marketplace/RespondToRequestForm";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await serverFetch<any>(`${API_BASE_URL}/buyer-requests/${params.id}`, { revalidate: 60 });
  const req = data?.request ?? data;
  if (!req?.title) return { title: "Respond to Request | Agrisoko" };
  return {
    title: `Respond to: ${req.title} | Agrisoko`,
    description: `Submit your supply offer for this buyer request on Agrisoko.`,
    robots: { index: false },
  };
}

export default async function RespondToRequestPage({ params }: Props) {
  const data = await serverFetch<any>(`${API_BASE_URL}/buyer-requests/${params.id}`, { revalidate: 60 });
  if (!data) notFound();

  const req = data.request ?? data;

  return (
    <RespondToRequestForm
      requestId={params.id}
      requestTitle={req.title ?? "Buyer request"}
      requestCategory={req.category ?? "produce"}
      requestQuantity={req.quantity}
      requestUnit={req.unit}
      requestBudget={
        req.budget
          ? { min: req.budget.min, max: req.budget.max }
          : req.budgetMax || req.budgetMin
          ? { min: req.budgetMin, max: req.budgetMax }
          : undefined
      }
      requestLocation={
        [req.location?.approximateLocation, req.location?.county].filter(Boolean).join(", ") ||
        req.county ||
        undefined
      }
    />
  );
}
