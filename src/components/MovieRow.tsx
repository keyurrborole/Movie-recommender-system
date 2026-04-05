import { ChevronRight } from "lucide-react";
import type { Movie } from "@/data/movies";
import MovieCard from "./MovieCard";

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

const MovieRow = ({ title, movies }: MovieRowProps) => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
          <button className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
            See all <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {movies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieRow;
