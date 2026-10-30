"use client";

import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { X } from "lucide-react";
import { WHATSAPP_GROUP_URL } from "@/lib/site-links";

const STORAGE_KEY = "1ms-whatsapp-popup";
const SHOW_AFTER_MS = 5000; // wait 5 seconds before showing
const HIDE_FOR_DAYS = 0; // after a visitor closes it, don't show again for a week

function recentlyDismissed(): boolean {
  try {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY));
    return Boolean(saved) && Date.now() - saved < HIDE_FOR_DAYS * 86_400_000;
  } catch {
    return false; // storage blocked: just show it
  }
}

function remember() {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export default function WhatsAppPopup() {
  const [open, setOpen] = useState(false);
  const joinRef = useRef<HTMLAnchorElement>(null);

  // Show once, a few seconds after the page opens.
  useEffect(() => {
    if (recentlyDismissed()) return;
    const id = window.setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []);

  // While open: focus the main button, close with Escape.
  useEffect(() => {
    if (!open) return;
    joinRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        remember();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const close = () => {
    remember();
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wa-popup-title"
        aria-describedby="wa-popup-text"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden border border-slate-300 bg-white font-classic shadow-2xl"
      >
        <div className="flex items-center gap-3 bg-[#25D366] px-5 py-4 text-white">
          <FaWhatsapp size={34} aria-hidden="true" />
          <h2 id="wa-popup-title" className="text-lg font-bold leading-tight">
            Join our WhatsApp group
          </h2>
        </div>

        <button
          type="button"
          onClick={close}
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
              onClick={close}
              className="flex flex-1 items-center justify-center gap-2 bg-[#25D366] px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-[#1EBE5A]"
            >
              <FaWhatsapp size={18} aria-hidden="true" /> Join the Group
            </a>
            <button
              type="button"
              onClick={close}
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
