"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function B2BRegisterContent() {
  const [userType, setUserType] = useState<"buyer" | "supplier">("buyer");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/b2b/dashboard";
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  const openSignup = () => {
    router.push(`/login?mode=signup&redirect=${encodeURIComponent(redirectTo)}`);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center bg-stone-100 px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-terra-600">
          Agrisoko B2B
        </p>
        <h2 className="mt-4 text-center text-3xl font-bold leading-9 tracking-tight text-stone-900">
          Register for the B2B Portal
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          B2B access now uses the same Agrisoko account setup and verification flow.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium leading-6 text-stone-900">I am a...</label>
              <fieldset className="mt-2">
                <legend className="sr-only">User type</legend>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      id="buyer"
                      name="userType"
                      type="radio"
                      checked={userType === "buyer"}
                      onChange={() => setUserType("buyer")}
                      className="h-4 w-4 border-stone-300 text-terra-600 focus:ring-terra-600"
                    />
                    <label htmlFor="buyer" className="ml-2 block text-sm text-stone-900">
                      B2B Buyer
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="supplier"
                      name="userType"
                      type="radio"
                      checked={userType === "supplier"}
                      onChange={() => setUserType("supplier")}
                      className="h-4 w-4 border-stone-300 text-terra-600 focus:ring-terra-600"
                    />
                    <label htmlFor="supplier" className="ml-2 block text-sm text-stone-900">
                      B2B Supplier
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-600">
              {userType === "buyer" ? (
                <>Buyer teams can use buyer requests, bulk workflows, and messaging immediately after account setup.</>
              ) : (
                <>Suppliers can use the same account flow, then respond through live marketplace and bulk workflows.</>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={openSignup}
                className="flex w-full justify-center rounded-md bg-terra-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-terra-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra-600"
              >
                Continue to account setup
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-stone-500">
            Already a member?{" "}
            <Link href={`/b2b/login?from=${encodeURIComponent(redirectTo)}`} className="font-semibold leading-6 text-terra-600 hover:text-terra-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function B2BRegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-stone-500">Loading portal signup...</div>}>
      <B2BRegisterContent />
    </Suspense>
  );
}
