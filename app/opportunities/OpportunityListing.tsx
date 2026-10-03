"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import OpportunityCard from "../component/OpportunityCard";
import { EmptyState, ErrorState, OpportunityGridSkeleton } from "../component/StateViews";
import { deriveCategories, fetchPublishedOpportunities, inCategory, prettifySlug, sameCategory } from "@/lib/opportunities";
import { useAsync } from "@/lib/useAsync";

export default function OpportunityListing({ initialCategory }: { initialCategory?: string }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const selected = initialCategory && initialCategory !== "all" ? initialCategory.toLowerCase() : "all";

  const { data: opportunities, error, loading, retry } = useAsync(fetchPublishedOpportunities);

  // Categories come from opportunity_programs; a category linked from the header that has no
  // opportunities yet is still shown (and highlighted) so the page doesn't look broken.
  const categories = useMemo(() => {
    const list = deriveCategories(opportunities ?? []);
    if (selected !== "all" && !list.some((c) => sameCategory(c.name, selected))) {
      list.push({ slug: selected, name: prettifySlug(selected) });
    }
    return list;
  }, [opportunities, selected]);

  const selectedName = categories.find((c) => sameCategory(c.name, selected))?.name ?? prettifySlug(selected);

  const filtered = useMemo(() => {
    const base = (opportunities ?? []).filter((item) => selected === "all" || inCategory(item, selected));
    const q = query.trim().toLowerCase();
    const searched = q ? base.filter((item) => `${item.title} ${item.description} ${item.organization}`.toLowerCase().includes(q)) : base;
    return [...searched].sort((a, b) => (sort === "az" ? a.title.localeCompare(b.title) : b.createdAt.localeCompare(a.createdAt)));
  }, [opportunities, query, selected, sort]);

  const heading = selected === "all" ? "Find Your Next Opportunity" : `${selectedName} Opportunities`;

  return (
    <main className="min-h-screen bg-[#F8FAFD] text-[#102F59]">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 lg:py-12">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full bg-[#EEF5FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#2166E8]">Opportunities</div>
            <h1 className="text-3xl font-bold tracking-tight text-[#102F59] sm:text-4xl">{heading}</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-6 text-slate-500">Explore scholarships, jobs, internships, fellowships, training and competitions from trusted organisations and programmes.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-7 sm:px-8">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <Link href="/opportunities" className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-bold ${selected === "all" ? "bg-[#2166E8] text-white" : "border border-slate-200 bg-white text-slate-600 hover:text-[#2166E8]"}`}>All</Link>
          {categories.map((category) => {
            const active = selected !== "all" && sameCategory(category.name, selected);
            return (
              <Link key={category.slug} href={`/opportunities/${category.slug}`} className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-bold ${active ? "bg-[#2166E8] text-white" : "border border-slate-200 bg-white text-slate-600 hover:text-[#2166E8]"}`}>{category.name}</Link>
            );
          })}
        </div>

        <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-[#F8FAFD] px-4 py-3">
            <span className="text-slate-400">⌕</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search opportunities..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#102F59] outline-none">
            <option value="newest">Newest First</option>
            <option value="az">Title A–Z</option>
          </select>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{selected === "all" ? "All Opportunities" : selectedName}</h2>
            {!loading && !error && <p className="mt-1 text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"} available</p>}
          </div>
        </div>

        {loading ? (
          <OpportunityGridSkeleton />
        ) : error ? (
          <ErrorState title="We couldn't load opportunities" message={error.message} onRetry={retry} />
        ) : filtered.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} />)}</div>
        ) : (
          <EmptyState>{query.trim() ? "No opportunities match your search." : selected === "all" ? "No opportunities are available right now. Please check back soon." : `No ${selectedName.toLowerCase()} opportunities are available right now.`}</EmptyState>
        )}
      </section>
    </main>
  );
}
