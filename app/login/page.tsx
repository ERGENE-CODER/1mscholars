import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "./auth-form";

export default async function SignInPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", data.claims.sub)
      .maybeSingle();

    redirect(profile?.onboarding_completed ? "/opportunity" : "/getstarted");
  }

  return (
    <main className="flex min-h-[calc(100vh-94px)] w-full items-center justify-center bg-[#EEF5FF] px-4 py-12 sm:px-6">
      {/* AuthForm reads ?mode= from the URL itself (see auth-form.tsx). */}
      <Suspense fallback={null}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
