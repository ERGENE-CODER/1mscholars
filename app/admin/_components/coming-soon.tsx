import { PageHeader } from "./ui";

/** Placeholder for sidebar sections that don't have a database table yet. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        This section isn&apos;t connected to the database yet.
      </div>
    </div>
  );
}
