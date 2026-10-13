import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Db = Awaited<ReturnType<typeof createClient>>;

/**
 * Every admin page AND every admin Server Action calls this. Server Actions are
 * public HTTP endpoints, so the layout's check alone is not enough.
 */
export async function requireAdmin(): Promise<{ supabase: Db; userId: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login?mode=login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.claims.sub)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  return { supabase, userId: data.claims.sub as string };
}

type PgError = { code?: string; message?: string } | null | undefined;

/** Turns database errors into something an admin can act on. */
export function friendlyError(error: PgError, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;
  const message = error.message ?? fallback;
  if (error.code === "42501" || /row-level security|permission denied/i.test(message)) {
    return "The database refused this change. Run supabase/admin-panel.sql in the Supabase SQL editor (one time), then try again.";
  }
  if (error.code === "23503") {
    return "This item is still linked to other records, so it can't be changed or removed yet.";
  }
  return message;
}

/** Only allow redirects back into the admin area. */
export function adminPath(value: FormDataEntryValue | null, fallback: string): string {
  return typeof value === "string" && value.startsWith("/admin") && !value.startsWith("//")
    ? value
    : fallback;
}

/** Redirects to `path` with a success ("notice") or error message the page shows in a banner. */
export function backTo(path: string, kind: "notice" | "error", message: string): never {
  const url = new URL(path, "http://local");
  url.searchParams.delete("notice");
  url.searchParams.delete("error");
  url.searchParams.set(kind, message);
  redirect(`${url.pathname}${url.search}`);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

export function toId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(diff)) return "—";
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date.length === 10 ? `${date}T00:00:00Z` : date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}
