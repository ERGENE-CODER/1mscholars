import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import OnboardingForm from "./onboarding-form";

// TODO: once Supabase is wired back in, replace this cookie check with a
// real session lookup (e.g. supabase.auth.getClaims()) and re-add the
// profiles-table onboarding_completed check that was here before.
const SESSION_COOKIE = "1ms_session";

export default async function GetStartedPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session) {
    redirect("/login");
  }

  let fullName: string | null = null;
  try {
    const parsed = JSON.parse(session.value) as { fullName?: string };
    fullName = typeof parsed.fullName === "string" ? parsed.fullName : null;
  } catch {
    fullName = null;
  }
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
