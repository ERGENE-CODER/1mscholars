import Link from "next/link";
import { ExternalLink, Pencil, Plus, Search, Star, FileText } from "lucide-react";
import { requireAdmin, formatDate } from "@/lib/admin";
import { opportunityPath, sameCategory, prettifySlug } from "@/lib/opportunities";
import { deleteOpportunity, setOpportunityStatus, toggleFeatured } from "./actions";
import { Badge, Card, EmptyBox, ErrorBox, Notice, PageHeader, Tabs } from "../_components/ui";
import { ConfirmButton, SubmitButton } from "../_components/buttons";

type Row = {
  id: number;
  title: string;
  organization: string;
  category: string | null;
  country: string | null;
  deadline: string | null;
  status: string;
  featured: boolean;
  image_url: string | null;
  created_at: string;
  created_by: string | null;
  opportunity_programs: { program_name: string; position: number }[] | null;
  applications: { count: number }[] | null;
};

type StatusFilter = "all" | "published" | "draft" | "closed";
const LIMIT = 500;

export default async function OpportunityList({
  basePath,
  category,
  searchParams,
}: {
  basePath: string; // "/admin/opportunities" or ".../scholarships"
  category?: string; // URL slug, e.g. "scholarships"
  searchParams: { status?: string; q?: string; notice?: string; error?: string };
}) {
  const { supabase, userId, isFull } = await requireAdmin();
  const status: StatusFilter = (["published", "draft", "closed"] as const).find((s) => s === searchParams.status) ?? "all";
  const q = (searchParams.q ?? "").trim().toLowerCase();

  const { data, error } = await supabase
    .from("opportunities")
    .select("id, title, organization, category, country, deadline, status, featured, image_url, created_at, created_by, opportunity_programs(program_name, position), applications(count)")
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  const all = ((data ?? []) as unknown as Row[]).filter((r) => {
    if (!category) return true;
    return Boolean(r.category && sameCategory(r.category, category));
  });

  const counts = {
    all: all.length,
    published: all.filter((r) => r.status === "published").length,
    draft: all.filter((r) => r.status === "draft").length,
    closed: all.filter((r) => r.status === "closed").length,
  };
  const rows = all.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (!q) return true;
    return `${r.title} ${r.organization} ${r.category ?? ""} ${r.country ?? ""}`.toLowerCase().includes(q);
  });

  const heading = category ? prettifySlug(category) : "Opportunities";
  const tabHref = (key: StatusFilter) => {
    const p = new URLSearchParams();
    if (key !== "all") p.set("status", key);
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  // Where quick actions return to (keeps the current filters).
  const returnTo = (() => {
    const p = new URLSearchParams();
    if (status !== "all") p.set("status", status);
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title={heading}
        description={category ? `Opportunities in the ${heading} category.` : "Add, edit, publish and remove the opportunities students see."}
        actions={
          <Link href="/admin/opportunities/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            <Plus size={18} /> Add Opportunity
          </Link>
        }
      />
      <Notice notice={searchParams.notice} error={searchParams.error} />

      <Card>
        <form action={basePath} className="flex flex-col gap-3 sm:flex-row">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4">
            <Search size={18} className="text-slate-400" />
            <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search by title, organization, category or country…" className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400" />
          </div>
          <button type="submit" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Search</button>
        </form>
      </Card>

      <Tabs
        current={status}
        href={tabHref}
        items={[
          { key: "all", label: "All", count: counts.all },
          { key: "published", label: "Published", count: counts.published },
          { key: "draft", label: "Drafts", count: counts.draft },
          { key: "closed", label: "Closed", count: counts.closed },
        ]}
      />

      {error ? (
        <ErrorBox title="Couldn't load opportunities." message={error.message} />
      ) : rows.length === 0 ? (
        <EmptyBox>
          {all.length === 0 ? (
            <>
              Nothing here yet.{" "}
              <Link href="/admin/opportunities/new" className="font-semibold text-blue-600">Add the first opportunity</Link>.
            </>
          ) : (
            "No opportunities match your filters."
          )}
        </EmptyBox>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3">Opportunity</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Deadline</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Applications</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const cat = r.category || "—";
                  const apps = r.applications?.[0]?.count ?? 0;
                  return (
                    <tr key={r.id} className="border-b border-slate-100 align-top last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <Link href={`/admin/opportunities/${r.id}/edit`} className="flex max-w-[320px] items-start gap-1.5 text-sm font-semibold text-slate-800 hover:text-blue-600">
                          {r.featured && <Star size={14} className="mt-1 shrink-0 fill-amber-400 text-amber-400" aria-label="Featured" />}
                          <span>{r.title}</span>
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500">{r.organization}{r.country ? ` · ${r.country}` : ""}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">{cat}</td>
                      <td className="px-3 py-3 text-xs text-slate-600">{formatDate(r.deadline)}</td>
                      <td className="px-3 py-3"><Badge value={r.status} /></td>
                      <td className="px-3 py-3 text-xs text-slate-600">{apps}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link href={`/admin/opportunities/${r.id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={13} /> Edit</Link>
                          <Link href={`/admin/opportunities/${r.id}/form`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><FileText size={13} /> Form</Link>
                          {r.status !== "draft" && (
                            <Link href={opportunityPath(r)} target="_blank" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ExternalLink size={13} /> View</Link>
                          )}
                          {r.status === "published" ? (
                            <QuickStatus id={r.id} status="closed" label="Close" returnTo={returnTo} />
                          ) : (
                            <QuickStatus id={r.id} status="published" label={r.status === "closed" ? "Reopen" : "Publish"} returnTo={returnTo} />
                          )}
                          {r.status === "published" && <QuickStatus id={r.id} status="draft" label="Unpublish" returnTo={returnTo} />}
                          <form action={toggleFeatured}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="featured" value={String(!r.featured)} />
                            <input type="hidden" name="returnTo" value={returnTo} />
                            <SubmitButton variant="secondary" pendingLabel="…" className="!px-2.5 !py-1.5 !text-xs">{r.featured ? "Unfeature" : "Feature"}</SubmitButton>
                          </form>
                          {(isFull || r.created_by === userId) && (
                            <form action={deleteOpportunity}>
                              <input type="hidden" name="id" value={r.id} />
                              <input type="hidden" name="returnTo" value={returnTo} />
                              <ConfirmButton message={`Delete "${r.title}"? This also removes its requirements, benefits and application form. This can't be undone.`} pendingLabel="Deleting…" className="!px-2.5 !py-1.5 !text-xs">Delete</ConfirmButton>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(data?.length ?? 0) >= LIMIT && <p className="text-xs text-slate-400">Showing the latest {LIMIT} opportunities.</p>}
    </div>
  );
}

function QuickStatus({ id, status, label, returnTo }: { id: number; status: string; label: string; returnTo: string }) {
  return (
    <form action={setOpportunityStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <SubmitButton variant="secondary" pendingLabel="…" className="!px-2.5 !py-1.5 !text-xs">{label}</SubmitButton>
    </form>
  );
}

