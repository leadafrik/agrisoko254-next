"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest(API_ENDPOINTS.auth.passwordReset, {
        method: "POST",
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-xl font-bold text-stone-900">
          Agrisoko
        </Link>

        <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-[0_20px_60px_-30px_rgba(28,25,23,0.15)]">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-stone-900">Check your inbox</h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                If an account exists for{" "}
                <span className="font-medium text-stone-700">{identifier}</span>, we&apos;ve sent
                password reset instructions.
              </p>
              <Link
                href="/login"
                className="mt-6 block text-sm font-semibold text-terra-600 hover:text-terra-700"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-stone-900">Reset password</h1>
              <p className="mt-1.5 text-sm text-stone-500">
                Enter your email or phone and we&apos;ll send reset instructions.
              </p>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="field-input"
                  placeholder="Email or phone"
                  required
                  autoFocus
                />
                <button type="submit" disabled={loading} className="primary-button w-full">
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-stone-500">
                Remembered it?{" "}
                <Link href="/login" className="font-semibold text-terra-600 hover:text-terra-700">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
