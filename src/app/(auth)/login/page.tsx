"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import FacebookLoginButton from "@/components/auth/FacebookLoginButton";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import PasswordField from "@/components/auth/PasswordField";
import { useAuth, type LegalConsents } from "@/contexts/AuthContext";
import { isLikelyPhoneNumber, normalizeKenyanPhone } from "@/lib/phone";

type Mode = "login" | "signup" | "otp";

const defaultConsents: LegalConsents = {
  termsAccepted: false,
  privacyAccepted: false,
  marketingConsent: false,
  dataProcessingConsent: false,
};

function LoginForm() {
  const { isAuthenticated, login, register, requestEmailOtp, requestSmsOtp, verifyEmailOtp, verifySmsOtp } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const requestedMode = params.get("mode") === "signup" ? "signup" : "login";
  const redirect = params.get("redirect") || params.get("next") || "/browse";

  const [mode, setMode] = useState<Mode>(requestedMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [consents, setConsents] = useState<LegalConsents>(defaultConsents);
  const [otpTarget, setOtpTarget] = useState("");
  const [otpIsPhone, setOtpIsPhone] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const requiredConsentsAccepted = consents.termsAccepted && consents.privacyAccepted && consents.dataProcessingConsent;

  useEffect(() => { setMode(requestedMode); }, [requestedMode]);
  useEffect(() => { if (isAuthenticated) router.replace(redirect); }, [isAuthenticated, redirect, router]);
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = window.setInterval(() => setOtpTimer((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [otpTimer]);

  const beginOtp = async (target: string, isPhone: boolean, message: string) => {
    setOtpTarget(target); setOtpIsPhone(isPhone); setOtpCode("");
    setInfo(message); setError(""); setMode("otp"); setOtpTimer(60);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(""); setInfo("");
    try {
      await login(identifier, password);
      router.replace(redirect);
    } catch (err: any) {
      if (err?.requiresVerification) {
        await beginOtp(err.verificationTarget || identifier.trim(), err.verificationMethod === "sms", err.message || "Verify your account to continue.");
      } else {
        setError(err?.message || "Unable to sign in.");
      }
    } finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(""); setInfo("");
    try {
      if (!signupName.trim()) throw new Error("Enter your full name.");
      if (!requiredConsentsAccepted) throw new Error("Accept the terms to continue.");
      const trimmed = identifier.trim();
      const isPhone = isLikelyPhoneNumber(trimmed);
      const phone = isPhone ? normalizeKenyanPhone(trimmed) : null;
      if (isPhone && !phone) throw new Error("Enter a valid Kenyan phone number.");
      if (!isPhone && !trimmed.includes("@")) throw new Error("Enter a valid email or phone number.");
      const res = await register({
        fullName: signupName.trim(),
        email: !isPhone ? trimmed.toLowerCase() : undefined,
        phone: phone || undefined,
        password,
        userType: "buyer",
        legalConsents: consents,
      });
      await beginOtp(phone || trimmed.toLowerCase(), Boolean(phone), res?.message || "Account created. Enter the code we sent.");
    } catch (err: any) {
      const msg: string = err?.message || "Unable to create account.";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
        setError("__duplicate_email__");
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (otpIsPhone) await verifySmsOtp(otpTarget, otpCode.trim());
      else await verifyEmailOtp(otpTarget, otpCode.trim());
      router.replace(redirect);
    } catch (err: any) {
      setError(err?.message || "Invalid code.");
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setLoading(true); setError(""); setInfo("");
    try {
      if (otpIsPhone) { await requestSmsOtp(otpTarget); setInfo("New code sent by SMS."); }
      else { await requestEmailOtp(otpTarget); setInfo("New code sent to your email."); }
      setOtpTimer(60);
    } catch (err: any) {
      setError(err?.message || "Could not resend code.");
    } finally { setLoading(false); }
  };

  const switchMode = (next: "login" | "signup") => { setMode(next); setError(""); setInfo(""); };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="mb-8 block text-center text-xl font-bold text-stone-900">
          Agrisoko
        </Link>

        <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-[0_20px_60px_-30px_rgba(28,25,23,0.15)]">
          {/* Title */}
          <h1 className="text-2xl font-bold text-stone-900">
            {mode === "signup" ? "Create account" : mode === "otp" ? "Enter code" : "Sign in"}
          </h1>
          {mode === "otp" && (
            <p className="mt-1.5 text-sm text-stone-500">Sent to {otpTarget}</p>
          )}

          {/* Alerts */}
          {error === "__duplicate_email__" ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">You already have an account with this email.</p>
              <p className="mt-1">
                If you signed up with Google, use the Google button above.{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold underline underline-offset-2 hover:text-amber-900"
                >
                  Sign in instead
                </button>
              </p>
            </div>
          ) : error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {info && (
            <div className="mt-4 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-700">
              {info}
            </div>
          )}

          {/* OTP step */}
          {mode === "otp" ? (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-3">
              <input
                type="text"
                inputMode="numeric"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="field-input text-center text-2xl tracking-[0.4em]"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
              <button type="submit" disabled={loading} className="primary-button w-full">
                {loading ? "Verifying…" : "Verify"}
              </button>
              <button
                type="button"
                onClick={() => void resendOtp()}
                disabled={loading || otpTimer > 0}
                className="secondary-button w-full"
              >
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend code"}
              </button>
              <button type="button" onClick={() => switchMode("login")} className="ghost-button w-full">
                Back
              </button>
            </form>
          ) : (
            <>
              {/* Social login */}
              <div className="mt-6 space-y-2.5">
                <GoogleLoginButton
                  legalConsents={mode === "signup" ? consents : undefined}
                  blockedReason={mode === "signup" && !requiredConsentsAccepted ? "Accept the terms before using Google." : undefined}
                  onBlocked={(msg) => setError(msg)}
                  onSuccess={() => router.replace(redirect)}
                  onError={(msg) => setError(msg)}
                />
                <FacebookLoginButton
                  legalConsents={mode === "signup" ? consents : undefined}
                  blockedReason={mode === "signup" && !requiredConsentsAccepted ? "Accept the terms before using Facebook." : undefined}
                  onBlocked={(msg) => setError(msg)}
                  onSuccess={() => router.replace(redirect)}
                  onError={(msg) => setError(msg)}
                />
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-stone-400">or</span>
                </div>
              </div>

              {/* Email/phone form */}
              <form onSubmit={mode === "signup" ? handleSignup : handleLogin} className="space-y-4">
                {mode === "signup" && (
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="field-input"
                    placeholder="Full name"
                    required
                  />
                )}
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="field-input"
                  placeholder="Email or phone"
                  required
                />
                <PasswordField
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                  placeholder="Password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                />

                {mode === "signup" && (
                  <label className="flex items-start gap-2.5 text-sm text-stone-600">
                    <input
                      type="checkbox"
                      checked={requiredConsentsAccepted}
                      onChange={(e) =>
                        setConsents((c) => ({
                          ...c,
                          termsAccepted: e.target.checked,
                          privacyAccepted: e.target.checked,
                          dataProcessingConsent: e.target.checked,
                        }))
                      }
                      className="mt-0.5 shrink-0"
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="/terms" className="text-terra-600 underline underline-offset-2">Terms</Link>
                      {" & "}
                      <Link href="/privacy" className="text-terra-600 underline underline-offset-2">Privacy Policy</Link>
                    </span>
                  </label>
                )}

                {mode === "login" && (
                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-xs text-stone-400 hover:text-terra-600">
                      Forgot password?
                    </Link>
                  </div>
                )}

                <button type="submit" disabled={loading} className="primary-button w-full">
                  {loading
                    ? mode === "signup" ? "Creating…" : "Signing in…"
                    : mode === "signup" ? "Create account" : "Sign in"}
                </button>
              </form>
            </>
          )}

          {/* Toggle */}
          {mode !== "otp" && (
            <p className="mt-5 text-center text-sm text-stone-500">
              {mode === "signup" ? (
                <>Already have an account?{" "}
                  <button onClick={() => switchMode("login")} className="font-semibold text-terra-600 hover:text-terra-700">Sign in</button>
                </>
              ) : (
                <>New here?{" "}
                  <button onClick={() => switchMode("signup")} className="font-semibold text-terra-600 hover:text-terra-700">Create account</button>
                </>
              )}
            </p>
          )}
        </div>

        {/* Browse without signing in */}
        <p className="mt-5 text-center text-sm text-stone-400">
          <Link href="/browse" className="hover:text-terra-600">Browse listings without signing in →</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-stone-400">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
