import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Wallet,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Bell,
} from "lucide-react";
import logoWide from "@/assets/logo-wide.png";
import logoIcon from "@/assets/logo-icon.png";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const nav_ = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !user) nav_({ to: "/login" });
  }, [user, loading, nav_]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-sidebar/60 backdrop-blur">
        <div className="p-5 border-b border-border/40">
          <img src={logoWide} alt="AlienSpark" className="h-8 object-contain" />
          <div className="text-xs text-muted-foreground mt-1 pl-1">OPS Console</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const active = loc.pathname === n.to || (n.to !== "/dashboard" && loc.pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  active
                    ? "bg-primary/15 text-primary neon-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/40">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={async () => {
              await signOut();
              nav_({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/40 flex items-center justify-between px-4 md:px-6 bg-background/40 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-3 md:hidden">
            <img src={logoIcon} alt="" className="h-8 w-8" />
            <span className="font-semibold neon-text">AlienSpark</span>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            Welcome back, <span className="text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="h-9 w-9 rounded-full bg-primary/20 grid place-items-center text-primary font-semibold border border-primary/30">
              {user.email?.[0]?.toUpperCase() ?? "?"}
            </div>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/40 bg-background/90 backdrop-blur grid grid-cols-6">
          {nav.map((n) => {
            const active = loc.pathname === n.to || (n.to !== "/dashboard" && loc.pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center justify-center py-2 text-[10px] gap-0.5",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <n.icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}