"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { saveApplicationForm } from "./actions";
import { Card, Field, inputClass } from "../_components/ui";
import {
  FIELD_TYPES,
  type BuilderField,
  type BuilderPayload,
  type BuilderState,
  type FieldTypeValue,
} from "@/lib/admin-opportunities";

type Row = {
  key: number;
  id: number | null;
  label: string;
  type: FieldTypeValue;
  required: boolean;
  placeholder: string;
  optionsText: string; // one option per line
};

const STARTER: Omit<Row, "key">[] = [
  { id: null, label: "Full name", type: "text", required: true, placeholder: "", optionsText: "" },
  { id: null, label: "Email address", type: "email", required: true, placeholder: "", optionsText: "" },
  { id: null, label: "Phone number", type: "text", required: true, placeholder: "", optionsText: "" },
  { id: null, label: "Why are you applying?", type: "textarea", required: true, placeholder: "", optionsText: "" },
];

const hasOptions = (t: FieldTypeValue) => t === "select" || t === "radio" || t === "checkbox";

export default function FormBuilder({
  opportunityId,
  formId,
  initialTitle,
  initialDescription,
  initialFields,
}: {
  opportunityId: number;
  formId: number | null;
  initialTitle: string;
  initialDescription: string;
  initialFields: BuilderField[];
}) {
  const [state, formAction, pending] = useActionState<BuilderState, FormData>(saveApplicationForm, {});
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [rows, setRows] = useState<Row[]>(() =>
    initialFields.map((f, i) => ({
      key: i,
      id: f.id,
      label: f.label,
      type: f.type,
      required: f.required,
      placeholder: f.placeholder,
      optionsText: f.options.join("\n"),
    }))
  );
  const [nextKey, setNextKey] = useState(initialFields.length);

  const update = (key: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const move = (index: number, dir: -1 | 1) =>
    setRows((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = prev.slice();
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });

  function addRows(templates: Omit<Row, "key">[]) {
    setRows((prev) => [...prev, ...templates.map((t, i) => ({ ...t, key: nextKey + i }))]);
    setNextKey((k) => k + templates.length);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload: BuilderPayload = {
      formId,
      opportunityId,
      title,
      description,
      fields: rows.map((r) => ({
        id: r.id,
        label: r.label,
        type: r.type,
        required: r.required,
        placeholder: r.placeholder,
        options: hasOptions(r.type) ? r.optionsText.split("\n").map((o) => o.trim()).filter(Boolean) : [],
      })),
    };
    const data = new FormData();
    data.set("payload", JSON.stringify(payload));
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.error}</p>
      )}

      <Card>
        <div className="grid gap-4">
          <Field label="Form title" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Application Form" />
          </Field>
          <Field label="Introduction (optional)" hint="Shown above the questions.">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} />
          </Field>
        </div>
      </Card>

      <div className="space-y-4">
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            <p>No questions yet.</p>
            <button type="button" onClick={() => addRows(STARTER)} className="mt-3 rounded-lg bg-blue-50 px-4 py-2 font-semibold text-blue-700 hover:bg-blue-100">
              Start with common questions (name, email, phone, motivation)
            </button>
          </div>
        )}

        {rows.map((row, index) => (
          <Card key={row.key}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Question {index + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Move up"><ArrowUp size={16} /></button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Move down"><ArrowDown size={16} /></button>
                <button
                  type="button"
                  onClick={() => {
                    if (row.id !== null && !window.confirm(`Remove "${row.label || "this question"}"? If students already answered it, it will be kept.`)) return;
                    setRows((prev) => prev.filter((r) => r.key !== row.key));
                  }}
                  className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove question"
                ><Trash2 size={16} /></button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Question / label" required className="sm:col-span-2">
                <input value={row.label} onChange={(e) => update(row.key, { label: e.target.value })} className={inputClass} placeholder="e.g. Full name" />
              </Field>
              <Field label="Answer type">
                <select value={row.type} onChange={(e) => update(row.key, { type: e.target.value as FieldTypeValue })} className={inputClass}>
                  {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Placeholder (optional)" hint="Grey hint text inside the box.">
                <input value={row.placeholder} onChange={(e) => update(row.key, { placeholder: e.target.value })} className={inputClass} />
              </Field>
              {hasOptions(row.type) && (
                <Field
                  label={row.type === "checkbox" ? "Choices (optional)" : "Choices"}
                  required={row.type !== "checkbox"}
                  hint={row.type === "checkbox" ? "Leave empty for a single tick box (like “I agree”). Add choices, one per line, to let students tick several." : "One choice per line."}
                  className="sm:col-span-2"
                >
                  <textarea value={row.optionsText} onChange={(e) => update(row.key, { optionsText: e.target.value })} rows={4} className={inputClass} placeholder={"Option 1\nOption 2"} />
                </Field>
              )}
              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={row.required} onChange={(e) => update(row.key, { required: e.target.checked })} className="h-4 w-4 accent-blue-600" />
                Students must answer this
              </label>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => addRows([{ id: null, label: "", type: "text", required: false, placeholder: "", optionsText: "" }])} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <Plus size={16} /> Add question
        </button>
        <button type="submit" disabled={pending} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Saving…" : "Save form"}
        </button>
      </div>
    </form>
  );
}
