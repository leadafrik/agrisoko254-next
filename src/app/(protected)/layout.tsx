"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!getToken()) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, pathname, router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="page-shell py-16 pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-center text-stone-500 lg:pb-16">Loading your account...</main>
        <Footer />
        <MobileBottomNav />
      </>
    );
  }

  if (!isAuthenticated && !getToken()) {
    return (
      <>
        <Navbar />
        <main className="page-shell py-16 pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-center text-stone-500 lg:pb-16">Redirecting to sign in...</main>
        <Footer />
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
