import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { opportunityPath } from "@/lib/opportunities";
import { formatDateTime, statusMeta } from "@/lib/application-status";

type ApplicationRow = {
  id: number;
  opportunity_id: number | null;
  status: string | null;
  submitted_at: string | null;
  completed_at: string | null;
};

type OpportunityRow = { id: number; title: string };

export const metadata = { title: "My Applications | 1M Scholars" };

export default async function MyApplicationsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();

  if (!auth?.claims) {
    redirect("/login?mode=login");
  }

  // Always filter by the signed-in user, even though row-level security
  // should do the same, so one person can never see another's applications.
  const { data, error } = await supabase
    .from("applications")
    .select("id, opportunity_id, status, submitted_at, completed_at")
    .eq("applicant_id", auth.claims.sub)
    .order("submitted_at", { ascending: false, nullsFirst: false });

  const applications = (data ?? []) as ApplicationRow[];

  const titles = new Map<number, OpportunityRow>();
  const ids = [
    ...new Set(
      applications
        .map((a) => a.opportunity_id)
        .filter((id): id is number => id !== null)
    ),
  ];
  if (ids.length > 0) {
    const { data: opps } = await supabase
      .from("opportunities")
      .select("id, title")
      .in("id", ids);
    for (const o of (opps ?? []) as OpportunityRow[]) titles.set(o.id, o);
  }

  return (
    <main className="min-h-[calc(100vh-94px)] bg-[#F8FAFD] px-4 pb-16 pt-10 text-[#102F59] sm:px-6">
      <div className="mx-auto max-w-[760px]">
        <h1 className="text-[26px] font-bold text-[#12396B]">My Applications</h1>
        <p className="mt-2 text-[14px] leading-[22px] text-gray-500">
          Track every application you&apos;ve sent. When our team finishes
          working on one, it shows as Completed here.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-[14px] text-red-700"
          >
            <strong>We couldn&apos;t load your applications.</strong> Please
            refresh the page. If it keeps happening, contact support.
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-[18px] font-bold">No applications yet</h2>
            <p className="mt-2 text-[14px] leading-[22px] text-gray-500">
              When you apply for an opportunity while signed in, it will show up
              here.
            </p>
            <Link
              href="/opportunities"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2166E8] px-5 text-[14px] font-bold text-white transition hover:bg-[#1554C7]"
            >
              Browse Opportunities
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {applications.map((app) => {
              const meta = statusMeta(app.status);
              const opp =
                app.opportunity_id !== null
                  ? titles.get(app.opportunity_id)
                  : undefined;

              return (
                <li
                  key={app.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-[17px] font-bold leading-[24px]">
                        {opp?.title ?? "Opportunity"}
                      </h2>
                      <p className="mt-0.5 text-[12px] font-semibold text-slate-400">
                        Reference #{app.id}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <ol className="mt-5 space-y-4">
                    <li className="flex gap-3">
                      <span
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2166E8] text-[13px] font-bold text-white"
                      >
                        ✓
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold">
                          Application sent
                        </p>
                        <p className="text-[13px] text-gray-500">
                          {formatDateTime(app.submitted_at)}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span
                        aria-hidden
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                          meta.completed
                            ? "bg-emerald-600 text-white"
                            : "border-2 border-slate-300 text-slate-300"
                        }`}
                      >
                        {meta.completed ? "✓" : ""}
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold">Completed</p>
                        <p className="text-[13px] text-gray-500">
                          {meta.completed
                            ? formatDateTime(app.completed_at)
                            : "Our team is working on it"}
                        </p>
                      </div>
                    </li>
                  </ol>

                  {opp && (
                    <Link
                      href={opportunityPath(opp)}
                      className="mt-5 inline-block text-[13px] font-semibold text-[#2166E8] hover:underline"
                    >
                      View opportunity
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
