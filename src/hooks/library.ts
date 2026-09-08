import { useQuery } from "@tanstack/react-query";
import {
  airingShows,
  nowPlayingMovies,
  searchTitles,
  titleDetail,
  trendingTitles,
} from "../lib/tmdb";
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

export function useTmdbSearch(term: string) {
  return useQuery({
    queryKey: ["tmdb", "search", term],
    queryFn: () => searchTitles(term),
    enabled: term.trim().length >= 2,
    staleTime: 10 * 60_000,
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
