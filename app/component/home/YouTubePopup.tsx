"use client";

import { useEffect } from "react";
import { FaYoutube } from "react-icons/fa6";
import { X } from "lucide-react";
import { YOUTUBE_SUBSCRIBE_URL } from "@/lib/site-links";

/**
 * Small corner card inviting visitors to subscribe on YouTube. Unlike the WhatsApp pop-up it
 * has no dark backdrop and doesn't take focus, so it never blocks the page.
 * onClose(true) = clicked "Subscribe", onClose(false) = dismissed.
 */
export default function YouTubePopup({ onClose }: { onClose: (acted: boolean) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="yt-popup-title"
      aria-describedby="yt-popup-text"
      className="popup-in fixed inset-x-4 bottom-4 z-50 border border-slate-300 bg-white font-classic shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[300px]"
    >
      <div className="flex items-center gap-2.5 bg-[#FF0000] px-3.5 py-2.5 text-white">
        <FaYoutube size={24} aria-hidden="true" />
        <h2 id="yt-popup-title" className="text-[14.5px] font-bold leading-tight">
          Subscribe to 1M Scholars
        </h2>
      </div>

      <button
        type="button"
        onClick={() => onClose(false)}
        aria-label="Close"
        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center text-white/90 transition hover:bg-black/15"
      >
        <X size={16} />
      </button>

      <div className="px-3.5 py-3">
        <p id="yt-popup-text" className="text-[13px] leading-5 text-slate-700">
          Watch our videos on scholarships, jobs and skills training, and be the first to see new ones. Subscribe to our YouTube channel.
        </p>
        <div className="mt-3 flex items-center gap-2.5">
          <a
            href={YOUTUBE_SUBSCRIBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onClose(true)}
            className="flex flex-1 items-center justify-center gap-2 bg-[#FF0000] px-3.5 py-2 text-[13.5px] font-bold text-white transition-colors hover:bg-[#CC0000]"
          >
            <FaYoutube size={16} aria-hidden="true" /> Subscribe
          </a>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-2 py-1.5 text-[12.5px] font-semibold text-slate-500 transition hover:text-[#102F59]"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}