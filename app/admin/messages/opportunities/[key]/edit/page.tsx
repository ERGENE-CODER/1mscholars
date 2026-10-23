import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { requireAdmin, toId } from "@/lib/admin";
import { opportunityPath } from "@/lib/opportunities";
import { deleteOpportunity } from "../../actions";
import { ConfirmButton } from "../../../_components/buttons";
import { Card, ErrorBox, Notice, PageHeader } from "../../../_components/ui";
import OpportunityForm from "../../opportunity-form";
import type { OpportunityFormValues, OpportunityStatusValue } from "@/lib/admin-opportunities";

export const metadata = { title: "Edit Opportunity | Admin" };

type Row = {
  id: number; title: string; organization: string; category: string | null; country: string | null;
  location: string | null; deadline: string | null; image_url: string | null; status: OpportunityStatusValue;
  featured: boolean; description: string | null; created_by: string | null;
  opportunity_programs: { program_name: string; position: number; id: number }[] | null;
  opportunity_requirements: { requirement: string; position: number; id: number }[] | null;
  opportunity_benefits: { benefit: string; position: number; id: number }[] | null;
};

const byPos = <T extends { position: number; id: number }>(a: T, b: T) => a.position - b.position || a.id - b.id;

export default async function EditOpportunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { key } = await params;
  const sp = await searchParams;
  const id = toId(key);
  if (!id) notFound();

  const { supabase, userId, isFull } = await requireAdmin();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*, opportunity_programs(id, program_name, position), opportunity_requirements(id, requirement, position), opportunity_benefits(id, benefit, position)")
    .eq("id", id)
    .maybeSingle();

  if (error) return <div className="mx-auto max-w-3xl"><ErrorBox title="Couldn't load this opportunity." message={error.message} /></div>;
  if (!data) notFound();
  const row = data as unknown as Row;

  const { data: cats } = await supabase.from("opportunities").select("category").not("category", "is", null).limit(500);
  const categories = [...new Set((cats ?? []).map((r: { category: string | null }) => r.category).filter((c): c is string => Boolean(c)))];

  const initial: OpportunityFormValues = {
    id: row.id,
    title: row.title,
    organization: row.organization,
    category: row.category ?? "",
    country: row.country ?? "",
    location: row.location ?? "",
    deadline: row.deadline ?? "",
    image_url: row.image_url ?? "",
    status: row.status,
    featured: row.featured,
    description: row.description ?? "",
    programs: (row.opportunity_programs ?? []).slice().sort(byPos).map((p) => p.program_name),
    requirements: (row.opportunity_requirements ?? []).slice().sort(byPos).map((r) => r.requirement),
    benefits: (row.opportunity_benefits ?? []).slice().sort(byPos).map((b) => b.benefit),
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/admin/opportunities" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft size={15} /> Back to opportunities</Link>
      <PageHeader
        title="Edit Opportunity"
        description={row.title}
        actions={
          <>
            <Link href={`/admin/opportunities/${row.id}/form`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FileText size={15} /> Application form</Link>
            {row.status !== "draft" && (
              <Link href={opportunityPath(row)} target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ExternalLink size={15} /> View on site</Link>
            )}
          </>
        }
      />
      <Notice notice={sp.notice} error={sp.error} />
      <OpportunityForm initial={initial} categories={categories} />

      {(isFull || row.created_by === userId) && (
      <Card className="border-red-200">
        <h2 className="text-base font-bold text-red-700">Delete this opportunity</h2>
        <p className="mt-1 text-sm text-slate-500">Removes it together with its requirements, benefits and application form. If students have already applied, it can&apos;t be deleted: close it instead.</p>
        <form action={deleteOpportunity} className="mt-4">
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="returnTo" value={`/admin/opportunities/${row.id}/edit`} />
          <ConfirmButton message={`Delete "${row.title}"? This can't be undone.`} pendingLabel="Deleting…">Delete opportunity</ConfirmButton>
        </form>
      </Card>
      )}
    </div>
  );
}
