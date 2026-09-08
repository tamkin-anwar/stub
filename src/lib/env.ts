const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const tmdbToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim();

export const env = {
  supabaseUrl: url ?? "",
  supabaseAnonKey: anonKey ?? "",
  tmdbToken: tmdbToken ?? "",
};

export const supabaseReady = Boolean(url && anonKey && url.startsWith("http"));
export const tmdbReady = Boolean(tmdbToken && tmdbToken.length > 20);

export const missingConfig: string[] = [
  ...(supabaseReady ? [] : ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]),
  ...(tmdbReady ? [] : ["VITE_TMDB_ACCESS_TOKEN"]),
];
