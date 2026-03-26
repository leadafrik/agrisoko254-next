import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { BULK_USE_CASES, MARKETPLACE_CATEGORIES, SUPPORTED_DELIVERY_COUNTIES } from "@/lib/marketplace";

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Delivery active in</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUPPORTED_DELIVERY_COUNTIES.map((county) => (
                  <span
                    key={county}
                    className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600"
                  >
                    {county}
                  </span>
                ))}
              </div>
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
              <li>
                <Link href="/market-intelligence" className="hover:text-terra-600">
                  Market intelligence
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
                <Link href="/market-intelligence" className="hover:text-terra-600">
                  Price intelligence
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
                Email support
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#25D366]/40 bg-white px-4 py-2 text-sm font-semibold text-[#128C7E] transition hover:border-[#25D366] hover:bg-[#25D366]/5"
              >
                <IconWhatsApp className="h-4 w-4 text-[#25D366]" />
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-[#E1306C] transition hover:border-[#E1306C]/30 hover:bg-[#E1306C]/5"
                  aria-label="LeadAfrik on Instagram"
                >
                  <IconInstagram className="h-4 w-4" />
                </a>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-[#1877F2] transition hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5"
                  aria-label="LeadAfrik on Facebook"
                >
                  <IconFacebook className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
