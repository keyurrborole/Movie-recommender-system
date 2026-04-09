import { motion } from "framer-motion";
import { Eye, Heart, Bookmark } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";

export interface MovieCardItem {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster: string;
}

interface MovieCardProps {
  movie: MovieCardItem;
  index?: number;
}

const MovieCard = ({ movie, index = 0 }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/film/${movie.id}`} className="relative aspect-[2/3] w-[180px] overflow-hidden rounded-md block">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          width={180}
          height={270}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay on hover */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/60 to-transparent p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setLiked(!liked)}
              className="rounded-full bg-secondary/80 p-1.5 transition-colors hover:bg-primary"
            >
              <Heart size={14} className={liked ? "fill-accent text-accent" : "text-foreground"} />
            </button>
            <button
              onClick={() => setInWatchlist(!inWatchlist)}
              className="rounded-full bg-secondary/80 p-1.5 transition-colors hover:bg-primary"
            >
              <Bookmark size={14} className={inWatchlist ? "fill-primary text-primary" : "text-foreground"} />
            </button>
            <button className="rounded-full bg-secondary/80 p-1.5 transition-colors hover:bg-primary">
              <Eye size={14} className="text-foreground" />
            </button>
          </div>
          <StarRating rating={movie.rating} interactive size={16} />
        </motion.div>
      </Link>

      <div className="mt-2 w-[180px]">
        <h3 className="truncate text-sm font-medium text-foreground">{movie.title}</h3>
        <p className="text-xs text-muted-foreground">{movie.year}</p>
      </div>
    </motion.div>
  );
};

export default MovieCard;
