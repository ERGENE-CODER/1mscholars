"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import CardImage from "../component/CardImage";
import OpportunityCard from "../component/OpportunityCard";
import { EmptyState, ErrorState, PageSkeleton } from "../component/StateViews";
import { daysUntil, fetchOpportunity, fetchRelatedOpportunities, slugify, type Opportunity } from "@/lib/opportunities";
import { useAsync } from "@/lib/useAsync";

const LEVEL_LABELS: Record<string, string> = {
  undergraduate: "Undergraduate",
  graduate: "Graduate",
  both: "Undergraduate & Graduate",
};

/** Heading used for every block inside the details panel (same look as the FILTER box). */
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="relative mb-4 border-b border-slate-300 pb-2 text-[16px] font-bold uppercase tracking-wide text-[#12396B]">
      {children}
      <span className="absolute -bottom-px left-0 h-[3px] w-14 bg-[#F5B335]" aria-hidden="true" />
    </h2>
  );
}

/** A plain list whose lines wrap naturally, however long they are. */
function BulletList({ items, check = false }: { items: string[]; check?: boolean }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={`${i}-${item}`} className="flex gap-3 text-[15px] leading-6 text-slate-700">
          {check ? (
            <Check size={17} strokeWidth={3} className="mt-1 shrink-0 text-[#2166E8]" aria-hidden="true" />
          ) : (
            <span className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-[#2166E8]" aria-hidden="true" />
          )}
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Long lists (e.g. dozens of programs) show the first few lines, with a button to reveal the rest. */
function ProgramList({ items }: { items: string[] }) {
  const LIMIT = 8;
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, LIMIT);

  return (
    <>
      <ul className="gap-x-10 space-y-2 md:columns-2 md:space-y-0">
        {shown.map((item, i) => (
          <li key={`${i}-${item}`} className="flex break-inside-avoid gap-3 py-1 text-[14.5px] leading-6 text-slate-700">
            <span className="mt-[10px] h-1.5 w-1.5 shrink-0 bg-[#F5B335]" aria-hidden="true" />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
      {items.length > LIMIT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 inline-flex items-center gap-1.5 border border-[#2166E8] px-4 py-2 text-[13px] font-semibold text-[#2166E8] transition-colors hover:bg-[#EEF5FF]"
        >
          {expanded ? "Show fewer programs" : `Show all ${items.length} programs`}
          <ChevronDown size={15} className={`transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      )}
    </>
  );
}

/** The one place a visitor acts from: summary table + the main button. */
function GlanceBox({ o, closed, days, applyHref }: { o: Opportunity; closed: boolean; days: number | null; applyHref: string }) {
  const urgent = days !== null && days >= 0 && days <= 14;
  const rows: [string, ReactNode][] = [];
  if (o.category) rows.push(["Category", o.category]);
  rows.push(["Organization", o.organization]);
  if (o.country) rows.push(["Country", o.country]);
  if (o.location && o.location !== o.country) rows.push(["Location", o.location]);
  if (o.studyLevel) rows.push(["Level of study", LEVEL_LABELS[o.studyLevel] ?? o.studyLevel]);
  rows.push([
    "Deadline",
    <span key="d" className={urgent ? "text-[#B42318]" : undefined}>
      {o.deadlineLabel}
      {urgent && <span className="block text-[12px] font-bold">{days === 0 ? "Closes today" : `${days} day${days === 1 ? "" : "s"} left`}</span>}
    </span>,
  ]);
  rows.push([
    "Status",
    <span key="s" className={`inline-block px-2 py-0.5 text-[12px] font-bold uppercase tracking-wide ${closed ? "bg-slate-200 text-slate-600" : "bg-[#E3F4E8] text-[#17663A]"}`}>
      {closed ? "Closed" : "Open"}
    </span>,
  ]);

  return (
    <div className="border border-slate-300 bg-white">
      <div className="border-b-[3px] border-[#F5B335] bg-[#12396B] px-4 py-2.5">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-white">At a glance</h2>
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-2.5 text-[13.5px]">
            <dt className="shrink-0 text-slate-500">{label}</dt>
            <dd className="min-w-0 break-words text-right font-semibold text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="bg-slate-50 p-4">
        {closed ? (
          <>
            <span className="block cursor-not-allowed bg-slate-200 px-4 py-3 text-center text-[15px] font-bold text-slate-500">Applications Closed</span>
            <p className="mt-3 text-center text-[13px] text-slate-600">
              Have a question? <Link href="/contact" className="font-semibold text-[#2166E8] hover:underline">Contact us</Link>
            </p>
          </>
        ) : (
          <>
            <Link href={applyHref} className="block bg-[#2166E8] px-4 py-3 text-center text-[15px] font-bold text-white transition-colors hover:bg-[#1554C7]">
              Ask for Application Assistance
            </Link>
            <p className="mt-3 text-[12.5px] leading-5 text-slate-600">
              Our team guides you through the documents and submission. Final decisions rest with the institution.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OpportunityDetail({ id }: { id: number }) {
  const load = useCallback(async () => {
    const opportunity = await fetchOpportunity(id);
    if (!opportunity) return null;
    // Related items are secondary: if they fail, the page still renders.
    const related = await fetchRelatedOpportunities(opportunity).catch(() => []);
    return { opportunity, related };
  }, [id]);

  const { data, error, loading, retry } = useAsync(load);

  if (loading) return <PageSkeleton label="Loading opportunity" />;

  if (error) {
    return (
      <main className="min-h-screen bg-[#F8FAFD] px-5 py-16 text-[#102F59]">
        <div className="mx-auto max-w-xl">
          <ErrorState title="We couldn't load this opportunity" message={error.message} onRetry={retry} />
          <div className="mt-4 text-center"><Link href="/opportunities" className="text-sm font-bold text-[#2166E8]">← Back to Opportunities</Link></div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#F8FAFD] px-5 py-16 text-[#102F59]">
        <div className="mx-auto max-w-xl">
          <EmptyState>
            <h1 className="text-xl font-bold text-[#102F59]">Opportunity not found</h1>
            <p className="mt-2 text-sm">This opportunity may have been removed or is not available yet.</p>
            <Link href="/opportunities" className="mt-6 inline-flex h-11 items-center bg-[#2166E8] px-5 text-sm font-bold text-white">Back to Opportunities</Link>
          </EmptyState>
        </div>
      </main>
    );
  }

  const { opportunity: o, related } = data;
  const days = daysUntil(o.deadline);
  const closed = o.status === "closed" || (days !== null && days < 0);
  const applyHref = `/opportunities/assistance?opportunity=${o.id}`;

  // Only the sections that have content are shown (and linked from the jump bar).
  const sections = [
    { id: "overview", label: "Overview", show: Boolean(o.description) },
    { id: "eligibility", label: "Eligibility", show: o.requirements.length > 0 },
    { id: "benefits", label: "Benefits", show: o.benefits.length > 0 },
    { id: "programs", label: `Programs (${o.programs.length})`, show: o.programs.length > 0 },
  ].filter((s) => s.show);

  return (
    <main className="min-h-screen bg-[#F8FAFD] font-classic text-[#102F59]">
      <div className="mx-auto max-w-[1240px] px-5 pb-12 pt-4 sm:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 text-[13px] text-slate-500">
          <Link href="/opportunities" className="hover:text-[#2166E8] hover:underline">Opportunities</Link>
          {o.category && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={`/opportunities/${slugify(o.category)}`} className="hover:text-[#2166E8] hover:underline">{o.category}</Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="max-w-full truncate text-slate-700 sm:max-w-md">{o.title}</span>
        </nav>

        {/* Title */}
        <header className="mt-4 border-b border-slate-300 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {o.category && <span className="bg-[#12396B] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">{o.category}</span>}
            {o.featured && <span className="bg-[#F5B335] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#102F59]">Featured</span>}
            {closed && <span className="bg-slate-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Closed</span>}
          </div>
          <h1 className="mt-3 text-[24px] font-bold leading-snug sm:text-[28px]">{o.title}</h1>
          <p className="mt-1.5 text-[14px] text-slate-600">
            <span className="font-semibold text-[#2166E8]">{o.organization}</span>
            {o.location && <> · {o.location}</>}
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          {/* ONE panel holds the picture, overview, eligibility, benefits and programs */}
          <article className="min-w-0 border border-slate-300 bg-white">
            {o.image && (
              <div className="border-b border-slate-300 bg-[#E4ECF7]">
                <CardImage src={o.image} className="aspect-[16/8] max-h-[360px] w-full" iconSize={64} />
              </div>
            )}

            {sections.length > 1 && (
              <nav aria-label="On this page" className="flex flex-wrap gap-x-5 gap-y-1 border-b border-slate-300 bg-slate-50 px-5 py-2.5 text-[13px] font-semibold sm:px-6">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="text-[#2166E8] hover:underline">{s.label}</a>
                ))}
              </nav>
            )}

            {o.description && (
              <section id="overview" className="scroll-mt-[110px] border-t border-slate-200 px-5 py-5 first:border-t-0 sm:px-6">
                <SectionTitle>Overview</SectionTitle>
                <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700">{o.description}</p>
              </section>
            )}

            {o.requirements.length > 0 && (
              <section id="eligibility" className="scroll-mt-[110px] border-t border-slate-200 px-5 py-5 first:border-t-0 sm:px-6">
                <SectionTitle>Eligibility requirements</SectionTitle>
                <BulletList items={o.requirements} />
              </section>
            )}

            {o.benefits.length > 0 && (
              <section id="benefits" className="scroll-mt-[110px] border-t border-slate-200 px-5 py-5 first:border-t-0 sm:px-6">
                <SectionTitle>Benefits</SectionTitle>
                <BulletList items={o.benefits} check />
              </section>
            )}

            {o.programs.length > 0 && (
              <section id="programs" className="scroll-mt-[110px] border-t border-slate-200 px-5 py-5 first:border-t-0 sm:px-6">
                <SectionTitle>Programs ({o.programs.length})</SectionTitle>
                <ProgramList items={o.programs} />
              </section>
            )}

            {sections.length === 0 && <p className="px-5 py-6 text-[15px] text-slate-500 sm:px-6">More details about this opportunity will be added soon.</p>}
          </article>

          {/* Summary + main button: stays in view while the long panel is scrolled */}
          <aside className="lg:sticky lg:top-[112px]">
            <GlanceBox o={o} closed={closed} days={days} applyHref={applyHref} />
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="relative mb-6 border-b border-slate-300 pb-3 text-[20px] font-bold uppercase tracking-wide text-[#12396B]">
              Related Opportunities
              <span className="absolute -bottom-px left-0 h-[3px] w-20 bg-[#F5B335]" aria-hidden="true" />
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <OpportunityCard key={item.id} opportunity={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Phones and tablets: the button stays at the bottom of the screen */}
      <div className="sticky bottom-0 z-30 border-t border-slate-300 bg-white p-3 shadow-[0_-6px_16px_rgba(15,45,90,0.12)] lg:hidden">
        {closed ? (
          <span className="block bg-slate-200 px-4 py-3 text-center text-[15px] font-bold text-slate-500">Applications Closed</span>
        ) : (
          <Link href={applyHref} className="block bg-[#2166E8] px-4 py-3 text-center text-[15px] font-bold text-white transition-colors hover:bg-[#1554C7]">
            Ask for Application Assistance
          </Link>
        )}
      </div>
    </main>
  );
}
