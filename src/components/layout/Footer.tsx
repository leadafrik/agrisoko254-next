import Link from "next/link";
import { BULK_USE_CASES, MARKETPLACE_CATEGORIES, SUPPORTED_DELIVERY_COUNTIES } from "@/lib/marketplace";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-[#f4ede3]">
      <div className="page-shell py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <p className="section-kicker">Agrisoko</p>
            <h3 className="mt-4 text-3xl font-bold text-stone-900">
              Professional agricultural trade, built for Kenya.
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-600">
              Agrisoko connects farmers, traders, buyers, service providers, and institutional
              procurement teams through one practical marketplace.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SUPPORTED_DELIVERY_COUNTIES.map((county) => (
                <span
                  key={county}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600"
                >
                  {county}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Marketplace
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-stone-700">
              <li>
                <Link href="/browse" className="hover:text-terra-600">
                  Browse all listings
                </Link>
              </li>
              {MARKETPLACE_CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link href={`/browse/${category.slug}`} className="hover:text-terra-600">
                    {category.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/request" className="hover:text-terra-600">
                  Buyer requests
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Company
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-stone-700">
              <li>
                <Link href="/about" className="hover:text-terra-600">
                  About Agrisoko
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-terra-600">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-terra-600">
                  Learn hub
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-terra-600">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-terra-600">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Bulk / B2B
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-stone-700">
              {BULK_USE_CASES.map((useCase) => (
                <li key={useCase}>{useCase}</li>
              ))}
            </ul>
            <Link href="/b2b" className="mt-4 inline-flex text-sm font-semibold text-terra-600 hover:text-terra-700">
              Explore bulk workflows
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-stone-200 pt-6 text-sm text-stone-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Agrisoko. All rights reserved.</p>
          <p>Operated for Kenyan agriculture with direct-market and trust-first workflows.</p>
        </div>
      </div>
    </footer>
  );
}
