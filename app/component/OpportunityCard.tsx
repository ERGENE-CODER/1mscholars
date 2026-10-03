import Link from "next/link";
import type { Opportunity } from "@/lib/opportunities";

export default function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const categoryLabel = opportunity.programs[0];
  const badge = opportunity.status === "closed" ? "Closed" : opportunity.featured ? "Featured" : undefined;
  const href = `/opportunities/${opportunity.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,45,90,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,45,90,0.12)]">
      <Link href={href} className="relative block aspect-[16/9] overflow-hidden bg-[#EEF5FF]">
        <img src={opportunity.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute left-4 top-4 flex gap-2">
          {categoryLabel && <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#2166E8] shadow-sm">{categoryLabel}</span>}
          {badge && <span className="rounded-full bg-[#12396B]/95 px-3 py-1 text-[11px] font-bold text-white">{badge}</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-slate-500">
          <span>{opportunity.organization}</span>
          {opportunity.location && (
            <>
              <span>•</span>
              <span>{opportunity.location}</span>
            </>
          )}
        </div>
        <Link href={href}>
          <h2 className="text-[18px] font-bold leading-6 text-[#102F59] transition group-hover:text-[#2166E8]">{opportunity.title}</h2>
        </Link>
        <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-slate-500">{opportunity.description}</p>

        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4">
          <div className="mr-auto min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Deadline</div>
            <div className="whitespace-nowrap text-[12px] font-bold text-[#102F59]">{opportunity.deadlineLabel}</div>
          </div>
          <Link href={`/opportunities/assistance?opportunity=${opportunity.id}`} className="whitespace-nowrap rounded-lg border border-[#BFD4F7] bg-[#F3F7FF] px-3 py-2 text-[11px] font-bold text-[#2166E8] transition hover:bg-[#E8F0FF]">
            Ask for Assistance
          </Link>
          <Link href={href} className="whitespace-nowrap rounded-lg bg-[#2166E8] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#1554C7]">
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
}
