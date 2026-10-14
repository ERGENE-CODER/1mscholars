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
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-[#EEF5FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#2166E8]">Opportunities</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102F59] sm:text-4xl">Latest Opportunities</h2>
          <p className="mt-3 text-[15px] leading-6 text-slate-500">Freshly published scholarships, jobs, internships, fellowships and training, picked for students and young professionals.</p>
        </div>

        <div className="mt-10">
          {loading ? (
            <OpportunityGridSkeleton count={COUNT} />
          ) : error ? (
            <ErrorState title="We couldn't load opportunities" message={error.message} onRetry={retry} />
          ) : data && data.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2166E8] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#1554C7]"
          >
            View All Opportunities <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
