// Presence/online status hook
import { useEffect, useRef, useCallback } from 'react';

const PRESENCE_INTERVAL = 60 * 1000; // 60 seconds
const ONLINE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

export function isOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  const lastSeen = new Date(lastSeenAt).getTime();
  const now = Date.now();
  return now - lastSeen < ONLINE_THRESHOLD;
}

export function usePresence(email: string | null | undefined) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updatePresence = useCallback(async () => {
    if (!email) return;
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('team_members')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('email', email);
    } catch (error) {
      // Silently fail - presence is not critical
      console.debug('Presence update failed:', error);
    }
  }, [email]);

  useEffect(() => {
    if (!email) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update presence immediately
    updatePresence();

    // Set up interval
    intervalRef.current = setInterval(updatePresence, PRESENCE_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [email, updatePresence]);

  return { isOnline: email ? isOnline(email) : false };
}
