/** Status values stored in applications.status. */
export const STATUS_SUBMITTED = "submitted";
export const STATUS_UNDER_REVIEW = "under_review";
export const STATUS_COMPLETED = "completed";

export type StatusMeta = {
  label: string;
  className: string;
  completed: boolean;
};

/** Label + badge colours for any status, including values we don't know about. */
export function statusMeta(status: string | null | undefined): StatusMeta {
  switch (status) {
    case STATUS_COMPLETED:
      return {
        label: "Completed",
        className: "bg-emerald-50 text-emerald-700",
        completed: true,
      };
    case STATUS_UNDER_REVIEW:
      return {
        label: "In review",
        className: "bg-amber-50 text-amber-700",
        completed: false,
      };
    case STATUS_SUBMITTED:
    case null:
    case undefined:
      return {
        label: "Sent",
        className: "bg-blue-50 text-blue-700",
        completed: false,
      };
    default: {
      const pretty = status.replace(/[_-]+/g, " ").trim();
      return {
        label: pretty.charAt(0).toUpperCase() + pretty.slice(1),
        className: "bg-slate-100 text-slate-600",
        completed: false,
      };
    }
  }
}

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Kigali",
});

/** e.g. "6 Oct 2026, 14:05" (Rwanda time). Returns "—" for missing/invalid dates. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateTimeFormat.format(d);
}
