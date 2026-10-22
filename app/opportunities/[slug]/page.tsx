import { Suspense } from "react";
import OpportunityDetail from "../OpportunityDetail";
import OpportunityListing from "../OpportunityListing";
import { OpportunityGridSkeleton } from "../../component/StateViews";
import { parseOpportunityId } from "@/lib/opportunities";

// "/opportunities/<id>" or "/opportunities/<id>-<title-slug>" → detail page.
// Anything else ("/opportunities/scholarships") → category listing.
export default async function OpportunityRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = parseOpportunityId(slug);
  if (id !== null) return <OpportunityDetail id={id} />;
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F8FAFD] px-5 py-10 sm:px-8"><div className="mx-auto max-w-[1240px]"><OpportunityGridSkeleton /></div></main>}>
      <OpportunityListing initialCategory={slug} />
    </Suspense>
  );
}
