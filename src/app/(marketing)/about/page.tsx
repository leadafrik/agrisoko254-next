import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const BRAND_NAME = "Agrisoko";
const LEGAL_ENTITY_NAME = "LeadAfrik Agricultural Solutions";
const SUPPORT_EMAIL = "info@leadafrik.com";
const FOUNDER_NAME = "Stephen Omukoko Okoth";
const FOUNDER_IMAGE = "/images/stephen-omukoko-okoth.jpg";
const FOUNDER_WHATSAPP = "254796389192";
const FOUNDER_WHATSAPP_DISPLAY = "0796 389 192";
const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/stephen-omukoko-okoth-a4a5b7188";
const CEO_VIDEO_EMBED_URL = "https://www.youtube.com/embed/JoFzDK2ct8w?si=D6PUkI_gdBWTdUgj";
const CEO_VIDEO_WATCH_URL = "https://www.youtube.com/watch?v=JoFzDK2ct8w";
const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/HzCaV5YVz86CjwajiOHR5i";
const TRADE_COVERAGE_COUNT = 47;

const heroMetrics = [
  { label: "Counties covered", value: `${TRADE_COVERAGE_COUNT}`, detail: "Nationwide reach" },
  { label: "Trust checks", value: "Verified", detail: "Profiles and listings" },
  {
    label: "Active community",
    value: "Farmers, buyers, and service providers",
    detail: "Growing daily across Kenya",
  },
];

const leadership = [
  {
    name: "Joseph Mugalla",
    title: "Chief Operating Officer",
    image: "/images/joseph-mugalla.jpeg",
    linkedin: "https://www.linkedin.com/in/joseph-mugalla-a387a1267",
    summary:
      "Joseph Mugalla is Agrisoko's Chief Operating Officer. He brings together operations, market research, agribusiness experience, and software delivery discipline to keep the platform practical, responsive, and execution-focused as it grows across Kenya.",
    detail:
      "His background across social science, technology, and agribusiness helps Agrisoko stay grounded in real market behavior while building reliable systems for sellers, buyers, and service providers.",
    skills: ["Operations", "Market Research", "Agribusiness", "Software Delivery"],
  },
  {
    name: "Valary Akong'ai",
    title: "Chief of Staff",
    image: "/images/valary-akongai.jpeg",
    linkedin: "https://www.linkedin.com/in/valary-akong-ai-93115735a",
    summary:
      "Akong'ai Valary Purity is a Meteorology graduate and Agrisoko's Chief of Staff. She focuses on climate intelligence, environmental risk awareness, and resilient agribusiness systems that help keep agricultural trade practical, informed, and future-ready.",
    detail:
      "She is focused on building data-informed, climate-resilient, and commercially viable systems that help farmers make better decisions, strengthen food security, and support sustainable agricultural growth across Kenya.",
    skills: ["Climate Intelligence", "Risk Assessment", "Agribusiness", "Sustainable Systems"],
  },
  {
    name: "Stanley Bwire",
    title: "Chief Marketing Officer",
    image: "/images/stanley-bwire.jpeg",
    linkedin: "https://www.linkedin.com/in/stanley-bwire",
    summary:
      "Stanley Bwire is Agrisoko's Chief Marketing Officer. As a sales and marketing executive specializing in digital marketing and media production, he combines graphic design, market research, and product advertising to connect Agrisoko with the right audience through clear, data-driven campaigns.",
    detail:
      "His work focuses on making Agrisoko visible, credible, and relevant in the market through strong brand communication, practical media execution, and marketing that is tied to real user behavior.",
    skills: ["Digital Marketing", "Media Production", "Market Research", "Product Advertising"],
  },
  {
    name: "Irene Njoki",
    title: "Field Operations Lead",
    image: "/images/irene-njoki.jpeg",
    summary:
      "Irene Njoki is Agrisoko's Field Operations Lead. With experience in animal health, small-scale farming, and direct relationships with sellers on the ground, she helps keep the platform connected to real farmer needs, trusted supply networks, and day-to-day field realities across Kenya.",
    detail:
      "Her work helps Agrisoko stay grounded in real agricultural relationships. With exposure to animal health and practical farming, she brings field-level insight that strengthens seller outreach, farmer trust, and on-the-ground market relevance.",
    skills: ["Field Operations", "Animal Health", "Farmer Network", "Seller Relations"],
  },
];

const offerings = [
  {
    code: "PR",
    title: "Produce",
    description: "High-quality maize, onions, potatoes, fruits, and vegetables listed by farmers.",
    bullets: ["Vegetables and fruits", "Grains and cereals", "Farm-to-buyer deals"],
  },
  {
    code: "LV",
    title: "Livestock",
    description: "Cattle, poultry, goats, and other livestock from active sellers.",
    bullets: ["Poultry and chicks", "Cattle and goats", "Direct seller contact"],
  },
  {
    code: "IN",
    title: "Inputs",
    description: "Certified seeds, fertilizer, and tools from verified suppliers.",
    bullets: ["Seeds and seedlings", "Fertilizers and crop care", "Tools and equipment"],
  },
  {
    code: "SV",
    title: "Services",
    description: "Tractors, transport, farm operations, and agribusiness services across Kenya.",
    bullets: ["Equipment rental", "Transport and logistics", "Farm operations support"],
  },
];

const faqItems = [
  {
    question: "What is Agrisoko?",
    answer:
      "Agrisoko is a Kenyan agricultural marketplace where farmers, buyers, and service providers trade produce, livestock, inputs, and services directly.",
  },
  {
    question: "Is ID verification required to create an account?",
    answer:
      "No. You can create an account and browse without verification. Verification is optional but recommended because it improves trust and listing visibility.",
  },
  {
    question: "How does verification work?",
    answer:
      "Users submit ID and selfie for manual review. Approved profiles get verified status. If rejected, users receive a reason and can resubmit.",
  },
  {
    question: "Do you support land or property listings?",
    answer:
      "No. Agrisoko focuses on agricultural produce, livestock, inputs, and services only.",
  },
  {
    question: "How is user data handled?",
    answer:
      "Agrisoko handles marketplace data in line with Kenya's Data Protection Act, 2019 and provides clear support channels for data inquiries.",
  },
];

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.agrisoko254.com/#organization",
  name: BRAND_NAME,
  legalName: LEGAL_ENTITY_NAME,
  alternateName: "Agrisoko254",
  url: "https://www.agrisoko254.com",
  logo: "https://www.agrisoko254.com/logo512.png",
  email: SUPPORT_EMAIL,
  telephone: "+254796389192",
  slogan: "Trusted agricultural marketplace across Kenya",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    telephone: "+254796389192",
    email: SUPPORT_EMAIL,
    areaServed: "KE",
    availableLanguage: ["English", "Swahili"],
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "KE",
    addressLocality: "Kenya",
  },
  sameAs: [
    `https://wa.me/${FOUNDER_WHATSAPP}`,
    WHATSAPP_COMMUNITY_URL,
    "https://www.instagram.com/lead_afrik/",
    "https://www.facebook.com/LeadAfrik",
  ],
  founder: {
    "@type": "Person",
    name: FOUNDER_NAME,
  },
};

const peopleSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: FOUNDER_NAME,
    jobTitle: "Founder, Agrisoko",
    image: `https://www.agrisoko254.com${FOUNDER_IMAGE}`,
    sameAs: [FOUNDER_LINKEDIN],
    worksFor: { "@type": "Organization", name: BRAND_NAME, legalName: LEGAL_ENTITY_NAME },
    address: { "@type": "PostalAddress", addressCountry: "KE" },
  },
  ...leadership.map((leader) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: leader.name,
    jobTitle: leader.title,
    image: `https://www.agrisoko254.com${leader.image}`,
    description: leader.summary,
    sameAs: leader.linkedin ? [leader.linkedin] : undefined,
    worksFor: { "@type": "Organization", name: BRAND_NAME, legalName: LEGAL_ENTITY_NAME },
    address: { "@type": "PostalAddress", addressCountry: "KE" },
  })),
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntityOfPage: "https://www.agrisoko254.com/about",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export const metadata: Metadata = {
  title: "About Agrisoko | Built in Kenya for Agricultural Trade",
  description:
    "Learn how Agrisoko is building direct, trusted agricultural trade across Kenya through verified profiles, practical marketplace workflows, and county-wide coverage.",
  alternates: {
    canonical: "https://www.agrisoko254.com/about",
  },
  openGraph: {
    title: "About Agrisoko | Built in Kenya for Agricultural Trade",
    description:
      "Agrisoko connects farmers, traders, agrovets, and buyers across Kenya through direct-market workflows and trust-first operations.",
    url: "https://www.agrisoko254.com/about",
  },
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function AboutPage() {
  return (
    <div className="page-shell py-10 sm:py-12">
      <JsonLd data={organizationSchema} />
      {peopleSchema.map((person) => (
        <JsonLd key={String(person.name)} data={person} />
      ))}
      <JsonLd data={faqSchema} />

      <section className="hero-panel relative overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="absolute inset-y-0 left-[55%] hidden w-[40%] rounded-full bg-[radial-gradient(circle,rgba(160,69,46,0.12)_0%,rgba(160,69,46,0)_70%)] blur-3xl lg:block" />
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="section-kicker">About Agrisoko</p>
            <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">
              Built by Kenyans, for Kenyan agriculture.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
              Agrisoko connects farmers, traders, agrovets, and buyers across all 47 counties. We
              help Kenyans trade directly, reduce broker costs, and build trust through verified
              profiles.
            </p>
            <p className="mt-3 text-sm font-medium text-stone-700">
              Agrisoko is operated by {LEGAL_ENTITY_NAME}.
            </p>

            <div className="mt-6 rounded-[24px] border border-[rgba(160,69,46,0.14)] bg-[rgba(160,69,46,0.06)] px-5 py-4 text-sm font-medium text-[#7a2f21]">
              Karibuni. Biashara bila middlemen - direct to farm, direct to buyer.
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login?mode=signup&redirect=%2Fbrowse" className="primary-button">
                Create account / Sign in
              </Link>
              <Link href="/browse" className="secondary-button">
                Explore Listings
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {heroMetrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`metric-chip ${index === 2 ? "sm:col-span-2" : ""}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {metric.label}
                </p>
                <p className="mt-3 text-2xl font-bold text-stone-900">{metric.value}</p>
                <p className="mt-2 text-sm text-stone-600">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2" id="ceo-message">
        <div className="surface-card p-8">
          <p className="section-kicker">Our Mission</p>
          <h2 className="mt-4 text-3xl font-bold text-stone-900">Make direct trade normal</h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Help Kenyan farmers and agribusinesses sell and buy directly, without broker pressure,
            with clear pricing and trusted profiles.
          </p>
        </div>

        <div className="surface-card p-8">
          <p className="section-kicker">Our Vision</p>
          <h2 className="mt-4 text-3xl font-bold text-stone-900">A trusted Kenyan marketplace</h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            A platform where every farmer, buyer, agrovet, and service provider can trade with
            confidence, backed by verification and accountability.
          </p>
        </div>
      </section>

      <section className="mt-16" id="founder-story">
        <div className="surface-card p-6 sm:p-8">
          <div className="grid gap-8 md:grid-cols-[0.82fr_1.18fr] md:items-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-stone-200 bg-[#f8f3eb]">
              <Image
                src={FOUNDER_IMAGE}
                alt={`${FOUNDER_NAME} - Founder of Agrisoko`}
                fill
                sizes="(min-width: 768px) 28rem, 100vw"
                className="object-cover"
              />
            </div>

            <div>
              <p className="section-kicker">Founder Story</p>
              <h2 className="mt-4 text-3xl font-bold text-stone-900 sm:text-4xl">
                From broker losses to a digital agriculture future
              </h2>
              <p className="mt-5 text-base leading-relaxed text-stone-700">
                {FOUNDER_NAME} built Agrisoko after seeing the same painful pattern in Kenyan
                markets: farmers did the hardest work, but middlemen captured the biggest share and
                many families were left with unfair prices.
              </p>
              <p className="mt-4 text-base leading-relaxed text-stone-700">
                Agrisoko exists to change that system. By taking agriculture digital, verified
                farmers, buyers, agrovets, and service providers can discover each other faster,
                negotiate directly, and trade with clear accountability.
              </p>
              <p className="mt-4 text-base leading-relaxed text-stone-700">
                This is the long game: make Kenya fully ready for 21st-century agricultural
                commerce, where reputation is earned, prices are transparent, and every county can
                compete in one trusted market.
              </p>

              <div className="mt-6 rounded-[24px] border border-[rgba(160,69,46,0.14)] bg-[rgba(160,69,46,0.06)] px-5 py-4">
                <p className="text-lg font-semibold text-[#7a2f21]">
                  &quot;Your verified Agrisoko profile is your trading reputation.&quot;
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`https://wa.me/${FOUNDER_WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button"
                >
                  WhatsApp {FOUNDER_WHATSAPP_DISPLAY}
                </a>
                <a
                  href={FOUNDER_LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-button"
                >
                  View LinkedIn Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16" id="ceo-video">
        <div className="surface-card p-6 sm:p-8">
          <p className="section-kicker">Message from the CEO</p>
          <h2 className="mt-4 text-3xl font-bold text-stone-900">
            Watch the founder&apos;s message on Agrisoko&apos;s mission
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-600">
            A short message from {FOUNDER_NAME} on why Agrisoko exists and where we are taking
            Kenya&apos;s agricultural marketplace.
          </p>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-stone-200 bg-white">
            <div className="relative pb-[56.25%]">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={CEO_VIDEO_EMBED_URL}
                title="Message from the CEO - Agrisoko"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <a
            href={CEO_VIDEO_WATCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-button mt-6"
          >
            Watch on YouTube
          </a>
        </div>
      </section>

      <section className="mt-16">
        <div className="space-y-6">
          {leadership.map((leader) => (
            <article key={leader.name} className="surface-card p-6 sm:p-8">
              <div className="grid gap-8 md:grid-cols-[0.82fr_1.18fr] md:items-start">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-stone-200 bg-[#f8f3eb]">
                  <Image
                    src={leader.image}
                    alt={`${leader.name} - ${leader.title} at Agrisoko`}
                    fill
                    sizes="(min-width: 768px) 28rem, 100vw"
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="section-kicker">Leadership</p>
                  <h2 className="mt-4 text-3xl font-bold text-stone-900 sm:text-4xl">
                    {leader.name}
                  </h2>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {leader.title}
                  </p>
                  <p className="mt-5 text-base leading-relaxed text-stone-700">{leader.summary}</p>
                  <p className="mt-4 text-base leading-relaxed text-stone-700">{leader.detail}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {leader.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {leader.linkedin ? (
                    <a
                      href={leader.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="secondary-button mt-6"
                    >
                      View LinkedIn Profile
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">What we offer</p>
            <h2 className="mt-4 text-3xl font-bold text-stone-900">
              Everything for your farm and agribusiness
            </h2>
          </div>
          <Link href="/browse" className="secondary-button">
            Browse offerings
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {offerings.map((offering) => (
            <article key={offering.title} className="surface-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terra-50 font-bold text-terra-700">
                  {offering.code}
                </div>
                <h3 className="text-2xl font-bold text-stone-900">{offering.title}</h3>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-stone-600">{offering.description}</p>

              <ul className="mt-5 space-y-2 text-sm text-stone-600">
                {offering.bullets.map((bullet) => (
                  <li key={bullet}>- {bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="surface-card p-6">
          <h2 className="text-2xl font-bold text-stone-900">Why choose Agrisoko</h2>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-stone-600">
            <p>
              <span className="font-semibold text-stone-900">Direct connections:</span> Fair
              pricing without middlemen.
            </p>
            <p>
              <span className="font-semibold text-stone-900">Verified profiles:</span> Trust
              signals on every transaction.
            </p>
            <p>
              <span className="font-semibold text-stone-900">Nationwide reach:</span> Listings
              across {TRADE_COVERAGE_COUNT} counties.
            </p>
            <p>
              <span className="font-semibold text-stone-900">Data protection:</span> ODPC-aligned
              handling of your information.
            </p>
            <p>
              <span className="font-semibold text-stone-900">Ratings and reviews:</span>{" "}
              Transparent reputation building.
            </p>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-2xl font-bold text-stone-900">How it works</h2>
          <ol className="mt-5 space-y-3 text-sm leading-relaxed text-stone-600">
            <li>
              <span className="font-semibold text-stone-900">1. Create account</span> - Open your
              profile in seconds.
            </li>
            <li>
              <span className="font-semibold text-stone-900">2. Verify when ready</span> -
              Optional, but boosts trust and visibility.
            </li>
            <li>
              <span className="font-semibold text-stone-900">3. List or browse</span> - Post supply
              or search active listings.
            </li>
            <li>
              <span className="font-semibold text-stone-900">4. Connect and rate</span> - Close
              deals directly and build reputation.
            </li>
          </ol>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="surface-card p-6">
          <p className="section-kicker">Privacy and trust</p>
          <h2 className="mt-4 text-2xl font-bold text-stone-900">Compliance-first operations</h2>
          <ul className="mt-5 space-y-2 text-sm leading-relaxed text-stone-600">
            <li>- Data practices aligned with Kenya&apos;s Data Protection Act, 2019.</li>
            <li>- ID verification is optional for account creation and browsing.</li>
            <li>- Manual review is used to keep verification quality consistent.</li>
            <li>- Support and escalation channels are available through email and WhatsApp.</li>
          </ul>
          <Link href="/legal/privacy" className="secondary-button mt-6">
            Read Privacy Policy
          </Link>
        </div>

        <div className="surface-card p-6">
          <p className="section-kicker">FAQ</p>
          <h2 className="mt-4 text-2xl font-bold text-stone-900">Common questions</h2>
          <div className="mt-5 space-y-3">
            {faqItems.map((item) => (
              <div key={item.question} className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
                <h3 className="text-sm font-semibold text-stone-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="hero-panel p-8 text-center sm:p-10">
          <h2 className="text-3xl font-bold text-stone-900">Ready to get started?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
            Join thousands of farmers, producers, buyers, and service providers building a stronger
            agricultural economy.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login?mode=signup&redirect=%2Fbrowse" className="secondary-button">
              Create account / Sign in
            </Link>
            <Link
              href="/login?mode=signup&redirect=%2Fcreate-listing%2Fproduce"
              className="primary-button"
            >
              Post a Listing
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <div className="surface-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Support
          </p>
          <h2 className="mt-4 text-2xl font-bold text-stone-900">We are here to help</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            Email us, message us directly on WhatsApp, or join the WhatsApp community for fast
            support.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="primary-button">
              Email Support
            </a>
            <a
              href={`https://wa.me/${FOUNDER_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-button"
            >
              WhatsApp {FOUNDER_WHATSAPP_DISPLAY}
            </a>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ghost-button justify-start rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-terra-600"
            >
              WhatsApp Community
            </a>
          </div>
        </div>

        <div className="surface-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Impact
          </p>
          <h2 className="mt-4 text-2xl font-bold text-stone-900">Growing every week</h2>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-stone-600">
            <p>
              <span className="font-semibold text-stone-900">{TRADE_COVERAGE_COUNT} counties</span>{" "}
              connected nationwide.
            </p>
            <p>
              <span className="font-semibold text-stone-900">Active listings</span> updated daily.
            </p>
            <p>
              <span className="font-semibold text-stone-900">Support</span> available through email
              and WhatsApp.
            </p>
          </div>
        </div>

        <div className="surface-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Trust</p>
          <h2 className="mt-4 text-2xl font-bold text-stone-900">Built on verification</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            Profiles are verified and ratings keep the marketplace honest.
          </p>
          <Link href="/verify-id" className="mt-6 inline-flex text-sm font-semibold text-terra-600 hover:text-terra-700">
            Sign in to verify
          </Link>
        </div>
      </section>
    </div>
  );
}
