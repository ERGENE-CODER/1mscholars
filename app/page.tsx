"use client";

import Link from "next/link";
import { useState } from "react";
export default function Home() {
const [opportunitiesOpen, setOpportunitiesOpen] = useState(false);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="w-full border-b border-gray-200 bg-white">

        <div
          className="
            mx-auto
            flex
            h-[94px]
            w-full
            max-w-[1600px]
            items-center
            px-6
            sm:px-8
            lg:px-10
            xl:px-12
          "
        >

          {/* =================================================
              LOGO + BRAND
          ================================================= */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-4"
          >

            {/* LOGO */}
            <div
              className="
                flex
                h-[72px]
                w-[72px]
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
              "
            >
              <img
                src="/logo.png"
                alt="1M Scholars Ltd"
                className="h-full w-full object-cover"
              />
            </div>

            {/* BRAND NAME */}
            <div className="flex flex-col">

              <span
                className="
                  whitespace-nowrap
                  text-[24px]
                  font-bold
                  leading-[29px]
                  tracking-[-0.5px]
                  text-[#12396B]
                "
              >
                1M Scholars
              </span>

              <span
                className="
                  mt-1
                  whitespace-nowrap
                  text-[13px]
                  font-medium
                  leading-[16px]
                  text-gray-400
                "
              >
                Your Future, Our Mission
              </span>

            </div>

          </Link>


          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}
          <nav
            className="
              ml-auto
              hidden
              items-center
              gap-8
              lg:flex
              xl:gap-10
            "
          >

            {/* HOME */}
            <Link
              href="/"
              className="
                relative
                flex
                h-[94px]
                items-center
                whitespace-nowrap
                px-1
                text-[15px]
                font-semibold
                text-[#2166E8]
              "
            >
              Home

              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  h-[3px]
                  w-full
                  rounded-t-full
                  bg-[#2166E8]
                "
              />
            </Link>


          {/* =================================================
    OPPORTUNITIES DROPDOWN
================================================= */}
<div
  className="relative"
  onMouseEnter={() => setOpportunitiesOpen(true)}
  onMouseLeave={() => setOpportunitiesOpen(false)}
>
  {/* OPPORTUNITIES BUTTON */}
  <button
    type="button"
    className="
      flex
      h-[94px]
      items-center
      gap-2
      whitespace-nowrap
      px-1
      text-[15px]
      font-semibold
      text-[#102F59]
      transition
      hover:text-[#2166E8]
    "
  >
    <span>Opportunities</span>

    <span
      className={`
        text-[11px]
        transition-transform
        duration-200
        ${opportunitiesOpen ? "rotate-180" : ""}
      `}
    >
      ⌄
    </span>
  </button>


  {/* =================================================
      DROPDOWN
  ================================================= */}
  {opportunitiesOpen && (
    <div
      className="
        absolute
        left-1/2
        top-[82px]
        z-50
        w-[680px]
        -translate-x-1/2
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-4
        shadow-[0_20px_60px_rgba(15,45,90,0.15)]
      "
    >

      <div className="grid grid-cols-[250px_1fr] overflow-hidden rounded-xl">

        {/* ==========================================
            LEFT SIDE
        ========================================== */}
        <div className="space-y-1">

          {/* SCHOLARSHIPS */}
          <Link
            href="/opportunities/scholarships"
            className="
              group
              flex
              items-center
              justify-between
              rounded-xl
              bg-[#EEF5FF]
              px-4
              py-3.5
              text-[#2166E8]
              transition
              hover:bg-[#E5F0FF]
            "
          >
            <div className="flex items-center gap-3">

              <span className="text-[20px]">
                🎓
              </span>

              <span className="text-[14px] font-semibold">
                Scholarships
              </span>

            </div>

            <span className="text-[18px]">
              ›
            </span>
          </Link>


          {/* JOBS */}
          <Link
            href="/opportunities/jobs"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-[#102F59]
              transition
              hover:bg-gray-50
              hover:text-[#2166E8]
            "
          >
            <span className="text-[19px]">
              💼
            </span>

            <span className="text-[14px] font-semibold">
              Jobs
            </span>
          </Link>


          {/* INTERNSHIPS */}
          <Link
            href="/opportunities/internships"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-[#102F59]
              transition
              hover:bg-gray-50
              hover:text-[#2166E8]
            "
          >
            <span className="text-[19px]">
              👤
            </span>

            <span className="text-[14px] font-semibold">
              Internships
            </span>
          </Link>


          {/* FELLOWSHIPS */}
          <Link
            href="/opportunities/fellowships"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-[#102F59]
              transition
              hover:bg-gray-50
              hover:text-[#2166E8]
            "
          >
            <span className="text-[19px]">
              👥
            </span>

            <span className="text-[14px] font-semibold">
              Fellowships
            </span>
          </Link>


          {/* TRAINING */}
          <Link
            href="/opportunities/training"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-[#102F59]
              transition
              hover:bg-gray-50
              hover:text-[#2166E8]
            "
          >
            <span className="text-[19px]">
              📖
            </span>

            <span className="text-[14px] font-semibold">
              Training & Courses
            </span>
          </Link>


          {/* COMPETITIONS */}
          <Link
            href="/opportunities/competitions"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-[#102F59]
              transition
              hover:bg-gray-50
              hover:text-[#2166E8]
            "
          >
            <span className="text-[19px]">
              🏆
            </span>

            <span className="text-[14px] font-semibold">
              Competitions
            </span>
          </Link>

        </div>


        {/* ==========================================
            RIGHT SIDE
        ========================================== */}
        <div
          className="
            ml-3
            rounded-xl
            bg-[#F8FAFD]
            p-4
          "
        >

          <img
            src="/hero.png"
            alt="Find opportunities"
            className="
              h-[135px]
              w-full
              rounded-xl
              object-cover
            "
          />

          <h3
            className="
              mt-4
              text-[18px]
              font-bold
              leading-[23px]
              text-[#12396B]
            "
          >
            Find the right opportunity
            <br />
            for your future
          </h3>

          <p
            className="
              mt-2
              text-[13px]
              leading-[20px]
              text-gray-500
            "
          >
            Explore scholarships, jobs,
            internships, trainings and more
            from trusted institutions.
          </p>

          <Link
            href="/opportunities"
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              text-[13px]
              font-semibold
              text-[#2166E8]
              hover:underline
            "
          >
            Browse All Opportunities

            <span className="text-[18px]">
              →
            </span>
          </Link>

        </div>

      </div>

    </div>
  )}

</div>

           {/* scholarships */}
            <Link
              href="/scholarships"
              className="
                flex
                items-center
                gap-2
                whitespace-nowrap
                px-1
                text-[15px]
                font-semibold
                text-[#102F59]
                transition
                hover:text-[#2166E8]
              "
            >
              Scholarship

              <span className="text-[11px]">
                ⌄
              </span>
            </Link>


            {/* ABOUT */}
            <Link
              href="/about"
              className="
                flex
                items-center
                gap-2
                whitespace-nowrap
                px-1
                text-[15px]
                font-semibold
                text-[#102F59]
                transition
                hover:text-[#2166E8]
              "
            >
              About Us

              <span className="text-[11px]">
                ⌄
              </span>
            </Link>


            {/* CONTACT */}
            <Link
              href="/contact"
              className="
                whitespace-nowrap
                px-1
                text-[15px]
                font-semibold
                text-[#102F59]
                transition
                hover:text-[#2166E8]
              "
            >
              Contact
            </Link>

          </nav>


          {/* =================================================
              ACTION BUTTONS
          ================================================= */}
          <div
            className="
              ml-6
              hidden
              shrink-0
              items-center
              gap-3
              lg:flex
              xl:ml-10
            "
          >

            {/* SIGN IN */}
            <Link
              href="/login"
              className="
                flex
                h-[46px]
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-[#CBD5E1]
                px-5
                text-[14px]
                font-semibold
                whitespace-nowrap
                text-[#102F59]
                transition
                hover:bg-gray-50
              "
            >
              <span className="text-[15px]">
                ♙
              </span>

              Sign In
            </Link>


            {/* GET STARTED */}
            <Link
              href="/register"
              className="
                flex
                h-[46px]
                items-center
                justify-center
                gap-5
                rounded-xl
                bg-[#2166E8]
                px-6
                text-[14px]
                font-semibold
                whitespace-nowrap
                text-white
                shadow-sm
                transition
                hover:bg-[#1554C7]
              "
            >
              <span>
                Get Started
              </span>

              <span className="text-[18px]">
                →
              </span>
            </Link>

          </div>

        </div>

      </header>


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