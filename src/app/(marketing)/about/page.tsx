import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Agrisoko — Kenya's Agricultural Marketplace",
  description: "Agrisoko connects Kenyan farmers with buyers, inputs suppliers, and service providers. Learn about our mission.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold font-display text-stone-900 mb-4">About Agrisoko</h1>
      <p className="text-lg text-stone-600 mb-8 leading-relaxed">
        Agrisoko is Kenya&apos;s agricultural marketplace — connecting farmers, buyers, input suppliers, and service providers in one place.
      </p>

      <div className="space-y-6 text-stone-600 leading-relaxed">
        <p>
          We built Agrisoko because too many Kenyan farmers sell at the farm gate for far less than their produce is worth — not because of low quality, but because they lack access to the right buyers. At the same time, buyers struggle to find reliable, verified suppliers.
        </p>
        <p>
          Agrisoko bridges that gap. Whether you&apos;re selling a bag of maize or 10 tonnes of produce, looking for a tractor for hire or sourcing certified seeds — Agrisoko is where Kenya&apos;s agricultural economy connects.
        </p>
        <p>
          We verify sellers, provide a knowledge hub for farmers, and make it easy for buyers to find exactly what they need — from any county in Kenya.
        </p>
      </div>

      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        {[
          { label: "Verified Sellers", desc: "Every seller goes through identity and document verification" },
          { label: "All Categories", desc: "Produce, livestock, inputs, services and buyer requests" },
          { label: "Built for Kenya", desc: "M-Pesa payments, Swahili support, designed for low-bandwidth" },
        ].map((item) => (
          <div key={item.label} className="bg-earth rounded-xl p-5">
            <h3 className="font-bold text-stone-800 mb-2">{item.label}</h3>
            <p className="text-sm text-stone-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/browse" className="bg-terra-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-terra-600 transition-colors">
          Browse Listings
        </Link>
        <Link href="/login?mode=signup" className="border border-stone-200 text-stone-700 px-6 py-3 rounded-xl font-semibold hover:bg-stone-50 transition-colors">
          Create Account
        </Link>
      </div>
    </div>
  );
}
