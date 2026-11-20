import Link from "next/link";

export default function ResourcesPage() {
  return (
    <main className="min-h-[60vh] bg-[#F8FAFD] px-5 py-20 text-center text-[#102F59]">
      <h1 className="text-3xl font-bold">Resources</h1>
      <p className="mt-3 text-slate-500">Guides and study resources are coming soon.</p>
      <Link href="/opportunities" className="mt-6 inline-block bg-[#2166E8] px-6 py-3 text-sm font-bold text-white">
        Browse Opportunities
      </Link>
    </main>
  );
}