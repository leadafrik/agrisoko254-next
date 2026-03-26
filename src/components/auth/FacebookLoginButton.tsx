"use client";

import { useEffect, useState } from "react";
import { useAuth, type LegalConsents } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { facebookAuth } from "@/lib/social/facebookAuth";

type FacebookLoginButtonProps = {
  legalConsents?: LegalConsents;
  blockedReason?: string;
  onBlocked?: (message: string) => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  className?: string;
};

export default function FacebookLoginButton({
  legalConsents,
  blockedReason,
  onBlocked,
  onSuccess,
  onError,
  className = "",
}: FacebookLoginButtonProps) {
  const { loginWithFacebook } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.config.public, { credentials: "include" });
        const config = await response.json().catch(() => ({}));
        const appId = String(config?.facebookAppId || "").trim();
        if (!appId) return;

        await facebookAuth.init(appId);
        if (!cancelled) {
          setIsReady(true);
        }
      } catch {
        if (!cancelled) {
          setIsReady(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isReady) return null;

  const handleClick = async () => {
    if (blockedReason) {
      onBlocked?.(blockedReason);
      return;
    }

    setLoading(true);
    try {
      const { user, accessToken } = await facebookAuth.login();
      await loginWithFacebook(accessToken, user.id, user.email, user.name, legalConsents);
      onSuccess?.();
    } catch (error: any) {
      const message = error?.message || "Facebook sign-in failed.";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-[#1877F2] bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1665d8] hover:border-[#1665d8] disabled:opacity-60 ${className}`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073C24 5.445 18.627.072 12 .072S0 5.445 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      {loading ? "Connecting to Facebook..." : "Continue with Facebook"}
    </button>
  );
}
