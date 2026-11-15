import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { siteUrl } from "@/lib/site";

// Server-only: the site's CSP blocks browser calls to Supabase, so every call
// goes through server components, server actions, route handlers or the proxy.
const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

// Sign-in also needs the secret key, a canonical site URL for its redirects, and
// Upstash, since its rate limit fails closed (without it every request is refused).
export const isSupabaseConfigured = Boolean(
  url &&
    publishableKey &&
    process.env.SUPABASE_SECRET_KEY &&
    siteUrl() &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN,
);

/**
 * A client acting as the signed-in visitor, so row level security applies.
 * `fetch` replaces the network for this client only (see requestLink).
 */
export async function createClient(fetch?: typeof globalThis.fetch) {
  if (!url || !publishableKey) {
    throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    ...(fetch && { global: { fetch } }),
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components cannot set cookies; src/proxy.ts refreshes them.
        }
      },
    },
  });
}

/** A secret-key client for the one check visitors may not run themselves. */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set.");
  }

  return createSupabaseClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
