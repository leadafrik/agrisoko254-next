"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

const fmt = (v?: number) => (typeof v === "number" ? `KES ${v.toLocaleString()}` : "-");

const completionMeta = (status?: string) => {
  switch (status) {
    case "buyer_marked": return { label: "Buyer confirmed complete", cls: "bg-sky-100 text-sky-700" };
    case "seller_marked": return { label: "Seller confirmed complete", cls: "bg-violet-100 text-violet-700" };
    case "completed": return { label: "Completed by both parties", cls: "bg-amber-100 text-amber-700" };
    case "presumed_complete": return { label: "Presumed complete", cls: "bg-amber-100 text-amber-700" };
    default: return { label: "Pending completion", cls: "bg-stone-100 text-stone-700" };
  }
};

export default function BulkOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [bidQuote, setBidQuote] = useState("");
  const [bidDate, setBidDate] = useState("");
  const [bidNote, setBidNote] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [counterBidId, setCounterBidId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterNote, setCounterNote] = useState("");
  const [sendingCounter, setSendingCounter] = useState(false);
  const [respondingCounterId, setRespondingCounterId] = useState<string | null>(null);

  const order = payload?.order || null;
  const isOwner = Boolean(payload?.isOwner);
  const canBid = Boolean(payload?.canBid);
  const myBid = payload?.myBid || null;
  const invoice = payload?.invoice || null;
  const completionState = completionMeta(order?.completionStatus);
  const buyerConfirmed = Boolean(order?.buyerMarkedCompleteAt);
  const sellerConfirmed = Boolean(order?.sellerMarkedCompleteAt);
  const canMarkComplete = Boolean(
    order &&
    order.sellerAcceptedAt &&
    (order.status === "awarded" || order.status === "closed") &&
    (isOwner || myBid?.status === "accepted") &&
    order.completionStatus !== "completed" &&
    order.completionStatus !== "presumed_complete"
  );

  const budgetLabel = useMemo(() => {
    if (!order?.budget) return "Not set";
    const { min, max } = order.budget;
    if (typeof min === "number" && typeof max === "number") return `${fmt(min)} – ${fmt(max)}`;
    if (typeof min === "number") return `From ${fmt(min)}`;
    if (typeof max === "number") return `Up to ${fmt(max)}`;
    return "Not set";
  }, [order?.budget]);

  const loadDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest(API_ENDPOINTS.bulkOrders.getById(id));
      setPayload(res?.data || res || null);
    } catch (err: any) {
      setError(err?.message || "Failed to load bulk order.");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDetails(); }, [loadDetails]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const quote = Number(bidQuote);
    if (!Number.isFinite(quote) || quote <= 0) { setError("Enter a valid quote amount."); return; }
    if (!bidDate) { setError("Select a delivery date."); return; }
    try {
      setSubmittingBid(true);
      setError(""); setNotice("");
      await apiRequest(API_ENDPOINTS.bulkOrders.bids.place(id), {
        method: "POST",
        body: JSON.stringify({ quoteAmount: quote, deliveryDate: bidDate, note: bidNote.trim() || undefined }),
      });
      setOfferOpen(false);
      setBidQuote(""); setBidDate(""); setBidNote("");
      setNotice("Delivery offer submitted successfully.");
      await loadDetails();
    } catch (err: any) {
      setError(err?.message || "Unable to submit offer.");
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!id) return;
    try {
      setAcceptingBidId(bidId);
      setError(""); setNotice("");
      await apiRequest(API_ENDPOINTS.bulkOrders.bids.accept(id, bidId), {
        method: "POST",
        body: JSON.stringify({ acceptedReason: "Offer accepted for payment.", rejectedReason: "Another offer was selected." }),
      });
      router.push(`/checkout?source=bulk-offer&orderId=${encodeURIComponent(id)}`);
    } catch (err: any) {
      setError(err?.message || "Unable to accept bid.");
    } finally {
      setAcceptingBidId(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    if (!id) return;
    const reason = window.prompt("Reason for rejection:");
    if (!reason?.trim()) return;
    try {
      setError(""); setNotice("");
      await apiRequest(API_ENDPOINTS.bulkOrders.bids.reject(id, bidId), {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      setNotice("Bid rejected.");
      await loadDetails();
    } catch (err: any) {
      setError(err?.message || "Unable to reject bid.");
    }
  };

  const handleSendCounter = async (bidId: string) => {
    if (!id) return;
    const amount = Number(counterAmount);
    if (!Number.isFinite(amount) || amount <= 0) { setError("Enter a valid counter-offer amount."); return; }
    try {
      setSendingCounter(true);
      setError(""); setNotice("");
      await apiRequest(API_ENDPOINTS.bulkOrders.bids.counterOffer(id, bidId), {
        method: "POST",
        body: JSON.stringify({ counterOfferAmount: amount, counterOfferNote: counterNote.trim() || undefined }),
      });
      setCounterBidId(null); setCounterAmount(""); setCounterNote("");
      setNotice("Counter-offer sent to seller.");
      await loadDetails();
    } catch (err: any) {
      setError(err?.message || "Unable to send counter-offer.");
    } finally {
      setSendingCounter(false);
    }
  };

  const handleCounterResponse = async (bidId: string, decision: "accepted" | "rejected") => {
    if (!id) return;
    try {
      setRespondingCounterId(bidId);
      setError(""); setNotice("");
      await apiRequest(API_ENDPOINTS.bulkOrders.bids.respondCounter(id, bidId), {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      setNotice(decision === "accepted" ? "Counter-offer accepted." : "Counter-offer declined.");
      await loadDetails();
    } catch (err: any) {
      setError(err?.message || "Unable to respond to counter-offer.");
    } finally {
      setRespondingCounterId(null);
    }
  };

  const handleCloseOrder = async (status: "closed" | "cancelled") => {
    if (!id) return;
    const reason = status === "cancelled" ? window.prompt("Cancellation reason (optional):") : undefined;
    try {
      setError(""); setNotice("");
      await apiRequest(API_ENDPOINTS.bulkOrders.close(id), {
        method: "POST",
        body: JSON.stringify({ status, reason: reason || undefined }),
      });
      setNotice(`Order ${status}.`);
      await loadDetails();
    } catch (err: any) {
      setError(err?.message || "Unable to update order status.");
    }
  };

  const handleMarkComplete = async () => {
    if (!id) return;
    try {
      setError(""); setNotice("");
      await apiRequest(API_ENDPOINTS.bulkOrders.complete(id), { method: "POST" });
      setNotice("Completion update saved.");
      await loadDetails();
    } catch (err: any) {
      setError(err?.message || "Unable to mark completion.");
    }
  };

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-2xl border border-stone-100 bg-white p-8">
        <h1 className="text-2xl font-bold text-stone-900">Bulk order details</h1>
        <p className="mt-2 text-sm text-stone-500">Sign in to continue.</p>
        <Link href={`/login?redirect=/bulk/orders/${id || ""}`} className="mt-5 inline-block rounded-xl bg-terra-500 px-5 py-3 text-sm font-semibold text-white hover:bg-terra-600">Sign in</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link href="/bulk/orders" className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50">Back to bulk board</Link>
        <Link href="/bulk" className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50">Bulk access</Link>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      {loading ? (
        <div className="rounded-2xl border border-stone-100 bg-white p-6 text-sm text-stone-500">Loading bulk order details...</div>
      ) : !order ? (
        <div className="rounded-2xl border border-stone-100 bg-white p-6 text-sm text-stone-500">Bulk order not found.</div>
      ) : (
        <>
          {/* Order header */}
          <section className="rounded-2xl border border-stone-100 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">Bulk order</p>
                <h1 className="mt-1 text-2xl font-bold text-stone-900">{order.title}</h1>
                <p className="mt-1 text-sm text-stone-600">{order.itemName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === "open" ? "bg-emerald-100 text-emerald-700" : order.status === "awarded" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-700"}`}>{order.status}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${completionState.cls}`}>{completionState.label}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-stone-50 p-3 text-sm text-stone-700">
                <p><strong>Category:</strong> {order.category}</p>
                <p><strong>Quantity:</strong> {order.quantity} {order.unit}</p>
                <p><strong>Budget:</strong> {budgetLabel}</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-3 text-sm text-stone-700">
                <p><strong>County:</strong> {order.deliveryLocation?.county}</p>
                <p><strong>Constituency:</strong> {order.deliveryLocation?.constituency || "-"}</p>
                <p><strong>Ward:</strong> {order.deliveryLocation?.ward || "-"}</p>
                <p><strong>Delivery scope:</strong> {order.deliveryScope}</p>
                <p><strong>Deadline:</strong> {order.deliveryDeadline ? new Date(order.deliveryDeadline).toLocaleDateString() : "Not specified"}</p>
              </div>
            </div>

            {order.description && (
              <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">{order.description}</div>
            )}

            <div className="mt-4 text-sm text-stone-700">
              <p><strong>Total bids:</strong> {payload?.bidCount || 0}</p>
            </div>

            {invoice && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <p><strong>Invoice:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Buyer total:</strong> {fmt(invoice.totalBuyerAmount)} (Quote {fmt(invoice.quoteAmount)} + Fee {fmt(invoice.platformFeeAmount)})</p>
                <p><strong>Status:</strong> {invoice.status}</p>
                <p><strong>Email delivery:</strong> {invoice.emailSentAt ? `Sent on ${new Date(invoice.emailSentAt).toLocaleString()}` : "Pending"}</p>
              </div>
            )}

            {order.checkoutOrderId && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-stone-700">
                <p className="font-semibold text-stone-900">Payment order already opened</p>
                <p className="mt-2">The accepted delivery offer is already in checkout with Agrisoko money-back guarantee cover.</p>
                {isOwner && (
                  <button type="button" onClick={() => router.push(`/orders/${order.checkoutOrderId}`)} className="mt-4 rounded-xl bg-terra-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terra-600">
                    Open payment order
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
              <p><strong>Buyer confirmation:</strong> {buyerConfirmed ? `Done on ${new Date(order.buyerMarkedCompleteAt).toLocaleString()}` : "Pending"}</p>
              <p><strong>Seller confirmation:</strong> {sellerConfirmed ? `Done on ${new Date(order.sellerMarkedCompleteAt).toLocaleString()}` : "Pending"}</p>
            </div>

            {isOwner && (
              <div className="mt-4 flex flex-wrap gap-2">
                {canMarkComplete && (
                  <button type="button" onClick={handleMarkComplete} className="rounded-xl bg-terra-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terra-600">Mark complete</button>
                )}
                {order.status !== "cancelled" && order.status !== "closed" && (
                  <button type="button" onClick={() => handleCloseOrder("cancelled")} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Cancel order</button>
                )}
              </div>
            )}
          </section>

          {/* Seller bid section */}
          {canBid && (
            <section className="rounded-2xl border border-stone-100 bg-white p-6">
              <h2 className="text-lg font-semibold text-stone-900">Offer delivery</h2>
              <p className="mt-1 text-sm text-stone-500">Send one clear delivery offer with your total price, delivery date, and notes.</p>
              {!offerOpen ? (
                <button type="button" onClick={() => setOfferOpen(true)} className="mt-4 rounded-xl bg-terra-500 px-4 py-3 text-sm font-semibold text-white hover:bg-terra-600">I can deliver</button>
              ) : (
                <form onSubmit={handlePlaceBid} className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Quote amount (KES) *</label>
                      <input type="number" min={1} value={bidQuote} onChange={(e) => setBidQuote(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Delivery date *</label>
                      <input type="date" value={bidDate} onChange={(e) => setBidDate(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Note to buyer</label>
                    <textarea value={bidNote} onChange={(e) => setBidNote(e.target.value)} rows={2} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" placeholder="How you will fulfill this order..." />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={submittingBid} className="rounded-xl bg-terra-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-terra-600 disabled:opacity-50">{submittingBid ? "Submitting..." : "Send delivery offer"}</button>
                    <button type="button" onClick={() => setOfferOpen(false)} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">Cancel</button>
                  </div>
                </form>
              )}
            </section>
          )}

          {/* My bid (seller view) */}
          {myBid && !isOwner && (
            <section className="rounded-2xl border border-stone-100 bg-white p-6">
              <h2 className="text-lg font-semibold text-stone-900">Your bid</h2>
              <div className="mt-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-700">
                <p><strong>Quote:</strong> {fmt(myBid.quoteAmount)}</p>
                <p><strong>Delivery date:</strong> {new Date(myBid.deliveryDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {myBid.status}</p>
                {myBid.buyerDecisionReason && <p><strong>Buyer note:</strong> {myBid.buyerDecisionReason}</p>}
              </div>
              {myBid.counterOfferStatus === "pending" && myBid.counterOfferAmount && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                  <p className="font-semibold text-amber-800">Buyer sent a counter-offer</p>
                  <p className="mt-1 text-amber-700">Proposed amount: <strong>{fmt(myBid.counterOfferAmount)}</strong>{myBid.counterOfferNote ? ` — "${myBid.counterOfferNote}"` : ""}</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => handleCounterResponse(myBid._id, "accepted")} disabled={respondingCounterId === myBid._id} className="rounded-xl bg-terra-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-terra-600 disabled:opacity-50">Accept counter-offer</button>
                    <button type="button" onClick={() => handleCounterResponse(myBid._id, "rejected")} disabled={respondingCounterId === myBid._id} className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50">Decline</button>
                  </div>
                </div>
              )}
              {myBid.status === "accepted" && !order?.checkoutOrderId && (
                <p className="mt-4 text-sm text-terra-600">The buyer selected your offer. Agrisoko is waiting for payment before delivery starts.</p>
              )}
              {canMarkComplete && order?.sellerAcceptedAt && (
                <button type="button" onClick={handleMarkComplete} className="mt-3 rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Mark complete</button>
              )}
            </section>
          )}

          {/* Incoming bids (buyer view) */}
          {isOwner && (
            <section className="rounded-2xl border border-stone-100 bg-white p-6">
              <h2 className="text-lg font-semibold text-stone-900">Incoming bids</h2>
              {payload?.bids?.length ? (
                <div className="mt-4 space-y-3">
                  {payload.bids.map((bid: any) => (
                    <article key={bid._id} className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-stone-900">{bid.sellerId?.fullName || "Seller"}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${bid.status === "accepted" ? "bg-emerald-100 text-emerald-700" : bid.status === "rejected" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-700"}`}>{bid.status}</span>
                      </div>
                      <p className="mt-2"><strong>Quote:</strong> {fmt(bid.quoteAmount)}</p>
                      <p><strong>Delivery date:</strong> {new Date(bid.deliveryDate).toLocaleDateString()}</p>
                      {bid.note && <p><strong>Note:</strong> {bid.note}</p>}
                      {bid.buyerDecisionReason && <p><strong>Decision note:</strong> {bid.buyerDecisionReason}</p>}
                      {bid.counterOfferAmount && (
                        <p className="mt-2 text-xs text-amber-700">Counter-offer sent: <strong>{fmt(bid.counterOfferAmount)}</strong> — {bid.counterOfferStatus === "pending" ? "awaiting seller response" : bid.counterOfferStatus}</p>
                      )}
                      {order.status === "open" && bid.status === "pending" && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" onClick={() => handleAcceptBid(bid._id)} disabled={acceptingBidId === bid._id} className="rounded-xl bg-terra-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-terra-600 disabled:opacity-50">{acceptingBidId === bid._id ? "Opening payment..." : "Accept and proceed to payment"}</button>
                          {(!bid.counterOfferStatus || bid.counterOfferStatus === "rejected") && (
                            <button type="button" onClick={() => setCounterBidId(counterBidId === bid._id ? null : bid._id)} className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100">Counter-offer</button>
                          )}
                          <button type="button" onClick={() => handleRejectBid(bid._id)} className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Reject with reason</button>
                        </div>
                      )}
                      {counterBidId === bid._id && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                          <p className="text-xs font-semibold text-amber-800">Propose a different price</p>
                          <input type="number" min={1} value={counterAmount} onChange={(e) => setCounterAmount(e.target.value)} placeholder="Your offer (KES)" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none" />
                          <input type="text" value={counterNote} onChange={(e) => setCounterNote(e.target.value)} placeholder="Optional note to seller" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none" />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleSendCounter(bid._id)} disabled={sendingCounter} className="rounded-xl bg-terra-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-terra-600 disabled:opacity-50">{sendingCounter ? "Sending..." : "Send counter-offer"}</button>
                            <button type="button" onClick={() => setCounterBidId(null)} className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50">Cancel</button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-500">No bids yet.</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
