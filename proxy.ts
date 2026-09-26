import { NextResponse, type NextRequest } from "next/server";

// TODO: once Supabase is wired back in, restore the session-refresh logic
// that used to live in lib/supabase/proxy.ts so Server Components always
// see a fresh auth cookie. With Supabase disconnected there is no session
// to refresh, so requests just pass through unchanged.
export default function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on every route except static assets. Currently a no-op — kept
     * so the matcher config doesn't need to change again once Supabase's
     * session refresh is restored here.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
