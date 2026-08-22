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

// Typed as `unknown` for now — Phase 0 doesn't yet generate types from
// the live schema (`supabase gen types typescript`). We'll swap this
// for a generated `Database` type in Phase 1 once the schema is final
// and stable, so we're not regenerating types on every table tweak.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);