import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: Page });

function Page() {
  const nav = useNavigate();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (p1.length < 8) return toast.error("Password must be at least 8 characters");
    if (p1 !== p2) return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold mb-2">Set new password</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter your new password below.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="p1">New password</Label>
            <Input id="p1" type="password" required value={p1} onChange={(e) => setP1(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="p2">Confirm password</Label>
            <Input id="p2" type="password" required value={p2} onChange={(e) => setP2(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {busy ? "Saving…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}