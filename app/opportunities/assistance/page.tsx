import { Suspense } from "react";
import { PageSkeleton } from "../../component/StateViews";
import AssistanceForm from "./AssistanceForm";

// useSearchParams() needs a Suspense boundary so the page can be prerendered.
export default function AssistancePage() {
  return (
    <Suspense fallback={<PageSkeleton label="Loading application form" />}>
      <AssistanceForm />
    </Suspense>
  );
}
