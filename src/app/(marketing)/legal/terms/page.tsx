import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Agrisoko",
  description: "The terms and conditions governing use of the Agrisoko agricultural marketplace platform.",
  robots: { index: true },
};

const EFFECTIVE_DATE = "1 March 2025";
const COMPANY = "LeadAfrik Agricultural Solutions";
const EMAIL = "info@leadafrik.com";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-stone-900 mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-stone-600">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="page-shell py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terra-600">Legal</p>
        <h1 className="mt-3 text-4xl font-bold text-stone-900">Terms of Service</h1>
        <p className="mt-3 text-sm text-stone-500">
          Effective date: {EFFECTIVE_DATE} · Operated by {COMPANY}
        </p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Please read these Terms carefully.</strong> By creating an account or using the Agrisoko platform, you agree to be bound by these Terms. If you do not agree, do not use the platform.
        </div>

        <nav className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Contents</p>
          <ol className="space-y-1.5 text-sm font-medium text-terra-700">
            {[
              ["#definitions", "1. Definitions"],
              ["#eligibility", "2. Eligibility"],
              ["#accounts", "3. Accounts"],
              ["#listings", "4. Listings"],
              ["#transactions", "5. Transactions & orders"],
              ["#payments", "6. Payments & boost fees"],
              ["#verification", "7. Identity verification"],
              ["#prohibited", "8. Prohibited conduct"],
              ["#ip", "9. Intellectual property"],
              ["#liability", "10. Limitation of liability"],
              ["#indemnity", "11. Indemnity"],
              ["#termination", "12. Termination"],
              ["#disputes", "13. Disputes"],
              ["#governing-law", "14. Governing law"],
              ["#changes", "15. Changes to these Terms"],
              ["#contact", "16. Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:text-terra-800 transition-colors">{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          <Section id="definitions" title="1. Definitions">
            <p>In these Terms:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>&ldquo;Agrisoko&rdquo;</strong> or <strong>&ldquo;Platform&rdquo;</strong> means the Agrisoko website and mobile application operated by {COMPANY}.</li>
              <li><strong>&ldquo;We&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;</strong> means {COMPANY}.</li>
              <li><strong>&ldquo;You&rdquo;, &ldquo;user&rdquo;</strong> means any individual or entity that accesses or uses the Platform.</li>
              <li><strong>&ldquo;Seller&rdquo;</strong> means a user who lists produce, livestock, farm inputs, land, or services for sale or hire.</li>
              <li><strong>&ldquo;Buyer&rdquo;</strong> means a user who places orders or makes purchases through the Platform.</li>
              <li><strong>&ldquo;Listing&rdquo;</strong> means any offer of goods or services posted by a seller on the Platform.</li>
              <li><strong>&ldquo;Transaction&rdquo;</strong> means any agreement between a buyer and seller facilitated through the Platform.</li>
            </ul>
          </Section>

          <Section id="eligibility" title="2. Eligibility">
            <p>To use Agrisoko, you must:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into a binding contract under Kenyan law</li>
              <li>Provide accurate and truthful registration information</li>
              <li>Not have been previously suspended or banned from the Platform</li>
            </ul>
            <p>By using the Platform, you represent and warrant that you meet all eligibility requirements.</p>
          </Section>

          <Section id="accounts" title="3. Accounts">
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide accurate, current, and complete information when registering</li>
              <li>Update your information to keep it accurate and current</li>
              <li>Notify us immediately of any unauthorised use of your account</li>
              <li>Not share your account with or transfer your account to any other person</li>
              <li>Not create more than one account without our written permission</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms or whose information is found to be false or misleading.</p>
          </Section>

          <Section id="listings" title="4. Listings">
            <p>Sellers are solely responsible for the accuracy, legality, and quality of their listings. By posting a listing, you represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>All information is accurate, truthful, and not misleading</li>
              <li>You own or have the legal right to sell the goods or services listed</li>
              <li>The listing does not violate any applicable Kenyan law or regulation</li>
              <li>The listing does not infringe any third-party intellectual property rights</li>
            </ul>
            <p>The following are prohibited on listings:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Illegal, counterfeit, or stolen goods</li>
              <li>Products requiring licensing you do not hold (e.g., restricted pesticides or veterinary drugs)</li>
              <li>False price information, fraudulent descriptions, or misleading photos</li>
              <li>Duplicate listings designed to manipulate search results</li>
            </ul>
            <p>Agrisoko reserves the right to remove any listing that violates these Terms or our policies, at our sole discretion and without prior notice.</p>
          </Section>

          <Section id="transactions" title="5. Transactions & orders">
            <p>Agrisoko is a marketplace platform that facilitates connections between buyers and sellers. We are not a party to any transaction between users.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>All transactions are directly between the buyer and seller</li>
              <li>Buyers and sellers must agree on price, delivery terms, and payment method independently</li>
              <li>Agrisoko does not guarantee the quality, safety, legality, or delivery of any goods or services</li>
              <li>Agrisoko is not responsible for disputes between buyers and sellers arising from transactions</li>
            </ul>
            <p>We encourage users to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Verify the seller&apos;s identity before making large payments</li>
              <li>Prefer verified sellers where possible</li>
              <li>Use our in-platform messaging for a record of agreements</li>
              <li>Report suspicious listings or users through our reporting tools</li>
            </ul>
          </Section>

          <Section id="payments" title="6. Payments & boost fees">
            <p>Agrisoko does not currently charge sellers a commission on transactions. Listing your products on the Platform is free.</p>
            <p><strong>Listing boosts:</strong> Sellers may optionally pay a boost fee (currently KES 500) to promote a listing. Boost fees are paid via M-Pesa to Agrisoko&apos;s designated till number and reviewed manually by our team. Boost fees are non-refundable unless the boost is rejected or not activated within a reasonable period.</p>
            <p>We reserve the right to introduce new fees with at least 14 days&apos; notice to registered users. Continued use of the Platform after fee changes take effect constitutes acceptance of the new fee structure.</p>
          </Section>

          <Section id="verification" title="7. Identity verification">
            <p>Agrisoko offers optional identity verification (ID and selfie) to help buyers make informed decisions. Verified sellers receive a &ldquo;Verified&rdquo; badge on their listings and profile.</p>
            <p>Verification is not a guarantee of the seller&apos;s trustworthiness, product quality, or transaction reliability. It confirms only that the identity documents submitted match the account holder. Buyers should exercise their own judgement and due diligence in all transactions.</p>
            <p>We may revoke verification if we discover that documents were falsified or if the account engages in fraudulent activity.</p>
          </Section>

          <Section id="prohibited" title="8. Prohibited conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Use the Platform for any unlawful purpose or in violation of Kenyan law</li>
              <li>Post false, misleading, or fraudulent listings</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Attempt to circumvent any security or access control measures</li>
              <li>Scrape, crawl, or extract data from the Platform without our written consent</li>
              <li>Use the Platform to spam, send unsolicited messages, or conduct phishing</li>
              <li>Impersonate another person, organisation, or Agrisoko staff</li>
              <li>Manipulate listing rankings or reviews through artificial means</li>
              <li>Facilitate transactions that bypass the Platform to avoid Platform policies</li>
            </ul>
          </Section>

          <Section id="ip" title="9. Intellectual property">
            <p>All content on the Agrisoko platform — including the logo, design, text, and software — is owned by or licensed to {COMPANY} and is protected by applicable intellectual property laws.</p>
            <p>By posting content (photos, descriptions, listings), you grant Agrisoko a non-exclusive, royalty-free, worldwide licence to display, reproduce, and distribute that content for the purpose of operating the Platform. You retain ownership of content you create.</p>
            <p>You may not reproduce, distribute, or create derivative works of any part of the Platform without our prior written consent.</p>
          </Section>

          <Section id="liability" title="10. Limitation of liability">
            <p>To the fullest extent permitted by Kenyan law:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Agrisoko provides the Platform on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind</li>
              <li>We are not liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Platform</li>
              <li>We are not liable for losses arising from transactions between buyers and sellers, including non-delivery, product quality disputes, or fraud by another user</li>
              <li>Our total liability to you for any claim shall not exceed the amount you paid to Agrisoko in the 12 months preceding the claim (which may be KES 0 if you have not paid any fees)</li>
            </ul>
          </Section>

          <Section id="indemnity" title="11. Indemnity">
            <p>You agree to indemnify and hold harmless {COMPANY}, its officers, directors, and employees from any claims, damages, losses, or expenses (including legal fees) arising from:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your use of the Platform in violation of these Terms</li>
              <li>Your listings, content, or conduct on the Platform</li>
              <li>Any dispute between you and another user</li>
            </ul>
          </Section>

          <Section id="termination" title="12. Termination">
            <p>We may suspend or permanently terminate your account at any time if we believe you have violated these Terms, engaged in fraudulent activity, or acted in a manner harmful to other users or the Platform.</p>
            <p>You may delete your account at any time from your profile settings. Upon deletion, your public listings will be removed. Transaction records may be retained as required by law.</p>
          </Section>

          <Section id="disputes" title="13. Disputes">
            <p>We encourage users to resolve disputes between themselves first through our in-platform messaging. If a dispute cannot be resolved, users may submit a report through our platform tools for Agrisoko review.</p>
            <p>Agrisoko is not an arbitrator and our decisions on reports do not constitute legal rulings. We reserve the right to take any action we deem appropriate, including suspension of accounts, when safety or integrity of the Platform is at risk.</p>
          </Section>

          <Section id="governing-law" title="14. Governing law">
            <p>These Terms are governed by and construed in accordance with the laws of Kenya. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Kenya.</p>
          </Section>

          <Section id="changes" title="15. Changes to these Terms">
            <p>We may update these Terms at any time. We will notify registered users of material changes by email or through a platform notification at least 14 days before they take effect. The effective date at the top of this page reflects the most recent revision.</p>
            <p>Continued use of the Platform after updated Terms take effect constitutes your acceptance of the new Terms.</p>
          </Section>

          <Section id="contact" title="16. Contact">
            <p>For questions about these Terms:</p>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-1">
              <p className="font-semibold text-stone-800">LeadAfrik Agricultural Solutions (Agrisoko)</p>
              <p>Email: <a href={`mailto:${EMAIL}`} className="font-medium text-terra-600 hover:underline">{EMAIL}</a></p>
            </div>
          </Section>
        </div>

        <div className="mt-12 border-t border-stone-200 pt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/legal/privacy" className="font-semibold text-terra-600 hover:text-terra-700">
            Privacy Policy →
          </Link>
          <Link href="/about" className="text-stone-500 hover:text-stone-700">About Agrisoko</Link>
        </div>
      </div>
    </div>
  );
}
