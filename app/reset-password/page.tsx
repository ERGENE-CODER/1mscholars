import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResetForm from "./reset-form";

export const metadata = { title: "Choose a new password | 1M Scholars" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  // Only reachable through the emailed link, which signs the person in first.
  if (!data?.claims) {
    redirect("/login?mode=forgot&notice=reset-expired");
  }

  return (
    <main className="flex min-h-[calc(100vh-94px)] w-full items-center justify-center bg-[#EEF5FF] px-4 py-12 sm:px-6">
      <ResetForm />
    </main>
  );
}
