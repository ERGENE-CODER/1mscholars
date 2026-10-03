import { getSupabase } from "./supabase/client";

/* ---------- Database row types (mirrors table_schema.sql) ---------- */

export type OpportunityStatus = "draft" | "published" | "closed";

type OpportunityRow = {
  id: number;
  title: string;
  organization: string;
  description: string | null;
  country: string | null;
  location: string | null;
  deadline: string | null; // date (YYYY-MM-DD)
  image_url: string | null;
  status: OpportunityStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

type ProgramRow = { id: number; program_name: string; position: number };
type RequirementRow = { id: number; requirement: string; position: number };
type BenefitRow = { id: number; benefit: string; position: number };

type OpportunityQueryRow = OpportunityRow & {
  opportunity_programs: ProgramRow[] | null;
  opportunity_requirements: RequirementRow[] | null;
  opportunity_benefits: BenefitRow[] | null;
};

/* ---------- App-level shape used by the UI ---------- */

export type Opportunity = {
  id: number;
  /** URL segment for the detail page: "<id>-<title-slug>" */
  slug: string;
  title: string;
  organization: string;
  description: string;
  country: string | null;
  location: string;
  deadline: string | null;
  deadlineLabel: string;
  image: string;
  status: OpportunityStatus;
  featured: boolean;
  createdAt: string;
  /** Program names from opportunity_programs, in position order. The first one is the primary category. */
  programs: string[];
  requirements: string[];
  benefits: string[];
};

export type Category = { slug: string; name: string };

const FALLBACK_IMAGE = "/hero.png";

const OPPORTUNITY_SELECT =
  "*, opportunity_programs(id, program_name, position), opportunity_requirements(id, requirement, position), opportunity_benefits(id, benefit, position)";

/* ---------- Helpers ---------- */

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Loose key so "Scholarship", "scholarships" and "Scholarships " all match one category. */
export function categoryKey(text: string) {
  return slugify(text).replace(/s$/, "");
}

export function opportunityPath(o: { id: number; title: string }) {
  const slug = slugify(o.title);
  return `/opportunities/${o.id}${slug ? `-${slug}` : ""}`;
}

/** Extracts the numeric id from "<id>" or "<id>-<slug>"; returns null for anything else (e.g. category slugs). */
export function parseOpportunityId(segment: string): number | null {
  const match = /^(\d+)(?:-.*)?$/.exec(segment);
  return match ? Number(match[1]) : null;
}

export function prettifySlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDeadline(date: string | null) {
  if (!date) return "Not specified";
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const byPosition = <T extends { position: number; id: number }>(a: T, b: T) => a.position - b.position || a.id - b.id;

function mapOpportunity(row: OpportunityQueryRow): Opportunity {
  const location = [row.location, row.country].filter((v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i).join(", ");
  return {
    id: row.id,
    slug: opportunityPath(row).replace("/opportunities/", ""),
    title: row.title,
    organization: row.organization,
    description: row.description ?? "",
    country: row.country,
    location,
    deadline: row.deadline,
    deadlineLabel: formatDeadline(row.deadline),
    image: row.image_url || FALLBACK_IMAGE,
    status: row.status,
    featured: row.featured,
    createdAt: row.created_at,
    programs: (row.opportunity_programs ?? []).slice().sort(byPosition).map((p) => p.program_name),
    requirements: (row.opportunity_requirements ?? []).slice().sort(byPosition).map((r) => r.requirement),
    benefits: (row.opportunity_benefits ?? []).slice().sort(byPosition).map((b) => b.benefit),
  };
}

/* ---------- Queries ---------- */

/** All published opportunities, newest first (featured ones are not forced to the top; the UI sorts). */
export async function fetchPublishedOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await getSupabase()
    .from("opportunities")
    .select(OPPORTUNITY_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as OpportunityQueryRow[]).map(mapOpportunity);
}

/** One opportunity with its programs, requirements and benefits. Returns null when it doesn't exist or isn't public. */
export async function fetchOpportunity(id: number): Promise<Opportunity | null> {
  const { data, error } = await getSupabase()
    .from("opportunities")
    .select(OPPORTUNITY_SELECT)
    .eq("id", id)
    .in("status", ["published", "closed"])
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapOpportunity(data as unknown as OpportunityQueryRow) : null;
}

/** Up to `limit` other published opportunities, preferring ones that share a program with the current one. */
export async function fetchRelatedOpportunities(current: Opportunity, limit = 3): Promise<Opportunity[]> {
  const { data, error } = await getSupabase()
    .from("opportunities")
    .select(OPPORTUNITY_SELECT)
    .eq("status", "published")
    .neq("id", current.id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  const keys = new Set(current.programs.map(categoryKey));
  const shares = (o: Opportunity) => o.programs.some((p) => keys.has(categoryKey(p)));
  const all = ((data ?? []) as unknown as OpportunityQueryRow[]).map(mapOpportunity);
  return [...all.filter(shares), ...all.filter((o) => !shares(o))].slice(0, limit);
}

/* ---------- Categories (derived from opportunity_programs) ---------- */

const PREFERRED_ORDER = ["scholarship", "job", "internship", "fellowship", "training", "competition"];

export function deriveCategories(opportunities: Opportunity[]): Category[] {
  const map = new Map<string, Category>();
  for (const o of opportunities) {
    for (const name of o.programs) {
      const key = categoryKey(name);
      if (key && !map.has(key)) map.set(key, { slug: slugify(name), name });
    }
  }
  const rank = (c: Category) => {
    const i = PREFERRED_ORDER.indexOf(categoryKey(c.name));
    return i === -1 ? PREFERRED_ORDER.length : i;
  };
  return [...map.values()].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

/** True when two category names/slugs refer to the same category. */
export function sameCategory(a: string, b: string) {
  return categoryKey(a) === categoryKey(b);
}

export function inCategory(o: Opportunity, categorySlug: string) {
  return o.programs.some((p) => sameCategory(p, categorySlug));
}
