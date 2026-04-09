import { Search, Film, Bookmark, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onSearchChange: (query: string) => void;
}

const Navbar = ({ onSearchChange }: NavbarProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const userDisplayName =
    (typeof user?.user_metadata?.username === "string" && user.user_metadata.username) ||
    (typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    user?.email?.split("@")[0] ||
    "Profile";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully.");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign out.");
    }
  };

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
          <Link to="/your-movies" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
            Your Movies
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* {searchOpen ? (
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
          )} */}
          {/* <button className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground">
            <Bookmark className="h-5 w-5" />
          </button> */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                title="Profile"
              >
                <User className="h-5 w-5" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card p-3 shadow-xl">
                  <div className="mb-3 border-b border-border pb-3">
                    <p className="truncate text-sm font-semibold text-foreground">{userDisplayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>

                  <button
                    onClick={async () => {
                      setProfileOpen(false);
                      await handleSignOut();
                    }}
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-foreground transition-colors hover:bg-muted"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground">
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
