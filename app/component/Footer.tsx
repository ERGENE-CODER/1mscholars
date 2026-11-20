"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, TriangleAlert } from "lucide-react";

/* =========================================================
   EDIT THE CONTENT HERE
   ========================================================= */

// The footer is hidden on pages that start with any of these (the admin panel has its own layout).
const HIDDEN_PREFIXES = ["/admin"];

const EMAIL = "1mscholarsltd@gmail.com";
const PHONES = ["+250 781 841 929", "+250 782 774 986", "+250 789 422 004"];

const OPPORTUNITY_LINKS = [
  { label: "Scholarships", href: "/opportunities/scholarships" },
  { label: "Jobs", href: "/opportunities/jobs" },
  { label: "Internships", href: "/opportunities/internships" },
  { label: "Training", href: "/opportunities/training" },
  { label: "Fellowships", href: "/opportunities/fellowships" },
];

// All point to the Training category for now; change an href when a topic gets its own page.
const TRAINING_LINKS = [
  { label: "Forex Trading", href: "/opportunities/training" },
  { label: "Cybersecurity", href: "/opportunities/training" },
  { label: "Web Development", href: "/opportunities/training" },
  { label: "Data Analysis", href: "/opportunities/training" },
  { label: "UI/UX Design", href: "/opportunities/training" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Our Team", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Apply for Consulting", href: "/contact" },
];

/* =========================================================
   FOOTER
   ========================================================= */

const headingClass = "text-[17px] font-semibold text-slate-200";
const linkClass = "text-sm text-slate-400 transition hover:text-white";

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h3 className={headingClass}>{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <footer className="w-full bg-[#050B18] text-slate-400">
      <div className="mx-auto max-w-[1280px] px-5 pb-8 pt-14 sm:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))] lg:gap-x-12">
          {/* BRAND: same font and size as the name in the header */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block" aria-label="1M Scholars Ltd home">
              <span className="block whitespace-nowrap text-[20px] font-bold leading-[29px] tracking-[-0.5px] text-white sm:text-[24px]">
                1M Scholars Ltd
              </span>
              <span className="mt-1 block text-[13px] font-medium leading-[16px] text-slate-400">
                Kigali, Rwanda
              </span>
            </Link>

            <p className="mt-5 max-w-[320px] text-sm leading-7 text-slate-400">
              Rwanda&apos;s trusted youth opportunity platform — connecting students, graduates and professionals to scholarships, jobs and skills training.
            </p>
          </div>

          <LinkColumn title="Opportunities" links={OPPORTUNITY_LINKS} />
          <LinkColumn title="Training" links={TRAINING_LINKS} />
          <LinkColumn title="Company" links={COMPANY_LINKS} />

          {/* CONTACT */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className={headingClass}>Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>Kigali, Rwanda</li>
              <li>
                <a href={`mailto:${EMAIL}`} className={`${linkClass} break-all`}>
                  {EMAIL}
                </a>
              </li>
              {PHONES.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className={linkClass}>
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* DISCLAIMER + BOTTOM BAR */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="flex max-w-3xl items-start gap-2 text-xs leading-5 text-slate-500">
            <TriangleAlert size={14} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-slate-400">Important:</strong> 1M Scholars Ltd is a consultative agency. Fees paid cover guidance and application support services only. We do not guarantee admission, employment, scholarship awards, or placement. All final decisions rest with the respective institutions.
            </span>
          </p>

          <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-400">
            <span>© {new Date().getFullYear()} 1M Scholars Ltd. All rights reserved.</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-[#F5B335]/50 hover:text-[#F5B335]"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
