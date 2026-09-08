import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, supabaseReady } from "./env";

/**
 * A single shared client. It is null until the two Supabase env vars are set,
 * so the app can render a setup screen instead of throwing on boot.
 */
export const supabase: SupabaseClient | null = supabaseReady
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }
  return supabase;
}
