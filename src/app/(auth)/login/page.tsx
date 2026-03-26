"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import FacebookLoginButton from "@/components/auth/FacebookLoginButton";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
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
  const {
    isAuthenticated,
    login,
    register,
    requestEmailOtp,
    requestSmsOtp,
    verifyEmailOtp,
    verifySmsOtp,
  } = useAuth();
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

  useEffect(() => {
    setMode(requestedMode);
  }, [requestedMode]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const timer = window.setInterval(() => setOtpTimer((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [otpTimer]);

  const requiredConsentsAccepted =
    consents.termsAccepted && consents.privacyAccepted && consents.dataProcessingConsent;

  const heroTitle = useMemo(
    () =>
      mode === "signup"
        ? "Create your Agrisoko account"
        : mode === "otp"
          ? `Verify your ${otpIsPhone ? "phone" : "email"}`
          : "Sign in to continue",
    [mode, otpIsPhone]
  );

  const heroDescription =
    mode === "signup"
      ? "Open your account, accept the marketplace terms once, and start listing or browsing immediately."
      : mode === "otp"
        ? "Enter the verification code we sent so the account can continue."
        : "Sign in with email, phone, Google, or Facebook.";

  const beginOtpFlow = async (target: string, isPhone: boolean, message: string) => {
    setOtpTarget(target);
    setOtpIsPhone(isPhone);
    setOtpCode("");
    setInfo(message);
    setError("");
    setMode("otp");
    setOtpTimer(60);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      await login(identifier, password);
      router.replace(redirect);
    } catch (loginError: any) {
      if (loginError?.requiresVerification) {
        await beginOtpFlow(
          loginError.verificationTarget || identifier.trim(),
          loginError.verificationMethod === "sms",
          loginError.message || "Verification required before you can continue."
        );
      } else {
        setError(loginError?.message || "Unable to sign in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      if (!signupName.trim()) {
        throw new Error("Enter your full name.");
      }

      if (!requiredConsentsAccepted) {
        throw new Error("Accept the Terms of Service, Privacy Policy, and data processing consent to continue.");
      }

      const trimmedIdentifier = identifier.trim();
      const isPhone = isLikelyPhoneNumber(trimmedIdentifier);
      const normalizedPhone = isPhone ? normalizeKenyanPhone(trimmedIdentifier) : null;

      if (isPhone && !normalizedPhone) {
        throw new Error("Enter a valid Kenyan phone number such as 0712345678 or +254712345678.");
      }

      if (!isPhone && !trimmedIdentifier.includes("@")) {
        throw new Error("Enter a valid email address or Kenyan phone number.");
      }

      const response = await register({
        fullName: signupName.trim(),
        email: !isPhone ? trimmedIdentifier.toLowerCase() : undefined,
        phone: normalizedPhone || undefined,
        password,
        userType: "buyer",
        legalConsents: consents,
      });

      await beginOtpFlow(
        normalizedPhone || trimmedIdentifier.toLowerCase(),
        Boolean(normalizedPhone),
        response?.message || "Account created. Enter the code we sent to continue."
      );
    } catch (signupError: any) {
      setError(signupError?.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (otpIsPhone) {
        await verifySmsOtp(otpTarget, otpCode.trim());
      } else {
        await verifyEmailOtp(otpTarget, otpCode.trim());
      }
      router.replace(redirect);
    } catch (otpError: any) {
      setError(otpError?.message || "Unable to verify that code.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setError("");
    setInfo("");

    try {
      if (otpIsPhone) {
        await requestSmsOtp(otpTarget);
        setInfo("A new verification code has been sent by SMS.");
      } else {
        await requestEmailOtp(otpTarget);
        setInfo("A new verification code has been sent to your email.");
      }
      setOtpTimer(60);
    } catch (resendError: any) {
      setError(resendError?.message || "Unable to resend the verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth px-4 py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <aside className="hidden rounded-[30px] bg-gradient-to-br from-[#8b3525] via-[#a0452e] to-[#6c281c] p-8 text-white shadow-[0_26px_70px_-36px_rgba(120,83,47,0.6)] lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Agrisoko</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Direct agricultural trade, grounded in real Kenyan workflows.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
              Sign in to message sellers, post verified supply, respond to buyer demand, and move
              into checkout or bulk workflows when the deal is ready.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {["Public browsing first", "Google and Facebook login", "OTP verification", "Buyer and seller workflows"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-[30px] border border-stone-200 bg-white p-6 shadow-[0_22px_60px_-40px_rgba(28,25,23,0.2)] sm:p-8">
          <div className="mb-8">
            <Link href="/" className="text-xl font-bold text-stone-900">
              Agrisoko
            </Link>
            <h2 className="mt-4 text-3xl font-bold text-stone-900">{heroTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{heroDescription}</p>
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {info ? (
            <div className="mb-5 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-medium text-forest-700">
              {info}
            </div>
          ) : null}

          {mode === "otp" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="field-label">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                  className="field-input text-center text-2xl tracking-[0.4em]"
                  placeholder="000000"
                  maxLength={6}
                />
                <p className="mt-2 text-xs text-stone-500">
                  Code sent to {otpTarget}
                </p>
              </div>

              <button type="submit" disabled={loading} className="primary-button w-full">
                {loading ? "Verifying..." : "Verify and continue"}
              </button>

              <button
                type="button"
                onClick={() => void resendOtp()}
                disabled={loading || otpTimer > 0}
                className="secondary-button w-full"
              >
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setOtpCode("");
                  setInfo("");
                  setError("");
                }}
                className="ghost-button w-full"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <>
              <div className="space-y-3">
                <GoogleLoginButton
                  legalConsents={mode === "signup" ? consents : undefined}
                  blockedReason={
                    mode === "signup" && !requiredConsentsAccepted
                      ? "Accept the signup terms before continuing with Google."
                      : undefined
                  }
                  onBlocked={(message) => setError(message)}
                  onSuccess={() => router.replace(redirect)}
                  onError={(message) => setError(message)}
                />
                <FacebookLoginButton
                  legalConsents={mode === "signup" ? consents : undefined}
                  blockedReason={
                    mode === "signup" && !requiredConsentsAccepted
                      ? "Accept the signup terms before continuing with Facebook."
                      : undefined
                  }
                  onBlocked={(message) => setError(message)}
                  onSuccess={() => router.replace(redirect)}
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

              <form onSubmit={mode === "signup" ? handleSignup : handleLogin} className="space-y-5">
                {mode === "signup" ? (
                  <div>
                    <label className="field-label">Full name</label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(event) => setSignupName(event.target.value)}
                      className="field-input"
                      placeholder="Your full name"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="field-label">Email or phone</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    className="field-input"
                    placeholder="email@example.com or 0712345678"
                  />
                </div>

                <div>
                  <label className="field-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="field-input"
                    placeholder="Use a strong password"
                  />
                </div>

                {mode === "signup" ? (
                  <div className="space-y-3 rounded-[24px] border border-stone-200 bg-stone-50 p-4">
                    <label className="flex items-start gap-3 text-sm text-stone-700">
                      <input
                        type="checkbox"
                        checked={requiredConsentsAccepted}
                        onChange={(event) =>
                          setConsents((current) => ({
                            ...current,
                            termsAccepted: event.target.checked,
                            privacyAccepted: event.target.checked,
                            dataProcessingConsent: event.target.checked,
                          }))
                        }
                        className="mt-1"
                      />
                      <span>
                        I accept the Terms of Service, Privacy Policy, and Agrisoko data processing
                        consent for account creation and marketplace operation.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 text-sm text-stone-600">
                      <input
                        type="checkbox"
                        checked={consents.marketingConsent}
                        onChange={(event) =>
                          setConsents((current) => ({
                            ...current,
                            marketingConsent: event.target.checked,
                          }))
                        }
                        className="mt-1"
                      />
                      <span>Send me product updates and marketplace announcements.</span>
                    </label>
                  </div>
                ) : null}

                <button type="submit" disabled={loading} className="primary-button w-full">
                  {loading
                    ? mode === "signup"
                      ? "Creating account..."
                      : "Signing in..."
                    : mode === "signup"
                      ? "Create account"
                      : "Sign in"}
                </button>
              </form>
            </>
          )}

          {mode !== "otp" ? (
            <p className="mt-6 text-center text-sm text-stone-500">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setInfo("");
                    }}
                    className="font-semibold text-terra-600 hover:text-terra-700"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to Agrisoko?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError("");
                      setInfo("");
                    }}
                    className="font-semibold text-terra-600 hover:text-terra-700"
                  >
                    Create account
                  </button>
                </>
              )}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-500">
            <span className="rounded-full bg-stone-100 px-3 py-1">Public browsing available</span>
            <Link href="/browse" className="text-terra-600 hover:text-terra-700">
              Browse listings first
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-stone-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
