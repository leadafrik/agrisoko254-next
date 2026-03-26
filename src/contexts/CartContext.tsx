"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  listingId: string;
  title: string;
  price: number;
  quantity: number;
  unit?: string;
  image?: string;
  category?: string;
  county?: string;
  sellerName?: string;
  maxQuantity?: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  setItemQuantity: (listingId: string, quantity: number) => void;
  removeItem: (listingId: string) => void;
  clearCart: () => void;
  getItemQuantity: (listingId: string) => number;
}

const CART_STORAGE_KEY = "agrisoko_marketplace_cart_v1";

const CartContext = createContext<CartContextValue | undefined>(undefined);

const clampQuantity = (quantity: number, maxQuantity?: number) => {
  const normalized = Number.isFinite(quantity) ? quantity : 1;
  const positive = Math.max(0.01, normalized);
  if (typeof maxQuantity === "number" && maxQuantity > 0) {
    return Math.min(positive, maxQuantity);
  }
  return positive;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setItems(parsed);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find((e) => e.listingId === item.listingId);
      if (!existing) {
        return [...current, { ...item, quantity: clampQuantity(item.quantity, item.maxQuantity) }];
      }
      return current.map((e) =>
        e.listingId === item.listingId
          ? { ...e, ...item, quantity: clampQuantity(e.quantity + item.quantity, item.maxQuantity ?? e.maxQuantity) }
          : e
      );
    });
  }, []);

  const setItemQuantity = useCallback((listingId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((e) => e.listingId === listingId ? { ...e, quantity: clampQuantity(quantity, e.maxQuantity) } : e)
        .filter((e) => e.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((listingId: string) => {
    setItems((current) => current.filter((e) => e.listingId !== listingId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getItemQuantity = useCallback(
    (listingId: string) => items.find((e) => e.listingId === listingId)?.quantity || 0,
    [items]
  );

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items, itemCount: items.length, subtotal, addItem, setItemQuantity, removeItem, clearCart, getItemQuantity };
  }, [items, addItem, setItemQuantity, removeItem, clearCart, getItemQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
