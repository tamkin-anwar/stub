// Only Supabase runs from the browser. TMDB, OMDb and The Guardian are
// proxied through /api/* so their keys stay on the server.

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const env = {
  supabaseUrl: url ?? "",
  supabaseAnonKey: anonKey ?? "",
};

// Reject the .env.example placeholders, which are otherwise long enough to look real.
const isPlaceholder = (v: string | undefined) => !v || /^your-/i.test(v) || v.includes("YOUR-PROJECT");

export const supabaseReady = Boolean(
  !isPlaceholder(url) && !isPlaceholder(anonKey) && url!.startsWith("http") && anonKey!.length > 20,
);

export const missingConfig: string[] = supabaseReady
  ? []
  : ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
