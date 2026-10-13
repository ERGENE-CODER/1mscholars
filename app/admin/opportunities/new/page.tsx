import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { PageHeader } from "../../_components/ui";
import OpportunityForm, { EMPTY_OPPORTUNITY } from "../opportunity-form";

export const metadata = { title: "Add Opportunity | Admin" };

export default async function NewOpportunityPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("opportunities").select("category").not("category", "is", null).limit(500);
  const categories = [...new Set((data ?? []).map((r: { category: string | null }) => r.category).filter((c): c is string => Boolean(c)))];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/admin/opportunities" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft size={15} /> Back to opportunities</Link>
      <PageHeader title="Add Opportunity" description="New opportunities start as drafts, so students can't see them until you publish." />
      <OpportunityForm initial={EMPTY_OPPORTUNITY} categories={categories} />
    </div>
  );
}
