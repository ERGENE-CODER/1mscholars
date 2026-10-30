import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import CardImage from "./CardImage";
import { daysUntil, type Opportunity } from "@/lib/opportunities";

/**
 * Classic portal-style card: square corners, thin borders, a ribbon label on the picture
 * and a small label/value table (Country, Deadline) above the summary.
 */
export default function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const category = opportunity.category;
  const href = `/opportunities/${opportunity.slug}`;
  const closed = opportunity.status === "closed";
  const days = daysUntil(opportunity.deadline);
  const expired = days !== null && days < 0;
  const urgent = days !== null && days >= 0 && days <= 14;
  const where = opportunity.location || opportunity.country;

  return (
    <article className="group flex h-full flex-col border border-slate-300 bg-white font-classic transition-colors hover:border-[#2166E8]">
      <Link href={href} className="relative block aspect-[3/2] overflow-hidden border-b border-slate-300 bg-[#E4ECF7]" tabIndex={-1} aria-hidden="true">
        <CardImage src={opportunity.image} className="h-full w-full" iconSize={56} />
        {category && (
          <span className="absolute left-0 top-3 bg-[#12396B] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">{category}</span>
        )}
        {(opportunity.featured || closed) && (
          <span className={`absolute right-0 top-3 px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${closed ? "bg-slate-600 text-white" : "bg-[#F5B335] text-[#102F59]"}`}>
            {closed ? "Closed" : "Featured"}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[16px] font-bold leading-snug text-[#12396B]">
          <Link href={href} className="hover:text-[#2166E8] hover:underline">
            {opportunity.title}
          </Link>
        </h3>
        <p className="mt-1 text-[13px] text-slate-500">{opportunity.organization}</p>

        <dl className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-[13px]">
          {where && (
            <div className="flex items-center justify-between gap-3 py-1.5">
              <dt className="flex items-center gap-1.5 text-slate-500"><MapPin size={13} aria-hidden="true" /> Location</dt>
              <dd className="text-right font-semibold text-slate-800">{where}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 py-1.5">
            <dt className="flex items-center gap-1.5 text-slate-500"><CalendarDays size={13} aria-hidden="true" /> Deadline</dt>
            <dd className={`text-right font-semibold ${expired ? "text-slate-400 line-through" : urgent ? "text-[#B42318]" : "text-slate-800"}`}>
              {opportunity.deadlineLabel}
              {urgent && <span className="ml-1.5 no-underline">({days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"} left`})</span>}
            </dd>
          </div>
        </dl>

        {opportunity.description && <p className="mt-3 line-clamp-3 text-[13px] leading-5 text-slate-600">{opportunity.description}</p>}

        <div className="mt-auto flex gap-2 pt-4">
          <Link href={href} className="flex-1 bg-[#2166E8] px-3 py-2 text-center text-[13px] font-semibold text-white transition-colors hover:bg-[#1554C7]">
            Read More
          </Link>
          {closed || expired ? (
            <span className="flex-1 cursor-not-allowed border border-slate-300 bg-slate-100 px-3 py-2 text-center text-[13px] font-semibold text-slate-400">Closed</span>
          ) : (
            <Link href={`/opportunities/assistance?opportunity=${opportunity.id}`} className="flex-1 border border-[#2166E8] px-3 py-2 text-center text-[13px] font-semibold text-[#2166E8] transition-colors hover:bg-[#EEF5FF]">
              Apply Now
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
