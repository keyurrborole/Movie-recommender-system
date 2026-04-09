import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Film, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotCooldownSeconds, setForgotCooldownSeconds] = useState(0);
  const [signUpCooldownSeconds, setSignUpCooldownSeconds] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, requestPasswordReset } = useAuth();

  const redirectPath =
    (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname || "/films";

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  useEffect(() => {
    if (forgotCooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setForgotCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [forgotCooldownSeconds]);

  useEffect(() => {
    if (signUpCooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSignUpCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [signUpCooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    if (isSignUp && !username.trim()) {
      toast.error("Username is required for sign up.");
      return;
    }

    if (isSignUp && signUpCooldownSeconds > 0) {
      toast.error(`Please wait ${signUpCooldownSeconds}s before trying to sign up again.`);
      return;
    }

    try {
      setIsSubmitting(true);

      if (isSignUp) {
        await signUp(email.trim(), password, username.trim());
        setSignUpCooldownSeconds(60);
        toast.success("Account created. Check your email to verify your account.");
      } else {
        await signIn(email.trim(), password);
        toast.success("Signed in successfully.");
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      if (isSignUp && /rate|too many|email rate/i.test(message)) {
        setSignUpCooldownSeconds(60);
        toast.error("Too many sign-up email requests. Please wait one minute and try again.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (forgotCooldownSeconds > 0) {
      return;
    }

    if (!email.trim()) {
      toast.error("Enter your email first, then click Forgot password.");
      return;
    }

    try {
      await requestPasswordReset(email.trim());
      setForgotCooldownSeconds(60);
      toast.success("Reset email sent. Please check your inbox.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send reset email.";
      if (/rate|too many/i.test(message)) {
        setForgotCooldownSeconds(60);
        toast.error("Too many reset requests. Please wait a minute and try again.");
        return;
      }
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
        <div className="relative z-10 p-12 max-w-md">
          <Film className="h-10 w-10 text-primary mb-6" />
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            Track films you've watched.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Save those you want to see. Tell your friends what's good.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Film className="h-7 w-7 text-primary" />
              <span className="font-display text-xl font-bold text-foreground tracking-wide">
                CineVault
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignUp
                ? "Join the community of film lovers"
                : "Sign in to your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cinephile42"
                  className="w-full h-11 rounded-lg border border-border bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 rounded-lg border border-border bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-lg border border-border bg-secondary px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotCooldownSeconds > 0}
                  className="text-xs text-primary hover:underline"
                >
                  {forgotCooldownSeconds > 0
                    ? `Try again in ${forgotCooldownSeconds}s`
                    : "Forgot password?"}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (isSignUp && signUpCooldownSeconds > 0)}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              {isSubmitting
                ? "Please wait..."
                : isSignUp && signUpCooldownSeconds > 0
                  ? `Try again in ${signUpCooldownSeconds}s`
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-medium hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
