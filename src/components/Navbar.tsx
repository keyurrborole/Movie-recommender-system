import { Search, Film, Bookmark, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  onSearchChange: (query: string) => void;
}

const Navbar = ({ onSearchChange }: NavbarProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground tracking-wide">
            CineVault
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/films" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
            Films
          </Link>
          <a href="#" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
            Lists
          </a>
        </div>

        <div className="flex items-center gap-3">
          {searchOpen ? (
            <input
              autoFocus
              type="text"
              placeholder="Search films..."
              className="h-9 w-48 rounded-md border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={() => setSearchOpen(false)}
            />
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          <button className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground">
            <Bookmark className="h-5 w-5" />
          </button>
          <button className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
