import { requireSupabase } from "../lib/supabase";
import type { MediaType, NotificationKind } from "../lib/types";

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  read: boolean;
  createdAt: string;
  stars: number | null;
  noteExcerpt: string | null;
  actorName: string;
  actorAccent: string;
  actorAvatarStyle: string;
  spaceName: string;
  tmdbId: number;
  mediaType: MediaType;
  titleName: string;
  year: number | null;
  posterPath: string | null;
}

interface NotificationRow {
  id: string;
  kind: NotificationKind;
  read: boolean;
  created_at: string;
  stars: number | string | null;
  note_excerpt: string | null;
  actor: { username: string; display_name: string; accent: string; avatar_style: string } | null;
  space: { name: string } | null;
  entry: {
    title: {
      tmdb_id: number;
      media_type: MediaType;
      name: string;
      year: number | null;
      poster_path: string | null;
    } | null;
  } | null;
}

const SELECT = `
  id, kind, read, created_at, stars, note_excerpt,
  actor:profiles!actor_id(username, display_name, accent, avatar_style),
  space:spaces(name),
  entry:list_entries(title:titles(tmdb_id, media_type, name, year, poster_path))
`;

export async function fetchNotifications(limit = 30): Promise<NotificationItem[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("notifications")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return ((data ?? []) as unknown as NotificationRow[])
    .filter((r) => r.entry?.title && r.actor)
    .map((r) => ({
      id: r.id,
      kind: r.kind,
      read: r.read,
      createdAt: r.created_at,
      stars: r.stars == null ? null : Number(r.stars),
      noteExcerpt: r.note_excerpt,
      actorName: r.actor!.display_name?.trim() || r.actor!.username,
      actorAccent: r.actor!.accent,
      actorAvatarStyle: r.actor!.avatar_style,
      spaceName: r.space?.name ?? "your shared list",
      tmdbId: r.entry!.title!.tmdb_id,
      mediaType: r.entry!.title!.media_type,
      titleName: r.entry!.title!.name,
      year: r.entry!.title!.year,
      posterPath: r.entry!.title!.poster_path,
    }));
}

export async function markNotificationRead(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from("notifications").update({ read: true }).eq("read", false);
  if (error) throw error;
}
