import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ensureLastActivity,
  markTimedOutLogout,
  msUntilIdleTimeout,
  recordActivity,
  WARNING_LEAD_MS,
} from "@/lib/idleSession";

const ACTIVITY_EVENTS = [
  "pointerdown",
  "keydown",
  "scroll",
  "touchstart",
  "mousemove",
] as const;

// capture: true because `scroll` doesn't bubble — without it, scrolling
// inside the admin main pane (an inner overflow container, not the
// window) would never reach this listener.
const LISTENER_OPTIONS: AddEventListenerOptions = {
  passive: true,
  capture: true,
};

/**
 * Signs the admin out after IDLE_TIMEOUT_MS of inactivity and exposes a
 * live countdown so the layout can warn first. Mounted once inside
 * AdminLayout, so it only runs while an admin session is active.
 *
 * The activity timestamp lives in sessionStorage: a refresh doesn't
 * reset the idle clock, and the deadline dies with the tab.
 */
export function useIdleSignOut() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastWriteRef = useRef(0);
  const signingOutRef = useRef(false);

  const onActivity = useCallback(() => {
    const now = Date.now();
    // mousemove/scroll can fire dozens of times a second; one write per
    // second is plenty for a 30-minute deadline.
    if (now - lastWriteRef.current < 1_000) return;
    lastWriteRef.current = now;
    recordActivity(now);
  }, []);

  const staySignedIn = useCallback(() => {
    // Writes directly rather than through onActivity's throttle — the
    // user just explicitly asked to stay, so the reset can't be skipped.
    recordActivity();
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    ensureLastActivity();

    function checkIdle() {
      if (signingOutRef.current) return;
      const remaining = msUntilIdleTimeout();
      if (remaining <= 0) {
        signingOutRef.current = true;
        // Flag (not a URL param) carries the reason: ProtectedRoute will
        // navigate to /admin/login on its own once the session clears,
        // and LoginPage consumes the flag on mount.
        markTimedOutLogout();
        void supabase.auth.signOut();
        return;
      }
      setSecondsLeft(
        remaining <= WARNING_LEAD_MS ? Math.ceil(remaining / 1_000) : null,
      );
    }

    checkIdle();
    const interval = setInterval(checkIdle, 1_000);

    function onVisible() {
      // Laptops sleep: timers pause while suspended, so catch up the
      // moment the tab is looked at again rather than waiting a tick.
      if (document.visibilityState === "visible") checkIdle();
    }

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, LISTENER_OPTIONS);
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity, true);
      }
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [onActivity]);

  return { secondsLeft, staySignedIn };
}
