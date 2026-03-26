import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Agrisoko",
  description: "How Agrisoko collects, uses, and protects your personal data under the Kenya Data Protection Act 2019.",
  robots: { index: true },
};

const EFFECTIVE_DATE = "1 March 2025";
const COMPANY = "LeadAfrik Agricultural Solutions";
const EMAIL = "info@leadafrik.com";
const ODPC_URL = "https://www.odpc.go.ke";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-stone-900 mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-stone-600">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="page-shell py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terra-600">Legal</p>
        <h1 className="mt-3 text-4xl font-bold text-stone-900">Privacy Policy</h1>
        <p className="mt-3 text-sm text-stone-500">
          Effective date: {EFFECTIVE_DATE} · Operated by {COMPANY}
        </p>

        <nav className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Contents</p>
          <ol className="space-y-1.5 text-sm font-medium text-terra-700">
            {[
              ["#who-we-are", "1. Who we are"],
              ["#what-we-collect", "2. What personal data we collect"],
              ["#how-we-use", "3. How we use your data"],
              ["#legal-basis", "4. Legal basis for processing (Kenya DPA 2019)"],
              ["#sharing", "5. When we share your data"],
              ["#retention", "6. How long we keep your data"],
              ["#security", "7. Security"],
              ["#your-rights", "8. Your rights"],
              ["#cookies", "9. Cookies & analytics"],
              ["#minors", "10. Minors"],
              ["#changes", "11. Changes to this policy"],
              ["#contact", "12. Contact & complaints"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:text-terra-800 transition-colors">{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          <Section id="who-we-are" title="1. Who we are">
            <p>
              Agrisoko is an agricultural marketplace platform operated by{" "}
              <strong>{COMPANY}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), a company incorporated in Kenya. We are the data controller for personal data collected through the Agrisoko website and mobile application.
            </p>
            <p>
              We are registered with the{" "}
              <a href={ODPC_URL} className="font-medium text-terra-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Office of the Data Protection Commissioner (ODPC)
              </a>{" "}
              in accordance with the Kenya Data Protection Act, 2019.
            </p>
          </Section>

          <Section id="what-we-collect" title="2. What personal data we collect">
            <p>We collect personal data in several ways:</p>
            <div className="space-y-4">
              {[
                {
                  title: "Account registration",
                  items: [
                    "Full name",
                    "Email address and/or Kenyan phone number",
                    "Password (stored as a one-way cryptographic hash — never in plain text)",
                    "County and approximate location",
                    "Profile photo (optional)",
                    "Role (buyer, seller, service provider)",
                  ],
                },
                {
                  title: "Identity verification (optional)",
                  items: [
                    "Government-issued ID (national ID, passport)",
                    "Selfie photo submitted alongside the ID",
                    "Verification status (verified / unverified)",
                  ],
                  note: "ID documents are stored securely and reviewed only by authorised Agrisoko staff. They are never shared with other users.",
                },
                {
                  title: "Marketplace activity",
                  items: [
                    "Listings you create (title, description, price, photos, location)",
                    "Orders and transactions you participate in",
                    "Messages exchanged with other users through our platform",
                    "Buyer requests and saved listings",
                    "Boost payment records (M-Pesa payer phone and amount)",
                  ],
                },
                {
                  title: "Technical data",
                  items: [
                    "IP address and device information",
                    "Browser type and operating system",
                    "Pages viewed and actions taken on the platform",
                    "Session tokens (stored in encrypted cookies)",
                  ],
                },
              ].map(({ title, items, note }) => (
                <div key={title} className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="font-semibold text-stone-800 mb-2">{title}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                  {note && <p className="mt-2 text-xs text-stone-500">{note}</p>}
                </div>
              ))}
            </div>
          </Section>

          <Section id="how-we-use" title="3. How we use your data">
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Create and maintain your account</li>
              <li>Enable you to post listings and connect with buyers or sellers</li>
              <li>Verify your identity and display trust signals to other users</li>
              <li>Process orders and facilitate transactions</li>
              <li>Send transactional notifications (OTP codes, order updates, listing status)</li>
              <li>Send platform announcements and marketing emails (you may opt out at any time)</li>
              <li>Detect fraud, enforce our policies, and moderate listings</li>
              <li>Improve platform performance, features, and user experience</li>
              <li>Comply with our legal obligations under Kenyan law</li>
            </ul>
            <p>We do <strong>not</strong> sell, rent, or trade your personal data to third parties for their own marketing purposes.</p>
          </Section>

          <Section id="legal-basis" title="4. Legal basis for processing (Kenya DPA 2019)">
            <p>Under the Kenya Data Protection Act, 2019, we rely on the following bases:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Consent</strong> — where you have given clear consent (e.g., marketing emails, optional ID verification)</li>
              <li><strong>Contract performance</strong> — where processing is necessary to deliver services you have requested</li>
              <li><strong>Legal obligation</strong> — where processing is required to comply with Kenyan law</li>
              <li><strong>Legitimate interests</strong> — where we have a legitimate interest not overridden by your rights (e.g., fraud prevention, platform security)</li>
            </ul>
          </Section>

          <Section id="sharing" title="5. When we share your data">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>With other users</strong> — your name, listing details, and county are visible when you post a listing. Your phone number is visible only if you choose to display it.</li>
              <li><strong>With service providers</strong> — trusted third-party processors (cloud hosting, image storage, SMS delivery) are contractually bound to handle your data only for the purposes we specify.</li>
              <li><strong>With payment processors</strong> — M-Pesa payment metadata is processed by Safaricom. We do not store full transaction secrets or PINs.</li>
              <li><strong>For legal compliance</strong> — we may disclose data where required by Kenyan law, a court order, or a lawful request from a regulatory authority including the ODPC.</li>
              <li><strong>Business transfers</strong> — in the event of a merger or acquisition, your data may be transferred to the acquiring entity under equivalent data protection standards.</li>
            </ul>
            <p>We never share your ID documents or selfie with other users or third parties except as required by law.</p>
          </Section>

          <Section id="retention" title="6. How long we keep your data">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account data</strong> — retained for the duration of your account and up to 2 years after deletion</li>
              <li><strong>Transaction and order records</strong> — retained for 7 years in accordance with Kenyan commercial and tax law</li>
              <li><strong>ID documents</strong> — retained only during the verification review period, then deleted unless required for a legal claim</li>
              <li><strong>Messages</strong> — retained while your account is active; you may request deletion</li>
            </ul>
          </Section>

          <Section id="security" title="7. Security">
            <p>We implement reasonable technical and organisational measures to protect your data, including:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>HTTPS encryption for all data in transit</li>
              <li>Encrypted password storage (bcrypt)</li>
              <li>Role-based access controls for staff</li>
              <li>Regular security reviews</li>
            </ul>
            <p>No method of transmission over the internet is 100% secure. If you believe your account has been compromised, contact us at <a href={`mailto:${EMAIL}`} className="font-medium text-terra-600 hover:underline">{EMAIL}</a>.</p>
          </Section>

          <Section id="your-rights" title="8. Your rights">
            <p>Under the Kenya Data Protection Act, 2019, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Correction</strong> — request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion (erasure)</strong> — request deletion of your personal data where there is no overriding legitimate reason to retain it</li>
              <li><strong>Object</strong> — object to processing in certain circumstances</li>
              <li><strong>Restriction</strong> — request that we restrict processing in certain circumstances</li>
              <li><strong>Data portability</strong> — request transfer of your data in a structured, machine-readable format</li>
              <li><strong>Withdraw consent</strong> — withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p>Contact us at <a href={`mailto:${EMAIL}`} className="font-medium text-terra-600 hover:underline">{EMAIL}</a>. We will respond within 21 days as required by the Act.</p>
          </Section>

          <Section id="cookies" title="9. Cookies & analytics">
            <p>We use session cookies to keep you logged in and secure your sessions. We may use analytics tools to understand platform usage and improve user experience.</p>
            <p>We do not use advertising cookies or sell cookie data to advertisers. You can control cookie settings in your browser; disabling essential cookies may affect platform functionality.</p>
          </Section>

          <Section id="minors" title="10. Minors">
            <p>Agrisoko is not intended for use by persons under 18 years of age. We do not knowingly collect personal data from minors. If you believe a minor has created an account, please contact us and we will promptly delete the account and associated data.</p>
          </Section>

          <Section id="changes" title="11. Changes to this policy">
            <p>We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify registered users of material changes by email or through a platform notification. The effective date at the top of this page reflects the most recent revision.</p>
          </Section>

          <Section id="contact" title="12. Contact & complaints">
            <p>For privacy-related questions, requests, or concerns:</p>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-1">
              <p className="font-semibold text-stone-800">LeadAfrik Agricultural Solutions (Agrisoko)</p>
              <p>Email: <a href={`mailto:${EMAIL}`} className="font-medium text-terra-600 hover:underline">{EMAIL}</a></p>
            </div>
            <p>
              If you are not satisfied with our response, you may lodge a complaint with the{" "}
              <a href={ODPC_URL} className="font-medium text-terra-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Office of the Data Protection Commissioner (ODPC)
              </a>
              , the Kenyan supervisory authority for data protection.
            </p>
          </Section>
        </div>

        <div className="mt-12 border-t border-stone-200 pt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/legal/terms" className="font-semibold text-terra-600 hover:text-terra-700">
            Terms of Service →
          </Link>
          <Link href="/about" className="text-stone-500 hover:text-stone-700">About Agrisoko</Link>
        </div>
      </div>
    </div>
  );
}
