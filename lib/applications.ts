import { getSupabase } from "./supabase/client";

/* ---------- Types (mirrors table_schema.sql) ---------- */

export type FieldType = "text" | "email" | "number" | "date" | "textarea" | "select" | "radio" | "checkbox" | "file";

export type FieldOption = { label: string; value: string };

export type ApplicationField = {
  id: number;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string | null;
  options: FieldOption[];
  position: number;
};

export type ApplicationForm = {
  id: number;
  opportunityId: number;
  title: string;
  description: string | null;
  fields: ApplicationField[];
};

type FieldRow = {
  id: number;
  label: string;
  field_type: FieldType;
  required: boolean;
  placeholder: string | null;
  options: unknown;
  position: number;
};

type FormRow = {
  id: number;
  opportunity_id: number;
  title: string;
  description: string | null;
  application_fields: FieldRow[] | null;
};

/** Value held by the form for a single field. */
export type AnswerValue = string | string[] | boolean | File | null;

/* ---------- Form loading ---------- */

/**
 * `application_fields.options` is free-form jsonb. Accept ["A", "B"], [{label, value}],
 * [{label}] / [{value}], or { options: [...] }.
 */
export function normalizeOptions(raw: unknown): FieldOption[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { options?: unknown }).options)
      ? (raw as { options: unknown[] }).options
      : [];
  const result: FieldOption[] = [];
  for (const item of list) {
    if (typeof item === "string" || typeof item === "number") {
      result.push({ label: String(item), value: String(item) });
    } else if (item && typeof item === "object") {
      const o = item as { label?: unknown; value?: unknown };
      const label = o.label ?? o.value;
      const value = o.value ?? o.label;
      if (label != null && value != null) result.push({ label: String(label), value: String(value) });
    }
  }
  return result;
}

/** Latest application form for an opportunity (with ordered fields), or null if none has been created. */
export async function fetchApplicationForm(opportunityId: number): Promise<ApplicationForm | null> {
  const { data, error } = await getSupabase()
    .from("application_forms")
    .select("id, opportunity_id, title, description, application_fields(id, label, field_type, required, placeholder, options, position)")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as unknown as FormRow;
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    title: row.title,
    description: row.description,
    fields: (row.application_fields ?? [])
      .slice()
      .sort((a, b) => a.position - b.position || a.id - b.id)
      .map((f) => ({
        id: f.id,
        label: f.label,
        type: f.field_type,
        required: f.required,
        placeholder: f.placeholder,
        options: normalizeOptions(f.options),
        position: f.position,
      })),
  };
}

/* ---------- Submission ---------- */

type AnswerInsert = {
  application_id: number;
  field_id: number;
  answer_text: string | null;
  answer_json: unknown;
};

/** Optional Storage bucket for `file` fields. When unset, only file metadata (name/size/type) is saved. */
const FILE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

export function isEmptyAnswer(value: AnswerValue | undefined) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "boolean") return !value;
  return false;
}

async function buildAnswer(
  applicationId: number,
  field: ApplicationField,
  value: AnswerValue,
): Promise<AnswerInsert> {
  const base = { application_id: applicationId, field_id: field.id };

  if (value instanceof File) {
    const meta: Record<string, unknown> = { name: value.name, size: value.size, type: value.type };
    if (FILE_BUCKET) {
      const safeName = value.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const path = `${applicationId}/${field.id}/${Date.now()}-${safeName}`;
      const { error } = await getSupabase().storage.from(FILE_BUCKET).upload(path, value, { contentType: value.type || undefined });
      if (error) throw new Error(`Could not upload "${value.name}": ${error.message}`);
      meta.bucket = FILE_BUCKET;
      meta.path = path;
    }
    return { ...base, answer_text: value.name, answer_json: meta };
  }
  if (Array.isArray(value)) return { ...base, answer_text: value.join(", "), answer_json: value };
  if (typeof value === "boolean") return { ...base, answer_text: value ? "Yes" : "No", answer_json: value };
  if (field.type === "number") {
    const n = Number(value);
    return { ...base, answer_text: String(value), answer_json: Number.isFinite(n) ? n : null };
  }
  return { ...base, answer_text: String(value).trim(), answer_json: null };
}

/**
 * Inserts a row into `applications` (status "submitted") and one row per answered field into
 * `application_answers`. Returns the new application id.
 */
export async function submitApplication(params: {
  opportunityId: number;
  form: ApplicationForm;
  values: Record<number, AnswerValue>;
}): Promise<number> {
  const supabase = getSupabase();

  // Attach the signed-in user if there is one; otherwise applicant_id stays null.
  const { data: sessionData } = await supabase.auth.getSession();
  const applicantId = sessionData.session?.user.id ?? null;

  const { data: application, error: appError } = await supabase
    .from("applications")
    .insert({
      opportunity_id: params.opportunityId,
      form_id: params.form.id,
      applicant_id: applicantId,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (appError || !application) throw new Error(appError?.message ?? "Could not create the application.");
  const applicationId = application.id as number;

  try {
    const answers: AnswerInsert[] = [];
    for (const field of params.form.fields) {
      const value = params.values[field.id];
      if (isEmptyAnswer(value)) continue;
      answers.push(await buildAnswer(applicationId, field, value as AnswerValue));
    }
    if (answers.length) {
      const { error } = await supabase.from("application_answers").insert(answers);
      if (error) throw new Error(error.message);
    }
  } catch (err) {
    // Best effort: don't leave a half-saved application behind (may be blocked by RLS).
    await supabase.from("applications").delete().eq("id", applicationId);
    throw err;
  }

  return applicationId;
}

/** True when a user is signed in on this browser (so the new application can be tracked). */
export async function isSignedIn(): Promise<boolean> {
  const { data } = await getSupabase().auth.getSession();
  return Boolean(data.session);
}
