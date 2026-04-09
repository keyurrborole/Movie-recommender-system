import { motion } from "framer-motion";
import { Play, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import StarRating from "./StarRating";
import type { FeaturedMovie } from "@/services/supabaseService";

interface HeroSectionProps {
  featured?: FeaturedMovie | null;
}

const HeroSection = ({ featured }: HeroSectionProps) => {
  const heroTitle = featured?.title ?? "Astral Drift";
  const heroRating = featured?.rating ?? 4.7;
  const heroYear = featured?.year ?? 2024;
  const heroRuntime = featured?.runtimeText ?? "2h 05m";
  const heroOverview =
    featured?.overview ??
    "An astronaut on a solo mission begins receiving transmissions from a version of herself in another universe. A stunning exploration of identity and solitude.";
  const heroBackdrop = featured?.backdrop ?? heroBg;

  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <img
        src={heroBackdrop}
        alt="Featured film"
        width={1920}
        height={800}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      <div className="container relative mx-auto flex h-full items-end px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-xl"
        >
          <span className="mb-2 inline-block rounded-sm bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            Featured Film
          </span>
          <h1 className="mb-3 font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            {heroTitle}
          </h1>
          <div className="mb-3 flex items-center gap-3">
            <StarRating rating={heroRating} size={18} />
            <span className="text-sm text-muted-foreground">{heroRating.toFixed(1)} / 10</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm text-muted-foreground">{heroYear}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm text-muted-foreground">{heroRuntime}</span>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            {heroOverview}
          </p>
          <div className="flex items-center gap-3">
            <Link
              to={featured ? `/film/${featured.id}` : "/films"}
              className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Play size={16} />
              View Details
            </Link>
            <Link to="/your-movies" className="flex items-center gap-2 rounded-md border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted">
              <Plus size={16} />
              Watchlist
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
