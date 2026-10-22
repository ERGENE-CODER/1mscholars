"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import OpportunityCard from "../OpportunityCard";
import { EmptyState, ErrorState, OpportunityGridSkeleton } from "../StateViews";
import { fetchLatestOpportunities } from "@/lib/opportunities";
import { useAsync } from "@/lib/useAsync";

const COUNT = 6;
const load = () => fetchLatestOpportunities(COUNT);

export default function LatestOpportunities() {
  const { data, error, loading, retry } = useAsync(load);

  return (
    <section className="bg-[#F8FAFD] py-14 sm:py-16">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-300 pb-3 font-classic">
          <div>
            <h2 className="relative text-[22px] font-bold uppercase tracking-wide text-[#12396B] sm:text-[24px]">
              Latest Opportunities
              <span className="absolute -bottom-[13px] left-0 h-[3px] w-20 bg-[#F5B335]" aria-hidden="true" />
            </h2>
            <p className="mt-2 text-[14px] text-slate-500">Freshly published scholarships, jobs, internships, fellowships and training.</p>
          </div>
          <Link href="/opportunities" className="text-[13px] font-semibold text-[#2166E8] hover:underline">View all »</Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <OpportunityGridSkeleton count={COUNT} />
          ) : error ? (
            <ErrorState title="We couldn't load opportunities" message={error.message} onRetry={retry} />
          ) : data && data.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          ) : (
            <EmptyState>No opportunities are available right now. Please check back soon.</EmptyState>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/opportunities"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#2166E8] px-7 text-sm font-bold text-white transition hover:bg-[#1554C7]"
          >
            View All Opportunities <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
