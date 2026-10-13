"use server";

import { revalidatePath } from "next/cache";
import { backTo, friendlyError, requireAdmin } from "@/lib/admin";
import { validateEmail } from "@/lib/validation";

const PAGE = "/admin/settings";

export async function addAdminEmail(formData: FormData) {
  const { supabase } = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const problem = validateEmail(email);
  if (problem) backTo(PAGE, "error", problem);

  const { error } = await supabase.from("admin_emails").insert({ email });
  if (error) backTo(PAGE, "error", error.code === "23505" ? "That email is already on the list." : friendlyError(error));

  revalidatePath(PAGE);
  backTo(PAGE, "notice", `${email} added.`);
}

export async function removeAdminEmail(formData: FormData) {
  const { supabase } = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) backTo(PAGE, "error", "That request wasn't valid.");

  const { data, error } = await supabase.from("admin_emails").delete().eq("email", email).select("email");
  if (error || !data || data.length === 0) backTo(PAGE, "error", friendlyError(error, "Nothing was removed."));

  revalidatePath(PAGE);
  backTo(PAGE, "notice", `${email} removed.`);
}
