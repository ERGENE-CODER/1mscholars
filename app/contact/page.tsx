import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | 1M Scholars",
  description: "Get in touch with the 1M Scholars team.",
};

// TODO: replace these placeholders with your real contact details.
// Leave a value as an empty string to hide that item.
const CONTACT = {
  email: "hello@example.com",
  phone: "+250 000 000 000",
  address: "Kigali, Rwanda",
  hours: "Monday to Friday, 8:00–17:00",
};

export default function ContactPage() {
  const details = [
    { icon: "✉️", label: "Email", value: CONTACT.email, href: CONTACT.email ? `mailto:${CONTACT.email}` : "" },
    { icon: "📞", label: "Phone", value: CONTACT.phone, href: CONTACT.phone ? `tel:${CONTACT.phone.replace(/[^+\d]/g, "")}` : "" },
    { icon: "📍", label: "Location", value: CONTACT.address, href: "" },
    { icon: "🕒", label: "Office hours", value: CONTACT.hours, href: "" },
  ].filter((d) => d.value);

  return (
    <main className="min-h-screen bg-[#F8FAFD] pb-16 text-[#102F59]">
      <section className="bg-[#102F59] px-5 py-10 text-white sm:py-12">
        <div className="mx-auto max-w-[1100px]">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Contact</span>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Get in Touch</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Questions about an opportunity, an application or working with us? Send us a message and we&apos;ll get back to you.</p>
        </div>
      </section>

      <div className="mx-auto mt-8 grid max-w-[1100px] gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold">Send us a message</h2>
          <p className="mt-1 text-sm text-slate-500">Fields marked <span className="text-red-500">*</span> are required.</p>
          <ContactForm />
        </section>

        {details.length > 0 && (
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Contact details</h2>
            <ul className="mt-4 space-y-4">
              {details.map((d) => (
                <li key={d.label} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF]" aria-hidden="true">{d.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{d.label}</div>
                    {d.href ? <a href={d.href} className="break-words text-sm font-semibold text-[#2166E8] hover:underline">{d.value}</a> : <div className="text-sm font-semibold">{d.value}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </main>
  );
}
