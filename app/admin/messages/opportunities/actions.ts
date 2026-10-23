"use server";

import { revalidatePath } from "next/cache";
import { adminPath, backTo, friendlyError, requireAdmin, toId, type Db } from "@/lib/admin";

const NOT_OWNER = "You can only delete opportunities and forms you published yourself. Ask a full administrator.";

/** Limited admins may only delete things they created. Full admins may delete anything. */
async function ownsOpportunity(supabase: Db, userId: string, opportunityId: number): Promise<boolean> {
  const { data } = await supabase.from("opportunities").select("created_by").eq("id", opportunityId).maybeSingle();
  return !!data && data.created_by === userId;
}
import {
  FIELD_TYPES,
  OPPORTUNITY_STATUSES,
  type BuilderPayload,
  type BuilderState,
  type OpportunityFormValues,
  type OpportunityStatusValue,
  type SaveState,
} from "@/lib/admin-opportunities";

const LIST = "/admin/opportunities";

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/opportunities", "layout");
}

/* ------------------------------------------------------------------ */
/* Create / update an opportunity                                      */
/* ------------------------------------------------------------------ */

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const list = (fd: FormData, key: string) =>
  fd.getAll(key).map((v) => String(v).trim()).filter(Boolean);

function readValues(fd: FormData): OpportunityFormValues {
  const status = text(fd, "status") as OpportunityStatusValue;
  const id = toId(fd.get("id"));
  return {
    ...(id ? { id } : {}),
    title: text(fd, "title"),
    organization: text(fd, "organization"),
    category: text(fd, "category"),
    country: text(fd, "country"),
    location: text(fd, "location"),
    deadline: text(fd, "deadline"),
    image_url: text(fd, "image_url"),
    status: OPPORTUNITY_STATUSES.includes(status) ? status : "draft",
    featured: fd.get("featured") === "on",
    description: String(fd.get("description") ?? "").trim(),
    programs: list(fd, "programs"),
    requirements: list(fd, "requirements"),
    benefits: list(fd, "benefits"),
  };
}

function validate(v: OpportunityFormValues): string | null {
  if (!v.title) return "Please enter a title.";
  if (v.title.length > 200) return "The title is too long (200 characters max).";
  if (!v.organization) return "Please enter the organization.";
  if (v.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(v.deadline)) return "The deadline isn't a valid date.";
  if (v.image_url && !/^https?:\/\/\S+$/i.test(v.image_url) && !v.image_url.startsWith("/")) {
    return "The image link must start with https:// (or be a path like /hero.png).";
  }
  return null;
}

const CHILD_TABLES = [
  { table: "opportunity_programs", column: "program_name", key: "programs" },
  { table: "opportunity_requirements", column: "requirement", key: "requirements" },
  { table: "opportunity_benefits", column: "benefit", key: "benefits" },
] as const;

/** Inserts the new list first, then removes the old rows, so a failure never loses the old data. */
async function replaceChildren(supabase: Db, opportunityId: number, v: OpportunityFormValues): Promise<string | null> {
  for (const { table, column, key } of CHILD_TABLES) {
    const { data: old, error: readError } = await supabase
      .from(table)
      .select("id")
      .eq("opportunity_id", opportunityId);
    if (readError) return friendlyError(readError);

    const values = v[key];
    if (values.length) {
      const rows = values.map((value, position) => ({ opportunity_id: opportunityId, [column]: value, position }));
      const { error } = await supabase.from(table).insert(rows);
      if (error) return friendlyError(error);
    }
    const oldIds = (old ?? []).map((r: { id: number }) => r.id);
    if (oldIds.length) {
      const { error } = await supabase.from(table).delete().in("id", oldIds);
      if (error) return friendlyError(error);
    }
  }
  return null;
}

export async function saveOpportunity(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const { supabase, userId } = await requireAdmin();
  const values = readValues(formData);
  const problem = validate(values);
  if (problem) return { error: problem, values };

  const row = {
    title: values.title,
    organization: values.organization,
    category: values.category || null,
    description: values.description || null,
    country: values.country || null,
    location: values.location || null,
    deadline: values.deadline || null,
    image_url: values.image_url || null,
    status: values.status,
    featured: values.featured,
    updated_at: new Date().toISOString(),
  };

  let opportunityId: number;
  const isNew = !values.id;

  if (values.id) {
    const { data, error } = await supabase.from("opportunities").update(row).eq("id", values.id).select("id");
    if (error || !data || data.length === 0) {
      return { error: friendlyError(error, "Nothing was updated. Check that this opportunity still exists and that you're an admin."), values };
    }
    opportunityId = values.id;
  } else {
    const { data, error } = await supabase
      .from("opportunities")
      .insert({ ...row, created_by: userId })
      .select("id")
      .single();
    if (error || !data) return { error: friendlyError(error), values };
    opportunityId = data.id as number;
  }

  const childError = await replaceChildren(supabase, opportunityId, values);
  refresh();

  if (childError) {
    if (isNew) {
      backTo(`${LIST}/${opportunityId}/edit`, "error", `The opportunity was created, but its lists weren't saved: ${childError}`);
    }
    return { error: `Details were saved, but the lists weren't: ${childError}`, values };
  }

  backTo(LIST, "notice", isNew ? `"${values.title}" was added.` : `"${values.title}" was updated.`);
}

/* ------------------------------------------------------------------ */
/* Quick actions from the list                                         */
/* ------------------------------------------------------------------ */

export async function setOpportunityStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = toId(formData.get("id"));
  const status = String(formData.get("status") ?? "") as OpportunityStatusValue;
  const returnTo = adminPath(formData.get("returnTo"), LIST);

  if (!id || !OPPORTUNITY_STATUSES.includes(status)) backTo(returnTo, "error", "That request wasn't valid.");

  const { data, error } = await supabase
    .from("opportunities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error || !data || data.length === 0) backTo(returnTo, "error", friendlyError(error, "Nothing was updated."));

  refresh();
  const label = status === "published" ? "published" : status === "closed" ? "closed" : "moved back to draft";
  backTo(returnTo, "notice", `Opportunity ${label}.`);
}

export async function toggleFeatured(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = toId(formData.get("id"));
  const featured = formData.get("featured") === "true";
  const returnTo = adminPath(formData.get("returnTo"), LIST);
  if (!id) backTo(returnTo, "error", "That request wasn't valid.");

  const { data, error } = await supabase
    .from("opportunities")
    .update({ featured, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error || !data || data.length === 0) backTo(returnTo, "error", friendlyError(error, "Nothing was updated."));

  refresh();
  backTo(returnTo, "notice", featured ? "Marked as featured." : "Removed from featured.");
}

/**
 * Deletes an opportunity together with its lists and application form.
 * Refuses if students have already applied: deleting would erase their applications.
 */
export async function deleteOpportunity(formData: FormData) {
  const { supabase, userId, isFull } = await requireAdmin();
  const id = toId(formData.get("id"));
  const returnTo = adminPath(formData.get("returnTo"), LIST);
  if (!id) backTo(returnTo, "error", "That request wasn't valid.");
  if (!isFull && !(await ownsOpportunity(supabase, userId, id))) backTo(returnTo, "error", NOT_OWNER);

  const { count, error: countError } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("opportunity_id", id);
  if (countError || count === null) backTo(returnTo, "error", friendlyError(countError));
  if (count > 0) {
    backTo(
      returnTo,
      "error",
      `This opportunity has ${count} application${count === 1 ? "" : "s"}, so it can't be deleted without erasing them. Close it instead.`
    );
  }

  const { data: forms, error: formsError } = await supabase.from("application_forms").select("id").eq("opportunity_id", id);
  if (formsError) backTo(returnTo, "error", friendlyError(formsError));
  const formIds = (forms ?? []).map((f: { id: number }) => f.id);
  if (formIds.length) {
    const { error } = await supabase.from("application_fields").delete().in("form_id", formIds);
    if (error) backTo(returnTo, "error", friendlyError(error));
    const { error: e2 } = await supabase.from("application_forms").delete().in("id", formIds);
    if (e2) backTo(returnTo, "error", friendlyError(e2));
  }
  for (const { table } of CHILD_TABLES) {
    const { error } = await supabase.from(table).delete().eq("opportunity_id", id);
    if (error) backTo(returnTo, "error", friendlyError(error));
  }
  const { data, error } = await supabase.from("opportunities").delete().eq("id", id).select("id");
  if (error || !data || data.length === 0) backTo(returnTo, "error", friendlyError(error, "Nothing was deleted."));

  refresh();
  // If we were on the edit page of the deleted item, go to the list.
  backTo(returnTo.includes("/edit") ? LIST : returnTo, "notice", "Opportunity deleted.");
}

/* ------------------------------------------------------------------ */
/* Application form builder                                            */
/* ------------------------------------------------------------------ */

const FIELD_TYPE_VALUES: string[] = FIELD_TYPES.map((t) => t.value);

function parsePayload(raw: FormDataEntryValue | null): BuilderPayload | string {
  try {
    const p = JSON.parse(String(raw ?? "")) as BuilderPayload;
    if (!toId(p.opportunityId) || !Array.isArray(p.fields)) return "The form data was incomplete. Please reload the page and try again.";
    return p;
  } catch {
    return "The form data was unreadable. Please reload the page and try again.";
  }
}

export async function saveApplicationForm(_prev: BuilderState, formData: FormData): Promise<BuilderState> {
  const { supabase } = await requireAdmin();
  const parsed = parsePayload(formData.get("payload"));
  if (typeof parsed === "string") return { error: parsed };
  const p = parsed;

  const title = String(p.title ?? "").trim();
  if (!title) return { error: "Please give the form a title." };
  if (p.fields.length === 0) return { error: "Add at least one field to the form." };

  for (const [i, f] of p.fields.entries()) {
    const n = i + 1;
    if (!String(f.label ?? "").trim()) return { error: `Field ${n} needs a label (the question students see).` };
    if (!FIELD_TYPE_VALUES.includes(f.type)) return { error: `Field ${n} has an unknown type.` };
    const options = (f.options ?? []).map((o) => String(o).trim()).filter(Boolean);
    if ((f.type === "select" || f.type === "radio") && options.length < 2) {
      return { error: `"${f.label}" needs at least two options (one per line).` };
    }
  }

  const description = String(p.description ?? "").trim() || null;
  let formId = toId(p.formId);

  if (formId) {
    const { data, error } = await supabase
      .from("application_forms")
      .update({ title, description, updated_at: new Date().toISOString() })
      .eq("id", formId)
      .eq("opportunity_id", p.opportunityId)
      .select("id");
    if (error || !data || data.length === 0) return { error: friendlyError(error, "The form couldn't be updated.") };
  } else {
    const { data, error } = await supabase
      .from("application_forms")
      .insert({ opportunity_id: p.opportunityId, title, description })
      .select("id")
      .single();
    if (error || !data) return { error: friendlyError(error) };
    formId = data.id as number;
  }

  const { data: existing, error: existingError } = await supabase
    .from("application_fields")
    .select("id")
    .eq("form_id", formId);
  if (existingError) return { error: friendlyError(existingError) };
  const existingIds = new Set((existing ?? []).map((r: { id: number }) => r.id));

  // Fields removed in the editor. Ones with applicant answers must stay (answers point at them).
  const keptIds = new Set(p.fields.map((f) => f.id).filter((v): v is number => v !== null && existingIds.has(v)));
  const removed = [...existingIds].filter((id) => !keptIds.has(id));
  let lockedLabels: string[] = [];
  if (removed.length) {
    const { data: used, error: usedError } = await supabase
      .from("application_answers")
      .select("field_id")
      .in("field_id", removed);
    if (usedError) return { error: friendlyError(usedError) };
    const lockedIds = new Set((used ?? []).map((r: { field_id: number }) => r.field_id));
    const deletable = removed.filter((id) => !lockedIds.has(id));
    if (deletable.length) {
      const { error } = await supabase.from("application_fields").delete().in("id", deletable);
      if (error) return { error: friendlyError(error) };
    }
    if (lockedIds.size) {
      const { data: labels } = await supabase.from("application_fields").select("label").in("id", [...lockedIds]);
      lockedLabels = (labels ?? []).map((r: { label: string }) => r.label);
    }
  }

  for (const [position, f] of p.fields.entries()) {
    const options = (f.options ?? []).map((o) => String(o).trim()).filter(Boolean);
    const row = {
      label: f.label.trim(),
      field_type: f.type,
      required: Boolean(f.required),
      placeholder: String(f.placeholder ?? "").trim() || null,
      options: options.length ? options : null,
      position,
    };
    if (f.id !== null && existingIds.has(f.id)) {
      const { error } = await supabase.from("application_fields").update(row).eq("id", f.id).eq("form_id", formId);
      if (error) return { error: friendlyError(error) };
    } else {
      const { error } = await supabase.from("application_fields").insert({ ...row, form_id: formId });
      if (error) return { error: friendlyError(error) };
    }
  }

  refresh();
  const kept = lockedLabels.length
    ? ` Kept ${lockedLabels.map((l) => `"${l}"`).join(", ")} because students have already answered it.`
    : "";
  // Redirect to the same page so new fields get their real ids.
  backTo(`${LIST}/${p.opportunityId}/form`, "notice", `Application form saved.${kept}`);
}

export async function deleteApplicationForm(formData: FormData) {
  const { supabase, userId, isFull } = await requireAdmin();
  const formId = toId(formData.get("formId"));
  const opportunityId = toId(formData.get("opportunityId"));
  if (!formId || !opportunityId) backTo(LIST, "error", "That request wasn't valid.");
  const page = `${LIST}/${opportunityId}/form`;
  if (!isFull && !(await ownsOpportunity(supabase, userId, opportunityId))) backTo(page, "error", NOT_OWNER);

  const { count, error: countError } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("form_id", formId);
  if (countError || count === null) backTo(page, "error", friendlyError(countError));
  if (count > 0) {
    backTo(page, "error", `Students have already submitted ${count} application${count === 1 ? "" : "s"} with this form, so it can't be deleted. Edit its fields instead.`);
  }

  const { error: fieldsError } = await supabase.from("application_fields").delete().eq("form_id", formId);
  if (fieldsError) backTo(page, "error", friendlyError(fieldsError));
  const { data, error } = await supabase.from("application_forms").delete().eq("id", formId).select("id");
  if (error || !data || data.length === 0) backTo(page, "error", friendlyError(error, "Nothing was deleted."));

  refresh();
  backTo(page, "notice", "Application form deleted.");
}
