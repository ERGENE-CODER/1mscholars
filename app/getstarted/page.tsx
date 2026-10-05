import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm from "./onboarding-form";

export default async function GetStartedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login?mode=signup");
  }

  const metadata = data.claims.user_metadata as
    | { full_name?: string }
    | undefined;
  const fullName =
    typeof metadata?.full_name === "string" ? metadata.full_name : null;
  const firstName = fullName?.trim().split(/\s+/)[0];

  return (
    <main className="flex min-h-[calc(100vh-94px)] w-full items-center justify-center bg-[#EEF5FF] px-4 py-12 sm:px-6">
      <div className="w-full max-w-[520px] rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,45,90,0.08)] sm:p-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold leading-[32px] text-[#12396B]">
            Welcome to 1M Scholars{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-2 text-[14px] leading-[22px] text-gray-500">
            Let&apos;s get you started by telling us a little about your
            goals.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  );
}