"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, LogOut } from "lucide-react";
import FacebookLoginButton from "@/components/auth/FacebookLoginButton";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

function AdminLoginContent() {
  const { isAuthenticated, isAdmin, adminLogin, user, token, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/admin";
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || !user) return;

    if (isAdmin) {
      if (!syncedRef.current) {
        syncedRef.current = true;
        adminLogin(token, user);
      }
      router.replace(redirectTo);
      return;
    }

    setError("This account does not have admin access.");
  }, [adminLogin, isAdmin, isAuthenticated, redirectTo, router, token, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const identifier = form.identifier.trim();
      const loginPayload = identifier.includes("@")
        ? { email: identifier.toLowerCase(), password: form.password }
        : { phone: identifier, password: form.password };

      let data: any;
      try {
        data = await apiRequest(API_ENDPOINTS.admin.login, {
          method: "POST",
          body: JSON.stringify(loginPayload),
        });
      } catch {
        data = await apiRequest(API_ENDPOINTS.auth.login, {
          method: "POST",
          body: JSON.stringify(loginPayload),
        });
      }

      const resolvedUser = data.user ?? data.admin;
      const role = resolvedUser?.role;

      if (role !== "admin" && role !== "super_admin") {
        throw new Error("This account does not have admin access.");
      }

      adminLogin(data.token ?? data.accessToken, resolvedUser);
      router.replace(redirectTo);
    } catch (loginError: any) {
      setError(loginError?.message ?? "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth px-4 py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <aside className="hidden rounded-[30px] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 p-8 text-white shadow-[0_26px_70px_-36px_rgba(28,25,23,0.6)] lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
              Agrisoko
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Admin access should recognize the right account immediately.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
              This console controls listings, verification, moderation, orders, bulk workflows,
              and content. Use the same trusted account flow, but only verified admin roles can
              enter.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Listings and moderation",
              "User verification",
              "Orders and bulk operations",
              "Content and broadcast controls",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-[30px] border border-stone-200 bg-white p-6 shadow-[0_22px_60px_-40px_rgba(28,25,23,0.2)] sm:p-8">
          <div className="mb-8">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-stone-900">Admin Sign In</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Agrisoko admin panel. If you are already signed in with an admin account, this page
              will recognize you and open the console directly.
            </p>
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {isAuthenticated && !isAdmin ? (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You are signed in, but this account is not an admin account.
            </div>
          ) : null}

          <div className="space-y-3">
            <GoogleLoginButton
              onSuccess={() => setError("")}
              onError={(message) => setError(message)}
            />
            <FacebookLoginButton
              onSuccess={() => setError("")}
              onError={(message) => setError(message)}
            />
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                Or use email or phone
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              required
              placeholder="Email or phone"
              value={form.identifier}
              onChange={(event) => setForm({ ...form, identifier: event.target.value })}
              className="field-input"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="field-input"
            />
            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm">
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="inline-flex items-center gap-2 font-semibold text-terra-600 hover:text-terra-700"
            >
              Use marketplace sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login?mode=signup"
              className="inline-flex items-center gap-2 font-semibold text-terra-600 hover:text-terra-700"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            {isAuthenticated && !isAdmin ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-2 font-semibold text-stone-600 hover:text-stone-800"
              >
                <LogOut className="h-4 w-4" />
                Sign out and switch account
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminLoginFallback() {
  return (
    <div className="min-h-screen bg-earth px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center rounded-[30px] border border-stone-200 bg-white p-8 shadow-[0_22px_60px_-40px_rgba(28,25,23,0.2)]">
        <p className="text-sm font-medium text-stone-600">Loading admin sign in...</p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginContent />
    </Suspense>
  );
}
