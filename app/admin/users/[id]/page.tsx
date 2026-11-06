import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin, isUuid, formatDate } from "@/lib/admin";
import { hasServiceRole } from "@/lib/supabase/admin";
import { formatDateTime, statusMeta } from "@/lib/application-status";
import { EDUCATION_LEVELS, INTEREST_AREAS } from "@/lib/validation";
import { deleteUser, updateUser } from "../actions";
import { ConfirmButton, SubmitButton } from "../../_components/buttons";
import { Card, ErrorBox, Field, Notice, PageHeader, inputClass } from "../../_components/ui";

export const metadata = { title: "User | Admin" };

type Profile = {
  id: string; full_name: string | null; email: string | null; phone_number: string | null;
  education_level: string | null; career_interest: string | null; interests: string[] | null;
  role: string; onboarding_completed: boolean; created_at: string;
};

export default async function AdminUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  if (!isUuid(id)) notFound();

  const { supabase, userId, isFull } = await requireAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone_number, education_level, career_interest, interests, role, onboarding_completed, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) return <div className="mx-auto max-w-3xl"><ErrorBox title="Couldn't load this user." message={error.message} /></div>;
  if (!data) notFound();
  const p = data as Profile;

  const { data: apps } = await supabase
    .from("applications")
    .select("id, opportunity_id, status, submitted_at")
    .eq("applicant_id", id)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(50);
  const oppIds = [...new Set((apps ?? []).map((a: { opportunity_id: number }) => a.opportunity_id))];
  const titles = new Map<number, string>();
  if (oppIds.length) {
    const { data: opps } = await supabase.from("opportunities").select("id, title").in("id", oppIds);
    for (const o of opps ?? []) titles.set(o.id, o.title);
  }

  const isSelf = p.id === userId;
  const interests = p.interests ?? [];
  const interestOptions = [...INTEREST_AREAS, ...interests.filter((i) => !(INTEREST_AREAS as readonly string[]).includes(i))];
  const canDelete = hasServiceRole();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft size={15} /> Back to users</Link>
      <PageHeader title={p.full_name || "User"} description={`${p.email ?? "No email on file"} · joined ${formatDate(p.created_at)}`} />
      <Notice notice={sp.notice} error={sp.error} />

      <Card>
        <form action={updateUser} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={p.id} />
          <Field label="Full name"><input name="full_name" defaultValue={p.full_name ?? ""} className={inputClass} /></Field>
          <Field label="Email" hint="Sign-in email can't be changed here."><input value={p.email ?? ""} disabled className={`${inputClass} bg-slate-50 text-slate-500`} /></Field>
          <Field label="Phone number"><input name="phone_number" defaultValue={p.phone_number ?? ""} className={inputClass} /></Field>
          <Field label="Education level">
            <select name="education_level" defaultValue={p.education_level ?? ""} className={inputClass}>
              <option value="">Not set</option>
              {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              {p.education_level && !(EDUCATION_LEVELS as readonly string[]).includes(p.education_level) && <option value={p.education_level}>{p.education_level}</option>}
            </select>
          </Field>
          <Field label="Career / study interest" className="sm:col-span-2"><input name="career_interest" defaultValue={p.career_interest ?? ""} className={inputClass} /></Field>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-xs font-bold text-slate-700">Areas of interest</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {interestOptions.map((i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="interests" value={i} defaultChecked={interests.includes(i)} className="h-4 w-4 accent-blue-600" /> {i}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Role" hint={isSelf ? "You can't change your own role." : !isFull ? "Only a full administrator can change roles." : "Full admins can do everything. Limited admins can't manage admins, delete users, or delete what others published."}>
            <select name="role" defaultValue={p.role} disabled={isSelf || !isFull} className={inputClass}>
              <option value="user">Student / user</option>
              <option value="sub_admin">Limited admin</option>
              <option value="admin">Full admin</option>
            </select>
            {(isSelf || !isFull) && <input type="hidden" name="role" value={p.role} />}
          </Field>
          <label className="flex items-center gap-3 self-center text-sm font-medium text-slate-700">
            <input type="checkbox" name="onboarding_completed" defaultChecked={p.onboarding_completed} className="h-4 w-4 accent-blue-600" /> Finished the get-started questions
          </label>
          <div className="sm:col-span-2"><SubmitButton pendingLabel="Saving…">Save user</SubmitButton></div>
        </form>
      </Card>

      <Card>
        <h2 className="text-base font-bold text-slate-900">Applications ({apps?.length ?? 0})</h2>
        {!apps || apps.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">This user hasn&apos;t applied for anything yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {apps.map((a: { id: number; opportunity_id: number; status: string | null; submitted_at: string | null }) => {
              const m = statusMeta(a.status);
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <Link href={`/admin/applications/${a.id}`} className="text-sm font-semibold text-slate-800 hover:text-blue-600">{titles.get(a.opportunity_id) ?? `Opportunity #${a.opportunity_id}`}</Link>
                    <p className="text-xs text-slate-500">Sent {formatDateTime(a.submitted_at)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${m.className}`}>{m.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {!isSelf && isFull && (
        <Card className="border-red-200">
          <h2 className="text-base font-bold text-red-700">Delete this user</h2>
          <p className="mt-1 text-sm text-slate-500">Removes their account and profile. Their applications stay in the system without a name attached.</p>
          {canDelete ? (
            <form action={deleteUser} className="mt-4">
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton message={`Delete ${p.full_name || p.email || "this user"}'s account? This can't be undone.`} pendingLabel="Deleting…">Delete user</ConfirmButton>
            </form>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Deleting accounts needs the server-only <code className="rounded bg-slate-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> setting.</p>
          )}
        </Card>
      )}
    </div>
  );
}
