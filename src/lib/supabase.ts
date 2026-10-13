import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly at startup rather than surfacing a cryptic network
  // error the first time a component tries to fetch — a missing .env
  // is a setup mistake, not a runtime condition to handle gracefully.
  throw new Error(
    "Missing Supabase env vars. Copy .env.example to .env and fill in your project's URL and anon key."
  );
}

// Earlier versions let supabase-js persist the session in localStorage
// (its default), which kept a refresh token alive across browser
// restarts — that's why /admin used to skip the login page. Remove any
// leftover keys so a stale long-lived session can't silently sign an
// admin back in. Runs once per page load; effectively free.
for (const key of Object.keys(window.localStorage)) {
  if (/^sb-.+-auth-token/.test(key)) window.localStorage.removeItem(key);
}

// Typed as `unknown` for now — Phase 0 doesn't yet generate types from
// the live schema (`supabase gen types typescript`). We'll swap this
// for a generated `Database` type in Phase 1 once the schema is final
// and stable, so we're not regenerating types on every table tweak.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // sessionStorage scopes the login to this tab: a page refresh keeps
    // the admin signed in, but closing the tab/browser ends the session
    // and a brand-new tab starts signed out.
    storage: window.sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

if (import.meta.env.DEV) {
  (window as unknown as { supabase: typeof supabase }).supabase = supabase;
}