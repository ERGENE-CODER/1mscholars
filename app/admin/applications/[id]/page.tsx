import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin, toId } from "@/lib/admin";
import {
  STATUS_COMPLETED,
  STATUS_SUBMITTED,
  STATUS_UNDER_REVIEW,
  formatDateTime,
  statusMeta,
} from "@/lib/application-status";
import { deleteApplication, updateApplicationStatus } from "../detail-actions";
import { ConfirmButton, SubmitButton } from "../../_components/buttons";
import { Card, ErrorBox, Notice, PageHeader, inputClass } from "../../_components/ui";

export const metadata = { title: "Application | Admin" };

type AnswerRow = {
  id: number;
  field_id: number;
  answer_text: string | null;
  answer_json: unknown;
  application_fields: { label: string; field_type: string; position: number } | { label: string; field_type: string; position: number }[] | null;
};

type FileMeta = { name?: string; bucket?: string; path?: string; size?: number };

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

export default async function AdminApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id: idParam } = await params;
  const sp = await searchParams;
  const id = toId(idParam);
  if (!id) notFound();

  const { supabase } = await requireAdmin();
  const { data: app, error } = await supabase
    .from("applications")
    .select("id, opportunity_id, form_id, applicant_id, status, submitted_at, completed_at")
    .eq("id", id)
    .maybeSingle();
  if (error) return <div className="mx-auto max-w-3xl"><ErrorBox title="Couldn't load this application." message={error.message} /></div>;
  if (!app) notFound();

  const [{ data: opp }, { data: person }, { data: form }, { data: answerData, error: answersError }] = await Promise.all([
    supabase.from("opportunities").select("id, title, organization").eq("id", app.opportunity_id).maybeSingle(),
    app.applicant_id
      ? supabase.from("profiles").select("id, full_name, email, phone_number, education_level").eq("id", app.applicant_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("application_forms").select("title").eq("id", app.form_id).maybeSingle(),
    supabase
      .from("application_answers")
      .select("id, field_id, answer_text, answer_json, application_fields(label, field_type, position)")
      .eq("application_id", id),
  ]);

  const answers = ((answerData ?? []) as unknown as AnswerRow[])
    .map((a) => ({ ...a, field: one(a.application_fields) }))
    .sort((a, b) => (a.field?.position ?? 0) - (b.field?.position ?? 0) || a.id - b.id);

  // Uploaded files (only if a Storage bucket is configured): short-lived download links.
  const fileLinks = new Map<number, string>();
  for (const a of answers) {
    const meta = a.answer_json as FileMeta | null;
    if (a.field?.field_type === "file" && meta && typeof meta === "object" && meta.bucket && meta.path) {
      const { data } = await supabase.storage.from(meta.bucket).createSignedUrl(meta.path, 3600);
      if (data?.signedUrl) fileLinks.set(a.id, data.signedUrl);
    }
  }

  const meta = statusMeta(app.status);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft size={15} /> Back to applications</Link>
      <PageHeader title={opp?.title ?? `Opportunity #${app.opportunity_id}`} description={`Application #${app.id}${form?.title ? ` · ${form.title}` : ""}`} actions={<span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>} />
      <Notice notice={sp.notice} error={sp.error} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-base font-bold text-slate-900">Applicant</h2>
          {person ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="text-xs text-slate-400">Name</dt><dd className="font-semibold">{person.full_name || "—"}</dd></div>
              <div><dt className="text-xs text-slate-400">Email</dt><dd className="font-semibold">{person.email ? <a href={`mailto:${person.email}`} className="text-blue-600">{person.email}</a> : "—"}</dd></div>
              <div><dt className="text-xs text-slate-400">Phone</dt><dd className="font-semibold">{person.phone_number || "—"}</dd></div>
              <div><dt className="text-xs text-slate-400">Education</dt><dd className="font-semibold">{person.education_level || "—"}</dd></div>
              <Link href={`/admin/users/${person.id}`} className="inline-block pt-1 text-xs font-semibold text-blue-600">View user profile →</Link>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{app.applicant_id ? "This user's profile couldn't be found." : "Applied without signing in. Use the answers below to contact them."}</p>
          )}
        </Card>

        <Card>
          <h2 className="text-base font-bold text-slate-900">Status</h2>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-xs text-slate-400">Sent</dt><dd className="font-semibold">{formatDateTime(app.submitted_at)}</dd></div>
            <div><dt className="text-xs text-slate-400">Completed</dt><dd className="font-semibold">{meta.completed ? formatDateTime(app.completed_at) : "—"}</dd></div>
          </dl>
          <form action={updateApplicationStatus} className="mt-4 flex gap-2">
            <input type="hidden" name="id" value={app.id} />
            <select name="status" defaultValue={app.status === STATUS_COMPLETED || app.status === STATUS_UNDER_REVIEW ? app.status : STATUS_SUBMITTED} className={inputClass}>
              <option value={STATUS_SUBMITTED}>Sent (to do)</option>
              <option value={STATUS_UNDER_REVIEW}>In review</option>
              <option value={STATUS_COMPLETED}>Completed</option>
            </select>
            <SubmitButton pendingLabel="Saving…">Update</SubmitButton>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="text-base font-bold text-slate-900">Answers</h2>
        {answersError ? (
          <p className="mt-3 text-sm text-red-600">Couldn&apos;t load the answers: {answersError.message}</p>
        ) : answers.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No answers were saved with this application.</p>
        ) : (
          <dl className="mt-4 divide-y divide-slate-100">
            {answers.map((a) => (
              <div key={a.id} className="py-3">
                <dt className="text-xs font-bold text-slate-500">{a.field?.label ?? `Question #${a.field_id}`}</dt>
                <dd className="mt-1 whitespace-pre-line break-words text-sm text-slate-800">
                  {fileLinks.get(a.id) ? (
                    <a href={fileLinks.get(a.id)} target="_blank" rel="noreferrer" className="font-semibold text-blue-600">Download {(a.answer_json as FileMeta).name ?? "file"}</a>
                  ) : (
                    a.answer_text || "—"
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      <Card className="border-red-200">
        <h2 className="text-base font-bold text-red-700">Delete this application</h2>
        <p className="mt-1 text-sm text-slate-500">Removes it and all its answers permanently. The applicant will no longer see it.</p>
        <form action={deleteApplication} className="mt-4">
          <input type="hidden" name="id" value={app.id} />
          <ConfirmButton message={`Delete application #${app.id} and its answers? This can't be undone.`} pendingLabel="Deleting…">Delete application</ConfirmButton>
        </form>
      </Card>
    </div>
  );
}
