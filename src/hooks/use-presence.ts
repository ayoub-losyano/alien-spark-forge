import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Heartbeat the team_members.last_seen_at for the row matching this email.
export function usePresence(email: string | null) {
  useEffect(() => {
    if (!email) return;
    let stopped = false;
    const tick = async () => {
      try {
        await (supabase as any)
          .from("team_members")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("email", email);
      } catch (e) {
        // ignore — RLS may not match, that's OK
      }
    };
    tick();
    const id = setInterval(() => {
      if (!stopped) tick();
    }, 60_000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [email]);
}

export function isOnline(lastSeenAt?: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 2 * 60_000;
}