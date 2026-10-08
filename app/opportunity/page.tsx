import { redirect } from "next/navigation";
import { OPPORTUNITIES_PATH } from "@/lib/routes";

// Old placeholder URL. Forward to the real opportunities pages.
export default function OpportunityPage() {
  redirect(OPPORTUNITIES_PATH);
}
