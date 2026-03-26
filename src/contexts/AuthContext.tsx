"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  clearSession,
  getAdminToken,
  getStoredUser,
  getToken,
  storeAdminSession,
  storeSession,
} from "@/lib/auth";

export interface LegalConsents {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
}

export interface User {
  _id: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  county?: string;
  constituency?: string;
  ward?: string;
  profilePicture?: string;
  role?: "user" | "admin" | "super_admin";
  userType?: string;
  verification?: {
    phoneVerified?: boolean;
    emailVerified?: boolean;
    idVerified?: boolean;
    selfieVerified?: boolean;
    isVerified?: boolean;
  };
}

type RegisterPayload = {
  phone?: string;
  email?: string;
  fullName: string;
  password: string;
  userType: "buyer" | "seller" | "farmer" | "landowner" | "service";
  county?: string;
  constituency?: string;
  ward?: string;
  inviteCode?: string;
  legalConsents: LegalConsents;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<any>;
  register: (payload: RegisterPayload) => Promise<any>;
  loginWithGoogle: (
    idToken: string,
    googleUserId: string,
    email: string,
    name: string,
    legalConsents?: LegalConsents
  ) => Promise<void>;
  loginWithFacebook: (
    accessToken: string,
    fbUserId: string,
    email: string,
    name: string,
    legalConsents?: LegalConsents
  ) => Promise<void>;
  requestEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, code: string) => Promise<void>;
  requestSmsOtp: (phone: string) => Promise<void>;
  verifySmsOtp: (phone: string, code: string) => Promise<void>;
  adminLogin: (
    token: string,
    user: User,
    session?: { refreshToken?: string; expiresIn?: number }
  ) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const pickToken = (payload: any) => payload?.token || payload?.accessToken || null;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthResponse = useCallback(async (payload: any) => {
    const nextToken = pickToken(payload);
    const nextUser = payload?.user ?? null;

    if (!nextToken || !nextUser) {
      throw new Error(payload?.message || "Authentication response was incomplete.");
    }

    storeSession({
      token: nextToken,
      refreshToken: payload?.refreshToken,
      expiresIn: payload?.expiresIn,
      user: nextUser,
    });

    setToken(nextToken);
    setUser(nextUser);
    await Promise.resolve();
  }, []);

  const refreshUser = useCallback(async () => {
    const existingToken = getToken() || getAdminToken();
    if (!existingToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const payload = await apiRequest(API_ENDPOINTS.auth.me);
      setUser(payload?.user ?? payload ?? null);
      setToken(existingToken);
    } catch {
      clearSession();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    const existingToken = getToken() || getAdminToken();

    if (storedUser && existingToken) {
      setUser(storedUser);
      setToken(existingToken);
    }

    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (identifier: string, password: string) => {
    const trimmed = identifier.trim();
    const payload: Record<string, string> = { password };

    if (trimmed.includes("@")) {
      payload.email = trimmed.toLowerCase();
    } else {
      payload.phone = trimmed;
    }

    const response = await apiRequest(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response?.requiresVerification) {
      const error: any = new Error(response?.message || "Verification required.");
      error.requiresVerification = true;
      error.verificationMethod = response?.verificationMethod;
      error.verificationTarget = response?.verificationTarget;
      throw error;
    }

    await applyAuthResponse(response);
    await refreshUser();
    return response;
  }, [applyAuthResponse, refreshUser]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await apiRequest(API_ENDPOINTS.auth.register, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response;
  }, []);

  const loginWithGoogle = useCallback(
    async (
      idToken: string,
      googleUserId: string,
      email: string,
      name: string,
      legalConsents?: LegalConsents
    ) => {
      const response = await apiRequest(API_ENDPOINTS.auth.googleLogin, {
        method: "POST",
        body: JSON.stringify({ idToken, googleUserId, email, name, legalConsents }),
      });

      await applyAuthResponse(response);
      await refreshUser();
    },
    [applyAuthResponse, refreshUser]
  );

  const loginWithFacebook = useCallback(
    async (
      accessToken: string,
      fbUserId: string,
      email: string,
      name: string,
      legalConsents?: LegalConsents
    ) => {
      const response = await apiRequest(API_ENDPOINTS.auth.facebookLogin, {
        method: "POST",
        body: JSON.stringify({ accessToken, fbUserId, email, name, legalConsents }),
      });

      await applyAuthResponse(response);
      await refreshUser();
    },
    [applyAuthResponse, refreshUser]
  );

  const requestEmailOtp = useCallback(async (email: string) => {
    await apiRequest(API_ENDPOINTS.auth.emailOtpRequest, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }, []);

  const verifyEmailOtp = useCallback(
    async (email: string, code: string) => {
      const response = await apiRequest(API_ENDPOINTS.auth.emailOtpVerify, {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });

      await applyAuthResponse(response);
      await refreshUser();
    },
    [applyAuthResponse, refreshUser]
  );

  const requestSmsOtp = useCallback(async (phone: string) => {
    await apiRequest(API_ENDPOINTS.auth.smsOtpRequest, {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }, []);

  const verifySmsOtp = useCallback(
    async (phone: string, code: string) => {
      const response = await apiRequest(API_ENDPOINTS.auth.smsOtpVerify, {
        method: "POST",
        body: JSON.stringify({ phone, code }),
      });

      await applyAuthResponse(response);
      await refreshUser();
    },
    [applyAuthResponse, refreshUser]
  );

  const adminLogin = useCallback(
    (
      adminToken: string,
      adminUser: User,
      session?: { refreshToken?: string; expiresIn?: number }
    ) => {
      if (session?.refreshToken || session?.expiresIn) {
        storeSession({
          token: adminToken,
          refreshToken: session.refreshToken,
          expiresIn: session.expiresIn,
          user: adminUser,
        });
      } else {
        storeAdminSession(adminToken, adminUser);
      }

      setToken(adminToken);
      setUser(adminUser);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest(API_ENDPOINTS.auth.logout, { method: "POST" });
    } catch {
      // Ignore logout transport errors and clear local session anyway.
    }

    clearSession();
    setUser(null);
    setToken(null);

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === "admin" || user?.role === "super_admin",
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        requestEmailOtp,
        verifyEmailOtp,
        requestSmsOtp,
        verifySmsOtp,
        adminLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
