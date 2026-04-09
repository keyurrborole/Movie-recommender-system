import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, Bookmark, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchUserMovieCollections,
  removeMovieFromCollection,
  type UserLibraryMovie,
} from "@/services/supabaseService";

type Tab = "watchlist" | "watched" | "liked";

const YourMovies = () => {
  const [activeTab, setActiveTab] = useState<Tab>("watchlist");
  const [watchlist, setWatchlist] = useState<UserLibraryMovie[]>([]);
  const [watched, setWatched] = useState<UserLibraryMovie[]>([]);
  const [liked, setLiked] = useState<UserLibraryMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    let ignore = false;

    const loadCollections = async () => {
      if (!user) {
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const collections = await fetchUserMovieCollections(user.id);

        if (ignore) {
          return;
        }

        setWatchlist(collections.watchlist);
        setWatched(collections.watched);
        setLiked(collections.liked);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load your movies.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadCollections();

    return () => {
      ignore = true;
    };
  }, [user]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "watchlist", label: "Watchlist", icon: <Bookmark size={16} />, count: watchlist.length },
    { key: "watched", label: "Watched", icon: <Eye size={16} />, count: watched.length },
    { key: "liked", label: "Liked", icon: <Heart size={16} />, count: liked.length },
  ];

  const currentList = activeTab === "watchlist" ? watchlist : activeTab === "watched" ? watched : liked;
  const setCurrentList = activeTab === "watchlist" ? setWatchlist : activeTab === "watched" ? setWatched : setLiked;

  const removeMovie = async (id: number) => {
    if (!user) {
      return;
    }

    try {
      await removeMovieFromCollection(user.id, id, activeTab);
      setCurrentList((prev) => prev.filter((m) => m.id !== id));
      toast.success("Removed from your list.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove movie.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchChange={() => {}} />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Your Movies</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Track films you want to watch, have seen, and love.
        </p>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-lg border border-border bg-secondary/50 p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                activeTab === tab.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Movie Grid */}
        {error ? (
          <p className="py-12 text-center text-sm text-destructive">{error}</p>
        ) : isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading your movies...</p>
        ) : currentList.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {currentList.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="group relative"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded border-2 border-transparent transition-colors hover:border-primary">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Remove button on hover */}
                  <button
                    onClick={() => removeMovie(movie.id)}
                    className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="mt-1.5 truncate text-xs font-medium text-foreground">{movie.title}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] text-muted-foreground">{movie.year}</p>
                  <span className="flex items-center gap-0.5 text-[11px] text-accent">
                    <Star size={10} className="fill-accent" />
                    {movie.rating.toFixed(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              {activeTab === "watchlist" ? <Bookmark size={24} className="text-muted-foreground" /> :
               activeTab === "watched" ? <Eye size={24} className="text-muted-foreground" /> :
               <Heart size={24} className="text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground">
              No films in your {activeTab === "watchlist" ? "watchlist" : activeTab === "watched" ? "watched list" : "liked list"} yet.
            </p>
          </div>
        )}
      </div>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © 2024 CineVault. A Movie Recommendation & Watchlist System.
        </div>
      </footer>
    </div>
  );
};

export default YourMovies;
