"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WhatsAppPopup from "./WhatsAppPopup";
import YouTubePopup from "./YouTubePopup";

/* =========================================================
   POP-UP SCHEDULE: change the numbers here
   ========================================================= */

type PopupId = "whatsapp" | "youtube";

/** Order the pop-ups appear in. */
const ORDER: PopupId[] = ["whatsapp", "youtube"];

/** Seconds after the page opens before the FIRST pop-up. */
const FIRST_DELAY_SECONDS = 2;

/** Quiet time after one pop-up closes before the NEXT one may appear. */
const GAP_SECONDS = 3;

/** Days a pop-up stays hidden after the visitor closes it, or after they click its button. */
const HIDE_DAYS: Record<PopupId, { closed: number; clicked: number }> = {
  whatsapp: { closed: 1, clicked: 1 },
  youtube: { closed: 1, clicked: 1 },
};

/* ========================================================= */

const DAY_MS = 86_400_000;
const hiddenKey = (id: PopupId) => `1ms-popup-${id}-hidden-until`;
const SESSION_KEY = "1ms-popups-shown-this-visit";

function isHidden(id: PopupId): boolean {
  try {
    return Date.now() < Number(window.localStorage.getItem(hiddenKey(id)) ?? 0);
  } catch {
    return false; // storage blocked: behave as if nothing was dismissed
  }
}

function hideFor(id: PopupId, days: number) {
  try {
    window.localStorage.setItem(hiddenKey(id), String(Date.now() + days * DAY_MS));
  } catch {
    /* ignore */
  }
}

function shownThisVisit(): PopupId[] {
  try {
    return JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "[]") as PopupId[];
  } catch {
    return [];
  }
}

function markShownThisVisit(id: PopupId) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify([...shownThisVisit(), id]));
  } catch {
    /* ignore */
  }
}

/**
 * Shows the homepage pop-ups ONE AT A TIME, spaced out:
 *   first one after FIRST_DELAY_SECONDS, the next one GAP_SECONDS after the previous is closed.
 * A pop-up that was closed (or clicked) stays hidden for days, and each pop-up shows at most once
 * per visit, so coming back to the homepage doesn't bring them back.
 */
export default function HomePopups() {
  const [active, setActive] = useState<PopupId | null>(null);
  const queue = useRef<PopupId[]>([]);
  const timer = useRef<number | undefined>(undefined);

  const scheduleNext = useCallback((seconds: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const next = queue.current.shift();
      if (!next) return;
      markShownThisVisit(next);
      setActive(next);
    }, seconds * 1000);
  }, []);

  useEffect(() => {
    const seen = shownThisVisit();
    queue.current = ORDER.filter((id) => !isHidden(id) && !seen.includes(id));
    if (queue.current.length > 0) scheduleNext(FIRST_DELAY_SECONDS);
    return () => window.clearTimeout(timer.current);
  }, [scheduleNext]);

  const closeWhatsApp = useCallback(
    (clicked: boolean) => {
      hideFor("whatsapp", clicked ? HIDE_DAYS.whatsapp.clicked : HIDE_DAYS.whatsapp.closed);
      setActive(null);
      if (queue.current.length > 0) scheduleNext(GAP_SECONDS);
    },
    [scheduleNext]
  );

  const closeYouTube = useCallback(
    (clicked: boolean) => {
      hideFor("youtube", clicked ? HIDE_DAYS.youtube.clicked : HIDE_DAYS.youtube.closed);
      setActive(null);
      if (queue.current.length > 0) scheduleNext(GAP_SECONDS);
    },
    [scheduleNext]
  );

  if (active === "whatsapp") return <WhatsAppPopup onClose={closeWhatsApp} />;
  if (active === "youtube") return <YouTubePopup onClose={closeYouTube} />;
  return null;
}
