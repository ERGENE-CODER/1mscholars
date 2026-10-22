"use client";

import { usePathname } from "next/navigation";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { SOCIAL_URLS } from "@/lib/site-links";

// Brand colours, as in the reference design. Order = order on screen.
const LINKS = [
  { label: "YouTube", href: SOCIAL_URLS.youtube, icon: FaYoutube, className: "bg-[#FF0000]" },
  { label: "WhatsApp", href: SOCIAL_URLS.whatsapp, icon: FaWhatsapp, className: "bg-[#25D366]" },
  { label: "Facebook", href: SOCIAL_URLS.facebook, icon: FaFacebookF, className: "bg-[#1877F2]" },
  { label: "X (Twitter)", href: SOCIAL_URLS.twitter, icon: FaXTwitter, className: "bg-black" },
  { label: "TikTok", href: SOCIAL_URLS.tiktok, icon: FaTiktok, className: "bg-[#111111]" },
  {
    label: "Instagram",
    href: SOCIAL_URLS.instagram,
    icon: FaInstagram,
    className: "bg-gradient-to-tr from-[#F9A03F] via-[#E1306C] to-[#833AB4]",
  },
] as const;

/** "Thursday, October 22nd, 2026" (always in Rwanda time, so server and browser agree). */
function formatToday() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Kigali",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = Number(get("day"));
  const suffix = day % 100 >= 11 && day % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th";
  return `${get("weekday")}, ${get("month")} ${day}${suffix}, ${get("year")}`;
}

export default function SocialBar() {
  const pathname = usePathname();
  // The admin panel has its own top bar.
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#2166E8] via-[#1A52B8] to-[#12396B] text-white">
      <div className="mx-auto flex h-11 max-w-[1600px] items-center justify-between px-6 sm:px-8 lg:px-10 xl:px-12">
        <span className="hidden text-[13px] font-medium sm:block" suppressHydrationWarning>
          {formatToday()}
        </span>
        <span className="text-[13px] font-medium sm:hidden">Follow us</span>

        <ul className="flex items-center gap-2" aria-label="Social media">
          {LINKS.map(({ label, href, icon: Icon, className }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className={`flex h-7 w-7 items-center justify-center rounded-[5px] text-white transition hover:-translate-y-0.5 hover:brightness-110 ${className}`}
              >
                <Icon size={14} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
