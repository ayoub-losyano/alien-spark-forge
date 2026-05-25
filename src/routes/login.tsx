import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logoIcon from "@/assets/logo-icon.png";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md glass rounded-3xl p-8 neon-border">
        <div className="flex flex-col items-center mb-6">
          <img src={logoIcon} alt="AlienSpark" className="h-16 w-16 drop-shadow-[0_0_24px_rgba(57,255,20,0.45)]" />
          <h1 className="mt-3 text-2xl font-bold">
            <span className="neon-text">AlienSpark</span> OPS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Internal operations console</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
            </div>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <div className="text-sm text-destructive">{err}</div>}
          <Button type="submit" disabled={busy} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-6">
          AlienSpark VN · Internal use only
        </p>
      </div>
    </div>
  );
}