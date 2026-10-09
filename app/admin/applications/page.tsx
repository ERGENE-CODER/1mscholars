import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  STATUS_COMPLETED,
  STATUS_SUBMITTED,
  formatDateTime,
  statusMeta,
} from "@/lib/application-status";
import { setApplicationStatus } from "./actions";
import StatusButton from "./status-button";

type ApplicationRow = {
  id: number;
  opportunity_id: number | null;
  applicant_id: string | null;
  status: string | null;
  submitted_at: string | null;
  completed_at: string | null;
};

type Filter = "all" | "submitted" | "completed";

const NOTICES: Record<string, { tone: "ok" | "error"; text: string }> = {
  completed: { tone: "ok", text: "Marked as completed. The applicant can now see it." },
  reopened: { tone: "ok", text: "Application reopened." },
  failed: {
    tone: "error",
    text: "Couldn't update that application. Check that supabase/applications-tracking.sql has been run and that you're signed in as an admin.",
  },
  invalid: { tone: "error", text: "That request wasn't valid." },
};

const LIMIT = 200;

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const filter: Filter =
    params.status === "completed" || params.status === "submitted"
      ? params.status
      : "all";
  const notice = params.notice ? NOTICES[params.notice] : undefined;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("id, opportunity_id, applicant_id, status, submitted_at, completed_at")
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(LIMIT);

  const all = (data ?? []) as ApplicationRow[];
  const isDone = (a: ApplicationRow) => a.status === STATUS_COMPLETED;
  const counts = {
    all: all.length,
    submitted: all.filter((a) => !isDone(a)).length,
    completed: all.filter(isDone).length,
  };
  const rows = all.filter((a) =>
    filter === "all" ? true : filter === "completed" ? isDone(a) : !isDone(a)
  );

  // Look names up separately so this page doesn't depend on foreign-key names.
  const people = new Map<string, { full_name: string | null; email: string | null }>();
  const applicantIds = [...new Set(rows.map((r) => r.applicant_id).filter((v): v is string => !!v))];
  if (applicantIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", applicantIds);
    for (const p of profiles ?? []) people.set(p.id, p);
  }

  const titles = new Map<number, string>();
  const oppIds = [...new Set(rows.map((r) => r.opportunity_id).filter((v): v is number => v !== null))];
  if (oppIds.length > 0) {
    const { data: opps } = await supabase
      .from("opportunities")
      .select("id, title")
      .in("id", oppIds);
    for (const o of opps ?? []) titles.set(o.id, o.title);
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "submitted", label: "To do" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="mx-auto w-full max-w-[900px] p-4 text-[#102F59] sm:p-6">
      <h1 className="text-[24px] font-bold text-[#12396B]">Applications</h1>
      <p className="mt-1 text-[14px] text-gray-500">
        Mark an application completed when you&apos;ve finished it. The applicant
        sees the change under My Applications.
      </p>

      {notice && (
        <p
          role="status"
          className={`mt-5 rounded-xl px-4 py-3 text-[14px] font-medium ${
            notice.tone === "ok"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filter applications">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/applications?status=${t.key}`}
            aria-current={filter === t.key ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
              filter === t.key
                ? "bg-[#12396B] text-white"
                : "bg-white text-[#102F59] ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label} ({counts[t.key]})
          </Link>
        ))}
      </nav>

      {error ? (
        <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-[14px] text-red-700">
          <strong>Couldn&apos;t load applications.</strong> {error.message}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-[14px] text-gray-500">
          Nothing here yet.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((app) => {
            const meta = statusMeta(app.status);
            const person = app.applicant_id ? people.get(app.applicant_id) : undefined;
            return (
              <li key={app.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[16px] font-bold leading-[22px]">
                      {app.opportunity_id !== null
                        ? (titles.get(app.opportunity_id) ?? `Opportunity #${app.opportunity_id}`)
                        : "Opportunity"}
                    </h2>
                    <p className="mt-0.5 break-words text-[13px] text-gray-500">
                      {app.applicant_id
                        ? `${person?.full_name || "Applicant"}${person?.email ? ` · ${person.email}` : ""}`
                        : "Applied without signing in (can't track)"}
                    </p>
                    <p className="mt-0.5 text-[12px] font-semibold text-slate-400">
                      Reference #{app.id}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${meta.className}`}>
                    {meta.label}
                  </span>
                </div>

                <dl className="mt-4 grid gap-2 text-[13px] sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-400">Sent</dt>
                    <dd className="font-semibold">{formatDateTime(app.submitted_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Completed</dt>
                    <dd className="font-semibold">
                      {meta.completed ? formatDateTime(app.completed_at) : "—"}
                    </dd>
                  </div>
                </dl>

                <form action={setApplicationStatus} className="mt-4">
                  <input type="hidden" name="id" value={app.id} />
                  <input type="hidden" name="filter" value={filter} />
                  {meta.completed ? (
                    <>
                      <input type="hidden" name="status" value={STATUS_SUBMITTED} />
                      <StatusButton variant="ghost" label="Reopen" pendingLabel="Reopening..." />
                    </>
                  ) : (
                    <>
                      <input type="hidden" name="status" value={STATUS_COMPLETED} />
                      <StatusButton variant="primary" label="Mark complete" pendingLabel="Saving..." />
                    </>
                  )}
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {all.length >= LIMIT && (
        <p className="mt-4 text-[12px] text-gray-400">
          Showing the latest {LIMIT} applications.
        </p>
      )}
    </div>
  );
}
