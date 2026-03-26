"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const DELIVERY_FEE = 350;
const PLATFORM_FEE = 30;
const TILL_NUMBER = "3319295";
const MERCHANT_NAME = "Purity Valary Akong'ai";
const fmt = (v: number) => `KES ${v.toLocaleString()}`;

export default function CartPage() {
  const { items, subtotal, setItemQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const total = subtotal + DELIVERY_FEE + PLATFORM_FEE;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Your cart</h1>
          <p className="mt-1 text-sm text-stone-500">Review quantities, then proceed to checkout.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/browse" className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
            Continue shopping
          </Link>
          {items.length > 0 && (
            <button onClick={clearCart} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
              Clear cart
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-stone-100 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-stone-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-stone-500">Add priced listings to get started with managed checkout.</p>
          <Link href="/browse" className="mt-5 inline-block rounded-xl bg-terra-500 px-6 py-3 text-sm font-semibold text-white hover:bg-terra-600">
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="order-2 space-y-4 lg:order-1">
            {items.map((item) => (
              <div key={item.listingId} className="rounded-2xl border border-stone-100 bg-white p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="h-28 w-full overflow-hidden rounded-xl bg-stone-100 md:w-36">
                    {item.image ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="144px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-semibold text-stone-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-terra-600">{item.category || "Product"}</p>
                        <h2 className="mt-1 text-lg font-semibold text-stone-900">{item.title}</h2>
                        <p className="mt-0.5 text-sm text-stone-500">{item.sellerName}{item.county ? ` · ${item.county}` : ""}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs text-stone-400">Unit price</p>
                        <p className="text-lg font-semibold text-terra-600">{fmt(item.price)}{item.unit ? ` / ${item.unit}` : ""}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="inline-flex w-full max-w-[220px] items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-2 py-2">
                        <button onClick={() => setItemQuantity(item.listingId, Math.max(0.01, item.quantity - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-700 hover:bg-white">
                          <Minus className="h-4 w-4" />
                        </button>
                        <input type="number" min="0.01" step="0.01" value={item.quantity}
                          onChange={(e) => setItemQuantity(item.listingId, Number(e.target.value || 0))}
                          className="w-20 border-0 bg-transparent text-center text-sm font-semibold text-stone-900 outline-none" />
                        <button onClick={() => setItemQuantity(item.listingId, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-700 hover:bg-white">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <p className="text-sm font-semibold text-stone-900">Line total: {fmt(item.price * item.quantity)}</p>
                        <button onClick={() => removeItem(item.listingId)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="order-1 space-y-4 lg:order-2">
            <div className="rounded-2xl border border-stone-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-stone-900">Order summary</h2>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                {[["Items", items.length], ["Subtotal", fmt(subtotal)], ["Delivery fee", fmt(DELIVERY_FEE)], ["Agrisoko fee", fmt(PLATFORM_FEE)]].map(([label, val]) => (
                  <div key={String(label)} className="flex items-center justify-between gap-3">
                    <span>{label}</span><span className="font-semibold">{val}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-3 text-base font-semibold text-stone-900">
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-terra-100 bg-terra-50 p-4 text-sm text-stone-700">
                <p className="font-semibold text-terra-700">Pay to Agrisoko till</p>
                <p className="mt-2">Till number: <span className="font-semibold">{TILL_NUMBER}</span></p>
                <p className="mt-1">Merchant: <span className="font-semibold">{MERCHANT_NAME}</span></p>
              </div>
              <div className="mt-4 space-y-3">
                {user ? (
                  <Link href="/checkout" className="block w-full rounded-xl bg-terra-500 py-3 text-center text-sm font-semibold text-white hover:bg-terra-600">
                    Proceed to checkout
                  </Link>
                ) : (
                  <Link href={`/login?redirect=${encodeURIComponent("/checkout")}`} className="block w-full rounded-xl bg-terra-500 py-3 text-center text-sm font-semibold text-white hover:bg-terra-600">
                    Login to checkout
                  </Link>
                )}
                <p className="text-xs text-stone-400">Delivery in Kiambu, Nairobi, Kakamega, and Narok.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
