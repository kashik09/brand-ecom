import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!

export function supabaseBrowser() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Missing Supabase ENV")
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export function supabaseService() {
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!SUPABASE_URL || !SERVICE_ROLE) throw new Error("Missing Supabase SERVICE env")
  // NOTE: service role — server only
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } })
}
