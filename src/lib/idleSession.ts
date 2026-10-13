// Session-lifecycle helpers for the admin idle sign-out. Framework-free
// so both the hook (useIdleSignOut) and the login page can share them,
// and so the timing logic stays unit-testable. All state lives in
// sessionStorage so it dies with the tab — same scope as the auth
// session itself (see src/lib/supabase.ts).

export const IDLE_TIMEOUT_MS = 30 * 60_000; // 30 minutes
export const WARNING_LEAD_MS = 60_000; // warn one minute before sign-out

const LAST_ACTIVITY_KEY = "jolnhs-admin-last-activity";
const LOGOUT_REASON_KEY = "jolnhs-admin-logout-reason";

export function recordActivity(now = Date.now()) {
  sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now));
}

/** Seed the clock on hook mount — but never reset an existing one,
 *  since that would let a page refresh dodge the idle deadline. */
export function ensureLastActivity(now = Date.now()) {
  if (!sessionStorage.getItem(LAST_ACTIVITY_KEY)) recordActivity(now);
}

/** Milliseconds until the idle deadline. A missing or corrupt timestamp
 *  counts as "just active" — we'd rather extend a session than cut a
 *  legitimate one short. */
export function msUntilIdleTimeout(now = Date.now()) {
  const raw = sessionStorage.getItem(LAST_ACTIVITY_KEY);
  const last = raw ? Number(raw) : NaN;
  const elapsed = Number.isFinite(last) ? now - last : 0;
  return IDLE_TIMEOUT_MS - elapsed;
}

export function markTimedOutLogout() {
  sessionStorage.setItem(LOGOUT_REASON_KEY, "timeout");
}

/** Read-and-clear the reason flag so the login page can show a notice
 *  exactly once. A URL param would do the same job, but ProtectedRoute
 *  navigates to /admin/login itself once the session clears and the
 *  flag survives that redirect without ordering races. */
export function consumeLogoutReason(): "timeout" | null {
  const reason = sessionStorage.getItem(LOGOUT_REASON_KEY);
  if (reason) sessionStorage.removeItem(LOGOUT_REASON_KEY);
  return reason === "timeout" ? "timeout" : null;
}
