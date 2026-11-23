"use client";

import { useEffect, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { X } from "lucide-react";
import { WHATSAPP_GROUP_URL } from "@/lib/site-links";

/**
 * Centered pop-up inviting visitors to the WhatsApp group.
 * It does not decide WHEN to appear: HomePopups does (so two pop-ups never overlap).
 * onClose(true) = the visitor clicked "Join", onClose(false) = they dismissed it.
 */
export default function WhatsAppPopup({ onClose }: { onClose: (acted: boolean) => void }) {
  const joinRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    joinRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => onClose(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wa-popup-title"
        aria-describedby="wa-popup-text"
        onClick={(e) => e.stopPropagation()}
        className="popup-in relative w-full max-w-md overflow-hidden border border-slate-300 bg-white font-classic shadow-2xl"
      >
        <div className="flex items-center gap-3 bg-[#25D366] px-5 py-4 text-white">
          <FaWhatsapp size={34} aria-hidden="true" />
          <h2 id="wa-popup-title" className="text-lg font-bold leading-tight">
            Join our WhatsApp group
          </h2>
        </div>

        <button
          type="button"
          onClick={() => onClose(false)}
          aria-label="Close"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center text-white/90 transition hover:bg-black/10"
        >
          <X size={20} />
        </button>

        <div className="px-5 py-5">
          <p id="wa-popup-text" className="text-[14px] leading-6 text-slate-700">
            Get <strong>instant updates</strong> on new scholarships, jobs and deadlines, and ask our team your questions anytime. It&apos;s free to join.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <a
              ref={joinRef}
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClose(true)}
              className="flex flex-1 items-center justify-center gap-2 bg-[#25D366] px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-[#1EBE5A]"
            >
              <FaWhatsapp size={18} aria-hidden="true" /> Join the Group
            </a>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="border border-slate-300 px-4 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
