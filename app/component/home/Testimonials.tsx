import { Quote } from "lucide-react";
import { TESTIMONIALS } from "./content";

export default function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="bg-[#F8FAFD] py-14 sm:py-20">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-[#EEF5FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#2166E8]">Reviews</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102F59] sm:text-4xl">What Our Clients Say</h2>
          <p className="mt-3 text-[15px] leading-6 text-slate-500">Real feedback from students and professionals we&apos;ve helped</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={`${t.name}-${t.quote.slice(0, 24)}`} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,45,90,0.06)]">
              <div className="flex items-center justify-between">
                <Quote size={26} className="text-[#2166E8]/30" aria-hidden="true" />
                {t.rating && (
                  <div className="text-[15px] tracking-wider text-[#F5B335]" role="img" aria-label={`${t.rating} out of 5 stars`}>
                    {"★".repeat(t.rating)}
                    <span className="text-slate-200">{"★".repeat(Math.max(0, 5 - t.rating))}</span>
                  </div>
                )}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-7 text-slate-600">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF5FF] text-sm font-bold text-[#2166E8]" aria-hidden="true">
                  {t.name.charAt(0).toUpperCase()}
                </span>
                <span>
                  <span className="block text-sm font-bold text-[#102F59]">{t.name}</span>
                  <span className="block text-xs text-slate-500">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
