"use server";

import { revalidatePath } from "next/cache";
import { backTo, friendlyError, isUuid, requireAdmin, requireFullAdmin } from "@/lib/admin";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { EDUCATION_LEVELS, validateEmail, validateFullName, validatePassword } from "@/lib/validation";

const LIST = "/admin/users";
const NEEDS_KEY =
  "This needs the SUPABASE_SERVICE_ROLE_KEY setting. Add it to your .env file (see supabase/admin-panel.sql notes in the README) and restart the server.";

export async function updateUser(formData: FormData) {
  const { supabase, userId, isFull } = await requireAdmin();
  const id = formData.get("id");
  if (!isUuid(id)) backTo(LIST, "error", "That request wasn't valid.");
  const page = `${LIST}/${id}`;

  const role = String(formData.get("role") ?? "");
  if (role !== "user" && role !== "admin" && role !== "sub_admin") backTo(page, "error", "Choose a valid role.");
  if (id === userId && role !== (isFull ? "admin" : "sub_admin")) {
    backTo(page, "error", "You can't change your own admin access. Ask a full administrator to do it.");
  }
  if (!isFull) {
    // Limited admins can edit profile details, but never anyone's role.
    const { data: current } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
    if (!current || current.role !== role) backTo(page, "error", "Only a full administrator can change roles.");
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const nameProblem = fullName ? validateFullName(fullName) : null;
  if (nameProblem) backTo(page, "error", nameProblem);

  const education = String(formData.get("education_level") ?? "").trim();
  if (education && !(EDUCATION_LEVELS as readonly string[]).includes(education)) {
    backTo(page, "error", "Choose a valid education level.");
  }

  const interests = formData.getAll("interests").map((v) => String(v).trim()).filter(Boolean);

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone_number: String(formData.get("phone_number") ?? "").trim() || null,
      education_level: education || null,
      career_interest: String(formData.get("career_interest") ?? "").trim() || null,
      interests,
      role,
      onboarding_completed: formData.get("onboarding_completed") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id");
  if (error || !data || data.length === 0) backTo(page, "error", friendlyError(error, "Nothing was updated."));

  revalidatePath("/admin/users");
  backTo(page, "notice", "User saved.");
}

/** Creates an account with a temporary password the admin passes on to the person. */
export async function createUser(formData: FormData) {
  const { isFull } = await requireAdmin();
  if (!hasServiceRole()) backTo(LIST, "error", NEEDS_KEY);

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleChoice = String(formData.get("role") ?? "user");
  const newRole = isFull && (roleChoice === "admin" || roleChoice === "sub_admin") ? roleChoice : null; // limited admins can only create students

  const problem = validateFullName(fullName) ?? validateEmail(email) ?? validatePassword(password);
  if (problem) backTo(LIST, "error", problem);

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) {
    backTo(LIST, "error", /already|registered|exists/i.test(error?.message ?? "") ? "An account with this email already exists." : (error?.message ?? "The account couldn't be created."));
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: data.user.id, email, full_name: fullName, ...(newRole ? { role: newRole } : {}) }, { onConflict: "id" });
  if (profileError) backTo(`${LIST}/${data.user.id}`, "error", `The account was created, but its profile wasn't saved: ${profileError.message}`);

  revalidatePath("/admin/users");
  backTo(`${LIST}/${data.user.id}`, "notice", `Account created for ${email}. Give them the temporary password so they can sign in.`);
}

/**
 * Deletes the account. Their applications are kept (anonymised) so records aren't lost.
 */
export async function deleteUser(formData: FormData) {
  const { userId } = await requireFullAdmin(LIST);
  const id = formData.get("id");
  if (!isUuid(id)) backTo(LIST, "error", "That request wasn't valid.");
  if (id === userId) backTo(`${LIST}/${id}`, "error", "You can't delete your own account.");
  if (!hasServiceRole()) backTo(`${LIST}/${id}`, "error", NEEDS_KEY);

  const admin = createAdminClient();
  const steps = [
    admin.from("applications").update({ applicant_id: null }).eq("applicant_id", id),
    admin.from("opportunities").update({ created_by: null }).eq("created_by", id),
    admin.from("profiles").delete().eq("id", id),
  ];
  for (const step of steps) {
    const { error } = await step;
    if (error) backTo(`${LIST}/${id}`, "error", friendlyError(error));
  }
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) backTo(`${LIST}/${id}`, "error", error.message);

  revalidatePath("/admin", "layout");
  backTo(LIST, "notice", "User deleted. Their applications were kept.");
}
