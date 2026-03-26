import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell py-20">
      <div className="hero-panel p-8 text-center sm:p-12">
        <p className="section-kicker">404</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-900 sm:text-5xl">That page does not exist</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-stone-600">
          The route may have moved during the migration from the PWA structure to the Next app, or
          the link may be outdated.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="primary-button">
            Go home
          </Link>
          <Link href="/browse" className="secondary-button">
            Browse marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
