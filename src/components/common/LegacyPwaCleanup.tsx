"use client";

import { useEffect } from "react";

const CLEANUP_DONE_KEY = "agrisoko:legacy-pwa-cleanup:v1";
const CLEANUP_RELOAD_KEY = "agrisoko:legacy-pwa-cleanup:reload";

export default function LegacyPwaCleanup() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.hostname === "localhost") return;
    if (window.localStorage.getItem(CLEANUP_DONE_KEY) === "1") return;

    let cancelled = false;

    const cleanup = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
      const cacheKeys =
        "caches" in window ? await window.caches.keys().catch(() => [] as string[]) : [];
      const hadLegacyState =
        Boolean(navigator.serviceWorker.controller) ||
        registrations.length > 0 ||
        cacheKeys.length > 0;

      if (registrations.length > 0) {
        await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)));
      }

      if ("caches" in window && cacheKeys.length > 0) {
        await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey).catch(() => false)));
      }

      const remainingRegistrations =
        await navigator.serviceWorker.getRegistrations().catch(() => []);
      const remainingCacheKeys =
        "caches" in window ? await window.caches.keys().catch(() => [] as string[]) : [];
      const fullyClean =
        !navigator.serviceWorker.controller &&
        remainingRegistrations.length === 0 &&
        remainingCacheKeys.length === 0;

      if (fullyClean || !hadLegacyState) {
        window.localStorage.setItem(CLEANUP_DONE_KEY, "1");
        window.sessionStorage.removeItem(CLEANUP_RELOAD_KEY);
        return;
      }

      if (!cancelled && window.sessionStorage.getItem(CLEANUP_RELOAD_KEY) !== "1") {
        window.sessionStorage.setItem(CLEANUP_RELOAD_KEY, "1");
        window.location.reload();
      }
    };

    void cleanup();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
