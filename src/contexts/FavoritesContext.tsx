"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

interface FavoritesContextValue {
  favorites: string[];
  isFavorited: (listingId: string) => boolean;
  toggleFavorite: (listingId: string, listingType?: string) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  isFavorited: () => false,
  toggleFavorite: async () => {},
  loading: false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) { setFavorites([]); return; }
    setLoading(true);
    try {
      const data = await apiRequest(API_ENDPOINTS.favorites.list);
      const ids: string[] = (data?.data || data || []).map((f: any) =>
        String(f?.listingId || f?._id || "")
      ).filter(Boolean);
      setFavorites(ids);
    } catch { setFavorites([]); }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => { void load(); }, [load]);

  const isFavorited = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback(async (listingId: string, listingType = "produce") => {
    if (!isAuthenticated) return;
    const wasFavorited = favorites.includes(listingId);
    // Optimistic update
    setFavorites((prev) =>
      wasFavorited ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
    try {
      await apiRequest(API_ENDPOINTS.favorites.toggle, {
        method: "POST",
        body: JSON.stringify({ listingId, listingType }),
      });
    } catch {
      // Revert on error
      setFavorites((prev) =>
        wasFavorited ? [...prev, listingId] : prev.filter((id) => id !== listingId)
      );
    }
  }, [isAuthenticated, favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorited, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
