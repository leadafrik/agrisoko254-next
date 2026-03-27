// Client-side only — all localStorage access is guarded with typeof window checks

const TOKEN_KEY         = "kodisha_token";
const REFRESH_TOKEN_KEY = "kodisha_refresh_token";
const TOKEN_EXPIRY_KEY  = "kodisha_token_expiry";
const USER_KEY          = "kodisha_user";
const ADMIN_TOKEN_KEY   = "kodisha_admin_token";
const AUTH_TOKEN_COOKIE = "agrisoko_auth_token";
const ADMIN_TOKEN_COOKIE = "agrisoko_admin_token";

const setClientCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
};

const clearClientCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const storeSession = (data: {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: any;
}) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, data.token);
  setClientCookie(AUTH_TOKEN_COOKIE, data.token);
  if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  if (data.expiresIn) {
    const expiry = Date.now() + data.expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
  }
  if (data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    const isAdminUser = data.user?.role === "admin" || data.user?.role === "super_admin";
    if (isAdminUser) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setClientCookie(ADMIN_TOKEN_COOKIE, data.token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      clearClientCookie(ADMIN_TOKEN_COOKIE);
    }
  }
};

export const storeAdminSession = (token: string, user?: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  // Keep admin auth separate so normal marketplace requests can keep using the user token.
  setClientCookie(AUTH_TOKEN_COOKIE, token);
  setClientCookie(ADMIN_TOKEN_COOKIE, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAdminSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  clearClientCookie(ADMIN_TOKEN_COOKIE);
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  [TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY, USER_KEY, ADMIN_TOKEN_KEY].forEach(
    (k) => localStorage.removeItem(k)
  );
  clearClientCookie(AUTH_TOKEN_COOKIE);
  clearClientCookie(ADMIN_TOKEN_COOKIE);
};

export const getStoredUser = (): any | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isTokenExpiringSoon = (): boolean => {
  if (typeof window === "undefined") return false;
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return false;
  return Date.now() > Number(expiry) - 2 * 60 * 1000;
};
