"use client";

import Link from "next/link";
import { useState } from "react";
export default function Home() {
  const [opportunitiesOpen, setOpportunitiesOpen] = useState(false);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section
        className="
          relative
          w-full
          overflow-hidden
        "
      >

        {/* BACKGROUND IMAGE */}
        <img
          src="/hero.png"
          alt="Graduate looking toward a brighter future"
          className="
            block
            h-auto
            min-h-[500px]
            w-full
            object-cover
            object-center
          "
        />

      </section>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}
      <div className="border-t border-gray-100 bg-white lg:hidden">

        <nav
          className="
            flex
            w-full
            items-center
            justify-center
            gap-6
            overflow-x-auto
            px-5
            py-4
          "
        >
          <Link
            href="/"
            className="whitespace-nowrap text-sm font-semibold text-[#2166E8]"
          >
            Home
          </Link>

          <Link
            href="/opportunities"
            className="whitespace-nowrap text-sm font-semibold text-[#102F59]"
          >
            Opportunities
          </Link>

          <Link
            href="/resources"
            className="whitespace-nowrap text-sm font-semibold text-[#102F59]"
          >
            Resources
          </Link>

          <Link
            href="/about"
            className="whitespace-nowrap text-sm font-semibold text-[#102F59]"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="whitespace-nowrap text-sm font-semibold text-[#102F59]"
          >
            Contact
          </Link>

        </nav>

      </div>

    </main>
  );
}