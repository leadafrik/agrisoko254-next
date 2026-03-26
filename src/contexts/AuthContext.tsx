"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getToken, getStoredUser, storeSession, storeAdminSession, clearSession } from "@/lib/auth";

interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  role: "user" | "admin" | "super_admin";
  verification?: {
    phoneVerified?: boolean;
    idVerified?: boolean;
    isVerified?: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: { token: string; refreshToken?: string; expiresIn?: number; user: User }) => void;
  adminLogin: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = getToken();
    if (!t) { setLoading(false); return; }
    try {
      const data = await apiRequest(API_ENDPOINTS.auth.me);
      setUser(data?.user ?? data ?? null);
      setToken(t);
    } catch {
      clearSession();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    const t      = getToken();
    if (stored && t) {
      setUser(stored);
      setToken(t);
      setLoading(false);
      // Silently refresh in background
      refreshUser();
    } else {
      refreshUser();
    }
  }, [refreshUser]);

  const login = (data: { token: string; refreshToken?: string; expiresIn?: number; user: User }) => {
    storeSession(data);
    setToken(data.token);
    setUser(data.user);
  };

  const adminLogin = (t: string, u: User) => {
    storeAdminSession(t, u);
    setToken(t);
    setUser(u);
  };

  const logout = async () => {
    try { await apiRequest(API_ENDPOINTS.auth.logout, { method: "POST" }); } catch {}
    clearSession();
    setUser(null);
    setToken(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      isAuthenticated: !!user && !!token,
      isAdmin: user?.role === "admin" || user?.role === "super_admin",
      login, adminLogin, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
