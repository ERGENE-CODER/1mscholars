"use server";

import { revalidatePath } from "next/cache";
import { backTo, friendlyError, requireAdmin, toId } from "@/lib/admin";
import { STATUS_COMPLETED, STATUS_SUBMITTED, STATUS_UNDER_REVIEW } from "@/lib/application-status";

const LIST = "/admin/applications";
const ALLOWED = [STATUS_SUBMITTED, STATUS_UNDER_REVIEW, STATUS_COMPLETED] as string[];

export async function updateApplicationStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = toId(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const page = `${LIST}/${id ?? ""}`;
  if (!id || !ALLOWED.includes(status)) backTo(LIST, "error", "That request wasn't valid.");

  const { data, error } = await supabase
    .from("applications")
    .update({
      status,
      completed_at: status === STATUS_COMPLETED ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id");
  if (error || !data || data.length === 0) backTo(page, "error", friendlyError(error, "Nothing was updated."));

  revalidatePath("/admin", "layout");
  revalidatePath("/my-applications");
  backTo(page, "notice", "Status updated. The applicant sees it under My Applications.");
}

export async function deleteApplication(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = toId(formData.get("id"));
  if (!id) backTo(LIST, "error", "That request wasn't valid.");

  const { error: answersError } = await supabase.from("application_answers").delete().eq("application_id", id);
  if (answersError) backTo(`${LIST}/${id}`, "error", friendlyError(answersError));
  const { data, error } = await supabase.from("applications").delete().eq("id", id).select("id");
  if (error || !data || data.length === 0) backTo(`${LIST}/${id}`, "error", friendlyError(error, "Nothing was deleted."));

  revalidatePath("/admin", "layout");
  revalidatePath("/my-applications");
  backTo(LIST, "notice", `Application #${id} deleted.`);
}
