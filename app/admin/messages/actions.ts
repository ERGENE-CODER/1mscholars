"use server";

import { revalidatePath } from "next/cache";
import { backTo, friendlyError, requireAdmin, toId } from "@/lib/admin";

export async function deleteMessage(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = toId(formData.get("id"));
  if (!id) backTo("/admin/messages", "error", "That request wasn't valid.");

  const { data, error } = await supabase.from("contact_messages").delete().eq("id", id).select("id");
  if (error || !data || data.length === 0) backTo("/admin/messages", "error", friendlyError(error, "Nothing was deleted."));

  revalidatePath("/admin", "layout");
  backTo("/admin/messages", "notice", "Message deleted.");
}
