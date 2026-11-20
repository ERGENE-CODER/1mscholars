"use client";

import { useEffect, useRef, useState } from "react";
import { fetchSiteStats } from "@/lib/site-stats";
import { useAsync } from "@/lib/useAsync";

/** Counts up from 0 to `value` the first time it scrolls into view (instant if the visitor prefers reduced motion). */
function CountUp({ value, suffix = "" }: { value: number | undefined; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || value === undefined) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 0 : 1600;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const t = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, value]);

  return (
    <span ref={ref} aria-label={value === undefined ? undefined : `${value.toLocaleString("en-GB")}${suffix}`}>
      <span aria-hidden="true">
        {shown.toLocaleString("en-GB")}
        {suffix}
      </span>
    </span>
  );
}

export default function StatsCounter() {
  // Every number is counted live from the database. If they can't be loaded we
  // show a dash rather than a wrong number.
  const { data, error, loading } = useAsync(fetchSiteStats);
  const failed = !loading && Boolean(error);

  const items: { label: string; value?: number }[] = [
    { label: "Active Opportunities", value: data?.activeOpportunities },
    { label: "Youth Supported", value: data?.youthSupported },
    { label: "Colleges Covered", value: data?.collegesCovered },
    { label: "Training Programs", value: data?.trainingPrograms },
  ];

  return (
    <section aria-label="1M Scholars in numbers" className="border-y border-[#0E1B33] bg-[#050B18] py-14 sm:py-16">
      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-x-6 gap-y-10 px-5 text-center sm:px-8 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="font-serif text-5xl font-bold leading-none text-[#F5B335] sm:text-6xl">
              {failed ? "—" : <CountUp value={item.value} />}
            </div>
            <p className="mt-3 text-sm text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
