import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Agrisoko",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold font-display text-stone-900 mb-8">Terms of Service</h1>
      <div className="prose prose-stone max-w-none">
        <p>By using Agrisoko, you agree to these terms. Please read them carefully.</p>
        <h2>Use of the Platform</h2>
        <p>Agrisoko provides a marketplace for agricultural transactions in Kenya. You must be at least 18 years old to create an account and list products or services.</p>
        <h2>Listings</h2>
        <p>All listings must be accurate and lawful. Agrisoko reserves the right to remove any listing that violates our policies.</p>
        <h2>Transactions</h2>
        <p>Agrisoko facilitates connections between buyers and sellers. All transactions are between the parties involved. Agrisoko is not responsible for disputes between buyers and sellers.</p>
        <h2>Account Suspension</h2>
        <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
        <h2>Contact</h2>
        <p>For questions about these terms, contact us through the About page.</p>
      </div>
    </div>
  );
}
