import type { ReactNode } from "react";

/** Placeholder cards that mirror the OpportunityCard layout while data loads. */
export function OpportunityGridSkeleton({ count = 6, className = "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" }: { count?: number; className?: string }) {
  return (
    <div className={className} role="status" aria-label="Loading opportunities">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse border border-slate-300 bg-white">
          <div className="aspect-[3/2] border-b border-slate-300 bg-slate-100" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-4/5 bg-slate-200" />
            <div className="h-3 w-1/2 bg-slate-100" />
            <div className="h-14 border-y border-slate-200 bg-slate-50" />
            <div className="h-3 w-full bg-slate-100" />
            <div className="h-3 w-2/3 bg-slate-100" />
            <div className="flex gap-2 pt-2">
              <div className="h-9 flex-1 bg-slate-200" />
              <div className="h-9 flex-1 bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full-page loading placeholder (detail page / form page). */
export function PageSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <main className="min-h-screen bg-[#F8FAFD] pb-16" role="status" aria-label={label}>
      <div className="mx-auto max-w-[1100px] animate-pulse px-5 pt-6 sm:px-8">
        <div className="mb-5 h-3 w-64 rounded bg-slate-200" />
        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-h-[280px] bg-[#EEF5FF]" />
          <div className="space-y-4 p-8">
            <div className="h-5 w-24 rounded-full bg-slate-100" />
            <div className="h-8 w-4/5 rounded bg-slate-100" />
            <div className="h-4 w-1/3 rounded bg-slate-100" />
            <div className="h-16 w-full rounded-xl bg-slate-100" />
            <div className="h-12 w-full rounded-xl bg-slate-100" />
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <div className="h-40 rounded-2xl border border-slate-200 bg-white" />
          <div className="h-40 rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    </main>
  );
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
      <h2 className="text-lg font-bold text-red-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-red-700">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#2166E8] px-5 text-sm font-bold text-white transition hover:bg-[#1554C7]">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">{children}</div>;
}
