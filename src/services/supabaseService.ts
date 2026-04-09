import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ============================================================================
// CONSTANTS
// ============================================================================
export const PAGE_SIZE = 300;
export const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
export const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w500";
export const TMDB_POSTER_DETAIL_BASE = "https://image.tmdb.org/t/p/w780";
export const FALLBACK_POSTER = "https://placehold.co/500x750?text=No+Poster";
export const FALLBACK_POSTER_DETAIL = "https://placehold.co/780x1170?text=No+Poster";
export const POPULAR_FILM_IDS = [546554, 56292, 11324, 299536];

// ============================================================================
// TYPES
// ============================================================================
export type SupabaseMovie = {
  id: number;
  title: string;
  vote_count: number | null;
  vote_average: number | null;
  release_date: string | null;
  poster_path: string | null;
  genres: string | null;
  overview: string | null;
};

export type SupabaseMovieDetail = {
  id: number;
  title: string;
  original_title: string | null;
  vote_average: number | null;
  vote_count: number | null;
  release_date: string | null;
  runtime: number | null;
  backdrop_path: string | null;
  poster_path: string | null;
  genres: string | null;
  overview: string | null;
  tagline: string | null;
};

export type FilmListMovie = {
  id: number;
  title: string;
  votes: number;
  rating: number;
  year: number;
  poster: string;
  genre: string[];
  overview: string | null;
};

export type FeaturedMovie = {
  id: number;
  title: string;
  rating: number;
  year: number;
  runtimeText: string;
  backdrop: string;
  overview: string;
};

export type HomeGenreRow = {
  key: string;
  title: string;
  movies: FilmListMovie[];
};

export type MovieDetailData = {
  id: number;
  title: string;
  originalTitle: string;
  rating: number;
  voteCount: number;
  year: number;
  runtimeText: string;
  backdrop: string;
  poster: string;
  genre: string[];
  synopsis: string;
  tagline: string;
};

export type UserLibraryMovie = {
  id: number;
  title: string;
  rating: number;
  year: number;
  poster: string;
};

export type UserMovieState = {
  inWishlist: boolean;
  watched: boolean;
  userRating: number;
};

type SupabaseHomeMovie = {
  id: number;
  title: string;
  vote_count: number | null;
  vote_average: number | null;
  release_date: string | null;
  runtime: number | null;
  backdrop_path: string | null;
  poster_path: string | null;
  genres: string | null;
  overview: string | null;
};

type SupabaseUserMovieRow = {
  movie_id: number;
  in_wishlist: boolean | null;
  watched: boolean | null;
  user_rating: number | null;
  movies:
    | {
        id: number;
        title: string;
        vote_average: number | null;
        release_date: string | null;
        poster_path: string | null;
      }
    | Array<{
        id: number;
        title: string;
        vote_average: number | null;
        release_date: string | null;
        poster_path: string | null;
      }>
    | null;
};

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================
export const mapMovie = (row: SupabaseMovie): FilmListMovie => {
  const releaseYear = row.release_date ? Number.parseInt(row.release_date.slice(0, 4), 10) : 0;
  return {
    id: row.id,
    title: row.title,
    votes: row.vote_count ?? 0,
    rating: row.vote_average ?? 0,
    year: Number.isNaN(releaseYear) ? 0 : releaseYear,
    poster: row.poster_path ? `${TMDB_POSTER_BASE}${row.poster_path}` : FALLBACK_POSTER,
    genre: row.genres ? row.genres.split(",").map((item) => item.trim()).filter(Boolean) : [],
    overview: row.overview,
  };
};

const mapFeaturedMovie = (row: SupabaseHomeMovie): FeaturedMovie => {
  const year = row.release_date ? Number.parseInt(row.release_date.slice(0, 4), 10) : 0;
  return {
    id: row.id,
    title: row.title,
    rating: row.vote_average ?? 0,
    year: Number.isNaN(year) ? 0 : year,
    runtimeText: row.runtime && row.runtime > 0 ? `${row.runtime} min` : "Runtime unavailable",
    backdrop: row.backdrop_path
      ? `${TMDB_BACKDROP_BASE}${row.backdrop_path}`
      : row.poster_path
        ? `${TMDB_POSTER_DETAIL_BASE}${row.poster_path}`
        : FALLBACK_POSTER_DETAIL,
    overview: row.overview ?? "Synopsis not available.",
  };
};

export const mapMovieDetail = (row: SupabaseMovieDetail): MovieDetailData => {
  const year = row.release_date ? Number.parseInt(row.release_date.slice(0, 4), 10) : 0;
  return {
    id: row.id,
    title: row.title,
    originalTitle: row.original_title ?? row.title,
    rating: row.vote_average ?? 0,
    voteCount: row.vote_count ?? 0,
    year: Number.isNaN(year) ? 0 : year,
    runtimeText: row.runtime && row.runtime > 0 ? `${row.runtime} min` : "Runtime unavailable",
    backdrop: row.backdrop_path
      ? `${TMDB_BACKDROP_BASE}${row.backdrop_path}`
      : row.poster_path
        ? `${TMDB_POSTER_DETAIL_BASE}${row.poster_path}`
        : FALLBACK_POSTER_DETAIL,
    poster: row.poster_path ? `${TMDB_POSTER_DETAIL_BASE}${row.poster_path}` : FALLBACK_POSTER_DETAIL,
    genre: row.genres ? row.genres.split(",").map((item) => item.trim()).filter(Boolean) : [],
    synopsis: row.overview ?? "Synopsis not available.",
    tagline: row.tagline ?? "",
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
export const getYearRange = (yearFilter: string): { start: number; end: number } | null => {
  if (yearFilter === "All") {
    return null;
  }

  if (yearFilter === "Before 1900") {
    return { start: 1, end: 1899 };
  }

  const parsedStart = Number.parseInt(yearFilter, 10);
  if (Number.isNaN(parsedStart)) {
    return null;
  }

  return { start: parsedStart, end: parsedStart + 9 };
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export interface FetchMoviesParams {
  searchQuery?: string;
  genre?: string;
  yearFilter?: string;
  ratingSort?: "highest" | "lowest" | "popular";
  page?: number;
}

/**
 * Fetch movies with optional filters
 */
export const fetchMovies = async (params: FetchMoviesParams) => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    searchQuery = "",
    genre = "All",
    yearFilter = "All",
    ratingSort = "popular",
    page = 0,
  } = params;

  let query = supabase.from("movies").select(
    "id,title,vote_count,vote_average,release_date,poster_path,genres,overview",
    { count: "exact" },
  );

  if (searchQuery.trim()) {
    query = query.ilike("title", `%${searchQuery.trim()}%`);
  }

  if (genre !== "All") {
    query = query.ilike("genres", `%${genre}%`);
  }

  const yearRange = getYearRange(yearFilter);
  if (yearRange) {
    query = query
      .gte("release_date", `${yearRange.start.toString().padStart(4, "0")}-01-01`)
      .lte("release_date", `${yearRange.end.toString().padStart(4, "0")}-12-31`);
  }

  if (ratingSort === "highest") {
    query = query.order("vote_average", { ascending: false, nullsFirst: false });
  } else if (ratingSort === "lowest") {
    query = query.order("vote_average", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("popularity", { ascending: false, nullsFirst: false });
  }

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw error;
  }

  const mappedMovies = (data as SupabaseMovie[]).map(mapMovie);
  return { movies: mappedMovies, totalCount: count ?? 0 };
};

/**
 * Fetch movies by specific IDs (for popular section, etc.)
 */
export const fetchMoviesByIds = async (ids: number[]) => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("movies")
    .select("id,title,vote_count,vote_average,release_date,poster_path,genres,overview")
    .in("id", ids);

  if (error) {
    throw error;
  }

  const mappedMovies = (data as SupabaseMovie[]).map(mapMovie);

  // Preserve order of input IDs
  const orderedMovies = ids
    .map((id) => mappedMovies.find((movie) => movie.id === id))
    .filter((movie): movie is FilmListMovie => Boolean(movie));

  return orderedMovies;
};

/**
 * Fetch single movie by ID (for detail page)
 */
export const fetchMovieById = async (movieId: number) => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (Number.isNaN(movieId)) {
    throw new Error("Invalid movie ID.");
  }

  const { data, error } = await supabase
    .from("movies")
    .select(
      "id,title,original_title,vote_average,vote_count,release_date,runtime,backdrop_path,poster_path,genres,overview,tagline",
    )
    .eq("id", movieId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Film not found.");
  }

  return mapMovieDetail(data as SupabaseMovieDetail);
};

const DEFAULT_HOME_GENRES = [
  { key: "action", label: "Action Picks", query: "Action" },
  { key: "drama", label: "Drama Essentials", query: "Drama" },
  { key: "comedy", label: "Comedy Break", query: "Comedy" },
  { key: "thriller", label: "Thriller Zone", query: "Thriller" },
  { key: "scifi", label: "Sci-Fi & Beyond", query: "Science Fiction" },
  { key: "romance", label: "Romance Stories", query: "Romance" },
  { key: "horror", label: "Night Watch", query: "Horror" },
];

export const fetchHomePageData = async () => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const [featuredRes, recommendedRes, recentRes, ...genreResults] = await Promise.all([
    supabase
      .from("movies")
      .select("id,title,vote_count,vote_average,release_date,runtime,backdrop_path,poster_path,genres,overview")
      .order("popularity", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("movies")
      .select("id,title,vote_count,vote_average,release_date,poster_path,genres,overview")
      .order("vote_average", { ascending: false, nullsFirst: false })
      .limit(16),
    supabase
      .from("movies")
      .select("id,title,vote_count,vote_average,release_date,poster_path,genres,overview")
      .order("release_date", { ascending: false, nullsFirst: false })
      .limit(16),
    ...DEFAULT_HOME_GENRES.map((genre) =>
      supabase
        .from("movies")
        .select("id,title,vote_count,vote_average,release_date,poster_path,genres,overview")
        .ilike("genres", `%${genre.query}%`)
        .order("popularity", { ascending: false, nullsFirst: false })
        .limit(16),
    ),
  ]);

  if (featuredRes.error) {
    throw featuredRes.error;
  }
  if (recommendedRes.error) {
    throw recommendedRes.error;
  }
  if (recentRes.error) {
    throw recentRes.error;
  }
  genreResults.forEach((result) => {
    if (result.error) {
      throw result.error;
    }
  });

  return {
    featured: featuredRes.data ? mapFeaturedMovie(featuredRes.data as SupabaseHomeMovie) : null,
    recommended: ((recommendedRes.data ?? []) as SupabaseMovie[]).map(mapMovie),
    recent: ((recentRes.data ?? []) as SupabaseMovie[]).map(mapMovie),
    genres: DEFAULT_HOME_GENRES.map((genre, idx) => ({
      key: genre.key,
      title: genre.label,
      movies: ((genreResults[idx].data ?? []) as SupabaseMovie[]).map(mapMovie),
    })).filter((row) => row.movies.length > 0) as HomeGenreRow[],
  };
};

const mapUserLibraryMovie = (movie: {
  id: number;
  title: string;
  vote_average: number | null;
  release_date: string | null;
  poster_path: string | null;
}): UserLibraryMovie => {
  const year = movie.release_date ? Number.parseInt(movie.release_date.slice(0, 4), 10) : 0;
  return {
    id: movie.id,
    title: movie.title,
    rating: movie.vote_average ?? 0,
    year: Number.isNaN(year) ? 0 : year,
    poster: movie.poster_path ? `${TMDB_POSTER_BASE}${movie.poster_path}` : FALLBACK_POSTER,
  };
};

export const fetchUserMovieCollections = async (userId: string) => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("user_movies")
    .select("movie_id,in_wishlist,watched,user_rating,movies(id,title,vote_average,release_date,poster_path)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as SupabaseUserMovieRow[];
  const watchlist: UserLibraryMovie[] = [];
  const watched: UserLibraryMovie[] = [];
  const liked: UserLibraryMovie[] = [];

  rows.forEach((row) => {
    const movieRecord = Array.isArray(row.movies) ? row.movies[0] : row.movies;
    if (!movieRecord) {
      return;
    }

    const mapped = mapUserLibraryMovie(movieRecord);

    if (row.in_wishlist) {
      watchlist.push(mapped);
    }

    if (row.watched) {
      watched.push(mapped);
    }

    if (typeof row.user_rating === "number") {
      liked.push(mapped);
    }
  });

  return { watchlist, watched, liked };
};

export const removeMovieFromCollection = async (
  userId: string,
  movieId: number,
  collection: "watchlist" | "watched" | "liked",
) => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const updates: {
    in_wishlist?: boolean;
    watched?: boolean;
    watched_at?: string | null;
    user_rating?: number | null;
  } = {};

  if (collection === "watchlist") {
    updates.in_wishlist = false;
  } else if (collection === "watched") {
    updates.watched = false;
    updates.watched_at = null;
  } else {
    updates.user_rating = null;
  }

  const { error } = await supabase
    .from("user_movies")
    .update(updates)
    .eq("user_id", userId)
    .eq("movie_id", movieId);

  if (error) {
    throw error;
  }
};

export const fetchUserMovieState = async (userId: string, movieId: number): Promise<UserMovieState> => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("user_movies")
    .select("in_wishlist,watched,user_rating")
    .eq("user_id", userId)
    .eq("movie_id", movieId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    inWishlist: Boolean(data?.in_wishlist),
    watched: Boolean(data?.watched),
    userRating: typeof data?.user_rating === "number" ? data.user_rating : 0,
  };
};

export const upsertUserMovieState = async (
  userId: string,
  movieId: number,
  updates: Partial<{ inWishlist: boolean; watched: boolean; userRating: number }>,
) => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const payload: {
    user_id: string;
    movie_id: number;
    in_wishlist?: boolean;
    watched?: boolean;
    watched_at?: string | null;
    user_rating?: number | null;
  } = {
    user_id: userId,
    movie_id: movieId,
  };

  if (typeof updates.inWishlist === "boolean") {
    payload.in_wishlist = updates.inWishlist;
  }

  if (typeof updates.watched === "boolean") {
    payload.watched = updates.watched;
    payload.watched_at = updates.watched ? new Date().toISOString() : null;
  }

  if (typeof updates.userRating === "number") {
    payload.user_rating = updates.userRating > 0 ? updates.userRating : null;
  }

  const { error } = await supabase.from("user_movies").upsert(payload, {
    onConflict: "user_id,movie_id",
  });

  if (error) {
    throw error;
  }
};

export const subscribeToUserMovieState = (
  userId: string,
  movieId: number,
  onChange: () => void,
): RealtimeChannel | null => {
  if (!supabase) {
    return null;
  }

  const channel = supabase
    .channel(`user_movie_state:${userId}:${movieId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_movies",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const nextMovieId = (payload.new as { movie_id?: number } | null)?.movie_id;
        const prevMovieId = (payload.old as { movie_id?: number } | null)?.movie_id;
        if (nextMovieId === movieId || prevMovieId === movieId) {
          onChange();
        }
      },
    )
    .subscribe();

  return channel;
};

export const unsubscribeChannel = (channel: RealtimeChannel | null) => {
  if (!supabase || !channel) {
    return;
  }

  void supabase.removeChannel(channel);
};
