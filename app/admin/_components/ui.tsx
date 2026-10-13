import Link from "next/link";
import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Green/red banner driven by ?notice=... / ?error=... in the URL. */
export function Notice({ notice, error }: { notice?: string; error?: string }) {
  if (!notice && !error) return null;
  const isError = Boolean(error);
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`rounded-xl px-4 py-3 text-sm font-medium ${
        isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ?? notice}
    </p>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function EmptyBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export function ErrorBox({ title, message }: { title: string; message: string }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      <strong>{title}</strong> {message}
    </div>
  );
}

const BADGES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
  closed: "bg-slate-100 text-slate-600",
  admin: "bg-purple-50 text-purple-700",
  user: "bg-slate-100 text-slate-600",
};

export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
        BADGES[value] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {label ?? value}
    </span>
  );
}

export function Tabs<T extends string>({
  items,
  current,
  href,
}: {
  items: { key: T; label: string; count?: number }[];
  current: T;
  href: (key: T) => string;
}) {
  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((t) => (
        <Link
          key={t.key}
          href={href(t.key)}
          aria-current={current === t.key ? "page" : undefined}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
            current === t.key
              ? "bg-[#12396B] text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          {t.label}
          {t.count !== undefined && ` (${t.count})`}
        </Link>
      ))}
    </nav>
  );
}

export function Field({
  label,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
