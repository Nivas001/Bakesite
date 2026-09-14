/// <reference types="vite/client" />

/**
 * Declares the build-time variables this app reads.
 *
 * This exists for more than convenience. `noPropertyAccessFromIndexSignature`
 * forced every read to use bracket notation, and Vite cannot statically replace
 * `import.meta.env["X"]` — it inlines the whole env object at the call site
 * instead. That published every VITE_* value to the browser, including the
 * unused Supabase URL and key, in any chunk that read a single variable.
 *
 * Declaring them here makes them real properties, so dot access type-checks and
 * Vite substitutes just the one value it was asked for.
 */
interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT?: string;
  readonly VITE_APPWRITE_PROJECT_ID?: string;
  readonly VITE_APPWRITE_PROJECT_NAME?: string;
  readonly VITE_CLARITY_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
