export type MediaType = "movie" | "tv";
export type ListStatus = "watchlist" | "watching" | "watched";
export type OwnerType = "user" | "space";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  accent: string;
  created_at: string;
}

export interface TitleRow {
  id: number;
  tmdb_id: number;
  media_type: MediaType;
  name: string;
  year: number | null;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  runtime: number | null;
  genres: string[];
  tmdb_rating: number | null;
  imdb_id: string | null;
  imdb_rating: number | null;
  imdb_votes: number | null;
  rt_rating: number | null;
  metacritic: number | null;
  omdb_checked_at: string | null;
  updated_at: string;
}

export interface RatingRow {
  id: string;
  entry_id: string;
  user_id: string;
  stars: number;
  updated_at: string;
}

export interface ListEntryRow {
  id: string;
  owner_type: OwnerType;
  owner_id: string;
  title_id: number;
  status: ListStatus;
  added_by: string | null;
  watched_on: string | null;
  note: string;
  created_at: string;
  updated_at: string;
}

/** An entry joined with its title and every rating on it. */
export interface ListEntry extends ListEntryRow {
  title: TitleRow;
  ratings: RatingRow[];
}

export interface Friendship {
  id: string;
  requester: string;
  addressee: string;
  status: "pending" | "accepted";
  created_at: string;
  updated_at: string;
}

export interface FriendView {
  friendship: Friendship;
  profile: Profile;
  direction: "incoming" | "outgoing" | "friends";
}

export interface Space {
  id: string;
  name: string;
  kind: string;
  created_by: string;
  created_at: string;
}

export interface SpaceWithMembers extends Space {
  members: Profile[];
}

/** Normalized TMDB search / discover result. */
export interface TmdbTitle {
  tmdbId: number;
  mediaType: MediaType;
  name: string;
  year: number | null;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
}

export interface TmdbDetail extends TmdbTitle {
  runtime: number | null;
  genres: string[];
  imdbId: string | null;
  tagline: string | null;
  cast: { name: string; character: string; profilePath: string | null }[];
}
