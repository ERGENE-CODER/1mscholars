"use client";

import { useFormStatus } from "react-dom";

export default function StatusButton({
  label,
  pendingLabel,
  variant,
}: {
  label: string;
  pendingLabel: string;
  variant: "primary" | "ghost";
}) {
  const { pending } = useFormStatus();
  const styles =
    variant === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : "border border-slate-300 text-[#102F59] hover:bg-slate-50";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`h-10 rounded-xl px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
