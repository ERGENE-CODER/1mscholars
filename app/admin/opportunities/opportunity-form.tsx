"use client";

import Link from "next/link";
import { startTransition, useActionState, type FormEvent } from "react";
import { saveOpportunity } from "./actions";
import StringListEditor from "../_components/string-list-editor";
import { Card, Field, inputClass } from "../_components/ui";
import {
  CATEGORY_SUGGESTIONS,
  OPPORTUNITY_STATUSES,
  STATUS_LABELS,
  STUDY_LEVELS,
  type OpportunityFormValues,
  type SaveState,
} from "@/lib/admin-opportunities";

export const EMPTY_OPPORTUNITY: OpportunityFormValues = {
  title: "",
  organization: "",
  category: "",
  country: "",
  study_level: "",
  location: "",
  deadline: "",
  image_url: "",
  status: "draft",
  featured: false,
  description: "",
  programs: [],
  requirements: [],
  benefits: [],
};

export default function OpportunityForm({
  initial,
  categories,
}: {
  initial: OpportunityFormValues;
  categories: string[];
}) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveOpportunity, {});
  // After a failed save the server echoes back what was typed, so nothing is lost.
  const v = state.values ?? initial;
  const isEdit = Boolean(v.id);
  const suggestions = [...new Set([...CATEGORY_SUGGESTIONS, ...categories])];

  // Calling the action from onSubmit (instead of <form action>) stops React from
  // clearing the fields after a failed save.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {v.id && <input type="hidden" name="id" value={v.id} />}

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <Card>
        <h2 className="text-base font-bold text-slate-900">Basic details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Title" required className="sm:col-span-2">
            <input name="title" required maxLength={200} defaultValue={v.title} className={inputClass} placeholder="e.g. Mastercard Foundation Scholarship 2027" />
          </Field>
          <Field label="Organization" required>
            <input name="organization" required defaultValue={v.organization} className={inputClass} placeholder="Who is offering it?" />
          </Field>
          <Field label="Category" hint="Pick one or type a new one. Students filter by this.">
            <input name="category" list="category-options" defaultValue={v.category} className={inputClass} placeholder="e.g. Scholarships" />
            <datalist id="category-options">
              {suggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Study level" hint="For scholarships: who can apply. Students can filter by this.">
            <select name="study_level" defaultValue={v.study_level} className={inputClass}>
              <option value="">Not specified</option>
              {STUDY_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Country">
            <input name="country" defaultValue={v.country} className={inputClass} placeholder="e.g. Rwanda" />
          </Field>
          <Field label="Location / city">
            <input name="location" defaultValue={v.location} className={inputClass} placeholder="e.g. Kigali, or Online" />
          </Field>
          <Field label="Application deadline">
            <input name="deadline" type="date" defaultValue={v.deadline} className={inputClass} />
          </Field>
          <Field label="Image link" hint="A full web address (https://…) of the picture shown on the card. Optional.">
            <input name="image_url" defaultValue={v.image_url} className={inputClass} placeholder="https://…" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea name="description" rows={6} defaultValue={v.description} className={inputClass} placeholder="What is this opportunity about?" />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-bold text-slate-900">Visibility</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Status" hint="Only “Published” opportunities are shown to students.">
            <select name="status" defaultValue={v.status} className={inputClass}>
              {OPPORTUNITY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-3 self-center text-sm font-medium text-slate-700">
            <input type="checkbox" name="featured" defaultChecked={v.featured} className="h-4 w-4 accent-blue-600" />
            Feature this opportunity
          </label>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="text-base font-bold text-slate-900">Programs</h2>
          <p className="mb-3 mt-1 text-xs text-slate-500">Programs, fields of study or tracks covered.</p>
          <StringListEditor name="programs" initial={v.programs} placeholder="e.g. Computer Science" addLabel="Add program" />
        </Card>
        <Card>
          <h2 className="text-base font-bold text-slate-900">Eligibility requirements</h2>
          <p className="mb-3 mt-1 text-xs text-slate-500">One requirement per line.</p>
          <StringListEditor name="requirements" initial={v.requirements} placeholder="e.g. Must be 18–25 years old" addLabel="Add requirement" />
        </Card>
        <Card>
          <h2 className="text-base font-bold text-slate-900">Benefits</h2>
          <p className="mb-3 mt-1 text-xs text-slate-500">What the student gets.</p>
          <StringListEditor name="benefits" initial={v.benefits} placeholder="e.g. Full tuition coverage" addLabel="Add benefit" />
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create opportunity"}
        </button>
        <Link href="/admin/opportunities" className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}

