import { createClient } from "@supabase/supabase-js";

/**
 * OPTIONAL. Only needed for the admin actions that Supabase restricts to the
 * server: inviting users by email and deleting user accounts.
 *
 * SUPABASE_SERVICE_ROLE_KEY must NEVER start with NEXT_PUBLIC_ and must never be
 * sent to the browser. This module is only imported from Server Actions / pages.
 */
export function hasServiceRole(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env (server-only) to invite or delete users."
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
