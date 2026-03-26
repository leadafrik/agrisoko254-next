import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-3">Agrisoko</h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              Kenya&apos;s agricultural marketplace. Buy, sell and connect — directly from the farm.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/browse"           className="hover:text-white transition-colors">Browse Listings</Link></li>
              <li><Link href="/browse/produce"   className="hover:text-white transition-colors">Produce</Link></li>
              <li><Link href="/browse/livestock" className="hover:text-white transition-colors">Livestock</Link></li>
              <li><Link href="/browse/inputs"    className="hover:text-white transition-colors">Farm Inputs</Link></li>
              <li><Link href="/browse/services"  className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/request"          className="hover:text-white transition-colors">Buy Requests</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Learn</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/learn/poultry"       className="hover:text-white transition-colors">Poultry Farming</Link></li>
              <li><Link href="/learn/crops"         className="hover:text-white transition-colors">Crop Farming</Link></li>
              <li><Link href="/learn/livestock"     className="hover:text-white transition-colors">Livestock</Link></li>
              <li><Link href="/learn/inputs"        className="hover:text-white transition-colors">Farm Inputs</Link></li>
              <li><Link href="/learn/market-prices" className="hover:text-white transition-colors">Market Prices</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about"        className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/blog"         className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/b2b"          className="hover:text-white transition-colors">Bulk / B2B</Link></li>
              <li><Link href="/legal/terms"  className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy"className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Agrisoko. All rights reserved.</p>
          <p>Built for Kenyan farmers 🇰🇪</p>
        </div>
      </div>
    </footer>
  );
}
