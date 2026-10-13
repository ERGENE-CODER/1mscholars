import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin, formatDate } from "@/lib/admin";
import { hasServiceRole } from "@/lib/supabase/admin";
import { createUser } from "./actions";
import { SubmitButton } from "../_components/buttons";
import { Badge, Card, EmptyBox, ErrorBox, Field, Notice, PageHeader, Tabs, inputClass } from "../_components/ui";

export const metadata = { title: "Users | Admin" };

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  education_level: string | null;
  role: string;
  onboarding_completed: boolean;
  created_at: string;
};

type RoleFilter = "all" | "user" | "admin";
const LIMIT = 500;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; notice?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const { supabase, userId } = await requireAdmin();
  const role: RoleFilter = sp.role === "admin" || sp.role === "user" ? sp.role : "all";
  const q = (sp.q ?? "").trim().toLowerCase();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone_number, education_level, role, onboarding_completed, created_at")
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  const all = (data ?? []) as Profile[];
  const counts = { all: all.length, user: all.filter((p) => p.role !== "admin").length, admin: all.filter((p) => p.role === "admin").length };
  const rows = all.filter((p) => {
    if (role === "admin" && p.role !== "admin") return false;
    if (role === "user" && p.role === "admin") return false;
    return !q || `${p.full_name ?? ""} ${p.email ?? ""} ${p.phone_number ?? ""}`.toLowerCase().includes(q);
  });
  const canCreate = hasServiceRole();

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Everyone who has an account. Open a user to edit their details, change their role or remove them." />
      <Notice notice={sp.notice} error={sp.error} />

      <Card>
        <details>
          <summary className="cursor-pointer text-sm font-bold text-blue-600">+ Add a user</summary>
          {canCreate ? (
            <form action={createUser} className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required><input name="full_name" required className={inputClass} /></Field>
              <Field label="Email" required><input name="email" type="email" required className={inputClass} /></Field>
              <Field label="Temporary password" required hint="At least 8 characters. Tell the person to sign in with it."><input name="password" type="text" required minLength={8} autoComplete="off" className={inputClass} /></Field>
              <Field label="Role">
                <select name="role" defaultValue="user" className={inputClass}>
                  <option value="user">Student / user</option>
                  <option value="admin">Administrator</option>
                </select>
              </Field>
              <div className="sm:col-span-2"><SubmitButton pendingLabel="Creating…">Create account</SubmitButton></div>
            </form>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Creating accounts needs the server-only <code className="rounded bg-slate-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> setting. Add it to your <code className="rounded bg-slate-100 px-1">.env</code> file and restart the server. Meanwhile, people can sign up themselves on the website.
            </p>
          )}
        </details>
      </Card>

      <Card>
        <form action="/admin/users" className="flex flex-col gap-3 sm:flex-row">
          {role !== "all" && <input type="hidden" name="role" value={role} />}
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4">
            <Search size={18} className="text-slate-400" />
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Search by name, email or phone…" className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400" />
          </div>
          <button type="submit" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Search</button>
        </form>
      </Card>

      <Tabs
        current={role}
        href={(k) => `/admin/users?${new URLSearchParams({ ...(k !== "all" ? { role: k } : {}), ...(q ? { q } : {}) }).toString()}`}
        items={[
          { key: "all", label: "Everyone", count: counts.all },
          { key: "user", label: "Students", count: counts.user },
          { key: "admin", label: "Admins", count: counts.admin },
        ]}
      />

      {error ? (
        <ErrorBox title="Couldn't load users." message={error.message} />
      ) : rows.length === 0 ? (
        <EmptyBox>{all.length === 0 ? "No users yet." : "No users match your filters."}</EmptyBox>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3">Name</th><th className="px-3 py-3">Phone</th><th className="px-3 py-3">Education</th>
                  <th className="px-3 py-3">Role</th><th className="px-3 py-3">Profile</th><th className="px-3 py-3">Joined</th><th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${p.id}`} className="text-sm font-semibold text-slate-800 hover:text-blue-600">{p.full_name || "(no name)"}{p.id === userId && <span className="ml-2 text-xs font-normal text-slate-400">you</span>}</Link>
                      <p className="text-xs text-slate-500">{p.email || "—"}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">{p.phone_number || "—"}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{p.education_level || "—"}</td>
                    <td className="px-3 py-3"><Badge value={p.role} label={p.role === "admin" ? "Admin" : "Student"} /></td>
                    <td className="px-3 py-3 text-xs text-slate-600">{p.onboarding_completed ? "Complete" : "Not finished"}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{formatDate(p.created_at)}</td>
                    <td className="px-5 py-3 text-right"><Link href={`/admin/users/${p.id}`} className="text-xs font-semibold text-blue-600">Manage →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {all.length >= LIMIT && <p className="text-xs text-slate-400">Showing the latest {LIMIT} users.</p>}
    </div>
  );
}
