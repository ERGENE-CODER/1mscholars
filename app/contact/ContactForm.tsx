"use client";

import { useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase/client";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#2166E8] focus:ring-2 focus:ring-[#2166E8]/10";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: real visitors never see or fill this field. Pretend success for bots.
    if (String(data.get("website") ?? "").trim()) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setError("");
    try {
      const subject = String(data.get("subject") ?? "").trim();
      // No .select() here, so anonymous visitors only need INSERT permission.
      const { error: dbError } = await getSupabase().from("contact_messages").insert({
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        subject: subject || null,
        message: String(data.get("message") ?? "").trim(),
      });
      if (dbError) throw new Error(dbError.message);
      form.reset();
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="mt-6 rounded-2xl bg-[#E9F8EF] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-emerald-600">✓</div>
        <h3 className="mt-4 text-xl font-bold text-[#102F59]">Message sent</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Thank you for reaching out. We&apos;ll get back to you as soon as we can.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-5 inline-flex h-10 items-center rounded-xl border border-[#BFD4F7] bg-white px-5 text-sm font-bold text-[#2166E8] hover:bg-[#F3F7FF]">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold">Full name <span className="text-red-500">*</span></span>
        <input name="name" type="text" required maxLength={120} autoComplete="name" className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold">Email address <span className="text-red-500">*</span></span>
        <input name="email" type="email" required maxLength={200} autoComplete="email" className={inputClass} />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-xs font-bold">Subject</span>
        <input name="subject" type="text" maxLength={200} className={inputClass} />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-xs font-bold">Message <span className="text-red-500">*</span></span>
        <textarea name="message" rows={6} required minLength={10} maxLength={5000} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#2166E8] focus:ring-2 focus:ring-[#2166E8]/10" />
      </label>

      {/* Honeypot (hidden from people and screen readers) */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {status === "error" && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 sm:col-span-2">
          <strong>We couldn&apos;t send your message.</strong> {error}
        </div>
      )}

      <button type="submit" disabled={status === "submitting"} className="flex h-12 items-center justify-center rounded-xl bg-[#2166E8] text-sm font-bold text-white shadow-sm transition hover:bg-[#1554C7] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">
        {status === "submitting" ? "Sending…" : <>Send Message <span className="ml-2">→</span></>}
      </button>
    </form>
  );
}
