import OpportunityList from "./opportunity-list";

export const metadata = { title: "Opportunities | Admin" };

export default async function AdminOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; notice?: string; error?: string }>;
}) {
  return <OpportunityList basePath="/admin/opportunities" searchParams={await searchParams} />;
}
