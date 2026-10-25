"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import OpportunityCard from "../component/OpportunityCard";
import { EmptyState, ErrorState, OpportunityGridSkeleton } from "../component/StateViews";
import OpportunityFilter from "./OpportunityFilter";
import {
  deriveCategories,
  fetchPublishedOpportunities,
  inCategory,
  matchesDeadline,
  matchesLevel,
  prettifySlug,
  sameCategory,
  type DeadlineFilter,
  type LevelFilter,
} from "@/lib/opportunities";
import { useAsync } from "@/lib/useAsync";

export default function OpportunityListing({ initialCategory }: { initialCategory?: string }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const selected = initialCategory && initialCategory !== "all" ? initialCategory.toLowerCase() : "all";

  // Filters chosen in the FILTER box live in the address bar (?country=…&deadline=…).
  const params = useSearchParams();
  const country = params.get("country")?.trim() || "all";
  const rawDeadline = params.get("deadline");
  const deadline: DeadlineFilter = rawDeadline === "open" || rawDeadline === "soon" ? rawDeadline : "any";

  const rawLevel = params.get("level");
  const level: LevelFilter = rawLevel === "undergraduate" || rawLevel === "graduate" ? rawLevel : "any";

  const { data: opportunities, error, loading, retry } = useAsync(fetchPublishedOpportunities);

  // Categories come from opportunity_programs / the category column; a category linked from the
  // header that has no opportunities yet is still shown (and highlighted).
  const categories = useMemo(() => {
    const list = deriveCategories(opportunities ?? []);
    if (selected !== "all" && !list.some((c) => sameCategory(c.name, selected))) {
      list.push({ slug: selected, name: prettifySlug(selected) });
    }
    return list;
  }, [opportunities, selected]);

  const countries = useMemo(() => {
    const seen = new Map<string, string>();
    for (const o of opportunities ?? []) {
      const c = o.country?.trim();
      if (c && !seen.has(c.toLowerCase())) seen.set(c.toLowerCase(), c);
    }
    if (country !== "all" && !seen.has(country.toLowerCase())) seen.set(country.toLowerCase(), country);
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [opportunities, country]);

  const selectedName = categories.find((c) => sameCategory(c.name, selected))?.name ?? prettifySlug(selected);
  const filtersActive = selected !== "all" || country !== "all" || deadline !== "any" || level !== "any";

  const filtered = useMemo(() => {
    const base = (opportunities ?? []).filter(
      (item) =>
        (selected === "all" || inCategory(item, selected)) &&
        (country === "all" || item.country?.trim().toLowerCase() === country.toLowerCase()) &&
        matchesDeadline(item, deadline) &&
        matchesLevel(item, level)
    );
    const q = query.trim().toLowerCase();
    const searched = q ? base.filter((item) => `${item.title} ${item.description} ${item.organization}`.toLowerCase().includes(q)) : base;
    return [...searched].sort((a, b) => (sort === "az" ? a.title.localeCompare(b.title) : b.createdAt.localeCompare(a.createdAt)));
  }, [opportunities, query, selected, sort, country, deadline, level]);

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

        <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          {/* FILTER (left on large screens, above the list on small ones) */}
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <OpportunityFilter
              key={`${selected}|${country}|${deadline}|${level}`}
              categories={categories}
              countries={countries}
              type={selected}
              country={country}
              deadline={deadline}
              level={level}
              active={filtersActive}
            />
          </div>

          <div className="min-w-0">
            <div className="mb-5 flex flex-col gap-3 border border-slate-300 bg-white p-3 sm:flex-row">
              <label className="flex min-w-0 flex-1 items-center gap-3 bg-[#F8FAFD] px-4 py-2.5">
                <span className="text-slate-400">⌕</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search opportunities..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
              </label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#102F59] outline-none">
                <option value="newest">Newest First</option>
                <option value="az">Title A–Z</option>
              </select>
            </div>

            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-300 pb-2">
              <h2 className="text-lg font-bold">{selected === "all" ? "All Opportunities" : selectedName}</h2>
              {!loading && !error && <p className="text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"} found</p>}
            </div>

            {loading ? (
              <OpportunityGridSkeleton />
            ) : error ? (
              <ErrorState title="We couldn't load opportunities" message={error.message} onRetry={retry} />
            ) : filtered.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} />)}</div>
            ) : (
              <EmptyState>
                {query.trim() || filtersActive ? (
                  <>
                    No opportunities match your search or filters.
                    {filtersActive && <> <Link href="/opportunities" className="font-semibold text-[#2166E8] hover:underline">Reset filters</Link></>}
                  </>
                ) : (
                  "No opportunities are available right now. Please check back soon."
                )}
              </EmptyState>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
