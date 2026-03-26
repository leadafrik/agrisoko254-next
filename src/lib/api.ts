"use client";

import { API_BASE_URL, API_ENDPOINTS } from "./endpoints";
import {
  clearAdminSession,
  clearSession,
  getAdminToken,
  getRefreshToken,
  getToken,
  isTokenExpiringSoon,
  storeAdminSession,
  storeSession,
} from "./auth";

const CSRF_HEADER = "X-CSRF-Token";
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

type AuthMode = "auto" | "user" | "admin" | "none";
type ApiRequestOptions = RequestInit & {
  authMode?: AuthMode;
};

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
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      csrfCache = data?.csrfToken ?? null;
      return csrfCache;
    })
    .finally(() => {
      csrfFlight = null;
    });

  return csrfFlight;
};

let refreshFlight: Promise<string | null> | null = null;

const redirectToAdminLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin/login")) return;
  const from = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/admin/login?from=${encodeURIComponent(from || "/admin")}`;
};

const doRefresh = async (): Promise<string | null> => {
  if (refreshFlight) return refreshFlight;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  refreshFlight = fetch(API_ENDPOINTS.auth.refreshToken, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.accessToken) {
        clearSession();
        return null;
      }

      storeSession({
        token: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      });

      return data.accessToken as string;
    })
    .catch(() => {
      clearSession();
      return null;
    })
    .finally(() => {
      refreshFlight = null;
    });

  return refreshFlight;
};

const SKIP_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/logout",
  "/auth/facebook",
  "/auth/google",
  "/request-email-otp",
  "/verify-email-otp",
  "/request-sms-otp",
  "/verify-sms-otp",
];

const resolveAuthToken = (authMode: AuthMode) => {
  const userToken = getToken();
  const adminToken = getAdminToken();

  if (authMode === "none") {
    return { token: null, canRefresh: false };
  }

  if (authMode === "admin") {
    return {
      token: adminToken || userToken,
      canRefresh: !adminToken && Boolean(userToken),
    };
  }

  return {
    token: userToken || adminToken,
    canRefresh: Boolean(userToken),
  };
};

const executeRequest = async (
  url: string,
  requestOptions: RequestInit,
  headers: Record<string, string>
) =>
  fetch(url, {
    ...requestOptions,
    headers,
    credentials: "include",
    cache: "no-store",
  });

const parseResponsePayload = async (response: Response) =>
  response.headers.get("content-type")?.includes("application/json")
    ? response.json().catch(() => ({}))
    : response.text().then((text) => (text ? { message: text } : {}));

export const apiRequest = async (
  url: string,
  options: ApiRequestOptions = {}
): Promise<any> => {
  const { authMode = "auto", ...requestOptions } = options;
  const { token, canRefresh } = resolveAuthToken(authMode);
  const adminToken = getAdminToken();
  const userToken = getToken();
  const method = (requestOptions.method ?? "GET").toUpperCase();
  const needsCsrf = MUTATING.has(method) && url.startsWith(API_BASE_URL);
  const skipRefresh = SKIP_REFRESH_PATHS.some((path) => url.includes(path));

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(requestOptions.headers as Record<string, string>),
  };

  const isFormData = typeof FormData !== "undefined" && requestOptions.body instanceof FormData;
  if (!isFormData && requestOptions.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (needsCsrf) {
    const csrfToken = await fetchCsrf();
    if (csrfToken) headers[CSRF_HEADER] = csrfToken;
  }

  let response = await executeRequest(url, requestOptions, headers);

  if (!response.ok && response.status === 403) {
    const errorData = await response.clone().json().catch(() => ({}));
    if (String(errorData?.code ?? "").startsWith("CSRF_")) {
      csrfCache = null;
      const newCsrf = await fetchCsrf(true);
      if (newCsrf) headers[CSRF_HEADER] = newCsrf;
      response = await executeRequest(url, requestOptions, headers);
    }
  }

  if (
    response.status === 401 &&
    authMode === "admin" &&
    adminToken &&
    userToken &&
    adminToken !== userToken
  ) {
    storeAdminSession(userToken);
    headers.Authorization = `Bearer ${userToken}`;
    response = await executeRequest(url, requestOptions, headers);
  }

  if (response.status === 401 && authMode === "admin") {
    clearAdminSession();

    if (userToken && userToken !== adminToken) {
      headers.Authorization = `Bearer ${userToken}`;
    } else {
      delete headers.Authorization;
    }

    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      redirectToAdminLogin();
    }
  }

  if (response.status === 401 && canRefresh && !skipRefresh) {
    const refreshedToken = isTokenExpiringSoon() ? await doRefresh() : await doRefresh();

    if (refreshedToken) {
      headers.Authorization = `Bearer ${refreshedToken}`;
      response = await executeRequest(url, requestOptions, headers);
    } else {
      clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  const data = await parseResponsePayload(response);

  if (!response.ok) {
    const adminSessionExpired =
      authMode === "admin" &&
      response.status === 401 &&
      String(data?.message || data?.error || "").toLowerCase().includes("token");
    const error: any = new Error(
      adminSessionExpired
        ? "Admin session expired. Sign in again to continue."
        : data?.message || data?.error || `API error ${response.status}`
    );
    error.response = { status: response.status, data };
    if (adminSessionExpired) {
      error.requiresAdminLogin = true;
    }
    throw error;
  }

  return data;
};

export const adminApiRequest = (url: string, options: RequestInit = {}) =>
  apiRequest(url, {
    ...options,
    authMode: "admin",
  });
