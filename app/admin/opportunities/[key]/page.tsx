import { notFound } from "next/navigation";
import OpportunityList from "../opportunity-list";

// /admin/opportunities/scholarships, /jobs, … (the sidebar sub-menu)
export default async function AdminOpportunityCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ status?: string; q?: string; notice?: string; error?: string }>;
}) {
  const { key } = await params;
  if (/^\d+$/.test(key)) notFound(); // numeric ids only have /edit and /form pages
  return <OpportunityList basePath={`/admin/opportunities/${key}`} category={key} searchParams={await searchParams} />;
}
