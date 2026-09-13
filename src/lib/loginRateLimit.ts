import { supabase } from "@/lib/supabase";

export interface LoginLockStatus {
  isLocked: boolean;
  secondsRemaining: number;
}

// Both RPCs return a one-row table; unwrap it into a plain object
// and fail safe (unlocked) if the call itself errors out, so a
// network hiccup against this best-effort check never blocks a
// legitimate sign-in. The actual account lock still lives in
// Postgres regardless of what the client does with the response.
interface LoginLockRow {
  is_locked: boolean;
  seconds_remaining: number;
}

// The client isn't generated against the DB schema yet (see the
// note in lib/supabase.ts), so `.rpc()` comes back as `unknown`.
// This is the one place that knows the shape of these two RPCs'
// return row and casts it — everything else in the app sees the
// typed LoginLockStatus above.
function toLockStatus(row: unknown): LoginLockStatus {
  const parsed = row as LoginLockRow | null | undefined;
  return {
    isLocked: parsed?.is_locked ?? false,
    secondsRemaining: parsed?.seconds_remaining ?? 0,
  };
}

/** Pre-flight check, before spending a real sign-in attempt. */
export async function checkLoginLock(email: string): Promise<LoginLockStatus> {
  const { data, error } = await supabase
    .rpc("check_login_lock", { p_email: email })
    .single();

  if (error) {
    return { isLocked: false, secondsRemaining: 0 };
  }

  return toLockStatus(data);
}

/** Call after every sign-in attempt to update the server-side counter. */
export async function recordLoginAttempt(
  email: string,
  success: boolean,
): Promise<LoginLockStatus> {
  const { data, error } = await supabase
    .rpc("record_login_attempt", { p_email: email, p_success: success })
    .single();

  if (error) {
    return { isLocked: false, secondsRemaining: 0 };
  }

  return toLockStatus(data);
}