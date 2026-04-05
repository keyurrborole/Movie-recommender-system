import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const StarRating = ({ rating, size = 14, interactive = false, onRate }: StarRatingProps) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          className={interactive ? "cursor-pointer transition-transform hover:scale-125" : "cursor-default"}
        >
          <Star
            size={size}
            className={
              star <= Math.round(rating)
                ? "fill-star text-star star-glow"
                : "text-muted-foreground/30"
            }
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
