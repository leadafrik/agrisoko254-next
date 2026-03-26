"use client";
import { useEffect, useState } from "react";

type AdaptiveLayoutProfile = {
  width: number;
  height: number;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isCompact: boolean;
  isShortViewport: boolean;
  isTouch: boolean;
  canHover: boolean;
  prefersReducedMotion: boolean;
};

const getProfile = (): AdaptiveLayoutProfile => {
  if (typeof window === "undefined") {
    return { width: 1280, height: 800, isPhone: false, isTablet: false, isDesktop: true, isCompact: false, isShortViewport: false, isTouch: false, canHover: true, prefersReducedMotion: false };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    width,
    height,
    isPhone: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    isCompact: width < 768,
    isShortViewport: height < 760,
    isTouch: window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0,
    canHover: window.matchMedia("(hover: hover)").matches,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
};

export const useAdaptiveLayout = () => {
  const [profile, setProfile] = useState<AdaptiveLayoutProfile>(() => getProfile());

  useEffect(() => {
    const update = () => setProfile(getProfile());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return profile;
};

export type { AdaptiveLayoutProfile };
