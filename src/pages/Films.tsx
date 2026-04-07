import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Eye, Heart, List, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { movies } from "@/data/movies";
import type { Movie } from "@/data/movies";

const FILTER_OPTIONS = {
  year: ["All", "2024", "2023", "2022"],
  rating: ["All", "Highest First", "Lowest First"],
  genre: ["All", "Sci-Fi", "Drama", "Romance", "Horror", "Adventure", "Crime", "Fantasy", "Thriller", "Mystery", "Noir"],
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

const FilmPosterCard = ({ movie, index }: { movie: Movie; index: number }) => {
  const views = Math.floor(Math.random() * 500 + 100) + "K";
  const lists = Math.floor(Math.random() * 200 + 20) + "K";
  const likes = Math.floor(Math.random() * 300 + 50) + "K";

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
          <Eye size={12} className="text-primary" />
          {views}
        </span>
        <span className="flex items-center gap-1">
          <List size={12} className="text-primary" />
          {lists}
        </span>
        <span className="flex items-center gap-1">
          <Heart size={12} className="text-accent" />
          {likes}
        </span>
      </div>
    </motion.div>
  );
};

const Films = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filmSearch, setFilmSearch] = useState("");
  const [filters, setFilters] = useState({
    year: "All",
    rating: "All",
    genre: "All",
    popular: "This Week",
  });

  const setFilter = (key: FilterKey, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (filmSearch) {
      result = result.filter((m) =>
        m.title.toLowerCase().includes(filmSearch.toLowerCase())
      );
    }

    if (filters.year !== "All") {
      result = result.filter((m) => m.year === parseInt(filters.year));
    }

    if (filters.genre !== "All") {
      result = result.filter((m) => m.genre.includes(filters.genre));
    }

    if (filters.rating === "Highest First") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filters.rating === "Lowest First") {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [filmSearch, filters]);

  // Popular = top rated
  const popularFilms = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchChange={setSearchQuery} />

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
          <FilterDropdown
            label="Popular"
            options={FILTER_OPTIONS.popular}
            value={filters.popular}
            onChange={(v) => setFilter("popular", v)}
          />
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
                value={filmSearch}
                onChange={(e) => setFilmSearch(e.target.value)}
                className="h-8 w-48 rounded border border-border bg-secondary pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search..."
              />
            </div>
          </div>
        </div>

        {/* Popular Films This Week */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Popular Films This Week
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

        {/* All Films / Filtered */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {filmSearch || filters.year !== "All" || filters.genre !== "All"
              ? "Results"
              : "Just Reviewed..."}
          </h2>
          <span className="text-xs text-muted-foreground">
            {filteredMovies.length} film{filteredMovies.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {filteredMovies.map((movie, i) => (
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
