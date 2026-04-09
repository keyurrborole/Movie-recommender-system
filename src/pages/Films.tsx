import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChartSpline, ChevronDown, Eye, Heart, List, Search, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  PAGE_SIZE,
  POPULAR_FILM_IDS,
  FilmListMovie,
  fetchMovies,
  fetchMoviesByIds,
} from "@/services/supabaseService";

const FILTER_OPTIONS = {
  year: ["All", "2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "1960s", "1950s","1940s", "1930s", "1920s", "1910s", "1900s", "Before 1900"],
  rating: ["All", "Highest First", "Lowest First"],
  genre: ["All", "Action", "Science Fiction", "Adventure", "Drama", "Crime", "Thriller", "Fantasy", "Comedy", "Romance", "Western", "Mystery", "War", "Animation", "Family", "Horror", "Music", "History", "TV Movie", "Documentary"],
  popular: ["All Time", "This Week", "This Month", "This Year"],
};

type FilterKey = keyof typeof FILTER_OPTIONS;

const FilterDropdown = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded border border-border bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground transition-colors hover:bg-muted"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[140px] rounded border border-border bg-card p-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`block w-full rounded px-3 py-1.5 text-left text-xs transition-colors ${
                value === opt
                  ? "bg-primary text-primary-foreground"
                  : "text-card-foreground hover:bg-muted"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FilmPosterCard = ({ movie, index }: { movie: FilmListMovie; index: number }) => {
  const rating = movie.rating ? movie.rating.toFixed(1) : "NR";
  const voteCount = movie.votes > 0 ? movie.votes : "No ratings";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group"
    >
      <Link to={`/film/${movie.id}`} className="relative aspect-[2/3] overflow-hidden rounded border-2 border-transparent transition-colors hover:border-primary block">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star size={12} className="text-primary" />
          {rating}
        </span>
        <span className="flex items-center gap-1">
          <ChartSpline size={12} className="text-primary" />
          {voteCount}
        </span>
        {/* <span className="flex items-center gap-1">
          <Heart size={12} className="text-accent" />
          {likes}
        </span> */}
      </div>
    </motion.div>
  );
};

const Films = () => {
  const [filmSearchInput, setFilmSearchInput] = useState("");
  const [filmSearch, setFilmSearch] = useState("");
  const [filters, setFilters] = useState({
    year: "All",
    rating: "All",
    genre: "All",
    popular: "This Week",
  });
  const [movies, setMovies] = useState<FilmListMovie[]>([]);
  const [popularFilms, setPopularFilms] = useState<FilmListMovie[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const setFilter = (key: FilterKey, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    setCurrentPage(0);
  }, [filmSearch, filters]);

  useEffect(() => {
    let ignore = false;

    const loadMovies = async () => {
      if (currentPage === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError("");

      try {
        const ratingSort =
          filters.rating === "Highest First"
            ? "highest"
            : filters.rating === "Lowest First"
              ? "lowest"
              : "popular";

        const { movies: mappedMovies, totalCount } = await fetchMovies({
          searchQuery: filmSearch,
          genre: filters.genre,
          yearFilter: filters.year,
          ratingSort,
          page: currentPage,
        });

        if (ignore) {
          return;
        }

        setMovies((prev) => (currentPage === 0 ? mappedMovies : [...prev, ...mappedMovies]));
        setTotalCount(totalCount);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to fetch movies.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    };

    loadMovies();

    return () => {
      ignore = true;
    };
  }, [currentPage, filmSearch, filters]);

  useEffect(() => {
    let ignore = false;

    const loadPopularMovies = async () => {
      try {
        const orderedPopularFilms = await fetchMoviesByIds(POPULAR_FILM_IDS);

        if (!ignore) {
          setPopularFilms(orderedPopularFilms);
        }
      } catch (err) {
        // Silently fail for popular films
        if (!ignore) {
          setPopularFilms([]);
        }
      }
    };

    loadPopularMovies();

    return () => {
      ignore = true;
    };
  }, []);

  const hasMoreMovies = useMemo(() => movies.length < totalCount, [movies.length, totalCount]);
  const hasActiveFilters = useMemo(
    () =>
      Boolean(filmSearch) ||
      filters.year !== "All" ||
      filters.genre !== "All" ||
      filters.rating !== "All",
    [filmSearch, filters.year, filters.genre, filters.rating],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchChange={() => undefined} />

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Browse By row */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Browse by
          </span>
          <FilterDropdown
            label="Year"
            options={FILTER_OPTIONS.year}
            value={filters.year}
            onChange={(v) => setFilter("year", v)}
          />
          <FilterDropdown
            label="Rating"
            options={FILTER_OPTIONS.rating}
            value={filters.rating}
            onChange={(v) => setFilter("rating", v)}
          />
          {/* <FilterDropdown
            label="Popular"
            options={FILTER_OPTIONS.popular}
            value={filters.popular}
            onChange={(v) => setFilter("popular", v)}
          /> */}
          <FilterDropdown
            label="Genre"
            options={FILTER_OPTIONS.genre}
            value={filters.genre}
            onChange={(v) => setFilter("genre", v)}
          />

          {/* Find a Film */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Find a Film
            </span>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={filmSearchInput}
                onChange={(e) => setFilmSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setFilmSearch(filmSearchInput.trim());
                  }
                }}
                className="h-8 w-48 rounded border border-border bg-secondary pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search and press Enter"
              />
            </div>
          </div>
        </div>

        {!hasActiveFilters && (
          <>
            {/* Popular Films This Week */}
            <div className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Popular Films
                </h2>
                <button className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
                  More
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {popularFilms.map((movie, i) => (
                  <FilmPosterCard key={movie.id} movie={movie} index={i} />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="mb-8 border-t border-border" />
          </>
        )}

        {/* All Films / Filtered */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {hasActiveFilters
              ? "Results"
              : "Movies..."}
          </h2>
          <span className="text-xs text-muted-foreground">
            {totalCount} film{totalCount !== 1 ? "s" : ""}
          </span>
        </div>

        {error ? (
          <p className="py-12 text-center text-sm text-destructive">{error}</p>
        ) : isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading movies...</p>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {movies.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="group"
              >
                <Link to={`/film/${movie.id}`} className="relative aspect-[2/3] overflow-hidden rounded border-2 border-transparent transition-colors hover:border-primary block">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <p className="mt-1.5 truncate text-xs font-medium text-foreground">{movie.title}</p>
                <p className="text-[11px] text-muted-foreground">{movie.year}</p>
              </motion.div>
            ))}

            {hasMoreMovies && (
              <div className="col-span-full mt-6 flex justify-center">
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={isLoadingMore}
                  className="rounded border border-border bg-secondary px-5 py-2 text-xs font-semibold uppercase tracking-wider text-secondary-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingMore ? "Loading..." : `Load ${PAGE_SIZE} More`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No films found matching your criteria.
          </p>
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

export default Films;
