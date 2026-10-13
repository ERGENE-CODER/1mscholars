import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdmin, toId } from "@/lib/admin";
import { normalizeOptions } from "@/lib/applications";
import { deleteApplicationForm } from "../../actions";
import { ConfirmButton } from "../../../_components/buttons";
import { Card, ErrorBox, Notice, PageHeader } from "../../../_components/ui";
import FormBuilder from "../../form-builder";
import type { BuilderField, FieldTypeValue } from "@/lib/admin-opportunities";

export const metadata = { title: "Application Form | Admin" };

type FieldRow = { id: number; label: string; field_type: FieldTypeValue; required: boolean; placeholder: string | null; options: unknown; position: number };
type FormRow = { id: number; title: string; description: string | null; application_fields: FieldRow[] | null };

export default async function ApplicationFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { key } = await params;
  const sp = await searchParams;
  const opportunityId = toId(key);
  if (!opportunityId) notFound();

  const { supabase } = await requireAdmin();
  const { data: opp, error: oppError } = await supabase.from("opportunities").select("id, title, status").eq("id", opportunityId).maybeSingle();
  if (oppError) return <div className="mx-auto max-w-3xl"><ErrorBox title="Couldn't load this opportunity." message={oppError.message} /></div>;
  if (!opp) notFound();

  // The public site uses the most recently created form for an opportunity, so edit that one.
  const { data: formData, error: formError } = await supabase
    .from("application_forms")
    .select("id, title, description, application_fields(id, label, field_type, required, placeholder, options, position)")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (formError) return <div className="mx-auto max-w-3xl"><ErrorBox title="Couldn't load the form." message={formError.message} /></div>;

  const form = formData as unknown as FormRow | null;
  const fields: BuilderField[] = (form?.application_fields ?? [])
    .slice()
    .sort((a, b) => a.position - b.position || a.id - b.id)
    .map((f) => ({
      id: f.id,
      label: f.label,
      type: f.field_type,
      required: f.required,
      placeholder: f.placeholder ?? "",
      options: normalizeOptions(f.options).map((o) => o.label),
    }));

  let submissions = 0;
  if (form) {
    const { count } = await supabase.from("applications").select("id", { count: "exact", head: true }).eq("form_id", form.id);
    submissions = count ?? 0;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href={`/admin/opportunities/${opp.id}/edit`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft size={15} /> Back to opportunity</Link>
      <PageHeader
        title="Application form"
        description={`The questions students answer when applying for “${opp.title}”.`}
        actions={
          form && opp.status !== "draft" ? (
            <Link href={`/opportunities/assistance?opportunity=${opp.id}`} target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ExternalLink size={15} /> Preview as student</Link>
          ) : undefined
        }
      />
      <Notice notice={sp.notice} error={sp.error} />
      {submissions > 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {submissions} student{submissions === 1 ? " has" : "s have"} already used this form. Questions they answered can be renamed but not removed.
        </p>
      )}

      <FormBuilder
        key={`${form?.id ?? "new"}-${fields.length}`}
        opportunityId={opp.id}
        formId={form?.id ?? null}
        initialTitle={form?.title ?? "Application Form"}
        initialDescription={form?.description ?? ""}
        initialFields={fields}
      />

      {form && (
        <Card className="border-red-200">
          <h2 className="text-base font-bold text-red-700">Delete this form</h2>
          <p className="mt-1 text-sm text-slate-500">Students will no longer be able to apply until you create a new form. Not possible once applications exist.</p>
          <form action={deleteApplicationForm} className="mt-4">
            <input type="hidden" name="formId" value={form.id} />
            <input type="hidden" name="opportunityId" value={opp.id} />
            <ConfirmButton message="Delete this application form and all its questions? This can't be undone." pendingLabel="Deleting…">Delete form</ConfirmButton>
          </form>
        </Card>
      )}
    </div>
  );
}
