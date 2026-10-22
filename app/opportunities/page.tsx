import { Suspense } from "react";
import OpportunityListing from "./OpportunityListing";
import { OpportunityGridSkeleton } from "../component/StateViews";

// The listing reads ?country=… from the address bar, which needs a Suspense boundary.
export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F8FAFD] px-5 py-10 sm:px-8"><div className="mx-auto max-w-[1240px]"><OpportunityGridSkeleton /></div></main>}>
      <OpportunityListing />
    </Suspense>
  );
}
