"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-xs ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-stone-200 bg-white text-stone-500"}`}>
      {label}
    </div>
  );
}

function ConsentCheckbox({ checked, label, onChange }: { checked: boolean; label: React.ReactNode; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 text-sm text-stone-600 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 rounded border-stone-300" />
      <span>{label}</span>
    </label>
  );
}

export default function AdminInviteSetupPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requiredConsentsAccepted = termsAccepted && privacyAccepted && dataConsent;

  const setRequiredConsents = (checked: boolean) => {
    setTermsAccepted(checked);
    setPrivacyAccepted(checked);
    setDataConsent(checked);
  };

  const rules = useMemo(() => ({
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }), [password]);

  const passwordIsValid = Object.values(rules).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) { setError("This setup link is missing the invite token."); return; }
    if (!passwordIsValid) { setError("Use at least 8 characters with an uppercase letter, lowercase letter, and number."); return; }
    if (password !== confirmPassword) { setError("Password and confirm password do not match."); return; }
    if (!requiredConsentsAccepted) { setError("Accept the Terms, Privacy Policy, and Data Processing Consent to continue."); return; }
    try {
      setLoading(true);
      await apiRequest(API_ENDPOINTS.auth.adminInviteComplete, {
        method: "POST",
        body: JSON.stringify({
          token,
          password,
          legalConsents: { termsAccepted, privacyAccepted, dataProcessingConsent: dataConsent, marketingConsent },
        }),
      });
      router.replace("/browse");
    } catch (err: any) {
      setError(err?.message || "Account setup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6">
      <section className="grid gap-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-lg lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <div className="space-y-5">
          <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">Congratulations</div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">You are in.</h1>
            <p className="max-w-xl text-sm leading-7 text-stone-600">Set your password to activate your Agrisoko account. Once complete, you will go straight to the marketplace.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-terra-600">
              <CheckCircle2 className="h-4 w-4" />
              What happens next
            </div>
            <div className="space-y-3 text-sm text-stone-600">
              <p>1. Set your password and confirm your details.</p>
              <p>2. Agree to the marketplace terms and data handling terms.</p>
              <p>3. Start browsing listings and continue from there.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terra-50 text-terra-600">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Set your password</h2>
              <p className="text-sm text-stone-500">Secure your account and continue.</p>
            </div>
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Use 8+ characters" className="w-full rounded-2xl border border-stone-200 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-terra-400" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-stone-500">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Confirm password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Repeat your password" className="w-full rounded-2xl border border-stone-200 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-terra-400" />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-stone-500">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-terra-600 mb-2">Password rules</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <PasswordRule ok={rules.minLength} label="At least 8 characters" />
              <PasswordRule ok={rules.uppercase} label="One uppercase letter" />
              <PasswordRule ok={rules.lowercase} label="One lowercase letter" />
              <PasswordRule ok={rules.number} label="One number" />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
            <ConsentCheckbox
              checked={requiredConsentsAccepted}
              onChange={setRequiredConsents}
              label={<>I agree to the <Link className="text-terra-600 underline" href="/terms">Terms of Service</Link> and <Link className="text-terra-600 underline" href="/privacy">Privacy Policy</Link>, and I consent to Agrisoko processing my account data to operate the marketplace.</>}
            />
            <ConsentCheckbox
              checked={marketingConsent}
              onChange={setMarketingConsent}
              label="Send me product updates and marketplace messages."
            />
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-terra-500 px-5 py-3 text-sm font-semibold text-white hover:bg-terra-600 disabled:opacity-60">
            {loading ? "Finishing setup..." : "Set password and continue"}
          </button>
        </form>
      </section>
    </div>
  );
}
