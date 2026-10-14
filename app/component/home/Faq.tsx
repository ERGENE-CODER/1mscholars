import { ChevronDown } from "lucide-react";
import { FAQS } from "./content";

export default function Faq() {
  if (FAQS.length === 0) return null;

  // Helps search engines show these answers directly.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section className="bg-white py-14 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-[#EEF5FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#2166E8]">FAQ</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102F59] sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-3 text-[15px] leading-6 text-slate-500">Everything you need to know before applying</p>
        </div>

        {/* Native <details> keeps this accessible and working without JavaScript; the shared `name` makes opening one close the others. */}
        <div className="mt-10 space-y-3">
          {FAQS.map((item, i) => (
            <details
              key={item.question}
              name="faq"
              open={i === 0}
              className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition open:border-[#BFD4F7] open:shadow-[0_8px_30px_rgba(15,45,90,0.07)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left text-[15px] font-bold text-[#102F59] outline-none focus-visible:ring-2 focus-visible:ring-[#2166E8] sm:px-6 sm:py-5 sm:text-base [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown size={20} className="shrink-0 text-[#2166E8] transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="px-5 pb-5 text-sm leading-7 text-slate-600 sm:px-6">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
