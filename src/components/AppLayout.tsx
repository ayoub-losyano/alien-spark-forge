import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Wallet,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Sun,
  Moon,
  Search,
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsBell } from "@/components/NotificationsBell";
import { GlobalSearch } from "@/components/GlobalSearch";
import { usePresence } from "@/hooks/use-presence";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders/new", label: "New Order", icon: PlusCircle },
  { to: "/orders", label: "Orders & Projects", icon: FolderKanban },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/team", label: "Team", icon: Users },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const nav_ = useNavigate();
  const loc = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  usePresence(user?.email ?? null);

  useEffect(() => {
    if (!loading && !user) nav_({ to: "/login" });
  }, [user, loading, nav_]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const initial = (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
          <img src={logoIcon} alt="AlienSpark" className="h-7 w-7" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">AlienSpark</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">OPS Console</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((n) => {
            const active = loc.pathname === n.to || (n.to !== "/dashboard" && loc.pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "group relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full transition-colors",
                    active ? "bg-primary" : "bg-transparent",
                  )}
                />
                <n.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 pb-2">Signed in</div>
          <div className="px-3 pb-3 text-xs text-foreground/80 truncate">{user.email}</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-2.5 md:hidden">
            <img src={logoIcon} alt="" className="h-7 w-7" />
            <span className="font-semibold text-sm">AlienSpark</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md border border-border text-xs text-muted-foreground hover:bg-accent transition-colors mr-2"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search…</span>
              <kbd className="ml-2 text-[10px] px-1.5 py-0.5 bg-muted rounded border border-border">⌘K</kbd>
            </button>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <NotificationsBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-1 h-8 w-8 rounded-full bg-primary/15 text-primary border border-primary/30 grid place-items-center text-xs font-semibold hover:bg-primary/25 transition-colors"
                  aria-label="Account"
                >
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-xs text-muted-foreground">Signed in as</div>
                  <div className="text-sm font-medium truncate">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => nav_({ to: "/settings" })}>
                  <SettingsIcon className="h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggle}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={async () => {
                    await signOut();
                    nav_({ to: "/login" });
                  }}
                >
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur grid grid-cols-6">
          {nav.map((n) => {
            const active = loc.pathname === n.to || (n.to !== "/dashboard" && loc.pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center justify-center py-2.5 gap-1",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <n.icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-10 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}