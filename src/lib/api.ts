"use client";

import { API_BASE_URL, API_ENDPOINTS } from "./endpoints";
import { getToken, getRefreshToken, storeSession, clearSession, isTokenExpiringSoon, getAdminToken } from "./auth";

const CSRF_HEADER = "X-CSRF-Token";
const MUTATING    = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let csrfCache: string | null = null;
let csrfFlight: Promise<string | null> | null = null;

const fetchCsrf = async (force = false): Promise<string | null> => {
  if (typeof window === "undefined") return null;
  if (!force && csrfCache) return csrfCache;
  if (!force && csrfFlight) return csrfFlight;

  csrfFlight = fetch(API_ENDPOINTS.auth.csrfToken, {
    credentials: "include",
    headers: { Accept: "application/json" },
  })
    .then(async (r) => {
      const d = await r.json().catch(() => ({}));
      csrfCache = d?.csrfToken ?? null;
      return csrfCache;
    })
    .finally(() => { csrfFlight = null; });

  return csrfFlight;
};

let refreshFlight: Promise<string | null> | null = null;

const doRefresh = async (): Promise<string | null> => {
  if (refreshFlight) return refreshFlight;
  const rt = getRefreshToken();
  if (!rt) return null;

  refreshFlight = fetch(API_ENDPOINTS.auth.refreshToken, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  })
    .then(async (r) => {
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.accessToken) { clearSession(); return null; }
      storeSession({ token: d.accessToken, refreshToken: d.refreshToken, expiresIn: d.expiresIn });
      return d.accessToken as string;
    })
    .catch(() => { clearSession(); return null; })
    .finally(() => { refreshFlight = null; });

  return refreshFlight;
};

const SKIP_REFRESH_PATHS = [
  "/auth/login", "/auth/register", "/auth/refresh-token", "/auth/logout",
  "/auth/facebook", "/auth/google", "/request-email-otp", "/verify-email-otp",
  "/request-sms-otp", "/verify-sms-otp",
];

export const apiRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const isAdmin   = !!getAdminToken();
  const token     = isAdmin ? getAdminToken() : getToken();
  const method    = (options.method ?? "GET").toUpperCase();
  const needsCsrf = MUTATING.has(method) && url.startsWith(API_BASE_URL);

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (needsCsrf) {
    const csrf = await fetchCsrf();
    if (csrf) headers[CSRF_HEADER] = csrf;
  }

  let res = await fetch(url, { ...options, headers, credentials: "include", cache: "no-store" });

  // Handle CSRF retry
  if (!res.ok && res.status === 403) {
    const err = await res.clone().json().catch(() => ({}));
    if (String(err?.code ?? "").startsWith("CSRF_")) {
      csrfCache = null;
      const newCsrf = await fetchCsrf(true);
      if (newCsrf) headers[CSRF_HEADER] = newCsrf;
      res = await fetch(url, { ...options, headers, credentials: "include", cache: "no-store" });
    }
  }

  // Handle 401 — refresh and retry once
  if (res.status === 401 && !isAdmin && !SKIP_REFRESH_PATHS.some((p) => url.includes(p))) {
    const refreshToken = isTokenExpiringSoon() ? await doRefresh() : await doRefresh();
    if (refreshToken) {
      headers.Authorization = `Bearer ${refreshToken}`;
      res = await fetch(url, { ...options, headers, credentials: "include", cache: "no-store" });
    } else {
      clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  const data = await (res.headers.get("content-type")?.includes("application/json")
    ? res.json().catch(() => ({}))
    : res.text().then((t) => (t ? { message: t } : {})));

  if (!res.ok) {
    const error: any = new Error(data?.message || data?.error || `API error ${res.status}`);
    error.response = { status: res.status, data };
    throw error;
  }

  return data;
};
