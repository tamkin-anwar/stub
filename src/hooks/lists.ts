import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToList,
  fetchEntries,
  removeEntry,
  setRating,
  updateEntry,
  type ListOwner,
} from "../data/lists";
import type { ListEntry, ListStatus } from "../lib/types";

export function entriesKey(owner: ListOwner) {
  return ["entries", owner.type, owner.id] as const;
}

export function useEntries(owner: ListOwner | null) {
  return useQuery({
    queryKey: owner ? entriesKey(owner) : ["entries", "none"],
    queryFn: () => fetchEntries(owner as ListOwner),
    enabled: !!owner,
  });
}

export function useAddToList(owner: ListOwner, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { tmdbId: number; mediaType: "movie" | "tv"; status: ListStatus }) =>
      addToList(owner, { tmdbId: args.tmdbId, mediaType: args.mediaType }, args.status, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: entriesKey(owner) }),
  });
}

export function useUpdateEntry(owner: ListOwner) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      entryId: string;
      patch: Partial<Pick<ListEntry, "status" | "note" | "watched_on">>;
    }) => updateEntry(args.entryId, args.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: entriesKey(owner) }),
  });
}

export function useRemoveEntry(owner: ListOwner) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => removeEntry(entryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: entriesKey(owner) }),
  });
}

export function useSetRating(owner: ListOwner, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { entryId: string; stars: number | null }) =>
      setRating(args.entryId, userId, args.stars),
    onSuccess: () => qc.invalidateQueries({ queryKey: entriesKey(owner) }),
  });
}
