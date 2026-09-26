import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AuthForm from "./auth-form";

// TODO: once Supabase is wired back in, replace this cookie check with a
// real session lookup (e.g. supabase.auth.getClaims()).
const SESSION_COOKIE = "1ms_session";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;

  const cookieStore = await cookies();
  const alreadySignedIn = Boolean(cookieStore.get(SESSION_COOKIE));

  if (alreadySignedIn) {
    redirect("/getstarted");
  }

  return (
    <main className="flex min-h-[calc(100vh-94px)] w-full items-center justify-center bg-[#EEF5FF] px-4 py-12 sm:px-6">
      <AuthForm initialMode={mode === "login" ? "login" : "signup"} />
    </main>
  );
}
