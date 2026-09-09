import { requireSupabase } from "../lib/supabase";
import type {
  FriendView,
  Friendship,
  ListStatus,
  MediaType,
  Profile,
  SpaceWithMembers,
} from "../lib/types";

export async function searchProfiles(term: string, selfId: string): Promise<Profile[]> {
  // Strip characters that are special to PostgREST's filter grammar so a
  // stray comma or paren in the query can't break (or bend) the request.
  const q = term
    .trim()
    .replace(/^@/, "")
    .replace(/[%,()"'\\*]/g, " ")
    .trim();
  if (q.length < 2) return [];
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
    .neq("id", selfId)
    .limit(12);
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function fetchFriendViews(selfId: string): Promise<FriendView[]> {
  const sb = requireSupabase();
  const { data: rows, error } = await sb
    .from("friendships")
    .select("*")
    .or(`requester.eq.${selfId},addressee.eq.${selfId}`);
  if (error) throw error;
  const friendships = (rows ?? []) as Friendship[];

  const otherIds = friendships.map((f) => (f.requester === selfId ? f.addressee : f.requester));
  if (otherIds.length === 0) return [];

  const { data: profiles, error: pErr } = await sb
    .from("profiles")
    .select("*")
    .in("id", otherIds);
  if (pErr) throw pErr;
  const byId = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));

  return friendships
    .map((f): FriendView | null => {
      const otherId = f.requester === selfId ? f.addressee : f.requester;
      const profile = byId.get(otherId);
      if (!profile) return null;
      const direction: FriendView["direction"] =
        f.status === "accepted" ? "friends" : f.requester === selfId ? "outgoing" : "incoming";
      return { friendship: f, profile, direction };
    })
    .filter((x): x is FriendView => x !== null);
}

export async function sendFriendRequest(selfId: string, targetId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("friendships")
    .insert({ requester: selfId, addressee: targetId, status: "pending" });
  if (error && error.code !== "23505") throw error;
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);
  if (error) throw error;
}

export async function removeFriendship(friendshipId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from("friendships").delete().eq("id", friendshipId);
  if (error) throw error;
}

export async function fetchMySpaces(selfId: string): Promise<SpaceWithMembers[]> {
  const sb = requireSupabase();
  const { data: memberships, error } = await sb
    .from("space_members")
    .select("space_id")
    .eq("user_id", selfId);
  if (error) throw error;
  const spaceIds = (memberships ?? []).map((m) => m.space_id as string);
  if (spaceIds.length === 0) return [];

  const { data: spaces, error: sErr } = await sb.from("spaces").select("*").in("id", spaceIds);
  if (sErr) throw sErr;

  const { data: allMembers, error: mErr } = await sb
    .from("space_members")
    .select("space_id, profile:profiles(*)")
    .in("space_id", spaceIds);
  if (mErr) throw mErr;

  const membersBySpace = new Map<string, Profile[]>();
  for (const row of allMembers ?? []) {
    const list = membersBySpace.get(row.space_id as string) ?? [];
    if (row.profile) list.push(row.profile as unknown as Profile);
    membersBySpace.set(row.space_id as string, list);
  }

  return (spaces ?? []).map((s) => ({
    ...(s as SpaceWithMembers),
    members: membersBySpace.get(s.id as string) ?? [],
  }));
}

export async function createCoupleSpace(friendId: string, name: string): Promise<string> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("create_couple_space", {
    friend: friendId,
    space_name: name,
  });
  if (error) throw error;
  return data as string;
}

export async function leaveSpace(spaceId: string, selfId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("space_members")
    .delete()
    .eq("space_id", spaceId)
    .eq("user_id", selfId);
  if (error) throw error;
}

export async function renameSpace(spaceId: string, name: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.rpc("rename_space", { space: spaceId, new_name: name });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Friend activity + list comparison (both backed by security-definer RPCs
// that gate on an accepted friendship).
// ---------------------------------------------------------------------------
export interface ActivityItem {
  actorId: string;
  username: string;
  displayName: string;
  accent: string;
  stars: number;
  tmdbId: number;
  mediaType: MediaType;
  name: string;
  year: number | null;
  posterPath: string | null;
  ratedAt: string;
}

interface ActivityRow {
  actor_id: string;
  username: string;
  display_name: string;
  accent: string;
  stars: number | string;
  tmdb_id: number;
  media_type: MediaType;
  name: string;
  year: number | null;
  poster_path: string | null;
  rated_at: string;
}

export async function fetchFriendActivity(limit = 24): Promise<ActivityItem[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("friend_activity", { max_rows: limit });
  if (error) throw error;
  return ((data ?? []) as ActivityRow[]).map((r) => ({
    actorId: r.actor_id,
    username: r.username,
    displayName: r.display_name,
    accent: r.accent,
    stars: Number(r.stars),
    tmdbId: r.tmdb_id,
    mediaType: r.media_type,
    name: r.name,
    year: r.year,
    posterPath: r.poster_path,
    ratedAt: r.rated_at,
  }));
}

export type CompareBucket = "both" | "mine" | "theirs";

export interface CompareItem {
  bucket: CompareBucket;
  tmdbId: number;
  mediaType: MediaType;
  name: string;
  year: number | null;
  posterPath: string | null;
  myStatus: ListStatus | null;
  theirStatus: ListStatus | null;
  myStars: number | null;
  theirStars: number | null;
}

interface CompareRow {
  bucket: CompareBucket;
  tmdb_id: number;
  media_type: MediaType;
  name: string;
  year: number | null;
  poster_path: string | null;
  my_status: ListStatus | null;
  their_status: ListStatus | null;
  my_stars: number | string | null;
  their_stars: number | string | null;
}

export async function fetchListCompare(friendId: string): Promise<CompareItem[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("list_compare", { friend: friendId });
  if (error) throw error;
  return ((data ?? []) as CompareRow[]).map((r) => ({
    bucket: r.bucket,
    tmdbId: r.tmdb_id,
    mediaType: r.media_type,
    name: r.name,
    year: r.year,
    posterPath: r.poster_path,
    myStatus: r.my_status,
    theirStatus: r.their_status,
    myStars: r.my_stars == null ? null : Number(r.my_stars),
    theirStars: r.their_stars == null ? null : Number(r.their_stars),
  }));
}
