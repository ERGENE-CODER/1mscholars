import { CheckCircle2, CircleAlert } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { hasServiceRole } from "@/lib/supabase/admin";
import { addAdminEmail, removeAdminEmail } from "./actions";
import { ConfirmButton, SubmitButton } from "../_components/buttons";
import { Card, ErrorBox, Notice, PageHeader, inputClass } from "../_components/ui";

export const metadata = { title: "Settings | Admin" };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("admin_emails").select("email").order("email");
  const emails = (data ?? []) as { email: string }[];
  const serviceRole = hasServiceRole();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Administrator access and optional features." />
      <Notice notice={sp.notice} error={sp.error} />

      <Card>
        <h2 className="text-base font-bold text-slate-900">Admin email list</h2>
        <p className="mt-1 text-sm text-slate-500">
          Email addresses stored in your database&apos;s <code className="rounded bg-slate-100 px-1">admin_emails</code> table. To make an existing user an administrator, open them under Users and change their role.
        </p>

        {error ? (
          <div className="mt-4"><ErrorBox title="Couldn't load the list." message={error.message} /></div>
        ) : emails.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No emails on the list.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {emails.map((e) => (
              <li key={e.email} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="break-all text-sm font-medium text-slate-800">{e.email}</span>
                <form action={removeAdminEmail}>
                  <input type="hidden" name="email" value={e.email} />
                  <ConfirmButton message={`Remove ${e.email} from the admin email list?`} pendingLabel="Removing…" className="!px-3 !py-1.5 !text-xs">Remove</ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={addAdminEmail} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input name="email" type="email" required placeholder="name@example.com" className={inputClass} />
          <SubmitButton pendingLabel="Adding…" className="shrink-0">Add email</SubmitButton>
        </form>
      </Card>

      <Card>
        <h2 className="text-base font-bold text-slate-900">Account management</h2>
        <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
          {serviceRole ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /> : <CircleAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />}
          {serviceRole
            ? "Adding and deleting user accounts is enabled."
            : "Adding and deleting user accounts is turned off. To enable it, add SUPABASE_SERVICE_ROLE_KEY (from Supabase → Project Settings → API) to your .env file and restart. Keep this key secret: never put NEXT_PUBLIC_ in front of it."}
        </p>
      </Card>
    </div>
  );
}
