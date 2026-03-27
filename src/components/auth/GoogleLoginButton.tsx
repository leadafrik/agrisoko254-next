"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, type LegalConsents } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { googleAuth } from "@/lib/social/googleAuth";

type GoogleLoginButtonProps = {
  legalConsents?: LegalConsents;
  blockedReason?: string;
  onBlocked?: (message: string) => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  className?: string;
};

const GOOGLE_CANONICAL_HOST = "www.agrisoko254.com";

const getGoogleUnavailableMessage = () => {
  if (typeof window === "undefined") {
    return "Google sign-in is unavailable right now.";
  }

  return window.location.hostname === GOOGLE_CANONICAL_HOST
    ? "Google sign-in is unavailable in this browser session. Reload once or use email or phone sign in."
    : `Google sign-in is only enabled on ${GOOGLE_CANONICAL_HOST}. Reload there or use email or phone sign in.`;
};

export default function GoogleLoginButton({
  legalConsents,
  blockedReason,
  onBlocked,
  onSuccess,
  onError,
  className = "",
}: GoogleLoginButtonProps) {
  const { loginWithGoogle } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState("");
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);

  useEffect(() => {
    successRef.current = onSuccess;
    errorRef.current = onError;
  }, [onError, onSuccess]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (typeof window !== "undefined" && window.location.hostname === "agrisoko254.com") {
          const nextUrl = new URL(window.location.href);
          nextUrl.hostname = GOOGLE_CANONICAL_HOST;
          window.location.replace(nextUrl.toString());
          return;
        }

        const response = await fetch(API_ENDPOINTS.config.public, { credentials: "include" });
        const config = await response.json().catch(() => ({}));
        const clientId = String(config?.googleClientId || "").trim();
        if (!clientId) {
          if (!cancelled) {
            setUnavailableReason("Google sign-in is not configured right now. Use email or phone sign in.");
          }
          return;
        }

        await googleAuth.init(clientId);
        if (!cancelled) {
          setUnavailableReason("");
          setIsReady(true);
        }
      } catch {
        if (!cancelled) {
          setIsReady(false);
          const message = getGoogleUnavailableMessage();
          setUnavailableReason(message);
          errorRef.current?.(message);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady || blockedReason || !buttonRef.current) {
      return;
    }

    const container = buttonRef.current;
    let renderHealthTimer: number | undefined;

    try {
      googleAuth.renderButton(
        container,
        {
          onSuccess: async ({ user, idToken }) => {
            setLoading(true);

            try {
              await loginWithGoogle(idToken, user.id, user.email, user.name, legalConsents);
              successRef.current?.();
            } catch (error: any) {
              const message = error?.message || "Google sign-in failed.";
              errorRef.current?.(message);
            } finally {
              setLoading(false);
            }
          },
          onError: (error) => {
            setLoading(false);
            errorRef.current?.(error.message || "Google sign-in failed.");
          },
        },
        {
          text: legalConsents ? "signup_with" : "continue_with",
          shape: "pill",
          theme: "outline",
        }
      );

      renderHealthTimer = window.setTimeout(() => {
        if (!container.childElementCount) {
          const message = getGoogleUnavailableMessage();
          setIsReady(false);
          setUnavailableReason(message);
          errorRef.current?.(message);
        }
      }, 1600);
    } catch (error: any) {
      const message = error?.message || getGoogleUnavailableMessage();
      setIsReady(false);
      setUnavailableReason(message);
      errorRef.current?.(message);
    }

    return () => {
      if (renderHealthTimer !== undefined) {
        window.clearTimeout(renderHealthTimer);
      }
      googleAuth.clearHandlers();
      container.innerHTML = "";
    };
  }, [blockedReason, isReady, legalConsents, loginWithGoogle]);

  if (!isReady && !unavailableReason) return null;

  const handleBlockedClick = () => {
    if (blockedReason) {
      onBlocked?.(blockedReason);
    }
  };

  const handleUnavailableClick = () => {
    errorRef.current?.(unavailableReason || getGoogleUnavailableMessage());
  };

  return (
    <div className={`relative w-full ${className}`}>
      {blockedReason ? (
        <button
          type="button"
          onClick={handleBlockedClick}
          className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      ) : unavailableReason && !isReady ? (
        <button
          type="button"
          onClick={handleUnavailableClick}
          className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-600 transition hover:border-stone-300 hover:bg-stone-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      ) : (
        <div className={loading ? "pointer-events-none opacity-60" : ""}>
          <div ref={buttonRef} className="min-h-[44px] w-full" />
        </div>
      )}

      {loading ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 text-sm font-semibold text-stone-700">
          Connecting to Google...
        </div>
      ) : null}
    </div>
  );
}
