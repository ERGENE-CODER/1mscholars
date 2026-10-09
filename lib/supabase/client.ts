import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_* values are inlined at build time, so they must be read
// with literal `process.env.NAME` access (no dynamic lookups).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Copy .env.local.example to .env.local, add your Supabase URL and publishable key, and restart the dev server.",
    );
    this.name = "SupabaseConfigError";
  }
}

let client: SupabaseClient | null = null;

/** Returns a shared Supabase client, or throws SupabaseConfigError if env vars are missing. */
export function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) throw new SupabaseConfigError();
  if (!client) {
    // createBrowserClient reads the same cookie session the login actions
    // create. (Plain supabase-js createClient uses localStorage and never sees
    // it, so applications used to be saved with no applicant.)
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}