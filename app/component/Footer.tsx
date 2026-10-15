"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa6";
import { ArrowRight, ArrowUp, TriangleAlert } from "lucide-react";

/* =========================================================
   EDIT THE CONTENT HERE
   ========================================================= */

// The footer is hidden on pages that start with any of these (the admin panel has its own layout).
const HIDDEN_PREFIXES = ["/admin"];

const EMAIL = "1mscholarsltd@gmail.com";
const PHONES = ["+250 781 841 929", "+250 782 774 986", "+250 789 422 004"];

// TODO: check that these addresses are your real accounts, and put your WhatsApp *Channel*
// link (https://whatsapp.com/channel/...) in WHATSAPP_CHANNEL.
const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/1MscholarsLtd", icon: FaFacebookF },
  { label: "Instagram", href: "https://www.instagram.com/1MscholarsLtd", icon: FaInstagram },
  { label: "Twitter", href: "https://www.twitter.com/1MscholarsLtd", icon: FaTwitter },
  { label: "TikTok", href: "https://www.tiktok.com/@1MscholarsLtd", icon: FaTiktok },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/1mscholars", icon: FaLinkedinIn },
  { label: "YouTube", href: "https://www.youtube.com/@1mscholarsltdservices", icon: FaYoutube },
  { label: "WhatsApp", href: "https://wa.me/250781841929", icon: FaWhatsapp },
];
const WHATSAPP_CHANNEL = "https://wa.me/250781841929";

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

const headingClass = "text-[17px] font-semibold text-slate-300";
const linkClass = "text-sm text-slate-400 transition hover:text-white";

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h3 className={headingClass}>{title}</h3>
      <ul className="mt-3 space-y-3">
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
      <div className="mx-auto max-w-[1280px] px-5 pb-6 pt-12 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
          {/* BRAND */}
          <div>
            <Link href="/" className="flex items-center gap-2.5" aria-label="1M Scholars Ltd home">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#F5B335]/30 bg-[#F5B335]/10 font-serif text-sm font-bold text-[#F5B335]">
                1M
              </span>
              <span className="leading-tight">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">Kigali, Rwanda</span>
                <span className="block font-serif text-lg font-bold text-white">1M Scholars Ltd</span>
              </span>
            </Link>

            <p className="mt-4 max-w-[290px] text-sm leading-7 text-slate-400">
              Rwanda&apos;s trusted youth opportunity platform — connecting students, graduates and professionals to scholarships, jobs and skills training.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:border-[#F5B335]/50 hover:text-[#F5B335]"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <LinkColumn title="Opportunities" links={OPPORTUNITY_LINKS} />
          <LinkColumn title="Training" links={TRAINING_LINKS} />
          <LinkColumn title="Company" links={COMPANY_LINKS} />

          {/* CONTACT */}
          <div>
            <h3 className={headingClass}>Contact</h3>
            <ul className="mt-3 space-y-3 text-sm">
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
              <li>
                <a
                  href={WHATSAPP_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#F5B335] transition hover:text-[#ffc95e]"
                >
                  WhatsApp Channel <ArrowRight size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* DISCLAIMER */}
        <p className="mt-10 flex max-w-3xl items-start gap-2 text-xs leading-5 text-slate-500">
          <TriangleAlert size={14} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-slate-400">Important:</strong> 1M Scholars Ltd is a consultative agency. Fees paid cover guidance and application support services only. We do not guarantee admission, employment, scholarship awards, or placement. All final decisions rest with the respective institutions.
          </span>
        </p>

        {/* BOTTOM BAR */}
        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-5 text-sm text-slate-400 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-[#F5B335]/50 hover:text-[#F5B335]"
            >
              <ArrowUp size={16} />
            </button>
            <span>© {new Date().getFullYear()} 1M Scholars Ltd. All rights reserved.</span>
          </div>
          <span>@1MscholarsLtd on all platforms · @1mscholarsltdservices on YouTube</span>
        </div>
      </div>
    </footer>
  );
}