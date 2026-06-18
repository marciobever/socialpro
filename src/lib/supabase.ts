import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  // Warn at startup rather than crashing — routes will return 500 gracefully
  console.warn("[supabase] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.");
}

// Service-role client: usado apenas em routes de servidor (nunca exposto ao browser)
export const supabase = createClient(url ?? "", key ?? "");
