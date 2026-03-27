import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
