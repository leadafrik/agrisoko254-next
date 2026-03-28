"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordField from "@/components/auth/PasswordField";
import { useAuth } from "@/contexts/AuthContext";

function B2BLoginContent() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/b2b/dashboard";
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(identifier, password);
      router.replace(redirectTo);
    } catch (loginError: any) {
      setError(loginError?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center bg-stone-100 px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-terra-600">
          Agrisoko B2B
        </p>
        <h2 className="mt-4 text-center text-3xl font-bold leading-9 tracking-tight text-stone-900">
          B2B Portal Login
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          Use your existing Agrisoko account. The B2B portal shares the same trusted sign-in flow.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium leading-6 text-stone-900">
                Email or phone
              </label>
              <div className="mt-2">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="info@example.com or 07..."
                  className="block w-full rounded-md border-0 py-1.5 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-terra-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-stone-900">
                Password
              </label>
              <div className="mt-2">
                <PasswordField
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-terra-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-terra-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-terra-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra-600 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-stone-500">
            Need access?{" "}
            <Link href={`/b2b/register?from=${encodeURIComponent(redirectTo)}`} className="font-semibold leading-6 text-terra-600 hover:text-terra-500">
              Start B2B signup
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-stone-500">
            Prefer the standard flow?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold leading-6 text-terra-600 hover:text-terra-500">
              Use marketplace sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function B2BLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-stone-500">Loading portal sign in...</div>}>
      <B2BLoginContent />
    </Suspense>
  );
}
