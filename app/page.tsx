import Link from "next/link";
import LatestOpportunities from "./component/home/LatestOpportunities";
import StatsCounter from "./component/home/StatsCounter";
import Testimonials from "./component/home/Testimonials";
import Faq from "./component/home/Faq";
import HeroCarousel from "./component/home/HeroCarousel";
import RecommendedScholarships from "./component/home/RecommendedScholarships";
import WhatsAppPopup from "./component/home/WhatsAppPopup";

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* =====================================================
          HERO: carousel (left) + recommended scholarships (right)
      ===================================================== */}
      <section className="border-b border-slate-200 bg-[#EEF2F8] py-5 sm:py-6">
        <div className="mx-auto grid max-w-[1400px] gap-5 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10">
          <div className="h-[440px] sm:h-[500px] lg:h-[540px]">
            <HeroCarousel />
          </div>
          <div className="lg:h-[540px]">
            <RecommendedScholarships />
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}
      <div className="border-t border-gray-100 bg-white lg:hidden">
        <nav className="flex w-full items-center justify-center gap-6 overflow-x-auto px-5 py-4">
          <Link href="/" className="whitespace-nowrap text-sm font-semibold text-[#2166E8]">
            Home
          </Link>
          <Link href="/opportunities" className="whitespace-nowrap text-sm font-semibold text-[#102F59]">
            Opportunities
          </Link>
          <Link href="/resources" className="whitespace-nowrap text-sm font-semibold text-[#102F59]">
            Resources
          </Link>
          <Link href="/about" className="whitespace-nowrap text-sm font-semibold text-[#102F59]">
            About
          </Link>
          <Link href="/contact" className="whitespace-nowrap text-sm font-semibold text-[#102F59]">
            Contact
          </Link>
        </nav>
      </div>

      {/* LATEST OPPORTUNITIES (6 newest published) */}
      <LatestOpportunities />

      {/* COUNTER */}
      <StatsCounter />

      {/* REVIEWS */}
      <Testimonials />

      {/* FAQ */}
      <Faq />

      {/* WhatsApp group invitation (appears a few seconds after the page opens) */}
      <WhatsAppPopup />
    </main>
  );
}
