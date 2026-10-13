"use client";

import { useFormStatus } from "react-dom";
import type { MouseEvent, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const STYLES: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  ghost: "text-slate-600 hover:bg-slate-100",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

/** Submit button that disables itself while its parent <form action={...}> is running. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: Variant;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${BASE} ${STYLES[variant]} ${className}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Asks "Are you sure?" before the surrounding form is submitted. */
export function ConfirmButton({
  children,
  message,
  pendingLabel = "Working…",
  variant = "danger",
  className = "",
}: {
  children: ReactNode;
  message: string;
  pendingLabel?: string;
  variant?: Variant;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={`${BASE} ${STYLES[variant]} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
