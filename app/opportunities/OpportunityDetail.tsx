"use client";

import { useCallback } from "react";
import Link from "next/link";
import OpportunityCard from "../component/OpportunityCard";
import { EmptyState, ErrorState, PageSkeleton } from "../component/StateViews";
import { fetchApplicationForm } from "@/lib/applications";
import { fetchOpportunity, fetchRelatedOpportunities } from "@/lib/opportunities";
import { useAsync } from "@/lib/useAsync";

export default function OpportunityDetail({ id }: { id: number }) {
  const load = useCallback(async () => {
    const opportunity = await fetchOpportunity(id);
    if (!opportunity) return null;
    // The form and related items are secondary: if they fail, the page still renders.
    const [form, related] = await Promise.all([
      fetchApplicationForm(id).catch(() => null),
      fetchRelatedOpportunities(opportunity).catch(() => []),
    ]);
    return { opportunity, form, related };
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
            <Link href="/opportunities" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2166E8] px-5 text-sm font-bold text-white">Back to Opportunities</Link>
          </EmptyState>
        </div>
      </main>
    );
  }

  const { opportunity, form, related } = data;
  const isClosed = opportunity.status === "closed";
  const assistanceHref = `/opportunities/assistance?opportunity=${opportunity.id}`;
  const hasForm = Boolean(form && form.fields.length);

  return (
    <main className="min-h-screen bg-[#F8FAFD] pb-16 text-[#102F59]">
      <div className="mx-auto max-w-[1100px] px-5 pt-6 sm:px-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-400"><Link href="/opportunities" className="hover:text-[#2166E8]">Opportunities</Link>{opportunity.programs[0] && <><span>/</span><span>{opportunity.programs[0]}</span></>}<span>/</span><span className="text-slate-600">{opportunity.title}</span></div>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,45,90,0.07)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="min-h-[280px] bg-[#EEF5FF]"><img src={opportunity.image} alt="" className="h-full min-h-[280px] w-full object-cover" /></div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">{opportunity.programs.map((program) => <span key={program} className="rounded-full bg-[#EEF5FF] px-3 py-1 text-[11px] font-bold text-[#2166E8]">{program}</span>)}{opportunity.featured && <span className="rounded-full bg-[#E9F8EF] px-3 py-1 text-[11px] font-bold text-emerald-700">Featured</span>}</div>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-[#102F59]">{opportunity.title}</h1>
              <p className="mt-3 text-sm font-semibold text-[#2166E8]">{opportunity.organization}</p>
              {opportunity.location && <p className="mt-1 text-sm text-slate-500">{opportunity.location}</p>}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[['Country', opportunity.country || '—'], ['Organization', opportunity.organization], ['Deadline', opportunity.deadlineLabel], ['Status', isClosed ? 'Closed' : 'Open']].map(([label, value]) => <div key={label} className="rounded-xl bg-[#F8FAFD] p-3"><div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 text-xs font-bold text-[#102F59]">{value}</div></div>)}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={assistanceHref} className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-[#BFD4F7] bg-[#F3F7FF] px-5 text-sm font-bold text-[#2166E8]">Ask for Assistance</Link>
                {isClosed
                  ? <span className="inline-flex h-12 flex-1 cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 px-5 text-sm font-bold text-slate-500">Applications Closed</span>
                  : <a href="#application" className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#2166E8] px-5 text-sm font-bold text-white hover:bg-[#1554C7]">Apply Now</a>}
              </div>
            </div>
          </div>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {opportunity.description && <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><h2 className="text-lg font-bold">Description</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{opportunity.description}</p></section>}
            {opportunity.requirements.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><h2 className="text-lg font-bold">Eligibility Requirements</h2><ul className="mt-4 space-y-3">{opportunity.requirements.map((item, i) => <li key={`${i}-${item}`} className="flex gap-3 text-sm leading-6 text-slate-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2166E8]" />{item}</li>)}</ul></section>}
            {opportunity.benefits.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><h2 className="text-lg font-bold">Benefits / What You Get</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{opportunity.benefits.map((item, i) => <li key={`${i}-${item}`} className="rounded-xl bg-[#F8FAFD] p-4 text-sm font-semibold text-slate-600">✓ {item}</li>)}</ul></section>}
            <section id="application" className="rounded-2xl border border-[#CFE0FB] bg-[#EEF5FF] p-6 sm:p-8">
              <h2 className="text-lg font-bold text-[#12396B]">{form?.title || "Application Information"}</h2>
              {hasForm && form ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{form.description || "Have your information ready. The application asks for the details below."}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{form.fields.map((field) => <span key={field.id} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#102F59]">{field.label}</span>)}</div>
                  {!isClosed && <Link href={assistanceHref} className="mt-5 inline-flex h-11 items-center rounded-xl bg-[#2166E8] px-5 text-sm font-bold text-white hover:bg-[#1554C7]">Start Application →</Link>}
                </>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-600">The application form for this opportunity isn&apos;t available yet. Please check back soon.</p>
              )}
            </section>
          </div>
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6"><div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Application deadline</div><div className="mt-2 text-2xl font-bold text-[#102F59]">{opportunity.deadlineLabel}</div><div className="mt-4 h-px bg-slate-100" /><p className="mt-4 text-sm leading-6 text-slate-500">Deadlines and requirements are set by the organisation. Please confirm the details before you apply.</p><Link href={assistanceHref} className="mt-5 flex h-11 items-center justify-center rounded-xl bg-[#2166E8] text-sm font-bold text-white">Get Application Assistance</Link></aside>
        </div>
        {related.length > 0 && <section className="mt-12"><h2 className="text-2xl font-bold">Related Opportunities</h2><div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{related.map(item => <OpportunityCard key={item.id} opportunity={item} />)}</div></section>}
      </div>
    </main>
  );
}
