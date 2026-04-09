import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MovieRow from "@/components/MovieRow";
import {
  type FilmListMovie,
  type FeaturedMovie,
  type HomeGenreRow,
  fetchHomePageData,
  fetchMovies,
} from "@/services/supabaseService";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featured, setFeatured] = useState<FeaturedMovie | null>(null);
  const [recommended, setRecommended] = useState<FilmListMovie[]>([]);
  const [recent, setRecent] = useState<FilmListMovie[]>([]);
  const [genreRows, setGenreRows] = useState<HomeGenreRow[]>([]);
  const [searchResults, setSearchResults] = useState<FilmListMovie[]>([]);
  const [isLoadingHome, setIsLoadingHome] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadHomeData = async () => {
      try {
        setIsLoadingHome(true);
        setError("");
        const data = await fetchHomePageData();

        if (ignore) {
          return;
        }

        setFeatured(data.featured);
        setRecommended(data.recommended);
        setRecent(data.recent);
        setGenreRows(data.genres);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load home content.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingHome(false);
        }
      }
    };

    loadHomeData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const runSearch = async () => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setSearchResults([]);
        return;
      }

      try {
        setIsLoadingSearch(true);
        const { movies } = await fetchMovies({
          searchQuery: trimmed,
          page: 0,
          ratingSort: "popular",
        });

        if (!ignore) {
          setSearchResults(movies.slice(0, 30));
        }
      } catch {
        if (!ignore) {
          setSearchResults([]);
        }
      } finally {
        if (!ignore) {
          setIsLoadingSearch(false);
        }
      }
    };

    runSearch();

    return () => {
      ignore = true;
    };
  }, [searchQuery]);

  const isSearching = Boolean(searchQuery.trim());

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchChange={setSearchQuery} />

      {error ? (
        <div className="container mx-auto px-4 pt-24">
          <p className="text-destructive">{error}</p>
        </div>
      ) : isSearching ? (
        <div className="container mx-auto px-4 pt-24 pb-8">
          <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
            Search Results
          </h2>
          {isLoadingSearch ? (
            <p className="text-muted-foreground">Searching...</p>
          ) : searchResults.length > 0 ? (
            <MovieRow title="Matching Movies" movies={searchResults} />
          ) : (
            <p className="text-muted-foreground">No films found matching "{searchQuery}"</p>
          )}
        </div>
      ) : isLoadingHome ? (
        <div className="container mx-auto px-4 pt-24 pb-10">
          <p className="text-muted-foreground">Loading home content...</p>
        </div>
      ) : (
        <>
          <HeroSection featured={featured} />
          <MovieRow title="Recommended For You" movies={recommended} />
          <MovieRow title="New Releases" movies={recent} />
          {genreRows.map((row) => (
            <MovieRow key={row.key} title={row.title} movies={row.movies} />
          ))}
        </>
      )}

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © 2024 CineVault. A Movie Recommendation & Watchlist System.
        </div>
      </footer>
    </div>
  );
};

export default Index;
