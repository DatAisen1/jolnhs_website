/// <reference types="vite/client" />

// Narrows `import.meta.env` from Vite's generic string-indexed type to
// exactly the variables this app actually uses, so a typo like
// `import.meta.env.VITE_SUPBASE_URL` is a compile error instead of
// silently resolving to `undefined` at runtime.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}