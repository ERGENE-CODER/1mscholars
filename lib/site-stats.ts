import { getSupabase } from "@/lib/supabase/client";

export type SiteStats = {
  activeOpportunities: number;
  youthSupported: number;
  collegesCovered: number;
  trainingPrograms: number;
};

function toCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * The four numbers on the home page, counted live by the database function
 * public.get_site_stats() (see supabase/site-stats.sql). It returns totals
 * only, never rows, so it is safe for signed-out visitors.
 */
export async function fetchSiteStats(): Promise<SiteStats> {
  const { data, error } = await getSupabase().rpc("get_site_stats");
  if (error) throw new Error(error.message);

  const row = (data ?? {}) as Record<string, unknown>;
  return {
    activeOpportunities: toCount(row.active_opportunities),
    youthSupported: toCount(row.youth_supported),
    collegesCovered: toCount(row.colleges_covered),
    trainingPrograms: toCount(row.training_programs),
  };
}
