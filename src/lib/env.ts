const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const tmdbToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim();

export const env = {
  supabaseUrl: url ?? "",
  supabaseAnonKey: anonKey ?? "",
  tmdbToken: tmdbToken ?? "",
};

// Reject the .env.example placeholders, which are otherwise long enough to look real.
const isPlaceholder = (v: string | undefined) =>
  !v || /^your-/i.test(v) || v.includes("YOUR-PROJECT");

export const supabaseReady = Boolean(
  !isPlaceholder(url) && !isPlaceholder(anonKey) && url!.startsWith("http") && anonKey!.length > 20,
);
// A TMDB v4 read access token is a JWT beginning with "eyJ".
export const tmdbReady = Boolean(
  !isPlaceholder(tmdbToken) && tmdbToken!.startsWith("eyJ") && tmdbToken!.length > 40,
);

export const missingConfig: string[] = [
  ...(supabaseReady ? [] : ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]),
  ...(tmdbReady ? [] : ["VITE_TMDB_ACCESS_TOKEN"]),
];
