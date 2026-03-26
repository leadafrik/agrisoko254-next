import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Agrisoko",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold font-display text-stone-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-stone max-w-none">
        <p>Agrisoko is committed to protecting your privacy. This policy explains what data we collect and how we use it.</p>
        <h2>Data We Collect</h2>
        <p>We collect your name, phone number, email address, and location when you register. We also collect listing data and transaction history.</p>
        <h2>How We Use Your Data</h2>
        <p>We use your data to operate the marketplace, verify your identity, send notifications, and improve our services. We do not sell your data to third parties.</p>
        <h2>Data Security</h2>
        <p>We use industry-standard security measures to protect your data. All passwords are encrypted.</p>
        <h2>Your Rights</h2>
        <p>You can request deletion of your account and data at any time from your profile settings.</p>
        <h2>Contact</h2>
        <p>For privacy concerns, contact us through the About page.</p>
      </div>
    </div>
  );
}
