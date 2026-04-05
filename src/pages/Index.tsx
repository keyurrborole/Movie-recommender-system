import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MovieRow from "@/components/MovieRow";
import { movies } from "@/data/movies";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery) return null;
    return movies.filter((m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const recommended = movies.filter((m) => m.rating >= 4.2);
  const recent = [...movies].sort((a, b) => b.year - a.year);
  const sciFi = movies.filter((m) => m.genre.includes("Sci-Fi"));

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchChange={setSearchQuery} />

      {!filtered ? (
        <>
          <HeroSection />
          <MovieRow title="Recommended For You" movies={recommended} />
          <MovieRow title="New Releases" movies={recent} />
          <MovieRow title="Sci-Fi & Beyond" movies={sciFi} />
        </>
      ) : (
        <div className="container mx-auto px-4 pt-24">
          <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
            Search Results
          </h2>
          {filtered.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {filtered.map((movie, i) => (
                <div key={movie.id}>
                  <MovieRow title="" movies={[movie]} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No films found matching "{searchQuery}"</p>
          )}
        </div>
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
