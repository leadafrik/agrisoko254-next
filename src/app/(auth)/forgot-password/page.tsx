"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { isLikelyPhoneNumber, normalizeKenyanPhone } from "@/lib/phone";

type Step = "request" | "reset" | "done";

const PASSWORD_HINT =
  "Use at least 8 characters with an uppercase letter, lowercase letter, and number.";

const isStrongPassword = (value: string) =>
  value.length >= 8 &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /[0-9]/.test(value);

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = window.setInterval(() => {
      setResendTimer((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendTimer]);

  const target = useMemo(() => {
    const trimmed = identifier.trim();
    if (!trimmed) return null;

    if (isLikelyPhoneNumber(trimmed)) {
      const phone = normalizeKenyanPhone(trimmed);
      if (!phone) return null;
      return { type: "phone" as const, value: phone };
    }

    if (!trimmed.includes("@")) return null;
    return { type: "email" as const, value: trimmed.toLowerCase() };
  }, [identifier]);

  const requestCode = async () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      throw new Error("Enter your email or phone number.");
    }

    if (!target) {
      throw new Error("Enter a valid email or Kenyan phone number.");
    }

    if (target.type === "phone") {
      await apiRequest(API_ENDPOINTS.auth.smsOtpRequest, {
        method: "POST",
        body: JSON.stringify({ phone: target.value }),
      });
    } else {
      await apiRequest(API_ENDPOINTS.auth.emailOtpRequest, {
        method: "POST",
        body: JSON.stringify({ email: target.value }),
      });
    }

    setIdentifier(target.value);
    setStep("reset");
    setInfo(
      target.type === "phone"
        ? "Reset code sent by SMS. Enter it below to set a new password."
        : "Reset code sent to your email. Enter it below to set a new password."
    );
    setResendTimer(60);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      await requestCode();
    } catch (err: any) {
      setError(err?.message || "Could not send a reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      if (!target) {
        throw new Error("Enter a valid email or Kenyan phone number.");
      }

      if (!code.trim()) {
        throw new Error("Enter the verification code.");
      }

      if (!isStrongPassword(newPassword)) {
        throw new Error(PASSWORD_HINT);
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      await apiRequest(API_ENDPOINTS.auth.passwordReset, {
        method: "POST",
        body: JSON.stringify(
          target.type === "phone"
            ? { phone: target.value, code: code.trim(), newPassword }
            : { email: target.value, code: code.trim(), newPassword }
        ),
      });

      setStep("done");
      setInfo("Password updated successfully. Sign in with your new password.");
    } catch (err: any) {
      setError(err?.message || "Could not reset your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    setInfo("");

    try {
      await requestCode();
    } catch (err: any) {
      setError(err?.message || "Could not resend the code.");
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
          {step === "done" ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-stone-900">Password updated</h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Your password has been reset for{" "}
                <span className="font-medium text-stone-700">{identifier}</span>.
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
              <h1 className="text-2xl font-bold text-stone-900">
                {step === "request" ? "Reset password" : "Set a new password"}
              </h1>
              <p className="mt-1.5 text-sm text-stone-500">
                {step === "request"
                  ? "Enter your email or phone and we'll send a verification code."
                  : `Enter the code sent to ${identifier} and choose your new password.`}
              </p>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {info && (
                <div className="mt-4 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-700">
                  {info}
                </div>
              )}

              {step === "request" ? (
                <form onSubmit={handleRequest} className="mt-6 space-y-4">
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
                    {loading ? "Sending..." : "Send reset code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReset} className="mt-6 space-y-4">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="field-input text-center tracking-[0.3em]"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="field-input"
                    placeholder="New password"
                    required
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="field-input"
                    placeholder="Confirm new password"
                    required
                  />
                  <p className="text-xs text-stone-500">{PASSWORD_HINT}</p>
                  <button type="submit" disabled={loading} className="primary-button w-full">
                    {loading ? "Updating..." : "Reset password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleResend()}
                    disabled={loading || resendTimer > 0}
                    className="secondary-button w-full"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                  </button>
                </form>
              )}

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
