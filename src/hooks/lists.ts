import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchEntries, removeEntry, setRating, updateEntry, type ListOwner } from "../data/lists";
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

export interface MyEntry {
  entryId: string;
  status: ListStatus;
}

/** A "mediaType-tmdbId" -> {entryId, status} map of the viewer's own list,
 *  so discovery cards can show what is already on it. */
export function useMyEntryLookup(userId: string | undefined): Map<string, MyEntry> {
  const { data } = useEntries(userId ? { type: "user", id: userId } : null);
  return useMemo(() => {
    const m = new Map<string, MyEntry>();
    for (const e of data ?? []) {
      m.set(`${e.title.media_type}-${e.title.tmdb_id}`, { entryId: e.id, status: e.status });
    }
    return m;
  }, [data]);
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
