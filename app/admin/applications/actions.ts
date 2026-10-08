"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STATUS_COMPLETED, STATUS_SUBMITTED } from "@/lib/application-status";

/**
 * Marks an application completed, or reopens it.
 *
 * The admin layout already blocks non-admins from the page, but server actions
 * are public endpoints, so the admin check is repeated here.
 * `completed_at` is stamped / cleared by a database trigger
 * (see supabase/applications-tracking.sql).
 */
export async function setApplicationStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const target = formData.get("status");
  const returnTo = formData.get("filter") === "completed"
    ? "completed"
    : formData.get("filter") === "submitted"
      ? "submitted"
      : "all";
  const base = `/admin/applications?status=${returnTo}`;

  if (!Number.isInteger(id) || id <= 0) redirect(`${base}&notice=invalid`);
  if (target !== STATUS_COMPLETED && target !== STATUS_SUBMITTED) {
    redirect(`${base}&notice=invalid`);
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/login?mode=login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.claims.sub)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  // .select() so we can tell "updated 0 rows" (blocked by row-level security) from success.
  const { data: updated, error } = await supabase
    .from("applications")
    .update({ status: target })
    .eq("id", id)
    .select("id");

  if (error || !updated || updated.length === 0) {
    console.error("setApplicationStatus failed:", error);
    redirect(`${base}&notice=failed`);
  }

  revalidatePath("/admin/applications");
  revalidatePath("/my-applications");
  redirect(`${base}&notice=${target === STATUS_COMPLETED ? "completed" : "reopened"}`);
}
