import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const rawSupabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!rawSupabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(new URL(rawSupabaseUrl).origin, supabaseKey);
}
