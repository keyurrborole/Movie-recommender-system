import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Heart, Bookmark, Clock, Star, Calendar, Flag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import StarRating from "@/components/StarRating";
import { useAuth } from "@/contexts/AuthContext";
import {
  MovieDetailData,
  fetchMovieById,
  fetchUserMovieState,
  subscribeToUserMovieState,
  unsubscribeChannel,
  upsertUserMovieState,
} from "@/services/supabaseService";

const MovieDetail = () => {
  const { id } = useParams();
  const movieId = useMemo(() => Number(id), [id]);
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isUpdatingState, setIsUpdatingState] = useState(false);
  const [watched, setWatched] = useState(false);
  const [liked, setLiked] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const { user } = useAuth();
  
  useEffect(() => {
    let ignore = false;

    const loadMovie = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const movieData = await fetchMovieById(movieId);

        if (!ignore) {
          setMovie(movieData);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setLoadError(err instanceof Error ? err.message : "Failed to load movie.");
          setIsLoading(false);
        }
      }
    };

    loadMovie();

    return () => {
      ignore = true;
    };
  }, [movieId]);

  useEffect(() => {
    let ignore = false;

    const syncUserState = async () => {
      if (!user || Number.isNaN(movieId)) {
        if (!ignore) {
          setWatched(false);
          setInWatchlist(false);
          setLiked(false);
          setUserRating(0);
        }
        return;
      }

      try {
        const state = await fetchUserMovieState(user.id, movieId);

        if (!ignore) {
          setWatched(state.watched);
          setInWatchlist(state.inWishlist);
          setUserRating(state.userRating);
          setLiked(state.userRating > 0);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(err instanceof Error ? err.message : "Failed to load your movie state.");
        }
      }
    };

    syncUserState();

    const channel = user && !Number.isNaN(movieId)
      ? subscribeToUserMovieState(user.id, movieId, syncUserState)
      : null;

    return () => {
      ignore = true;
      unsubscribeChannel(channel);
    };
  }, [user, movieId]);

  const requireUser = () => {
    if (user) {
      return true;
    }

    toast.error("Please sign in to update your movie activity.");
    return false;
  };

  const toggleWatched = async () => {
    if (!requireUser() || !user) {
      return;
    }

    const next = !watched;
    setWatched(next);
    setIsUpdatingState(true);

    try {
      await upsertUserMovieState(user.id, movieId, { watched: next });
    } catch (err) {
      setWatched(!next);
      toast.error(err instanceof Error ? err.message : "Failed to update watched state.");
    } finally {
      setIsUpdatingState(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!requireUser() || !user) {
      return;
    }

    const next = !inWatchlist;
    setInWatchlist(next);
    setIsUpdatingState(true);

    try {
      await upsertUserMovieState(user.id, movieId, { inWishlist: next });
    } catch (err) {
      setInWatchlist(!next);
      toast.error(err instanceof Error ? err.message : "Failed to update watchlist state.");
    } finally {
      setIsUpdatingState(false);
    }
  };

  const toggleLiked = async () => {
    if (!requireUser() || !user) {
      return;
    }

    const nextLiked = !liked;
    const nextRating = nextLiked ? (userRating > 0 ? userRating : 10) : 0;
    const previousLiked = liked;
    const previousRating = userRating;

    setLiked(nextLiked);
    setUserRating(nextRating);
    setIsUpdatingState(true);

    try {
      await upsertUserMovieState(user.id, movieId, { userRating: nextRating });
    } catch (err) {
      setLiked(previousLiked);
      setUserRating(previousRating);
      toast.error(err instanceof Error ? err.message : "Failed to update like state.");
    } finally {
      setIsUpdatingState(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!requireUser() || !user) {
      return;
    }

    const previousRating = userRating;
    const previousLiked = liked;
    setUserRating(rating);
    setLiked(rating > 0);
    setIsUpdatingState(true);

    try {
      await upsertUserMovieState(user.id, movieId, { userRating: rating });
    } catch (err) {
      setUserRating(previousRating);
      setLiked(previousLiked);
      toast.error(err instanceof Error ? err.message : "Failed to update rating.");
    } finally {
      setIsUpdatingState(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onSearchChange={() => {}} />
        <div className="container mx-auto px-4 pt-32 text-center text-muted-foreground">
          Loading movie...
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onSearchChange={() => {}} />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-2xl font-display text-foreground">{loadError || "Film not found"}</h1>
          <Link to="/films" className="mt-4 inline-block text-primary hover:underline">
            ← Back to Films
          </Link>
        </div>
      </div>
    );
  }

  // Fake review data
  const reviews = [
    {
      user: "cinephile_42",
      date: "03 Apr 2026",
      text: "Absolutely stunning. The cinematography alone is worth the price of admission.",
      likes: 24,
    },
    {
      user: "film_noir_fan",
      date: "01 Apr 2026",
      text: `Good but not great. The pacing felt off in the second act, though the ending was satisfying. ${movie.genre[0] ?? "Movie"} fans will enjoy it.`,
      likes: 8,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchChange={() => {}} />

      {/* Backdrop */}
      <div className="relative h-[360px] w-full overflow-hidden md:h-[440px]">
        <img
          src={movie.backdrop}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/35 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/35 to-background" />
      </div>

      <div className="container mx-auto px-4 -mt-52 relative z-10 pb-16 md:-mt-56">
        <div className="grid grid-cols-[240px_1fr_280px] gap-8 items-start">
          {/* Left: Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded border-2 border-border shadow-2xl">
              <img
                src={movie.poster}
                alt={movie.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-background/80 p-2 backdrop-blur-sm">
                <button
                  onClick={toggleWatched}
                  disabled={isUpdatingState}
                  className="rounded-full bg-secondary p-1.5 transition-colors hover:bg-primary"
                >
                  <Eye size={14} className={watched ? "text-primary" : "text-muted-foreground"} />
                </button>
                <button
                  onClick={toggleLiked}
                  disabled={isUpdatingState}
                  className="rounded-full bg-secondary p-1.5 transition-colors hover:bg-primary"
                >
                  <Heart size={14} className={liked ? "fill-accent text-accent" : "text-muted-foreground"} />
                </button>
                <button className="rounded-full bg-secondary p-1.5 transition-colors hover:bg-primary">
                  <span className="text-muted-foreground text-xs">•••</span>
                </button>
              </div>
            </div>

            {/* Where to watch */}
            {/* <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Where to Watch</h4>
              <div className="space-y-1">
                {["Streaming Service", "Rent / Buy"].map((service) => (
                  <div key={service} className="flex items-center gap-2 rounded bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                    <span className="h-4 w-4 rounded bg-primary/30" />
                    {service}
                  </div>
                ))}
              </div>
            </div> */}
          </motion.div>

          {/* Center: Details & Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {movie.title}{" "}
                <span className="text-xl font-normal text-muted-foreground">{movie.year}</span>
              </h1>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {movie.year || "Unknown year"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {movie.runtimeText}
                </span>
              </div>
              {movie.originalTitle !== movie.title && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Original title: <span className="text-foreground">{movie.originalTitle}</span>
                </p>
              )}
              <div className="mt-2 flex gap-2">
                {movie.genre.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {movie.tagline && (
              <p className="text-sm italic text-foreground">{movie.tagline}</p>
            )}

            <p className="text-sm leading-relaxed text-muted-foreground">{movie.synopsis}</p>

            {/* Ratings summary */}
            <div className="flex items-center gap-6 border-t border-b border-border py-4">
              <div className="text-center">
                <div className="flex items-center gap-1 text-primary">
                  <Star size={18} className="fill-primary" />
                  <span className="text-2xl font-bold text-foreground">{movie.rating}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Average</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{movie.voteCount}</p>
                <p className="text-[11px] text-muted-foreground">Ratings</p>
              </div>
            </div>

            {/* Reviews - hidden for now */}
            <div className="hidden">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Popular Reviews
              </h3>
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <div key={i} className="rounded border border-border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-secondary" />
                        <span className="text-sm font-medium text-foreground">
                          Review by <span className="text-primary">{review.user}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">Watched {review.date}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                      <button className="flex items-center gap-1 transition-colors hover:text-accent">
                        <Heart size={12} />
                        Like review
                      </button>
                      <button className="flex items-center gap-1 transition-colors hover:text-foreground">
                        <Flag size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Action sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded border border-border bg-card p-5 space-y-4"
          >
            {/* Watch / Like / Watchlist */}
            <div className="flex justify-around">
              <button
                onClick={toggleWatched}
                disabled={isUpdatingState}
                className="flex flex-col items-center gap-1 text-xs"
              >
                <Eye size={24} className={watched ? "text-primary" : "text-muted-foreground"} />
                <span className={watched ? "text-primary font-medium" : "text-muted-foreground"}>Watch</span>
              </button>
              <button
                onClick={toggleLiked}
                disabled={isUpdatingState}
                className="flex flex-col items-center gap-1 text-xs"
              >
                <Heart size={24} className={liked ? "fill-accent text-accent" : "text-muted-foreground"} />
                <span className={liked ? "text-accent font-medium" : "text-muted-foreground"}>Like</span>
              </button>
              <button
                onClick={toggleWatchlist}
                disabled={isUpdatingState}
                className="flex flex-col items-center gap-1 text-xs"
              >
                <Bookmark size={24} className={inWatchlist ? "fill-primary text-primary" : "text-muted-foreground"} />
                <span className={inWatchlist ? "text-primary font-medium" : "text-muted-foreground"}>Watchlist</span>
              </button>
            </div>

            {/* Rate */}
            <div className="border-t border-border pt-4 text-center">
              <p className="mb-2 text-xs font-semibold text-primary uppercase tracking-wider">Rate</p>
              <StarRating rating={userRating} interactive size={22} onRate={handleRate} />
            </div>

            {/* Actions */}
            {/* <div className="space-y-1 border-t border-border pt-4">
              {[
                "Show your activity",
                "Review or log...",
                "Add film to lists...",
                "Share this film",
              ].map((action) => (
                <button
                  key={action}
                  className="w-full rounded px-3 py-2 text-left text-xs text-secondary-foreground transition-colors hover:bg-muted"
                >
                  {action}
                </button>
              ))}
            </div> */}
          </motion.div>
        </div>
      </div>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © 2024 CineVault. A Movie Recommendation & Watchlist System.
        </div>
      </footer>
    </div>
  );
};

export default MovieDetail;
