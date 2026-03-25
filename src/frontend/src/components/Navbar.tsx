import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, MessageSquare, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { truncatePrincipal } from "../utils/format";

export function Navbar() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-display font-semibold text-lg text-foreground hover:text-primary transition-colors"
          data-ocid="nav.link"
        >
          <MessageSquare className="h-5 w-5 text-primary" />
          Community Forum
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated && identity && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {truncatePrincipal(identity.getPrincipal())}
              </span>
            </div>
          )}

          {!isAuthenticated ? (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              data-ocid="auth.primary_button"
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={clear}
              data-ocid="auth.secondary_button"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign Out
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
