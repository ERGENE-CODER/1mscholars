import OpportunityDetail from "../OpportunityDetail";
import OpportunityListing from "../OpportunityListing";
import { parseOpportunityId } from "@/lib/opportunities";

// "/opportunities/<id>" or "/opportunities/<id>-<title-slug>" → detail page.
// Anything else ("/opportunities/scholarships") → category listing.
export default async function OpportunityRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = parseOpportunityId(slug);
  if (id !== null) return <OpportunityDetail id={id} />;
  return <OpportunityListing initialCategory={slug} />;
}
