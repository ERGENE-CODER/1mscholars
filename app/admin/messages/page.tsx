import { Mail } from "lucide-react";
import { requireAdmin, formatDate } from "@/lib/admin";
import { formatDateTime } from "@/lib/application-status";
import { deleteMessage } from "./actions";
import { ConfirmButton } from "../_components/buttons";
import { Card, EmptyBox, ErrorBox, Notice, PageHeader } from "../_components/ui";

export const metadata = { title: "Messages | Admin" };

type Message = { id: number; name: string; email: string; subject: string | null; message: string; created_at: string };
const LIMIT = 200;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, created_at")
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  const rows = (data ?? []) as Message[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Messages" description="Messages sent through the Contact page. Reply by email, then delete them once handled." />
      <Notice notice={sp.notice} error={sp.error} />

      {error ? (
        <ErrorBox title="Couldn't load messages." message={error.message} />
      ) : rows.length === 0 ? (
        <EmptyBox>No messages yet.</EmptyBox>
      ) : (
        <ul className="space-y-4">
          {rows.map((m) => (
            <li key={m.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-900">{m.subject || "(no subject)"}</h2>
                    <p className="mt-0.5 break-words text-sm text-slate-500">
                      {m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Your message to 1M Scholars"}`)}`} className="font-semibold text-blue-600">{m.email}</a>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400" title={formatDate(m.created_at)}>{formatDateTime(m.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Your message to 1M Scholars"}`)}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Mail size={15} /> Reply</a>
                    <form action={deleteMessage}>
                      <input type="hidden" name="id" value={m.id} />
                      <ConfirmButton message="Delete this message? This can't be undone." pendingLabel="Deleting…">Delete</ConfirmButton>
                    </form>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-line break-words rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">{m.message}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {rows.length >= LIMIT && <p className="text-xs text-slate-400">Showing the latest {LIMIT} messages.</p>}
    </div>
  );
}
