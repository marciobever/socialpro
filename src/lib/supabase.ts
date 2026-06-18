import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — client is only created on first actual use, not at module
// load time. This prevents build failures when env vars aren't present.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente."
    );
  }
  _client = createClient(url, key);
  return _client;
}
