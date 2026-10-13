/** Shared (browser + server) types and constants for the admin opportunity & form editors. */

export const OPPORTUNITY_STATUSES = ["draft", "published", "closed"] as const;
export type OpportunityStatusValue = (typeof OPPORTUNITY_STATUSES)[number];

export const STATUS_LABELS: Record<OpportunityStatusValue, string> = {
  draft: "Draft (hidden)",
  published: "Published (visible)",
  closed: "Closed",
};

/** Suggestions for the category box; admins can still type anything. */
export const CATEGORY_SUGGESTIONS = [
  "Scholarships",
  "Jobs",
  "Internships",
  "Fellowships",
  "Training",
  "Competitions",
];

export type OpportunityFormValues = {
  id?: number;
  title: string;
  organization: string;
  category: string;
  country: string;
  location: string;
  deadline: string; // YYYY-MM-DD or ""
  image_url: string;
  status: OpportunityStatusValue;
  featured: boolean;
  description: string;
  programs: string[];
  requirements: string[];
  benefits: string[];
};

export type SaveState = { error?: string; values?: OpportunityFormValues };

export const FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Long text (paragraph)" },
  { value: "select", label: "Dropdown (choose one)" },
  { value: "radio", label: "Radio buttons (choose one)" },
  { value: "checkbox", label: "Checkbox (yes/no, or pick several if options are added)" },
  { value: "file", label: "File upload" },
] as const;

export type FieldTypeValue = (typeof FIELD_TYPES)[number]["value"];

export type BuilderField = {
  /** Existing database id; null for a field that hasn't been saved yet. */
  id: number | null;
  label: string;
  type: FieldTypeValue;
  required: boolean;
  placeholder: string;
  options: string[];
};

export type BuilderPayload = {
  formId: number | null;
  opportunityId: number;
  title: string;
  description: string;
  fields: BuilderField[];
};

export type BuilderState = { error?: string; saved?: string };
