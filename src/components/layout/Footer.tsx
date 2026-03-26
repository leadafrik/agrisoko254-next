import Link from "next/link";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { BULK_USE_CASES, MARKETPLACE_CATEGORIES, SUPPORTED_DELIVERY_COUNTIES } from "@/lib/marketplace";

const LEGAL_ENTITY_NAME = "LeadAfrik Agricultural Solutions";
const SUPPORT_EMAIL = "info@leadafrik.com";
const WHATSAPP_URL = "https://chat.whatsapp.com/HzCaV5YVz86CjwajiOHR5i";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.agrisoko.app";
const INSTAGRAM_URL = "https://www.instagram.com/lead_afrik/";
const FACEBOOK_URL = "https://www.facebook.com/LeadAfrik";
const ODPC_URL = "https://www.odpc.go.ke";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-[#f4ede3]">
      <div className="page-shell py-12">
        <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.95fr]">
          <div>
            <p className="section-kicker">Agrisoko</p>
            <h3 className="mt-4 text-3xl font-bold text-stone-900">
              Professional agricultural trade, built for Kenya.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Agrisoko connects farmers, traders, buyers, service providers, and institutional
              procurement teams through one practical marketplace.
            </p>
            <p className="mt-3 text-sm font-medium text-stone-700">
              Operated by {LEGAL_ENTITY_NAME}
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
                  Buy requests
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
                <Link href="/learn" className="hover:text-terra-600">
                  Learn hub
                </Link>
              </li>
              <li>
                <Link href="/learn/insights" className="hover:text-terra-600">
                  Market insights
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-terra-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-terra-600">
                  Privacy Policy
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
            <Link
              href="/b2b"
              className="mt-4 inline-flex text-sm font-semibold text-terra-600 hover:text-terra-700"
            >
              Explore bulk workflows
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-stone-200 pt-6">
          <div className="flex flex-col gap-3 border-b border-stone-200 pb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-terra-300 hover:text-terra-600"
              >
                <Mail className="h-4 w-4 text-terra-600" />
                Contact Support
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-terra-300 hover:text-terra-600"
              >
                <MessageCircle className="h-4 w-4 text-terra-600" />
                WhatsApp
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-terra-300 hover:text-terra-600"
              >
                Download App
              </a>
            </div>

            <a
              href={ODPC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-terra-600"
            >
              <ShieldCheck className="h-4 w-4 text-terra-600" />
              ODPC
            </a>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="pt-6 text-sm text-stone-500">
              <p>&copy; {new Date().getFullYear()} Agrisoko. All rights reserved.</p>
              <p className="mt-1">Using Agrisoko means you agree to our Terms and Privacy Policy.</p>
            </div>

            <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
              <p className="text-sm text-stone-500">
                Data protection inquiries:{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-terra-600 hover:text-terra-700">
                  {SUPPORT_EMAIL}
                </a>
              </p>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Follow LeadAfrik
                </span>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-terra-300 hover:text-terra-600"
                  aria-label="LeadAfrik on Instagram"
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]">IG</span>
                </a>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-terra-300 hover:text-terra-600"
                  aria-label="LeadAfrik on Facebook"
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]">FB</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
