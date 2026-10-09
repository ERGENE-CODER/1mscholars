"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";
import { EmptyState, ErrorState, PageSkeleton } from "../../component/StateViews";
import {
  fetchApplicationForm,
  isEmptyAnswer,
  isSignedIn,
  submitApplication,
  type AnswerValue,
  type ApplicationField,
} from "@/lib/applications";
import { fetchOpportunity, parseOpportunityId } from "@/lib/opportunities";
import { useAsync } from "@/lib/useAsync";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#2166E8] focus:ring-2 focus:ring-[#2166E8]/10";
const textareaClass = "w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#2166E8] focus:ring-2 focus:ring-[#2166E8]/10";

const DECLARATIONS = [
  "I confirm that the information I have provided is accurate and complete.",
  "I understand that application assistance does not guarantee selection, admission, placement or employment.",
  "I agree to the 1M Scholars terms of service.",
  "I agree that 1M Scholars may contact me regarding this application.",
];

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#F8FAFD] px-5 py-16 text-[#102F59]"><div className="mx-auto max-w-xl">{children}</div></main>;
}

export default function AssistanceForm() {
  const params = useSearchParams();
  const opportunityId = parseOpportunityId(params.get("opportunity") ?? "");

  const load = useCallback(async () => {
    if (opportunityId === null) return null;
    const opportunity = await fetchOpportunity(opportunityId);
    if (!opportunity) return null;
    const form = opportunity.status === "closed" ? null : await fetchApplicationForm(opportunityId);
    return { opportunity, form };
  }, [opportunityId]);

  const { data, error, loading, retry } = useAsync(load);

  const [values, setValues] = useState<Record<number, AnswerValue>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [trackable, setTrackable] = useState(false);

  if (opportunityId === null) {
    return <Shell><EmptyState><h1 className="text-xl font-bold text-[#102F59]">Choose an opportunity first</h1><p className="mt-2 text-sm">Open an opportunity and select &ldquo;Ask for Assistance&rdquo; to start an application.</p><Link href="/opportunities" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2166E8] px-5 text-sm font-bold text-white">Browse Opportunities</Link></EmptyState></Shell>;
  }

  if (loading) return <PageSkeleton label="Loading application form" />;

  if (error) {
    return <Shell><ErrorState title="We couldn't load the application form" message={error.message} onRetry={retry} /><div className="mt-4 text-center"><Link href="/opportunities" className="text-sm font-bold text-[#2166E8]">← Back to Opportunities</Link></div></Shell>;
  }

  if (!data) {
    return <Shell><EmptyState><h1 className="text-xl font-bold text-[#102F59]">Opportunity not found</h1><p className="mt-2 text-sm">This opportunity may have been removed or is not available yet.</p><Link href="/opportunities" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2166E8] px-5 text-sm font-bold text-white">Back to Opportunities</Link></EmptyState></Shell>;
  }

  const { opportunity, form } = data;

  if (applicationId !== null) {
    return <main className="min-h-screen bg-[#F8FAFD] px-5 py-16"><div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E9F8EF] text-2xl text-emerald-600">✓</div><h1 className="mt-5 text-2xl font-bold text-[#102F59]">Application Received</h1><p className="mt-3 text-sm leading-6 text-slate-500">We have received your request for application assistance. Our team can review the information and contact you regarding the next steps.</p><p className="mt-3 text-xs font-semibold text-slate-400">Reference: #{applicationId}</p>{trackable ? null : <p className="mt-4 text-xs leading-5 text-slate-500">Sign in next time you apply to track your applications from your profile menu.</p>}<div className="mt-6 flex flex-wrap items-center justify-center gap-3">{trackable && <Link href="/my-applications" className="inline-flex h-11 items-center rounded-xl bg-[#2166E8] px-5 text-sm font-bold text-white">Track my application</Link>}<Link href="/opportunities" className={trackable ? "inline-flex h-11 items-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-[#102F59]" : "inline-flex h-11 items-center rounded-xl bg-[#2166E8] px-5 text-sm font-bold text-white"}>Back to Opportunities</Link></div></div></main>;
  }

  const fields = form?.fields ?? [];

  function setValue(fieldId: number, value: AnswerValue) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setFieldErrors((prev) => {
      if (!(fieldId in prev)) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form || submitting) return;

    // Native `required` covers most inputs; this catches checkbox groups and files.
    const errors: Record<number, string> = {};
    for (const field of fields) if (field.required && isEmptyAnswer(values[field.id])) errors[field.id] = "This field is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      document.getElementById(`field-${Number(Object.keys(errors)[0])}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const id = await submitApplication({ opportunityId: opportunity.id, form, values });
      setTrackable(await isSignedIn().catch(() => false));
      setApplicationId(id);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong while submitting your application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFD] pb-16 text-[#102F59]">
      <section className="bg-[#102F59] px-5 py-10 text-white sm:py-12"><div className="mx-auto max-w-[1050px]"><span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">1M Scholars</span><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Application Assistance</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Tell us about yourself and we can help you understand the application process for your selected opportunity.</p></div></section>
      <div className="mx-auto max-w-[1050px] px-5 sm:px-8">
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Important Notice:</strong> Application assistance is a guidance service. It does not guarantee admission, scholarship selection, employment or any other outcome.</div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="bg-[#102F59] p-5 text-white"><div className="text-[10px] font-bold uppercase tracking-wide text-blue-200">Selected Opportunity</div><h2 className="mt-1 text-lg font-bold">{opportunity.title}</h2><p className="mt-1 text-xs text-blue-100">{opportunity.organization}{opportunity.location && ` · ${opportunity.location}`}</p></div><div className="grid gap-3 p-5 sm:grid-cols-3"><div><span className="text-[10px] font-bold uppercase text-slate-400">Category</span><p className="mt-1 text-sm font-semibold">{opportunity.programs[0] ?? "—"}</p></div><div><span className="text-[10px] font-bold uppercase text-slate-400">Deadline</span><p className="mt-1 text-sm font-semibold">{opportunity.deadlineLabel}</p></div><div><span className="text-[10px] font-bold uppercase text-slate-400">Service Fee</span><p className="mt-1 text-sm font-semibold">Contact us to confirm</p></div></div></section>

          {opportunity.status === "closed" ? (
            <EmptyState><h2 className="text-lg font-bold text-[#102F59]">Applications are closed</h2><p className="mt-2 text-sm">This opportunity is no longer accepting applications.</p><Link href="/opportunities" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2166E8] px-5 text-sm font-bold text-white">Browse Opportunities</Link></EmptyState>
          ) : !form || fields.length === 0 ? (
            <EmptyState><h2 className="text-lg font-bold text-[#102F59]">Application form not available yet</h2><p className="mt-2 text-sm">The application form for this opportunity hasn&apos;t been set up. Please check back soon.</p><Link href={`/opportunities/${opportunity.slug}`} className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2166E8] px-5 text-sm font-bold text-white">Back to Opportunity</Link></EmptyState>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-bold">{form.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{form.description || "Please provide accurate information so the team can understand your application needs."}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {fields.map((field) => <FieldInput key={field.id} field={field} value={values[field.id]} error={fieldErrors[field.id]} onChange={(v) => setValue(field.id, v)} />)}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-bold">Declarations</h2>
                <div className="mt-5 space-y-3">{DECLARATIONS.map((text, i) => <label key={text} className="flex gap-3 text-sm leading-6 text-slate-600"><input required type="checkbox" className="mt-1 h-4 w-4 accent-[#2166E8]" /> <span>{text}{i < 2 && <span className="ml-1 text-red-500">*</span>}</span></label>)}</div>
                {submitError && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"><strong>We couldn&apos;t submit your application.</strong> {submitError}</div>}
                <button type="submit" disabled={submitting} className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-[#2166E8] text-sm font-bold text-white shadow-sm transition hover:bg-[#1554C7] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Submitting…" : <>Submit Application <span className="ml-2">→</span></>}</button>
              </section>
            </>
          )}
        </form>
      </div>
    </main>
  );
}

/* ---------- Renders one application_fields row ---------- */

function FieldInput({ field, value, error, onChange }: { field: ApplicationField; value: AnswerValue | undefined; error?: string; onChange: (v: AnswerValue) => void }) {
  const id = `field-${field.id}`;
  const name = id;
  const wide = field.type === "textarea" || field.type === "radio" || field.type === "file" || (field.type === "checkbox" && field.options.length > 0);
  const labelText = <span className="mb-1.5 block text-xs font-bold text-[#102F59]">{field.label}{field.required && <span className="ml-1 text-red-500">*</span>}</span>;
  const errorText = error ? <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p> : null;
  const str = typeof value === "string" ? value : "";

  let control: React.ReactNode;
  switch (field.type) {
    case "textarea":
      control = <textarea id={id} name={name} rows={5} required={field.required} placeholder={field.placeholder ?? undefined} value={str} onChange={(e) => onChange(e.target.value)} className={textareaClass} />;
      break;
    case "select":
      control = (
        <select id={id} name={name} required={field.required} value={str} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">{field.placeholder || "Select an option"}</option>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case "radio":
      control = (
        <div id={id} role="radiogroup" className="flex flex-col gap-2">
          {field.options.map((o) => <label key={o.value} className="flex items-center gap-3 text-sm text-slate-600"><input type="radio" name={name} required={field.required} value={o.value} checked={str === o.value} onChange={() => onChange(o.value)} className="h-4 w-4 accent-[#2166E8]" />{o.label}</label>)}
        </div>
      );
      break;
    case "checkbox":
      if (field.options.length > 0) {
        const selected = Array.isArray(value) ? value : [];
        control = (
          <div id={id} className="flex flex-col gap-2">
            {field.options.map((o) => <label key={o.value} className="flex items-center gap-3 text-sm text-slate-600"><input type="checkbox" name={name} value={o.value} checked={selected.includes(o.value)} onChange={(e) => onChange(e.target.checked ? [...selected, o.value] : selected.filter((v) => v !== o.value))} className="h-4 w-4 accent-[#2166E8]" />{o.label}</label>)}
          </div>
        );
      } else {
        // Single yes/no checkbox: the field label is the checkbox text.
        return (
          <div className="sm:col-span-2">
            <label className="flex gap-3 text-sm leading-6 text-slate-600"><input id={id} type="checkbox" name={name} required={field.required} checked={value === true} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[#2166E8]" /><span>{field.label}{field.required && <span className="ml-1 text-red-500">*</span>}</span></label>
            {errorText}
          </div>
        );
      }
      break;
    case "file":
      control = <input id={id} name={name} type="file" required={field.required} onChange={(e) => onChange(e.target.files?.[0] ?? null)} className="block w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#EEF5FF] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#2166E8]" />;
      break;
    default:
      // text | email | number | date
      control = <input id={id} name={name} type={field.type} required={field.required} placeholder={field.placeholder ?? undefined} value={str} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
  }

  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      {field.type === "radio" || (field.type === "checkbox" && field.options.length > 0) ? <div className="mb-1.5 text-xs font-bold text-[#102F59]">{field.label}{field.required && <span className="ml-1 text-red-500">*</span>}</div> : <label htmlFor={id} className="block">{labelText}</label>}
      {control}
      {errorText}
    </div>
  );
}
