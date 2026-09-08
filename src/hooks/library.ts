import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  airingShows,
  browseTitles,
  classicFilms,
  imdbIdFor,
  nowPlayingMovies,
  searchTitles,
  titleDetail,
  trendingTitles,
  upcomingMovies,
  type BrowseFeed,
  type MediaFilter,
} from "../lib/tmdb";
import { guardianArticles } from "../lib/guardian";
import { omdbScores } from "../lib/omdb";
import type { MediaType } from "../lib/types";

export function useTrending() {
  return useQuery({ queryKey: ["tmdb", "trending"], queryFn: trendingTitles, staleTime: 30 * 60_000 });
}

export function useNowPlaying() {
  return useQuery({ queryKey: ["tmdb", "now-playing"], queryFn: nowPlayingMovies, staleTime: 30 * 60_000 });
}

export function useAiringShows() {
  return useQuery({ queryKey: ["tmdb", "airing"], queryFn: airingShows, staleTime: 30 * 60_000 });
}

export function useUpcoming() {
  return useQuery({ queryKey: ["tmdb", "upcoming"], queryFn: upcomingMovies, staleTime: 60 * 60_000 });
}

export function useClassics() {
  return useQuery({ queryKey: ["tmdb", "classics"], queryFn: classicFilms, staleTime: 12 * 60 * 60_000 });
}

export function useArticles() {
  return useQuery({
    queryKey: ["guardian", "film-tv"],
    queryFn: () => guardianArticles(12),
    staleTime: 30 * 60_000,
  });
}

export function useBrowse(params: {
  feed: BrowseFeed;
  media: MediaFilter;
  movieGenre?: number;
  tvGenre?: number;
}) {
  return useInfiniteQuery({
    queryKey: [
      "tmdb",
      "browse",
      params.feed,
      params.media,
      params.movieGenre ?? null,
      params.tvGenre ?? null,
    ],
    queryFn: ({ pageParam }) => browseTitles({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 15 * 60_000,
  });
}

export function useTmdbSearch(term: string) {
  return useQuery({
    queryKey: ["tmdb", "search", term],
    queryFn: () => searchTitles(term),
    enabled: term.trim().length >= 2,
    staleTime: 10 * 60_000,
  });
}

export function useOmdb(imdbId: string | null | undefined) {
  return useQuery({
    queryKey: ["omdb", imdbId],
    queryFn: () => omdbScores(imdbId),
    enabled: !!imdbId,
    staleTime: 24 * 60 * 60_000,
    gcTime: 24 * 60 * 60_000,
  });
}

/**
 * IMDb / RT for one Library card. Costs a small TMDB external-ids call plus
 * an OMDb call, both served from the CDN cache after the first lookup, and
 * held for a week per browser. Shows nothing when OMDb is off or over quota.
 */
export function useCardScores(mediaType: MediaType, tmdbId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["card-scores", mediaType, tmdbId],
    queryFn: async () => {
      const imdbId = await imdbIdFor(mediaType, tmdbId);
      const s = await omdbScores(imdbId);
      return { imdb: s.imdb, rt: s.rt };
    },
    enabled,
    staleTime: 7 * 24 * 60 * 60_000,
    gcTime: 30 * 24 * 60 * 60_000,
    retry: 0,
  });
}

export function useTitleDetail(mediaType: MediaType | undefined, tmdbId: number | undefined) {
  return useQuery({
    queryKey: ["tmdb", "detail", mediaType, tmdbId],
    queryFn: () => titleDetail(mediaType as MediaType, tmdbId as number),
    enabled: !!mediaType && !!tmdbId,
    staleTime: 60 * 60_000,
  });
}
