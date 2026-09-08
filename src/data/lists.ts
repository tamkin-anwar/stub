import { requireSupabase } from "../lib/supabase";
import { titleDetail } from "../lib/tmdb";
import type {
  ListEntry,
  ListStatus,
  MediaType,
  OwnerType,
  TitleRow,
  TmdbTitle,
} from "../lib/types";

const ENTRY_SELECT = "*, title:titles(*), ratings(*)";

export interface ListOwner {
  type: OwnerType;
  id: string;
}

export async function cacheTitle(mediaType: MediaType, tmdbId: number): Promise<TitleRow> {
  const sb = requireSupabase();
  const d = await titleDetail(mediaType, tmdbId);
  const { data, error } = await sb
    .from("titles")
    .upsert(
      {
        tmdb_id: d.tmdbId,
        media_type: d.mediaType,
        name: d.name,
        year: d.year,
        overview: d.overview,
        poster_path: d.posterPath,
        backdrop_path: d.backdropPath,
        runtime: d.runtime,
        genres: d.genres,
        tmdb_rating: d.voteAverage,
        imdb_id: d.imdbId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tmdb_id,media_type" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as TitleRow;
}

export async function fetchEntries(owner: ListOwner): Promise<ListEntry[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("list_entries")
    .select(ENTRY_SELECT)
    .eq("owner_type", owner.type)
    .eq("owner_id", owner.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ListEntry[];
}

export async function addToList(
  owner: ListOwner,
  media: Pick<TmdbTitle, "tmdbId" | "mediaType">,
  status: ListStatus,
  addedBy: string,
): Promise<ListEntry> {
  const sb = requireSupabase();
  const title = await cacheTitle(media.mediaType, media.tmdbId);

  const { data, error } = await sb
    .from("list_entries")
    .insert({
      owner_type: owner.type,
      owner_id: owner.id,
      title_id: title.id,
      status,
      added_by: addedBy,
    })
    .select(ENTRY_SELECT)
    .single();

  if (error) {
    // 23505 = unique violation: the title is already on this list, return it.
    if (error.code === "23505") {
      const { data: existing, error: e2 } = await sb
        .from("list_entries")
        .select(ENTRY_SELECT)
        .eq("owner_type", owner.type)
        .eq("owner_id", owner.id)
        .eq("title_id", title.id)
        .single();
      if (e2) throw e2;
      return existing as unknown as ListEntry;
    }
    throw error;
  }
  return data as unknown as ListEntry;
}

export async function updateEntry(
  entryId: string,
  patch: Partial<Pick<ListEntry, "status" | "note" | "watched_on">>,
): Promise<void> {
  const sb = requireSupabase();
  const body = { ...patch };
  if (body.status === "watched" && !("watched_on" in patch)) {
    body.watched_on = new Date().toISOString().slice(0, 10);
  }
  const { error } = await sb.from("list_entries").update(body).eq("id", entryId);
  if (error) throw error;
}

export async function removeEntry(entryId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from("list_entries").delete().eq("id", entryId);
  if (error) throw error;
}

export async function setRating(entryId: string, userId: string, stars: number | null): Promise<void> {
  const sb = requireSupabase();
  if (stars === null) {
    const { error } = await sb.from("ratings").delete().eq("entry_id", entryId).eq("user_id", userId);
    if (error) throw error;
    return;
  }
  const { error } = await sb
    .from("ratings")
    .upsert({ entry_id: entryId, user_id: userId, stars }, { onConflict: "entry_id,user_id" });
  if (error) throw error;
}
