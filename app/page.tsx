import Link from "next/link";
import LatestOpportunities from "./component/home/LatestOpportunities";
import StatsCounter from "./component/home/StatsCounter";
import Testimonials from "./component/home/Testimonials";
import Faq from "./component/home/Faq";
import HeroCarousel from "./component/home/HeroCarousel";

export default function Home() {
   return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* =====================================================
          HERO CAROUSEL
      ===================================================== */}
      <HeroCarousel />


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
    </main>
  );
}
