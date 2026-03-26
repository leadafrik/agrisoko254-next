export const COOKIE_CONSENT_KEY = "agrisoko_cookie_consent";
export const GOOGLE_ADS_TAG_ID = "AW-17766894151";
export const GOOGLE_ANALYTICS_TAG_ID = "G-HP4LZ027BY";

export type CookieConsentValue = "accepted" | "rejected";

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
    __agrisokoGoogleTagsInitialized?: boolean;
  }
}

const ensureGtagStub = () => {
  if (!window.dataLayer) window.dataLayer = [];
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args); };
  }
};

const ensureGoogleTagScript = () => {
  const src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_TAG_ID}`;
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
};

export const getCookieConsent = (): CookieConsentValue | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  return stored === "accepted" || stored === "rejected" ? stored : null;
};

export const setCookieConsent = (value: CookieConsentValue) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
};

export const enableGoogleAdsTracking = () => {
  if (typeof window === "undefined") return;
  ensureGtagStub();
  ensureGoogleTagScript();
  if (window.__agrisokoGoogleTagsInitialized) return;
  window.gtag?.("js", new Date());
  [GOOGLE_ADS_TAG_ID, GOOGLE_ANALYTICS_TAG_ID].forEach((id) => window.gtag?.("config", id));
  window.__agrisokoGoogleTagsInitialized = true;
};

export const trackGooglePageView = ({ pagePath, pageTitle }: { pagePath: string; pageTitle?: string }) => {
  if (typeof window === "undefined" || getCookieConsent() !== "accepted") return;
  enableGoogleAdsTracking();
  window.gtag?.("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  });
};

export const trackGoogleEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined" || getCookieConsent() !== "accepted") return;
  enableGoogleAdsTracking();
  window.gtag?.("event", eventName, params);
};
