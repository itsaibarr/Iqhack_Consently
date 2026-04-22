import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !key) {
    console.warn(
      "Missing Supabase admin credentials. Supabase operations requiring admin access will fail."
    );
    // Use fallbacks to prevent crash
    return createClient(
      supabaseUrl || "https://placeholder-url.supabase.co",
      key || "placeholder-key",
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );
  }

  _client = createClient(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _client;
}

// Keep backwards-compatible named export that lazily resolves
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
