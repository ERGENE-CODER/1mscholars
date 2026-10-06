import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where the confirmation email link lands.
 *
 * - Success: session is created, send them to onboarding (or straight in if
 *   they already finished it).
 * - Expired / already-used link: Supabase appends ?error=...&error_code=...
 * - Link opened in a different browser or device than the one that signed up:
 *   the PKCE code can't be exchanged there, but Supabase has already marked
 *   the email as confirmed, so we just ask them to sign in.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  if (searchParams.get("error") || searchParams.get("error_code")) {
    return NextResponse.redirect(`${origin}/login?mode=login&notice=link-expired`);
  }

  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${origin}/login?mode=login`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?mode=login&notice=confirm-done`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", data.user.id)
    .maybeSingle();

  return NextResponse.redirect(
    `${origin}${profile?.onboarding_completed ? "/opportunity" : "/getstarted"}`
  );
}
