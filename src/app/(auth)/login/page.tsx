"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode") ?? "login";
  const redirect = params.get("redirect") ?? "/";

  const [form, setForm] = useState({ identifier: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) router.replace(redirect);
  }, [isAuthenticated, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = mode === "signup"
        ? { name: form.name, identifier: form.identifier, password: form.password }
        : { identifier: form.identifier, password: form.password };

      const url = mode === "signup" ? API_ENDPOINTS.auth.register : API_ENDPOINTS.auth.login;
      const data = await apiRequest(url, { method: "POST", body: JSON.stringify(payload) });
      login({ token: data.token ?? data.accessToken, refreshToken: data.refreshToken, expiresIn: data.expiresIn, user: data.user });
      router.replace(redirect);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold font-display text-terra-600">Agrisoko</Link>
          <p className="text-stone-500 text-sm mt-1">{mode === "signup" ? "Create your free account" : "Welcome back"}</p>
        </div>

        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">Full name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400"
                placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Phone or Email</label>
            <input type="text" required value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400"
              placeholder="0712 345 678 or email" />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Password</label>
            <input type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-terra-500 text-white py-3 rounded-lg font-semibold hover:bg-terra-600 transition-colors disabled:opacity-50">
            {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          {mode === "signup" ? (
            <>Already have an account? <Link href="/login" className="text-terra-600 font-medium hover:underline">Sign in</Link></>
          ) : (
            <>New to Agrisoko? <Link href="/login?mode=signup" className="text-terra-600 font-medium hover:underline">Create account</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
