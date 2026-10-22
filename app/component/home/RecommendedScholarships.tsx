"use client";

import Link from "next/link";
import CardImage from "../CardImage";
import { daysUntil, fetchRecommendedScholarships } from "@/lib/opportunities";
import { useAsync } from "@/lib/useAsync";

const COUNT = 5;
const load = () => fetchRecommendedScholarships(COUNT);

/** Compact list shown beside the hero carousel. */
export default function RecommendedScholarships() {
  const { data, error, loading, retry } = useAsync(load);

  return (
    <aside aria-label="Recommended scholarships" className="flex h-full flex-col border border-slate-300 bg-white font-classic">
      <div className="border-b-[3px] border-[#F5B335] bg-[#12396B] px-4 py-3">
        <h2 className="text-[14px] font-bold uppercase tracking-wide text-white">Recommended Scholarships</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <ul className="divide-y divide-slate-200" role="status" aria-label="Loading scholarships">
            {Array.from({ length: COUNT }, (_, i) => (
              <li key={i} className="flex animate-pulse gap-3 p-3">
                <div className="h-[58px] w-[76px] shrink-0 bg-slate-100" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-11/12 bg-slate-200" />
                  <div className="h-3 w-2/3 bg-slate-100" />
                  <div className="h-2.5 w-1/2 bg-slate-100" />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <div role="alert" className="p-5 text-sm text-slate-600">
            <p>We couldn&apos;t load the scholarships.</p>
            <button type="button" onClick={retry} className="mt-3 border border-[#2166E8] px-3 py-1.5 text-[13px] font-semibold text-[#2166E8] hover:bg-[#EEF5FF]">
              Try again
            </button>
          </div>
        ) : data && data.length > 0 ? (
          <ul className="divide-y divide-slate-200">
            {data.map((o) => {
              const days = daysUntil(o.deadline);
              const urgent = days !== null && days >= 0 && days <= 14;
              return (
                <li key={o.id}>
                  <Link href={`/opportunities/${o.slug}`} className="group flex gap-3 p-3 transition-colors hover:bg-[#F3F7FF]">
                    <CardImage src={o.image} className="h-[58px] w-[76px] shrink-0 border border-slate-200" iconSize={24} />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[13.5px] font-bold leading-snug text-[#12396B] group-hover:text-[#2166E8] group-hover:underline">{o.title}</span>
                      <span className="mt-0.5 block truncate text-[12px] text-slate-500">{o.organization}{o.country ? ` · ${o.country}` : ""}</span>
                      <span className={`mt-0.5 block text-[12px] ${urgent ? "font-semibold text-[#B42318]" : "text-slate-600"}`}>
                        Deadline: {o.deadlineLabel}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-5 text-sm text-slate-500">No scholarships are open right now. Please check back soon.</p>
        )}
      </div>

      <div className="border-t border-slate-300 bg-slate-50 p-3 text-center">
        <Link href="/opportunities/scholarships" className="text-[13px] font-semibold text-[#2166E8] hover:underline">
          View all scholarships »
        </Link>
      </div>
    </aside>
  );
}
