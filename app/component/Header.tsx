"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileMenu from "./ProfileMenu";

// Categories that sit directly on the navigation bar (plain links, no dropdown).
const MAIN_CATEGORY_LINKS = [
  { href: "/opportunities/scholarships", label: "Scholarships" },
  { href: "/opportunities/jobs", label: "Jobs" },
] as const;

// Everything else lives in the Opportunities dropdown. The row for the page
// you're on is highlighted. To move a category onto the bar (or back), move
// its line between these two lists.
const DROPDOWN_CATEGORIES = [
  { href: "/opportunities/internships", label: "Internships", icon: "👤" },
  { href: "/opportunities/fellowships", label: "Fellowships", icon: "👥" },
  { href: "/opportunities/training", label: "Training & Courses", icon: "📖" },
  { href: "/opportunities/competitions", label: "Competitions", icon: "🏆" },
] as const;

// Every top-level nav item uses the same size and weight; only colour changes.
const NAV_ITEM_BASE =
  "relative flex h-[94px] items-center gap-2 whitespace-nowrap px-1 text-[14px] font-semibold transition xl:text-[15px]";

function navItemClass(active: boolean) {
  return `${NAV_ITEM_BASE} ${
    active ? "text-[#2166E8]" : "text-[#102F59] hover:text-[#2166E8]"
  }`;
}

/** Blue underline under the page you're on. */
function ActiveBar({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-[#2166E8]" />
  );
}

export default function Header({
  isAdmin = false,
  user = null,
}: {
  isAdmin?: boolean;
  user?: { name: string | null; email: string | null } | null;
}) {
  const pathname = usePathname() ?? "/";

  // The admin panel has its own top bar, so don't show the public header there.   // ← added
  if (pathname.startsWith("/admin")) return null;                                  // ← added

  const isHome = pathname === "/";
  const isOpportunities =
    pathname.startsWith("/opportunities") &&
    !MAIN_CATEGORY_LINKS.some((item) => item.href === pathname);
  const isAbout = pathname.startsWith("/about");
  const isContact = pathname.startsWith("/contact");

  return (
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
              MOBILE / TABLET AUTH LINK
              (the desktop navigation below is lg+ only)
          ================================================= */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          {user ? (
            <ProfileMenu name={user.name} email={user.email} isAdmin={isAdmin} />
          ) : (
            <Link
              href="/login?mode=signup"
              className="flex h-[40px] items-center justify-center rounded-xl bg-[#2166E8] px-4 text-[13px] font-semibold whitespace-nowrap text-white shadow-sm transition hover:bg-[#1554C7]"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* =================================================
              DESKTOP NAVIGATION
              flex-1 + justify-evenly = equal spacing between items
          ================================================= */}
        <nav
          aria-label="Main"
          className="mx-6 hidden max-w-[760px] flex-1 items-center justify-evenly lg:flex xl:mx-auto"
        >

          {/* HOME */}
          <Link
            href="/"
            aria-current={isHome ? "page" : undefined}
            className={navItemClass(isHome)}
          >
            Home
            <ActiveBar active={isHome} />
          </Link>


          {/* SCHOLARSHIPS + JOBS: plain links, no dropdown */}
          {MAIN_CATEGORY_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={navItemClass(active)}
              >
                {item.label}
                <ActiveBar active={active} />
              </Link>
            );
          })}


          {/* =================================================
    OPPORTUNITIES DROPDOWN
================================================= */}
<div
  className="group relative"
>
  {/* OPPORTUNITIES BUTTON */}
  <Link
    href="/opportunities"
    aria-current={isOpportunities ? "page" : undefined}
    className={navItemClass(isOpportunities)}
  >
    <span>Opportunities</span>

    <span
      className="
        text-[11px]
        transition-transform
        duration-200
        group-hover:rotate-180
      "
    >
      ⌄
    </span>
    <ActiveBar active={isOpportunities} />
  </Link>


            {/* =================================================
      DROPDOWN
  ================================================= */}
  <div
    className="
      invisible
      absolute
      left-1/2
      top-[94px]
      z-50
      w-[300px]
      -translate-x-1/2
      rounded-2xl
      border
      border-gray-100
      bg-white
      p-4
      shadow-[0_20px_60px_rgba(15,45,90,0.15)]
      opacity-0
      transition-all
      duration-200
      group-hover:visible
      group-hover:opacity-100
      group-focus-within:visible
      group-focus-within:opacity-100
    "
  >

                <div className="space-y-1">

                    {DROPDOWN_CATEGORIES.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                            active
                              ? "bg-[#EEF5FF] text-[#2166E8] hover:bg-[#E5F0FF]"
                              : "text-[#102F59] hover:bg-gray-50 hover:text-[#2166E8]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[20px]">{item.icon}</span>
                            <span className="text-[14px] font-semibold">
                              {item.label}
                            </span>
                          </div>
                          {active && <span className="text-[18px]">›</span>}
                        </Link>
                      );
                    })}

                </div>

    </div>

          </div>



          {/* ABOUT */}
          <Link
            href="/about"
            aria-current={isAbout ? "page" : undefined}
            className={navItemClass(isAbout)}
          >
            About us
            <ActiveBar active={isAbout} />
          </Link>


          {/* CONTACT */}
          <Link
            href="/contact"
            aria-current={isContact ? "page" : undefined}
            className={navItemClass(isContact)}
          >
            Contact
            <ActiveBar active={isContact} />
          </Link>

        </nav>


        {/* =================================================
              ACTION BUTTONS
          ================================================= */}
        <div
          className="
              hidden
              shrink-0
              items-center
              gap-3
              lg:flex
            "
        >
          {/* ADMIN PORTAL (only visible to admins) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="
                flex
                h-[46px]
                items-center
                justify-center
                rounded-xl
                bg-[#12396B]
                px-5
                text-[14px]
                font-semibold
                whitespace-nowrap
                text-white
                transition
                hover:bg-[#2166E8]
              "
            >
              Admin Portal
            </Link>
          )}

          {user ? (
            <ProfileMenu name={user.name} email={user.email} isAdmin={isAdmin} />

          ) : (
            <>
              {/* GET STARTED: one button; the page it opens has both
                  "Create Account" and "Sign In" tabs */}
              <Link
                href="/login?mode=signup"
                className="flex h-[46px] items-center justify-center gap-5 rounded-xl bg-[#2166E8] px-6 text-[14px] font-semibold whitespace-nowrap text-white shadow-sm transition hover:bg-[#1554C7]"
              >
                <span>Get Started</span>
                <span className="text-[18px]">→</span>
              </Link>
            </>
          )}

        </div>

      </div>

    </header>
  );
}