import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | 1M Scholars",
  description: "Learn about 1M Scholars and our mission to connect students and young professionals with life-changing opportunities.",
};

const WHAT_WE_DO = [
  { icon: "🔎", title: "Discover", text: "Browse scholarships, jobs, internships, fellowships, training programmes and competitions in one place, with clear deadlines and requirements." },
  { icon: "📝", title: "Prepare", text: "Understand what each organisation is looking for, so you can put together a strong, accurate application." },
  { icon: "🤝", title: "Apply with support", text: "Request application assistance and get guidance from our team as you work toward your submission." },
];

const VALUES = [
  { title: "Access for everyone", text: "Talent is everywhere. Information about opportunities should be too." },
  { title: "Trust and accuracy", text: "We point you to credible organisations and keep details as clear and current as we can." },
  { title: "Student-first guidance", text: "We explain the process honestly, including that assistance never guarantees an outcome." },
  { title: "Community", text: "We grow stronger when learners, mentors and organisations support one another." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFD] pb-16 text-[#102F59]">
      <section className="bg-[#102F59] px-5 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-[1100px]">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">About Us</span>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">Your Future, Our Mission</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-blue-100">
            1M Scholars helps students and young professionals find, understand and apply for opportunities that can change the course of their lives.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <section className="-mt-6 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,45,90,0.07)] sm:p-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold">Our Mission</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Too many capable people miss out on opportunities because they never hear about them, or because the application process feels out of reach. We exist to close that gap by bringing trusted opportunities together and supporting people through every step.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold">Our Vision</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              A future where every learner can reach the education, work and training they are ready for, no matter where they start.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">What We Do</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {WHAT_WE_DO.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5FF] text-xl" aria-hidden="true">{item.icon}</div>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Our Values</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
                <h3 className="text-sm font-bold text-[#2166E8]">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{value.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-[#CFE0FB] bg-[#EEF5FF] p-6 text-center sm:p-10">
          <h2 className="text-2xl font-bold text-[#12396B]">Ready to find your next opportunity?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Explore what&apos;s open now, or get in touch and tell us how we can help.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/opportunities" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#2166E8] px-6 text-sm font-bold text-white transition hover:bg-[#1554C7]">Browse Opportunities</Link>
            <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-xl border border-[#BFD4F7] bg-white px-6 text-sm font-bold text-[#2166E8] transition hover:bg-[#F3F7FF]">Contact Us</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
