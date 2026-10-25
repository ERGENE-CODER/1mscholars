"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { sameCategory, type Category, type DeadlineFilter, type LevelFilter } from "@/lib/opportunities";

const selectClass =
  "h-10 w-full border border-slate-400 bg-slate-100 px-3 text-[14px] text-slate-800 outline-none focus:border-[#2166E8] focus:bg-white";

const DEADLINE_OPTIONS: { value: DeadlineFilter; label: string }[] = [
  { value: "any", label: "Any deadline" },
  { value: "open", label: "Still open" },
  { value: "soon", label: "Closing within 30 days" },
];

const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: "any", label: "All levels" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
];

/**
 * "FILTER" box with drop-downs and a Submit button. Choosing options and pressing Submit
 * reloads the list through the address bar, so a filtered page can be bookmarked or shared.
 */
export default function OpportunityFilter({
  categories,
  countries,
  type,
  country,
  deadline,
  level,
  active,
}: {
  categories: Category[];
  countries: string[];
  type: string; // category slug or "all"
  country: string; // "all" or a country name
  deadline: DeadlineFilter;
  level: LevelFilter;
  active: boolean; // any filter currently applied
}) {
  const router = useRouter();
  const [typeValue, setTypeValue] = useState(type);
  const [countryValue, setCountryValue] = useState(country);
  const [deadlineValue, setDeadlineValue] = useState<DeadlineFilter>(deadline);
  const [levelValue, setLevelValue] = useState<LevelFilter>(level);
  // The level drop-down only applies to scholarships.
  const showLevel = sameCategory(typeValue, "scholarships");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (countryValue !== "all") params.set("country", countryValue);
    if (deadlineValue !== "any") params.set("deadline", deadlineValue);
    if (showLevel && levelValue !== "any") params.set("level", levelValue);
    const qs = params.toString();
    const path = typeValue === "all" ? "/opportunities" : `/opportunities/${typeValue}`;
    router.push(qs ? `${path}?${qs}` : path);
  }

  return (
    <form onSubmit={onSubmit} aria-label="Filter opportunities" className="border border-slate-300 bg-white p-4 font-classic">
      <h2 className="relative border-b border-slate-300 pb-2 text-[17px] font-bold uppercase text-[#12396B]">
        Filter
        <span className="absolute -bottom-px left-0 h-[3px] w-14 bg-[#F5B335]" aria-hidden="true" />
      </h2>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold text-slate-600">Type of opportunity</span>
          <select value={typeValue} onChange={(e) => setTypeValue(e.target.value)} className={selectClass}>
            <option value="all">All Types</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {showLevel && (
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-slate-600">Level of study</span>
            <select value={levelValue} onChange={(e) => setLevelValue(e.target.value as LevelFilter)} className={selectClass}>
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold text-slate-600">Country</span>
          <select value={countryValue} onChange={(e) => setCountryValue(e.target.value)} className={selectClass}>
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold text-slate-600">Deadline</span>
          <select value={deadlineValue} onChange={(e) => setDeadlineValue(e.target.value as DeadlineFilter)} className={selectClass}>
            {DEADLINE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button type="submit" className="bg-[#F5B335] px-6 py-2 text-[14px] font-bold text-[#102F59] transition hover:bg-[#E6A21F]">
          Submit
        </button>
        {active && (
          <Link href="/opportunities" className="text-[13px] font-semibold text-[#2166E8] hover:underline">
            Reset filters
          </Link>
        )}
      </div>
    </form>
  );
}
